from rest_framework import serializers

from MediaApp.models import StoredImage
from PostsApp.models import CATEGORIES, Post, PostComment


class PostSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source='display_author', read_only=True)
    image = serializers.SerializerMethodField()
    image_id = serializers.PrimaryKeyRelatedField(source='image', queryset=StoredImage.objects.all(),
                                                  write_only=True, required=False)
    categories = serializers.ListField(child=serializers.ChoiceField(choices=CATEGORIES), allow_empty=False)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)
    likes = serializers.SerializerMethodField()
    liked = serializers.SerializerMethodField()
    comments = serializers.SerializerMethodField()
    canEdit = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'author', 'title', 'body', 'categories', 'image', 'image_id', 'createdAt', 'updatedAt',
                  'likes', 'liked', 'comments', 'canEdit']

    def _user(self):
        request = self.context.get('request')
        return request.user if request and request.user.is_authenticated else None

    def get_image(self, obj):
        if obj.image_id:
            return obj.image.url(self.context.get('request'))
        return obj.image_path or None

    def get_likes(self, obj):
        return obj.like_count if hasattr(obj, 'like_count') else obj.likes.count()

    def get_comments(self, obj):
        return obj.comment_count if hasattr(obj, 'comment_count') else obj.comments.count()

    def get_liked(self, obj):
        user = self._user()
        if user is None:
            return False
        if hasattr(obj, 'liked_by_me'):
            return bool(obj.liked_by_me)
        return obj.likes.filter(user=user).exists()

    def get_canEdit(self, obj):
        user = self._user()
        return bool(user and (user.is_staff or obj.author_id == user.id))

    def validate_title(self, value):
        value = value.strip()
        if len(value) < 5:
            raise serializers.ValidationError('Give your post a title (at least 5 characters).')
        return value

    def validate_body(self, value):
        value = value.strip()
        if len(value) < 40:
            raise serializers.ValidationError('Tell your story in at least 40 characters.')
        return value

    def validate_categories(self, value):
        return [c for c in CATEGORIES if c in value]  # dedupe, keep a stable order

    def validate_image_id(self, image):
        user = self._user()
        if image is not None and (user is None or image.owner_id != user.id):
            raise serializers.ValidationError('Upload the image first.')
        return image

    def validate(self, attrs):
        if self.instance is None and not attrs.get('image'):
            raise serializers.ValidationError({'image_id': 'Add a cover photo.'})
        return attrs


class CommentSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source='user.username', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    canDelete = serializers.SerializerMethodField()

    class Meta:
        model = PostComment
        fields = ['id', 'author', 'body', 'createdAt', 'canDelete']

    def get_canDelete(self, obj):
        user = self.context['request'].user
        return bool(user.is_authenticated and (user.is_staff or obj.user_id == user.id or obj.post.author_id == user.id))

    def validate_body(self, value):
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError('Write a comment first.')
        return value
