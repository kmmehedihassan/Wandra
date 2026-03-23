from rest_framework import serializers
from AuthenApp.models import LogIN,RegisterTable,UploadProfileFile


class LogInSerializer(serializers.ModelSerializer):
    class Meta:
        model=LogIN
        fields=('UserId',
                 'UserName',
                 'UserPass')

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model=RegisterTable
        fields=('UserId',
                 'UserName',
                 'UserPass',
                 'UserEmail')


class UploadProfileFileSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = UploadProfileFile
        fields = ['UserName','first_name','last_name','gender','birthday','phone', 'address','registrationDate','cover']