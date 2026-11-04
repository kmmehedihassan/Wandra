from io import BytesIO

from django.http import Http404, HttpResponse
from django.views.decorators.http import require_GET
from PIL import Image, UnidentifiedImageError
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes, permission_classes, throttle_classes
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle

from MediaApp.models import StoredImage

MAX_UPLOAD_BYTES = 5 * 1024 * 1024
MAX_STORED_BYTES = 1536 * 1024
MAX_EDGE = 1600
FORMATS = {'JPEG': 'image/jpeg', 'PNG': 'image/png', 'WEBP': 'image/webp', 'GIF': 'image/gif'}


class UploadThrottle(UserRateThrottle):
    scope = 'uploads'


def _normalise(upload):
    """Verify the file is a real image, strip metadata and shrink it if needed."""
    try:
        image = Image.open(upload)
        image.verify()
        upload.seek(0)
        image = Image.open(upload)
        fmt = image.format
    except (UnidentifiedImageError, OSError, ValueError):
        raise ValueError('That file is not a supported image.')
    if fmt not in FORMATS:
        raise ValueError('Use a JPEG, PNG, WebP or GIF image.')
    if fmt == 'GIF':
        image = image.convert('RGBA')
        fmt = 'PNG'
    image.thumbnail((MAX_EDGE, MAX_EDGE))
    if fmt == 'JPEG' and image.mode not in ('RGB', 'L'):
        image = image.convert('RGB')
    out = BytesIO()
    save_kwargs = {'optimize': True}
    if fmt in ('JPEG', 'WEBP'):
        save_kwargs['quality'] = 85
    image.save(out, fmt, **save_kwargs)
    data = out.getvalue()
    if len(data) > MAX_STORED_BYTES and fmt != 'JPEG':
        # Large PNG/WebP photos: re-encode as JPEG to keep the database small.
        out = BytesIO()
        image.convert('RGB').save(out, 'JPEG', quality=82, optimize=True)
        data, fmt = out.getvalue(), 'JPEG'
    if len(data) > MAX_STORED_BYTES:
        raise ValueError('That image is too large. Try a smaller photo.')
    return data, FORMATS[fmt], image.width, image.height


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
@throttle_classes([UploadThrottle])
def upload_image(request):
    """POST multipart `file` → {id, url}. Used for profile photos and post covers."""
    upload = request.FILES.get('file')
    if upload is None:
        return Response({'detail': 'Choose an image to upload.'}, status=status.HTTP_400_BAD_REQUEST)
    if upload.size > MAX_UPLOAD_BYTES:
        return Response({'detail': 'Images must be 5 MB or smaller.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        data, content_type, width, height = _normalise(upload)
    except ValueError as exc:
        return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
    image = StoredImage.objects.create(owner=request.user, content_type=content_type, width=width,
                                       height=height, size=len(data), data=data)
    return Response({'id': str(image.id), 'url': image.url(request), 'width': width, 'height': height},
                    status=status.HTTP_201_CREATED)


@require_GET
def serve_image(request, pk):
    image = StoredImage.objects.filter(pk=pk).only('content_type', 'data').first()
    if image is None:
        raise Http404('Image not found')
    response = HttpResponse(bytes(image.data), content_type=image.content_type)
    # Image ids are random and their content never changes.
    response['Cache-Control'] = 'public, max-age=31536000, immutable'
    response['X-Content-Type-Options'] = 'nosniff'
    return response
