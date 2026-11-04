from django.contrib import admin

from AuthenApp.models import Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'gender', 'phone', 'updated_at')
    search_fields = ('user__username', 'user__email', 'phone')
    raw_id_fields = ('avatar',)
