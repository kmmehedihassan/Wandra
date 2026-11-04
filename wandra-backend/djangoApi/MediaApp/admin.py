from django.contrib import admin

from MediaApp.models import StoredImage


@admin.register(StoredImage)
class StoredImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'owner', 'content_type', 'width', 'height', 'size', 'created_at')
    exclude = ('data',)
    readonly_fields = ('owner', 'content_type', 'width', 'height', 'size', 'created_at')
