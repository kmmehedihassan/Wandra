"""Wishlist API: a user's saved destinations, tours and hotels."""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from TripsApp.models import Destination, Hotel, Tour, WishlistItem

MODELS = {'destination': Destination, 'tour': Tour, 'hotel': Hotel}
MAX_ITEMS = 200


def _serialize(item):
    return {'id': item.id, 'kind': item.kind, 'refId': item.ref_id, 'createdAt': item.created_at}


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def wishlist(request):
    """GET the list; POST {kind, refId} to save something (saving twice is fine)."""
    if request.method == 'POST':
        kind = request.data.get('kind')
        try:
            ref_id = int(request.data.get('refId'))
        except (TypeError, ValueError):
            ref_id = None
        if kind not in MODELS or ref_id is None or not MODELS[kind].objects.filter(pk=ref_id).exists():
            return Response({'detail': 'Unknown item.'}, status=status.HTTP_400_BAD_REQUEST)
        existing = WishlistItem.objects.filter(user=request.user, kind=kind, ref_id=ref_id).first()
        if existing:
            return Response(_serialize(existing))
        if WishlistItem.objects.filter(user=request.user).count() >= MAX_ITEMS:
            return Response({'detail': f'You can save up to {MAX_ITEMS} items.'}, status=status.HTTP_400_BAD_REQUEST)
        item = WishlistItem.objects.create(user=request.user, kind=kind, ref_id=ref_id)
        return Response(_serialize(item), status=status.HTTP_201_CREATED)
    return Response([_serialize(i) for i in WishlistItem.objects.filter(user=request.user)])


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def wishlist_item(request, kind, ref_id):
    WishlistItem.objects.filter(user=request.user, kind=kind, ref_id=ref_id).delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
