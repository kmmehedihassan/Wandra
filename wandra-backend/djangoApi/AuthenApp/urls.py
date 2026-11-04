from django.urls import path

from AuthenApp import views

urlpatterns = [
    path('auth/register', views.register, name='auth-register'),
    path('auth/login', views.login, name='auth-login'),
    path('auth/logout', views.logout, name='auth-logout'),
    path('auth/me', views.me, name='auth-me'),
    path('auth/password', views.change_password, name='auth-password'),
    path('auth/profile', views.profile, name='auth-profile'),
]
