from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import SimpleRateThrottle
from rest_framework.views import APIView

from AuthenApp.models import UploadProfileFile
from AuthenApp.serializers import (
    LoginSerializer,
    RegisterSerializer,
    UploadProfileFileSerializer,
    UserSerializer,
)


class AuthThrottle(SimpleRateThrottle):
    """Per-IP limit on login/register attempts (rate set by AUTH_THROTTLE_RATE)."""

    scope = 'auth'

    def get_cache_key(self, request, view):
        return self.cache_format % {'scope': self.scope, 'ident': self.get_ident(request)}


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
    user = authenticate(
        request,
        username=serializer.validated_data['username'],
        password=serializer.validated_data['password'],
    )
    if user is None:
        return Response({'detail': 'Invalid username or password.'}, status=status.HTTP_400_BAD_REQUEST)
    return Response(_session_payload(user))


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    Token.objects.filter(user=request.user).delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(UserSerializer(request.user).data)


class ProfileFileView(APIView):
    """The authenticated user's own profile. Users can't read or change anyone else's."""

    parser_classes = (MultiPartParser, FormParser, JSONParser)
    permission_classes = [IsAuthenticated]

    def _own_profiles(self, request):
        return UploadProfileFile.objects.filter(UserName=request.user.username)

    def get(self, request):
        serializer = UploadProfileFileSerializer(
            self._own_profiles(request), many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        serializer = UploadProfileFileSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save(UserName=request.user.username)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def patch(self, request, *args, **kwargs):
        profile = self._own_profiles(request).first()
        if profile is None:
            return Response({'detail': 'Profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = UploadProfileFileSerializer(
            profile, data=request.data, partial=True, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, *args, **kwargs):
        deleted, _ = self._own_profiles(request).delete()
        if not deleted:
            return Response({'detail': 'Profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)
