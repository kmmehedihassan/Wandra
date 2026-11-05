from django.contrib import admin

from TripsApp.models import Booking, CartItem, Destination, Hotel, Order, Review, RoomType, Tour, WishlistItem


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


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'kind', 'tour', 'hotel', 'rating', 'created_at')
    list_filter = ('kind', 'rating')
    search_fields = ('user__username', 'text')


admin.site.register(Destination)


@admin.register(WishlistItem)
class WishlistItemAdmin(admin.ModelAdmin):
    list_display = ('user', 'kind', 'ref_id', 'created_at')
    list_filter = ('kind',)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('tran_id', 'user', 'amount', 'status', 'card_type', 'created_at', 'paid_at')
    list_filter = ('status', 'card_type')
    search_fields = ('tran_id', 'user__username', 'billing_phone', 'bank_tran_id')
    readonly_fields = ('reference', 'tran_id', 'user', 'amount', 'cart_item_ids', 'val_id', 'bank_tran_id',
                       'card_type', 'gateway_data', 'created_at', 'paid_at')
