import uuid

from django.conf import settings
from django.db import models


class StoredImage(models.Model):
    """An uploaded image kept in the database.

    Hosts like Railway wipe the local disk on every deploy, so uploads are
    stored here instead of MEDIA_ROOT and served by MediaApp.views.serve_image.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='images')
    content_type = models.CharField(max_length=40)
    width = models.PositiveIntegerField()
    height = models.PositiveIntegerField()
    size = models.PositiveIntegerField(help_text='Bytes')
    data = models.BinaryField()
    created_at = models.DateTimeField(auto_now_add=True)

    def url(self, request=None):
        path = f'/images/{self.id}'
        return request.build_absolute_uri(path) if request else path

    def __str__(self):
        return f'{self.id} ({self.content_type}, {self.width}×{self.height})'
