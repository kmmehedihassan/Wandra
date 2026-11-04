from django.conf import settings
from django.conf.urls.static import static
from django.urls import path

from AuthenApp import views

urlpatterns = [
    path('auth/register', views.register, name='auth-register'),
    path('auth/login', views.login, name='auth-login'),
    path('auth/logout', views.logout, name='auth-logout'),
    path('auth/me', views.me, name='auth-me'),
    path('auth/profile', views.profile, name='auth-profile'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
