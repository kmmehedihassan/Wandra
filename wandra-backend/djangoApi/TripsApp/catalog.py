"""Load catalog.json (exported from the frontend data) into Tour/Hotel/RoomType."""
import json
from pathlib import Path

CATALOG_PATH = Path(__file__).with_name('catalog.json')


def sync_catalog(Tour, Hotel, RoomType):
    data = json.loads(CATALOG_PATH.read_text())
    for t in data['tours']:
        Tour.objects.update_or_create(id=t['id'], defaults={'title': t['title'], 'price': t['price'], 'image': t['image']})
    for h in data['hotels']:
        Hotel.objects.update_or_create(id=h['id'], defaults={'name': h['name'], 'price': h['price'], 'image': h['image']})
    for r in data['rooms']:
        RoomType.objects.update_or_create(id=r['id'], defaults={
            'hotel_id': r['hotel'], 'name': r['name'], 'price': r['price'], 'adults': r['adults'],
            'children': r['children'], 'quantity': r['quantity'],
        })
    return len(data['tours']), len(data['hotels']), len(data['rooms'])
