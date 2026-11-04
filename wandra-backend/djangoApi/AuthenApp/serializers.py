from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from AuthenApp.models import UploadProfileFile

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, trim_whitespace=False)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password')

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('An account with this email already exists.')
        return value

    def validate(self, attrs):
        validate_password(attrs['password'], user=User(username=attrs['username'], email=attrs['email']))
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(trim_whitespace=False, write_only=True)


class UploadProfileFileSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = UploadProfileFile
        fields = ['UserName', 'first_name', 'last_name', 'gender', 'birthday', 'phone',
                  'address', 'registrationDate', 'cover']
        read_only_fields = ['UserName']
