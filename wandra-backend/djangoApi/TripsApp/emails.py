"""Booking confirmation and cancellation emails (sent through the configured email backend)."""
import logging

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.utils.html import escape

from TripsApp.models import Kind

logger = logging.getLogger(__name__)


def _money(amount):
    return f'৳{amount:,}'


def _date(d):
    return d.strftime('%-d %b %Y') if d else ''


def _line(booking):
    """(title, details, total) for one booking line."""
    if booking.kind == Kind.TOUR:
        details = (f'{_date(booking.checkin)} · {booking.quantity} ticket{"s" if booking.quantity > 1 else ""} '
                   f'× {_money(booking.unit_price_paid)}')
        return booking.tour.title, details, booking.total
    nights = booking.nights
    details = (f'{_date(booking.checkin)} → {_date(booking.checkout)} ({nights} night{"s" if nights > 1 else ""}) · '
               f'{booking.quantity} × {booking.room.name} at {_money(booking.unit_price_paid)}/night')
    return booking.room.hotel.name, details, booking.total


def _send(user, subject, intro_text, intro_html, bookings, total, footer_text):
    if not user.email:
        return False
    name = user.first_name or user.username
    link = f"{settings.FRONTEND_URL.rstrip('/')}/dashboard?tab=bookings"
    reference = str(bookings[0].reference)[:8].upper()
    lines = [_line(b) for b in bookings]

    text = '\n'.join(
        [f'Hi {name},', '', intro_text, '', f'Reference: {reference}', '']
        + [f'• {title}\n  {details}\n  {_money(amount)}' for title, details, amount in lines]
        + ['', f'Total: {_money(total)}', '', footer_text, f'Manage your bookings: {link}', '', '— Wandra']
    )
    rows = ''.join(
        f'<tr><td style="padding:12px 0;border-bottom:1px solid #e6e8ec">'
        f'<strong>{escape(title)}</strong><br><span style="color:#6b7280;font-size:14px">{escape(details)}</span></td>'
        f'<td style="padding:12px 0;border-bottom:1px solid #e6e8ec;text-align:right;white-space:nowrap">'
        f'{escape(_money(amount))}</td></tr>'
        for title, details, amount in lines
    )
    html = f"""\
<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1d2127;line-height:1.5">
  <h2 style="color:#ff681a;margin:0 0 16px">{escape(subject)}</h2>
  <p>Hi {escape(name)},</p>
  <p>{intro_html}</p>
  <p style="color:#6b7280;font-size:14px">Reference <strong style="color:#1d2127">{escape(reference)}</strong></p>
  <table style="width:100%;border-collapse:collapse">{rows}
    <tr><td style="padding:14px 0"><strong>Total</strong></td>
        <td style="padding:14px 0;text-align:right"><strong>{escape(_money(total))}</strong></td></tr>
  </table>
  <p style="font-size:14px;color:#6b7280">{escape(footer_text)}</p>
  <p style="margin:24px 0">
    <a href="{escape(link)}" style="background:#ff681a;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:bold">View my bookings</a>
  </p>
</div>"""
    message = EmailMultiAlternatives(subject, text, settings.DEFAULT_FROM_EMAIL, [user.email])
    message.attach_alternative(html, 'text/html')
    try:
        return message.send() == 1
    except Exception:
        logger.exception('Booking email to user %s failed', user.pk)
        return False


def send_booking_confirmation(user, bookings):
    total = sum(b.total for b in bookings)
    return _send(
        user, 'Your Wandra booking is confirmed',
        "Thanks for booking with Wandra! Here's a summary of your trip.",
        "Thanks for booking with Wandra! Here&#x27;s a summary of your trip.",
        bookings, total,
        'You can cancel any booking from your dashboard until the day it starts.',
    )


def send_booking_cancelled(user, booking):
    return _send(
        user, 'Your Wandra booking was cancelled',
        'This booking has been cancelled. We will contact you about your refund.',
        'This booking has been cancelled. We will contact you about your refund.',
        [booking], booking.total,
        "If you didn't cancel this booking, reply to this email right away.",
    )
