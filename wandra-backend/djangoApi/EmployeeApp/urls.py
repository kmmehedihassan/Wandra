from django.conf.urls import url,include
from django.conf.urls import url
from EmployeeApp import views
# from EmployeeApp.views import StudentsViewSet,ModulesViewSet
from django.urls import path
# from djangoApi.EmployeeApp.views import FileView
# from views import FileView
from django.conf.urls.static import static
from django.conf import settings
# from .views import StudentsViewSet, ModulesViewSet
# from rest_framework.routers import DefaultRouter


# router = DefaultRouter()
# router.register("student", StudentsViewSet, basename="student")
# router.register("module", ModulesViewSet, basename="module")

# path('')

# from djangoApi.EmployeeApp.views import FileView
from EmployeeApp.views import FileView
urlpatterns=[
    url(r'^department$',views.departmentApi),
    url(r'^department/([0-9]+)$',views.departmentApi),

     url(r'^employee$',views.employeeApi),
    url(r'^employee/([0-9]+)$',views.employeeApi),
    url(r'^reserve/([0-9]+)$',views.confirm),
    url(r'^reserve$',views.confirm),
    url(r'^myhotel$',views.MyHotelApi),
    url(r'^myhotel/([0-9]+)$',views.MyHotelApi),
    
    url(r'^students/$',views.StudentsViewSet.as_view(),name='student'),
    url(r'^students/([0-9]+)$',views.StudentsViewSet.as_view(),name='student1'),
    url(r'^modules/$',views.ModulesViewSet.as_view(),name='modules'),
    #  url('', include(router.urls)),
    # path('',views.StudentsViewSet.as_view(),"students"),
    # path('',views.ModulesViewSet.as_view(),"modules"),

    url(r'^Employee/SaveFile$', views.SaveFile),
    url(r'^upload/$', FileView.as_view(), name='file-upload')
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)