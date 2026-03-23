from django.conf.urls import url,include
from django.conf.urls import url
from PostsApp import views
from django.conf.urls.static import static
from django.conf import settings
# from djangoApi.PostsApp.views import AllPostViewSet

urlpatterns=[
     url(r'^categories/$',views.CategoriesViewSet.as_view(),name='categories'),
     url(r'^posts/$',views.AllPostViewSet.as_view(),name='posts'),
     url(r'^posts/([0-9]+)$',views.AllPostViewSet.as_view(),name='posts'),
     url(r'^uploadpost/$', views.PostsFileView.as_view(), name='file-upload')
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)