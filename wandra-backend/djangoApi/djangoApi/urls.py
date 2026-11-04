"""Wandra API URL configuration."""
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/posts/', include('PostsApp.urls')),
    path('api/', include('TripsApp.urls')),
    path('', include('MediaApp.urls')),
    path('', include('AuthenApp.urls')),
]
