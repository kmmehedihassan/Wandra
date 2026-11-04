"""Availability rules shared by the cart and checkout."""
from datetime import timedelta

from django.db.models import Sum
from django.utils import timezone

from TripsApp.models import Booking, Kind

MAX_NIGHTS = 30
MAX_TICKETS = 20


class Unavailable(Exception):
    """Raised when a cart line can't be booked; the message is shown to the user."""


def today():
    return timezone.localdate()


def rooms_left(room, checkin, checkout, exclude_booking_ids=()):
    """Fewest rooms of this type free on any night of the stay."""
    bookings = (
        Booking.objects.filter(room=room, status=Booking.Status.CONFIRMED, checkin__lt=checkout, checkout__gt=checkin)
        .exclude(id__in=exclude_booking_ids)
        .values_list('checkin', 'checkout', 'quantity')
    )
    bookings = list(bookings)
    lowest = room.quantity
    night = checkin
    while night < checkout:
        taken = sum(q for start, end, q in bookings if start <= night < end)
        lowest = min(lowest, room.quantity - taken)
        night += timedelta(days=1)
    return max(lowest, 0)


def seats_left(tour, date):
    taken = (
        Booking.objects.filter(tour=tour, status=Booking.Status.CONFIRMED, checkin=date).aggregate(n=Sum('quantity'))['n']
        or 0
    )
    return max(tour.seats_per_date - taken, 0)


def validate_line(kind, *, tour=None, room=None, quantity, checkin, checkout=None):
    """Check dates and quantity; raise Unavailable with a friendly message."""
    if checkin < today():
        raise Unavailable('The date is in the past. Please choose a future date.')
    if kind == Kind.TOUR:
        if not 1 <= quantity <= MAX_TICKETS:
            raise Unavailable(f'You can book between 1 and {MAX_TICKETS} tickets.')
        left = seats_left(tour, checkin)
        if quantity > left:
            raise Unavailable(
                f'Only {left} seat{"" if left == 1 else "s"} left on {tour.title} for that date.' if left else
                f'{tour.title} is fully booked on that date.'
            )
    else:
        if checkout is None or checkout <= checkin:
            raise Unavailable('Check-out must be at least one night after check-in.')
        if (checkout - checkin).days > MAX_NIGHTS:
            raise Unavailable(f'Stays are limited to {MAX_NIGHTS} nights.')
        if quantity < 1:
            raise Unavailable('Select at least one room.')
        left = rooms_left(room, checkin, checkout)
        if quantity > left:
            raise Unavailable(
                f'Only {left} {room.name} room{"" if left == 1 else "s"} left at {room.hotel.name} for those dates.'
                if left else f'{room.name} rooms at {room.hotel.name} are fully booked for those dates.'
            )
