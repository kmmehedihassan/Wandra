from django.contrib import admin

from PostsApp.models import Post, PostLike


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'author_name', 'created_at')
    search_fields = ('title', 'body', 'author__username', 'author_name')
    raw_id_fields = ('image',)


admin.site.register(PostLike)
