from django.urls import path

from MediaApp import views

urlpatterns = [
    path('api/images/', views.upload_image, name='image-upload'),
    path('images/<uuid:pk>', views.serve_image, name='image'),
]
