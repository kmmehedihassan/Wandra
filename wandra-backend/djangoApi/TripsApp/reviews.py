"""Reviews API: anyone can read; only travellers with a finished trip can write."""
from django.db.models import Avg, Count
from rest_framework import serializers, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response

from TripsApp.models import Booking, Hotel, Kind, Review, Tour
from TripsApp.services import today


class ReviewSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source='user.username', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    mine = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'author', 'rating', 'text', 'createdAt', 'mine']

    def get_mine(self, obj):
        user = self.context['request'].user
        return user.is_authenticated and obj.user_id == user.id


class ReviewInputSerializer(serializers.Serializer):
    tour = serializers.IntegerField(required=False)
    hotel = serializers.IntegerField(required=False)
    rating = serializers.IntegerField(min_value=1, max_value=5)
    text = serializers.CharField(max_length=2000)

    def validate_text(self, value):
        value = value.strip()
        if len(value) < 10:
            raise serializers.ValidationError('Write at least a sentence (10 characters).')
        return value

    def validate(self, attrs):
        if bool(attrs.get('tour')) == bool(attrs.get('hotel')):
            raise serializers.ValidationError('Review either a tour or a hotel.')
        return attrs


def _target(params):
    """(kind, filter kwargs, object) from ?tour= or ?hotel=, or None."""
    for kind, model, key in ((Kind.TOUR, Tour, 'tour'), (Kind.HOTEL, Hotel, 'hotel')):
        value = params.get(key)
        if value not in (None, ''):
            try:
                obj = model.objects.filter(pk=int(value)).first()
            except (TypeError, ValueError):
                return None
            return (kind, {key: obj}, obj) if obj else None
    return None


def can_review(user, kind, obj):
    """True once the user has a confirmed booking for this tour/hotel that has finished."""
    if not user.is_authenticated:
        return False
    bookings = Booking.objects.filter(user=user, status=Booking.Status.CONFIRMED)
    if kind == Kind.TOUR:
        return bookings.filter(tour=obj, checkin__lt=today()).exists()
    return bookings.filter(room__hotel=obj, checkout__lte=today()).exists()


def _summary(qs):
    data = qs.aggregate(average=Avg('rating'), count=Count('id'))
    return {'average': round(data['average'], 1) if data['average'] else None, 'count': data['count']}


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticatedOrReadOnly])
def reviews(request):
    """GET ?tour=<id> or ?hotel=<id>; POST {tour|hotel, rating, text} creates or updates your review."""
    if request.method == 'POST':
        serializer = ReviewInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        target = _target({'tour': data.get('tour'), 'hotel': data.get('hotel')})
        if target is None:
            return Response({'detail': 'Unknown tour or hotel.'}, status=status.HTTP_400_BAD_REQUEST)
        kind, lookup, obj = target
        if not can_review(request.user, kind, obj):
            return Response({'detail': 'You can review this after your trip is completed.'},
                            status=status.HTTP_403_FORBIDDEN)
        review, created = Review.objects.update_or_create(
            user=request.user, **lookup, defaults={'kind': kind, 'rating': data['rating'], 'text': data['text']})
        return Response(ReviewSerializer(review, context={'request': request}).data,
                        status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    target = _target(request.query_params)
    if target is None:
        return Response({'detail': 'Provide ?tour=<id> or ?hotel=<id>.'}, status=status.HTTP_400_BAD_REQUEST)
    kind, lookup, obj = target
    qs = Review.objects.filter(**lookup).select_related('user')
    mine = qs.filter(user=request.user).first() if request.user.is_authenticated else None
    return Response({
        **_summary(qs),
        'reviews': ReviewSerializer(qs, many=True, context={'request': request}).data,
        'canReview': can_review(request.user, kind, obj),
        'myReview': ReviewSerializer(mine, context={'request': request}).data if mine else None,
    })


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def review_detail(request, pk):
    review = Review.objects.filter(pk=pk).first()
    if review is None:
        return Response({'detail': 'Review not found.'}, status=status.HTTP_404_NOT_FOUND)
    if review.user_id != request.user.id and not request.user.is_staff:
        return Response({'detail': 'You can only delete your own review.'}, status=status.HTTP_403_FORBIDDEN)
    review.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([AllowAny])
def review_summary(request):
    """Average rating and count for every reviewed tour and hotel (for list pages)."""
    result = {'tours': {}, 'hotels': {}}
    for key, field in (('tours', 'tour_id'), ('hotels', 'hotel_id')):
        rows = (Review.objects.filter(**{f'{field}__isnull': False}).values(field)
                .annotate(average=Avg('rating'), count=Count('id')))
        result[key] = {row[field]: {'average': round(row['average'], 1), 'count': row['count']} for row in rows}
    return Response(result)
