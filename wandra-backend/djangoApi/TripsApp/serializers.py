from rest_framework import serializers

from TripsApp.models import Booking, CartItem, Kind, RoomType, Tour


class TripLineSerializer(serializers.ModelSerializer):
    """Read shape matches what the frontend's cart/booking components expect."""

    type = serializers.CharField(source='kind', read_only=True)
    refId = serializers.SerializerMethodField()
    roomid = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    roomtype = serializers.SerializerMethodField()
    price = serializers.SerializerMethodField()
    ticket = serializers.SerializerMethodField()
    totalrooms = serializers.SerializerMethodField()
    days = serializers.IntegerField(source='nights', read_only=True)
    total = serializers.SerializerMethodField()
    contact = serializers.SerializerMethodField()

    class Meta:
        fields = ['id', 'type', 'refId', 'roomid', 'name', 'image', 'roomtype', 'price', 'ticket', 'totalrooms',
                  'checkin', 'checkout', 'days', 'total', 'contact']

    def _is_tour(self, obj):
        return obj.kind == Kind.TOUR

    def get_refId(self, obj):
        return obj.tour_id if self._is_tour(obj) else obj.room.hotel_id

    def get_roomid(self, obj):
        return obj.room_id

    def get_name(self, obj):
        return obj.tour.title if self._is_tour(obj) else obj.room.hotel.name

    def get_image(self, obj):
        return obj.tour.image if self._is_tour(obj) else obj.room.hotel.image

    def get_roomtype(self, obj):
        return '' if self._is_tour(obj) else obj.room.name

    def get_price(self, obj):
        return obj.unit_price

    def get_ticket(self, obj):
        return obj.quantity if self._is_tour(obj) else None

    def get_totalrooms(self, obj):
        return None if self._is_tour(obj) else obj.quantity

    def get_total(self, obj):
        return obj.compute_total()

    def get_contact(self, obj):
        if not obj.contact_name:
            return None
        return {'name': obj.contact_name, 'email': obj.contact_email, 'phone': obj.contact_phone}


class CartItemSerializer(TripLineSerializer):
    class Meta(TripLineSerializer.Meta):
        model = CartItem


class BookingSerializer(TripLineSerializer):
    status = serializers.CharField(read_only=True)
    bookedAt = serializers.DateTimeField(source='created_at', read_only=True)
    reference = serializers.UUIDField(read_only=True)

    class Meta(TripLineSerializer.Meta):
        model = Booking
        fields = TripLineSerializer.Meta.fields + ['status', 'bookedAt', 'reference', 'cancelled_at']

    def get_price(self, obj):
        return obj.unit_price_paid

    def get_total(self, obj):
        return obj.total


class ContactSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    phone = serializers.RegexField(r'^\+?[\d\s-]{7,15}$', error_messages={'invalid': 'Enter a valid phone number.'})


class AddToCartSerializer(serializers.Serializer):
    """Input for POST /api/cart/. Prices are never taken from the client."""

    type = serializers.ChoiceField(choices=Kind.choices)
    refId = serializers.IntegerField(required=False, help_text='Tour id (tours only)')
    roomid = serializers.IntegerField(required=False, help_text='Room type id (hotels only)')
    quantity = serializers.IntegerField(min_value=1)
    checkin = serializers.DateField()
    checkout = serializers.DateField(required=False, allow_null=True)
    contact = ContactSerializer(required=False)

    def validate(self, attrs):
        if attrs['type'] == Kind.TOUR:
            tour = Tour.objects.filter(pk=attrs.get('refId')).first()
            if tour is None:
                raise serializers.ValidationError({'refId': 'Unknown tour.'})
            if 'contact' not in attrs:
                raise serializers.ValidationError({'contact': 'Lead traveller details are required for tours.'})
            attrs['tour'] = tour
        else:
            room = RoomType.objects.select_related('hotel').filter(pk=attrs.get('roomid')).first()
            if room is None:
                raise serializers.ValidationError({'roomid': 'Unknown room type.'})
            if not attrs.get('checkout'):
                raise serializers.ValidationError({'checkout': 'Check-out date is required.'})
            attrs['room'] = room
        return attrs
