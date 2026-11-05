from django.urls import path

from TripsApp import payments, reviews, views, wishlist

urlpatterns = [
    path('cart/', views.cart, name='cart'),
    path('cart/<int:pk>/', views.cart_item, name='cart-item'),
    path('checkout/', views.checkout, name='checkout'),
    path('bookings/', views.bookings, name='bookings'),
    path('bookings/<int:pk>/cancel/', views.cancel_booking, name='booking-cancel'),
    path('availability/hotels/<int:pk>/', views.hotel_availability, name='hotel-availability'),
    path('availability/tours/<int:pk>/', views.tour_availability, name='tour-availability'),
    path('reviews/', reviews.reviews, name='reviews'),
    path('reviews/summary/', reviews.review_summary, name='review-summary'),
    path('reviews/<int:pk>/', reviews.review_detail, name='review-detail'),
    path('wishlist/', wishlist.wishlist, name='wishlist'),
    path('wishlist/<str:kind>/<int:ref_id>/', wishlist.wishlist_item, name='wishlist-item'),
    path('payments/config/', payments.payment_config, name='payment-config'),
    path('payments/start/', payments.start_payment, name='payment-start'),
    path('payments/orders/<uuid:reference>/', payments.order_status, name='payment-order'),
    path('payments/sslcommerz/success/', payments.sslcommerz_success, name='sslcommerz-success'),
    path('payments/sslcommerz/fail/', payments.sslcommerz_fail, name='sslcommerz-fail'),
    path('payments/sslcommerz/cancel/', payments.sslcommerz_cancel, name='sslcommerz-cancel'),
    path('payments/sslcommerz/ipn/', payments.sslcommerz_ipn, name='sslcommerz-ipn'),
]
