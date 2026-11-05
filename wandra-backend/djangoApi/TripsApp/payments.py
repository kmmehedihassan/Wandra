"""SSLCOMMERZ payments (hosted checkout: bKash, Nagad, Rocket, cards...).

Flow:
1. POST /api/payments/start/ creates a pending Order for the cart and asks
   SSLCOMMERZ for a payment page (GatewayPageURL); the browser goes there.
2. After paying, SSLCOMMERZ sends the browser to success/fail/cancel and also
   calls the IPN url server-to-server.
3. On success/IPN we never trust the posted data: the payment is re-checked
   with SSLCOMMERZ's validation API (status, amount, currency, tran_id) before
   any booking is created. Finalising is idempotent, so success + IPN arriving
   together book once.

Settings (environment): SSLCOMMERZ_STORE_ID, SSLCOMMERZ_STORE_PASSWORD,
SSLCOMMERZ_SANDBOX (True by default). Without a store id the demo checkout is used.
"""
import json
import logging
import secrets
import urllib.error
import urllib.parse
import urllib.request
from decimal import Decimal, InvalidOperation

from django.conf import settings
from django.db import transaction
from django.http import HttpResponse, HttpResponseRedirect
from django.urls import reverse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from rest_framework import serializers, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from TripsApp.emails import send_booking_confirmation
from TripsApp.models import CartItem, Order
from TripsApp.serializers import BookingSerializer
from TripsApp.services import Unavailable, validate_line

logger = logging.getLogger(__name__)

TIMEOUT = 20


def payments_enabled():
    return bool(settings.SSLCOMMERZ_STORE_ID and settings.SSLCOMMERZ_STORE_PASSWORD)


def _host():
    if settings.SSLCOMMERZ_API_BASE:  # only for testing against a mock gateway
        return settings.SSLCOMMERZ_API_BASE.rstrip('/')
    return 'https://sandbox.sslcommerz.com' if settings.SSLCOMMERZ_SANDBOX else 'https://securepay.sslcommerz.com'


def _post_form(url, data):
    body = urllib.parse.urlencode(data).encode()
    req = urllib.request.Request(url, data=body, method='POST',
                                 headers={'Content-Type': 'application/x-www-form-urlencoded'})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
        return json.loads(resp.read().decode())


def _get_json(url, params):
    with urllib.request.urlopen(f'{url}?{urllib.parse.urlencode(params)}', timeout=TIMEOUT) as resp:
        return json.loads(resp.read().decode())


def create_session(order, user, request):
    """Ask SSLCOMMERZ for a payment page. Returns GatewayPageURL or raises RuntimeError."""
    def callback(name):
        return request.build_absolute_uri(reverse(f'sslcommerz-{name}'))

    items = list(CartItem.objects.filter(id__in=order.cart_item_ids).select_related('tour', 'room__hotel'))
    names = ', '.join(i.tour.title if i.tour_id else i.room.hotel.name for i in items)[:250]
    data = _post_form(f'{_host()}/gwprocess/v4/api.php', {
        'store_id': settings.SSLCOMMERZ_STORE_ID,
        'store_passwd': settings.SSLCOMMERZ_STORE_PASSWORD,
        'total_amount': f'{order.amount:.2f}',
        'currency': 'BDT',
        'tran_id': order.tran_id,
        'success_url': callback('success'),
        'fail_url': callback('fail'),
        'cancel_url': callback('cancel'),
        'ipn_url': callback('ipn'),
        'cus_name': order.billing_name,
        'cus_email': user.email or 'no-email@example.com',
        'cus_phone': order.billing_phone,
        'cus_add1': order.billing_address,
        'cus_city': order.billing_city,
        'cus_country': 'Bangladesh',
        'shipping_method': 'NO',
        'product_name': names or 'Wandra booking',
        'product_category': 'Travel',
        'product_profile': 'general',
        'num_of_item': len(items),
        'value_a': str(order.reference),
    })
    if data.get('status') != 'SUCCESS' or not data.get('GatewayPageURL'):
        raise RuntimeError(data.get('failedreason') or 'SSLCOMMERZ did not return a payment page')
    return data['GatewayPageURL']


