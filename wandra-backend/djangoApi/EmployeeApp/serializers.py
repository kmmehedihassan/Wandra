from dataclasses import fields
from rest_framework import serializers
from EmployeeApp.models import Departments,Employees,UploadFile
from EmployeeApp.models import Modules,Students 
from EmployeeApp.models import MyReservation,MyHotelInfo
from EmployeeApp.models import MyTourInfo,MyTour

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model=Departments
        fields=('DepartmentId',
                 'DepartmentName')

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model=Employees
        fields=('EmployeeId',
                 'EmployeeName',
                 'Department',
                 'DateOfJoining',
                 'PhotoFileName')

class BookSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = UploadFile
        fields = ['title', 'cover']

class ModulesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Modules
        fields = ['id', 'module_name', 'class_room']



class StudentsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Students
        fields = ['id', 'name', 'age', 'grade', 'modules']
        depth = 1
    
    def get_queryset(self):
        student = Students.objects.all()
        return student


class MyReservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = MyReservation
        fields="__all__"

class MyHotelInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = MyHotelInfo
        fields="__all__"

class MyTourInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = MyTourInfo
        fields="__all__"

class MyTourSerializer(serializers.ModelSerializer):
    class Meta:
        model = MyTour
        fields="__all__"