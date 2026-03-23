from django.urls import re_path as url
from django.urls import re_path as url
from AuthenApp import views
from django.conf.urls.static import static
from django.conf import settings
urlpatterns=[
    url(r'^login$',views.LogInApi),
    # url(r'^login$',views.LogInApi.as_view())
    url(r'^register$',views.RegisterApi),
    url(r'^uploadprofile/$', views.ProfileFileView.as_view(), name='file-upload')
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)