from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import SimpleRateThrottle

from AuthenApp.email import send_password_reset
from AuthenApp.models import Profile
from AuthenApp.serializers import (
    LoginSerializer,
    PasswordChangeSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegisterSerializer,
    ProfileSerializer,
    UserSerializer,
)


class AuthThrottle(SimpleRateThrottle):
    """Per-IP limit on login/register attempts (rate set by AUTH_THROTTLE_RATE)."""

    scope = 'auth'

    def get_cache_key(self, request, view):
        return self.cache_format % {'scope': self.scope, 'ident': self.get_ident(request)}


class PasswordResetThrottle(SimpleRateThrottle):
    """Per-IP limit on reset emails (rate set by PASSWORD_RESET_THROTTLE_RATE)."""

    scope = 'password_reset'

    def get_cache_key(self, request, view):
        return self.cache_format % {'scope': self.scope, 'ident': self.get_ident(request)}


User = get_user_model()


def _find_user(identifier):
    """Find an account by username or email, ignoring case."""
    identifier = identifier.strip()
    if '@' not in identifier:
        exact = User.objects.filter(username=identifier).first()
        if exact:
            return exact
    field = 'email__iexact' if '@' in identifier else 'username__iexact'
    matches = list(User.objects.filter(**{field: identifier})[:2])
    return matches[0] if len(matches) == 1 else None


def _session_payload(user):
    token, _ = Token.objects.get_or_create(user=user)
    return {'token': token.key, 'user': UserSerializer(user).data}


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AuthThrottle])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    return Response(_session_payload(user), status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AuthThrottle])
def login(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    account = _find_user(serializer.validated_data['username'])
    user = account and authenticate(
        request,
        username=account.username,
        password=serializer.validated_data['password'],
    )
    if not user:
        return Response({'detail': 'Invalid username or password.'}, status=status.HTTP_400_BAD_REQUEST)
    return Response(_session_payload(user))


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    Token.objects.filter(user=request.user).delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@throttle_classes([AuthThrottle])
def change_password(request):
    """Change the password and sign out every other device by issuing a new token."""
    serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
    serializer.is_valid(raise_exception=True)
    request.user.set_password(serializer.validated_data['new_password'])
    request.user.save(update_fields=['password'])
    Token.objects.filter(user=request.user).delete()
    return Response(_session_payload(request.user))


GENERIC_RESET_REPLY = {
    'detail': "If an account uses that email, we've sent a link to reset the password. Check your inbox and spam folder."
}


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([PasswordResetThrottle])
def password_reset_request(request):
    """Email a reset link. Always gives the same reply so emails can't be probed."""
    serializer = PasswordResetRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    users = User.objects.filter(email__iexact=serializer.validated_data['email'].strip(), is_active=True)
    for user in users:
        if user.has_usable_password():
            send_password_reset(user, default_token_generator.make_token(user))
    return Response(GENERIC_RESET_REPLY)


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AuthThrottle])
def password_reset_confirm(request):
    """Set a new password from an emailed link, then sign the user in.

    Tokens expire after PASSWORD_RESET_TIMEOUT and stop working once the
    password changes, so each link can only be used once.
    """
    serializer = PasswordResetConfirmSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data
    try:
        user = User.objects.get(pk=force_str(urlsafe_base64_decode(data['uid'])), is_active=True)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None
    if user is None or not default_token_generator.check_token(user, data['token']):
        return Response({'detail': 'This reset link is invalid or has expired. Request a new one.'},
                        status=status.HTTP_400_BAD_REQUEST)
    try:
        validate_password(data['new_password'], user=user)
    except DjangoValidationError as exc:
        return Response({'new_password': list(exc.messages)}, status=status.HTTP_400_BAD_REQUEST)
    user.set_password(data['new_password'])
    user.save(update_fields=['password'])
    Token.objects.filter(user=user).delete()  # sign out everywhere else
    return Response(_session_payload(user))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(UserSerializer(request.user).data)


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def profile(request):
    """The signed-in user's own profile. Users can't read or change anyone else's."""
    obj, _ = Profile.objects.select_related('user', 'avatar').get_or_create(user=request.user)
    if request.method == 'PATCH':
        serializer = ProfileSerializer(obj, data=request.data, partial=True, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        obj.refresh_from_db()
    return Response(ProfileSerializer(obj, context={'request': request}).data)
