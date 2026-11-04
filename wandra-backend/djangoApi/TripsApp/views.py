from datetime import date

from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from TripsApp.models import Booking, CartItem, Hotel, Kind, RoomType, Tour
from TripsApp.serializers import AddToCartSerializer, BookingSerializer, CartItemSerializer
from TripsApp.services import Unavailable, rooms_left, seats_left, today, validate_line

LINE_RELATED = ('tour', 'room', 'room__hotel')


def _cart_response(user):
    items = CartItem.objects.filter(user=user).select_related(*LINE_RELATED)
    return Response({
        'items': CartItemSerializer(items, many=True).data,
        'total': sum(item.compute_total() for item in items),
    })


def _parse_date(value):
    try:
        return date.fromisoformat(value)
    except (TypeError, ValueError):
        return None


@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def cart(request):
    """GET the cart, POST a line (validated against live availability), DELETE to empty it."""
    if request.method == 'DELETE':
        CartItem.objects.filter(user=request.user).delete()
        return _cart_response(request.user)

    if request.method == 'POST':
        serializer = AddToCartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        contact = data.get('contact') or {}
        line = dict(
            kind=data['type'], tour=data.get('tour'), room=data.get('room'), quantity=data['quantity'],
            checkin=data['checkin'], checkout=data.get('checkout') if data['type'] == Kind.HOTEL else None,
        )
        # Count rooms/seats already in this user's cart for the same slot.
        same = CartItem.objects.filter(user=request.user, kind=line['kind'], tour=line['tour'], room=line['room'],
                                       checkin=line['checkin'], checkout=line['checkout']).first()
        quantity = line['quantity'] + (same.quantity if same else 0)
        try:
            validate_line(line['kind'], tour=line['tour'], room=line['room'], quantity=quantity,
                          checkin=line['checkin'], checkout=line['checkout'])
        except Unavailable as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_409_CONFLICT)
        if same:
            same.quantity = quantity
            if contact:
                same.contact_name, same.contact_email, same.contact_phone = contact['name'], contact['email'], contact['phone']
            same.save()
        else:
            CartItem.objects.create(user=request.user, contact_name=contact.get('name', ''),
                                    contact_email=contact.get('email', ''), contact_phone=contact.get('phone', ''), **line)
        return Response(_cart_response(request.user).data, status=status.HTTP_201_CREATED)

    return _cart_response(request.user)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def cart_item(request, pk):
    deleted, _ = CartItem.objects.filter(user=request.user, pk=pk).delete()
    if not deleted:
        return Response({'detail': 'Cart item not found.'}, status=status.HTTP_404_NOT_FOUND)
    return _cart_response(request.user)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def checkout(request):
    """Turn the whole cart into confirmed bookings, or nothing if any line is unavailable.

    Payment is a demo: card details are validated in the browser and never sent here.
    """
    with transaction.atomic():
        items = list(CartItem.objects.filter(user=request.user).select_related(*LINE_RELATED))
        if not items:
            return Response({'detail': 'Your cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)
        # Lock the rooms/tours being booked so two checkouts can't oversell them.
        list(RoomType.objects.select_for_update().filter(id__in=[i.room_id for i in items if i.room_id]))
        list(Tour.objects.select_for_update().filter(id__in=[i.tour_id for i in items if i.tour_id]))

        # Validate every line, counting other lines of this cart for the same slot.
        for item in items:
            peers = sum(o.quantity for o in items if o.kind == item.kind and o.tour_id == item.tour_id
                        and o.room_id == item.room_id and o.checkin == item.checkin and o.checkout == item.checkout)
            try:
                validate_line(item.kind, tour=item.tour, room=item.room, quantity=peers,
                              checkin=item.checkin, checkout=item.checkout)
            except Unavailable as exc:
                return Response({'detail': str(exc), 'item': item.id}, status=status.HTTP_409_CONFLICT)

        reference = None
        bookings = []
        for item in items:
            booking = Booking(
                user=request.user, kind=item.kind, tour=item.tour, room=item.room, quantity=item.quantity,
                checkin=item.checkin, checkout=item.checkout, contact_name=item.contact_name,
                contact_email=item.contact_email, contact_phone=item.contact_phone,
                unit_price_paid=item.unit_price, total=item.compute_total(),
            )
            if reference is None:
                reference = booking.reference
            booking.reference = reference
            bookings.append(booking)
        Booking.objects.bulk_create(bookings)
        CartItem.objects.filter(id__in=[i.id for i in items]).delete()

    created = Booking.objects.filter(user=request.user, reference=reference).select_related(*LINE_RELATED)
    return Response({
        'reference': str(reference),
        'total': sum(b.total for b in created),
        'bookings': BookingSerializer(created, many=True).data,
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def bookings(request):
    items = Booking.objects.filter(user=request.user).select_related(*LINE_RELATED)
    return Response(BookingSerializer(items, many=True).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_booking(request, pk):
    booking = Booking.objects.filter(user=request.user, pk=pk).select_related(*LINE_RELATED).first()
    if booking is None:
        return Response({'detail': 'Booking not found.'}, status=status.HTTP_404_NOT_FOUND)
    if booking.status == Booking.Status.CANCELLED:
        return Response({'detail': 'This booking is already cancelled.'}, status=status.HTTP_400_BAD_REQUEST)
    if booking.checkin <= today():
        return Response({'detail': 'Trips that have started or finished can no longer be cancelled.'},
                        status=status.HTTP_400_BAD_REQUEST)
    booking.status = Booking.Status.CANCELLED
    booking.cancelled_at = timezone.now()
    booking.save(update_fields=['status', 'cancelled_at'])
    return Response(BookingSerializer(booking).data)


@api_view(['GET'])
@permission_classes([AllowAny])
def hotel_availability(request, pk):
    """Rooms left per room type for ?checkin=YYYY-MM-DD&checkout=YYYY-MM-DD."""
    hotel = Hotel.objects.filter(pk=pk).first()
    if hotel is None:
        return Response({'detail': 'Hotel not found.'}, status=status.HTTP_404_NOT_FOUND)
    checkin, checkout = _parse_date(request.query_params.get('checkin')), _parse_date(request.query_params.get('checkout'))
    if not checkin or not checkout or checkout <= checkin:
        return Response({'detail': 'Provide checkin and checkout dates (checkout after checkin).'},
                        status=status.HTTP_400_BAD_REQUEST)
    return Response({
        'hotel': hotel.id,
        'rooms': [{'roomid': r.id, 'left': rooms_left(r, checkin, checkout), 'total': r.quantity}
                  for r in hotel.rooms.order_by('id')],
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def tour_availability(request, pk):
    """Seats left on ?date=YYYY-MM-DD."""
    tour = Tour.objects.filter(pk=pk).first()
    if tour is None:
        return Response({'detail': 'Tour not found.'}, status=status.HTTP_404_NOT_FOUND)
    day = _parse_date(request.query_params.get('date'))
    if not day:
        return Response({'detail': 'Provide a date.'}, status=status.HTTP_400_BAD_REQUEST)
    return Response({'tour': tour.id, 'date': day.isoformat(), 'left': seats_left(tour, day), 'total': tour.seats_per_date})
