import uuid

from django.conf import settings
from django.db import models


class Tour(models.Model):
    """Bookable tour. Ids match the frontend catalog (src/components/Database/data.js)."""

    id = models.PositiveIntegerField(primary_key=True)
    title = models.CharField(max_length=120)
    price = models.PositiveIntegerField(help_text='Price per person in BDT')
    image = models.CharField(max_length=200, blank=True)
    seats_per_date = models.PositiveIntegerField(default=30)

    def __str__(self):
        return self.title


class Hotel(models.Model):
    id = models.PositiveIntegerField(primary_key=True)
    name = models.CharField(max_length=120)
    price = models.PositiveIntegerField(help_text='Lowest nightly price in BDT')
    image = models.CharField(max_length=200, blank=True)

    def __str__(self):
        return self.name


class RoomType(models.Model):
    id = models.PositiveIntegerField(primary_key=True)
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, related_name='rooms')
    name = models.CharField(max_length=60)
    price = models.PositiveIntegerField(help_text='Price per room per night in BDT')
    adults = models.PositiveSmallIntegerField(default=2)
    children = models.PositiveSmallIntegerField(default=0)
    quantity = models.PositiveIntegerField(help_text='Number of rooms of this type')

    def __str__(self):
        return f'{self.hotel.name} – {self.name}'


class Kind(models.TextChoices):
    TOUR = 'tour', 'Tour'
    HOTEL = 'hotel', 'Hotel'


class TripLine(models.Model):
    """Fields shared by cart items and bookings."""

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    kind = models.CharField(max_length=10, choices=Kind.choices)
    tour = models.ForeignKey(Tour, null=True, blank=True, on_delete=models.PROTECT)
    room = models.ForeignKey(RoomType, null=True, blank=True, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(help_text='Tickets for a tour, rooms for a hotel')
    checkin = models.DateField(help_text='Travel date for a tour, check-in date for a hotel')
    checkout = models.DateField(null=True, blank=True)
    contact_name = models.CharField(max_length=100, blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True
        ordering = ['created_at']

    @property
    def nights(self):
        if self.kind == Kind.HOTEL and self.checkout:
            return (self.checkout - self.checkin).days
        return 0

    @property
    def unit_price(self):
        return self.tour.price if self.kind == Kind.TOUR else self.room.price

    def compute_total(self):
        if self.kind == Kind.TOUR:
            return self.unit_price * self.quantity
        return self.unit_price * self.quantity * self.nights


class CartItem(TripLine):
    pass


class Booking(TripLine):
    class Status(models.TextChoices):
        CONFIRMED = 'confirmed', 'Confirmed'
        CANCELLED = 'cancelled', 'Cancelled'

    reference = models.UUIDField(default=uuid.uuid4, editable=False, help_text='Groups the lines of one checkout')
    unit_price_paid = models.PositiveIntegerField()
    total = models.PositiveIntegerField()
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.CONFIRMED)
    cancelled_at = models.DateTimeField(null=True, blank=True)

    class Meta(TripLine.Meta):
        ordering = ['-created_at']
        indexes = [models.Index(fields=['room', 'status', 'checkin', 'checkout']), models.Index(fields=['tour', 'status', 'checkin'])]


class Review(models.Model):
    """A traveller's rating of a tour or hotel they have completed a booking for."""

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    kind = models.CharField(max_length=10, choices=Kind.choices)
    tour = models.ForeignKey(Tour, null=True, blank=True, on_delete=models.CASCADE, related_name='reviews')
    hotel = models.ForeignKey(Hotel, null=True, blank=True, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveSmallIntegerField()
    text = models.TextField(max_length=2000)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(fields=['user', 'tour'], condition=models.Q(tour__isnull=False),
                                    name='one_review_per_user_tour'),
            models.UniqueConstraint(fields=['user', 'hotel'], condition=models.Q(hotel__isnull=False),
                                    name='one_review_per_user_hotel'),
            models.CheckConstraint(condition=models.Q(rating__gte=1, rating__lte=5), name='rating_1_to_5'),
        ]

    def __str__(self):
        return f'{self.rating}★ by {self.user} for {self.tour or self.hotel}'
