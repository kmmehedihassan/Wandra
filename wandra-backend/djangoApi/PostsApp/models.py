from django.conf import settings
from django.db import models

CATEGORIES = ['Beach', 'Nature', 'Culture', 'Adventure', 'Food', 'Tips']


class Post(models.Model):
    author = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL,
                               related_name='posts')
    # Shown when the post has no author account (e.g. the seeded starter posts).
    author_name = models.CharField(max_length=150, blank=True)
    title = models.CharField(max_length=120)
    body = models.TextField()
    categories = models.JSONField(default=list)
    image = models.ForeignKey('MediaApp.StoredImage', null=True, blank=True, on_delete=models.SET_NULL,
                              related_name='+')
    # Path to a bundled frontend image (seeded posts), used when `image` is empty.
    image_path = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    @property
    def display_author(self):
        return self.author.username if self.author_id else self.author_name

    def __str__(self):
        return self.title


class PostLike(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='post_likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=['post', 'user'], name='one_like_per_user')]
