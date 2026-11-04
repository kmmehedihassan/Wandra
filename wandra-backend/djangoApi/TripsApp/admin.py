from django.contrib import admin

from TripsApp.models import Booking, CartItem, Hotel, RoomType, Tour


@admin.register(Tour)
class TourAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'price', 'seats_per_date')
    search_fields = ('title',)


class RoomTypeInline(admin.TabularInline):
    model = RoomType
    extra = 0


@admin.register(Hotel)
class HotelAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'price')
    search_fields = ('name',)
    inlines = [RoomTypeInline]


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'kind', 'tour', 'room', 'quantity', 'checkin', 'checkout', 'total', 'status', 'created_at')
    list_filter = ('status', 'kind', 'checkin')
    search_fields = ('user__username', 'contact_email', 'reference')
    readonly_fields = ('reference', 'created_at', 'cancelled_at')


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'kind', 'tour', 'room', 'quantity', 'checkin', 'checkout', 'created_at')
