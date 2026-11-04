from django.contrib import admin

from PostsApp.models import Post, PostComment, PostLike


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'author_name', 'created_at')
    search_fields = ('title', 'body', 'author__username', 'author_name')
    raw_id_fields = ('image',)


admin.site.register(PostLike)


@admin.register(PostComment)
class PostCommentAdmin(admin.ModelAdmin):
    list_display = ('post', 'user', 'created_at')
    search_fields = ('body', 'user__username')
