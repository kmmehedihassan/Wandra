from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from AuthenApp.models import Profile
from MediaApp.models import StoredImage

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


class ProfileSerializer(serializers.ModelSerializer):
    """The signed-in user's profile. Names are stored on the User model."""

    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    firstname = serializers.CharField(source='user.first_name', max_length=150, required=False, allow_blank=True)
    lastname = serializers.CharField(source='user.last_name', max_length=150, required=False, allow_blank=True)
    phone = serializers.RegexField(r'^(\+?[\d\s-]{7,15})?$', required=False, allow_blank=True,
                                   error_messages={'invalid': 'Enter a valid phone number.'})
    avatar = serializers.SerializerMethodField()
    avatar_id = serializers.PrimaryKeyRelatedField(source='avatar', queryset=StoredImage.objects.all(),
                                                   required=False, allow_null=True, write_only=True)

    class Meta:
        model = Profile
        fields = ['username', 'email', 'firstname', 'lastname', 'gender', 'birthday', 'phone', 'address',
                  'avatar', 'avatar_id']

    def get_avatar(self, obj):
        return obj.avatar.url(self.context.get('request')) if obj.avatar_id else None

    def validate_avatar_id(self, image):
        user = self.context['request'].user
        if image is not None and image.owner_id != user.id:
            raise serializers.ValidationError('Upload the image first.')
        return image

    def validate_birthday(self, value):
        from django.utils import timezone
        if value and value > timezone.localdate():
            raise serializers.ValidationError("Birthday can't be in the future.")
        return value

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        for field, value in user_data.items():
            setattr(instance.user, field, value.strip())
        if user_data:
            instance.user.save(update_fields=list(user_data))
        for field in ('phone', 'address'):
            if field in validated_data:
                validated_data[field] = validated_data[field].strip()
        return super().update(instance, validated_data)