def validate_payment(val_id):
    """Ask SSLCOMMERZ whether this payment is genuine. Returns the validation response."""
    return _get_json(f'{_host()}/validator/api/validationserverAPI.php', {
        'val_id': val_id,
        'store_id': settings.SSLCOMMERZ_STORE_ID,
        'store_passwd': settings.SSLCOMMERZ_STORE_PASSWORD,
        'format': 'json',
    })


def finalize_order(tran_id, val_id):
    """Validate a payment and book the order (once). Returns the Order or None."""
    from TripsApp.views import book_cart_items  # avoid an import cycle

    if not tran_id or not val_id:
        return None
    order = Order.objects.filter(tran_id=tran_id).first()
    if order is None:
        logger.warning('SSLCOMMERZ callback for unknown tran_id %s', tran_id)
        return None
    if order.status != Order.Status.PENDING:
        return order  # already handled (success redirect and IPN both arrive)

    try:
        data = validate_payment(val_id)
    except (urllib.error.URLError, ValueError, TimeoutError) as exc:
        logger.error('SSLCOMMERZ validation failed for %s: %s', tran_id, exc)
        return order  # stay pending; the IPN or a retry can finish it

    try:
        paid_amount = Decimal(str(data.get('amount', '0')))
    except InvalidOperation:
        paid_amount = Decimal('-1')
    genuine = (
        data.get('status') in ('VALID', 'VALIDATED')
        and data.get('tran_id') == order.tran_id
        and data.get('currency_type', data.get('currency')) == 'BDT'
        and paid_amount == Decimal(order.amount)
    )

    with transaction.atomic():
        order = Order.objects.select_for_update().get(pk=order.pk)
        if order.status != Order.Status.PENDING:
            return order
        keep = {k: data.get(k) for k in ('status', 'tran_id', 'val_id', 'amount', 'currency_type', 'bank_tran_id',
                                          'card_type', 'card_brand', 'card_issuer', 'risk_level', 'risk_title',
                                          'tran_date')}
        order.gateway_data = keep
        if not genuine:
            logger.warning('SSLCOMMERZ payment %s did not validate: %s', tran_id, keep)
            order.status = Order.Status.FAILED
            order.note = 'Payment could not be validated with SSLCOMMERZ.'
            order.save()
            return order
        order.val_id = val_id
        order.bank_tran_id = data.get('bank_tran_id') or ''
        order.card_type = data.get('card_type') or ''
        order.paid_at = timezone.now()
        try:
            bookings = book_cart_items(order.user, order.cart_item_ids, order=order)
        except Unavailable as exc:
            order.status = Order.Status.NEEDS_REFUND
            order.note = str(exc)[:255]
            order.save()
            logger.error('Order %s was paid but could not be booked: %s', tran_id, exc)
            return order
        order.status = Order.Status.PAID
        order.save()
    if str(data.get('risk_level')) == '1':
        logger.warning('SSLCOMMERZ flagged order %s as risky: %s', tran_id, data.get('risk_title'))
    send_booking_confirmation(order.user, bookings)
    return order


def _frontend(path):
    return f"{settings.FRONTEND_URL.rstrip('/')}{path}"


class BillingSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    phone = serializers.RegexField(r'^\+?[\d\s-]{7,15}$', error_messages={'invalid': 'Enter a valid phone number.'})
    address = serializers.CharField(max_length=200)
    city = serializers.CharField(max_length=60)


