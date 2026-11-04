from django.db.models import Count, Exists, OuterRef, Q
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response

from PostsApp.models import CATEGORIES, Post, PostLike
from PostsApp.serializers import PostSerializer


def _posts(request):
    qs = Post.objects.select_related('author', 'image').annotate(like_count=Count('likes', distinct=True))
    if request.user.is_authenticated:
        qs = qs.annotate(liked_by_me=Exists(PostLike.objects.filter(post=OuterRef('pk'), user=request.user)))
    return qs


def _can_edit(user, post):
    return user.is_staff or post.author_id == user.id


@api_view(['GET'])
@permission_classes([AllowAny])
def categories(request):
    return Response(CATEGORIES)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticatedOrReadOnly])
def post_list(request):
    """GET posts (optional ?q=, ?cat=, ?author=); POST a new post as the signed-in user."""
    if request.method == 'POST':
        serializer = PostSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        post = serializer.save(author=request.user)
        return Response(PostSerializer(_posts(request).get(pk=post.pk), context={'request': request}).data,
                        status=status.HTTP_201_CREATED)

    qs = _posts(request)
    q = request.query_params.get('q', '').strip()
    if q:
        qs = qs.filter(Q(title__icontains=q) | Q(body__icontains=q) | Q(author__username__icontains=q)
                       | Q(author_name__icontains=q))
    cat = request.query_params.get('cat')
    posts = list(qs)
    if cat:  # JSON list contains-lookups aren't portable to SQLite, so filter in Python.
        posts = [p for p in posts if cat in p.categories]
    author = request.query_params.get('author')
    if author:
        posts = [p for p in posts if p.display_author == author]
    return Response(PostSerializer(posts, many=True, context={'request': request}).data)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticatedOrReadOnly])
def post_detail(request, pk):
    post = _posts(request).filter(pk=pk).first()
    if post is None:
        return Response({'detail': 'Post not found.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(PostSerializer(post, context={'request': request}).data)
    if not _can_edit(request.user, post):
        return Response({'detail': 'You can only change your own posts.'}, status=status.HTTP_403_FORBIDDEN)
    if request.method == 'DELETE':
        post.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    serializer = PostSerializer(post, data=request.data, partial=True, context={'request': request})
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(PostSerializer(_posts(request).get(pk=pk), context={'request': request}).data)


@api_view(['POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def post_like(request, pk):
    """POST to like, DELETE to unlike. Returns the new like count."""
    post = Post.objects.filter(pk=pk).first()
    if post is None:
        return Response({'detail': 'Post not found.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'POST':
        PostLike.objects.get_or_create(post=post, user=request.user)
    else:
        PostLike.objects.filter(post=post, user=request.user).delete()
    return Response({'likes': post.likes.count(), 'liked': request.method == 'POST'})
