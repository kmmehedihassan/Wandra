from django.urls import path

from TripsApp import views

urlpatterns = [
    path('cart/', views.cart, name='cart'),
    path('cart/<int:pk>/', views.cart_item, name='cart-item'),
    path('checkout/', views.checkout, name='checkout'),
    path('bookings/', views.bookings, name='bookings'),
    path('bookings/<int:pk>/cancel/', views.cancel_booking, name='booking-cancel'),
    path('availability/hotels/<int:pk>/', views.hotel_availability, name='hotel-availability'),
    path('availability/tours/<int:pk>/', views.tour_availability, name='tour-availability'),
]