@api_view(['GET'])
@permission_classes([AllowAny])
def payment_config(request):
    return Response({'provider': 'sslcommerz' if payments_enabled() else 'demo',
                     'sandbox': settings.SSLCOMMERZ_SANDBOX})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_payment(request):
    """Create a pending order for the cart and return the SSLCOMMERZ payment page URL."""
    if not payments_enabled():
        return Response({'detail': 'Online payment is not set up.'}, status=status.HTTP_400_BAD_REQUEST)
    billing = BillingSerializer(data=request.data)
    billing.is_valid(raise_exception=True)
    items = list(CartItem.objects.filter(user=request.user).select_related('tour', 'room__hotel'))
    if not items:
        return Response({'detail': 'Your cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)
    # Check availability now so people aren't charged for something already sold out.
    for item in items:
        peers = sum(o.quantity for o in items if o.kind == item.kind and o.tour_id == item.tour_id
                    and o.room_id == item.room_id and o.checkin == item.checkin and o.checkout == item.checkout)
        try:
            validate_line(item.kind, tour=item.tour, room=item.room, quantity=peers,
                          checkin=item.checkin, checkout=item.checkout)
        except Unavailable as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_409_CONFLICT)

    b = billing.validated_data
    order = Order.objects.create(
        tran_id=f'WND{timezone.now():%y%m%d}{secrets.token_hex(6).upper()}',
        user=request.user, amount=sum(i.compute_total() for i in items), cart_item_ids=[i.id for i in items],
        billing_name=b['name'].strip(), billing_phone=b['phone'].strip(),
        billing_address=b['address'].strip(), billing_city=b['city'].strip(),
    )
    try:
        url = create_session(order, request.user, request)
    except Exception as exc:  # network error or SSLCOMMERZ refused
        logger.error('Could not start SSLCOMMERZ payment %s: %s', order.tran_id, exc)
        order.status = Order.Status.FAILED
        order.note = f'Could not start payment: {exc}'[:255]
        order.save(update_fields=['status', 'note'])
        return Response({'detail': "We couldn't reach the payment service. Please try again in a moment."},
                        status=status.HTTP_502_BAD_GATEWAY)
    return Response({'url': url, 'order': str(order.reference)}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_status(request, reference):
    order = Order.objects.filter(reference=reference, user=request.user).first()
    if order is None:
        return Response({'detail': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)
    bookings = order.bookings.select_related('tour', 'room', 'room__hotel')
    return Response({
        'reference': str(order.reference),
        'status': order.status,
        'amount': order.amount,
        'paymentMethod': order.card_type,
        'bookings': BookingSerializer(bookings, many=True).data,
    })


# --- Callbacks from SSLCOMMERZ (form POSTs; verified via the validation API) ---

def _param(request, name):
    return (request.POST.get(name) or request.GET.get(name) or '').strip()


@csrf_exempt
@require_http_methods(['GET', 'POST'])
def sslcommerz_success(request):
    order = finalize_order(_param(request, 'tran_id'), _param(request, 'val_id'))
    if order is None:
        return HttpResponseRedirect(_frontend('/cart?payment=error'))
    outcome = {Order.Status.PAID: 'success', Order.Status.PENDING: 'processing',
               Order.Status.NEEDS_REFUND: 'refund'}.get(order.status, 'failed')
    return HttpResponseRedirect(_frontend(f'/cart?payment={outcome}&order={order.reference}'))


def _close(request, new_status, outcome):
    order = Order.objects.filter(tran_id=_param(request, 'tran_id')).first()
    if order and order.status == Order.Status.PENDING:
        order.status = new_status
        order.save(update_fields=['status'])
    return HttpResponseRedirect(_frontend(f'/cart?payment={outcome}'))


@csrf_exempt
@require_http_methods(['GET', 'POST'])
def sslcommerz_fail(request):
    return _close(request, Order.Status.FAILED, 'failed')


@csrf_exempt
@require_http_methods(['GET', 'POST'])
def sslcommerz_cancel(request):
    return _close(request, Order.Status.CANCELLED, 'cancelled')


@csrf_exempt
@require_http_methods(['POST'])
def sslcommerz_ipn(request):
    """Server-to-server notification: books the order even if the customer closed the tab."""
    if _param(request, 'status') in ('VALID', 'VALIDATED'):
        finalize_order(_param(request, 'tran_id'), _param(request, 'val_id'))
    return HttpResponse('OK')
