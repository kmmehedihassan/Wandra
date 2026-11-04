from django.urls import path

from PostsApp import views

urlpatterns = [
    path('', views.post_list, name='post-list'),
    path('categories/', views.categories, name='post-categories'),
    path('<int:pk>/', views.post_detail, name='post-detail'),
    path('<int:pk>/like/', views.post_like, name='post-like'),
]
