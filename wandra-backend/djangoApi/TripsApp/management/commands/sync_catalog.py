from django.core.management.base import BaseCommand

from TripsApp.catalog import sync_catalog
from TripsApp.models import Destination, Hotel, RoomType, Tour


class Command(BaseCommand):
    help = 'Create or update tours, hotels and room types from TripsApp/catalog.json.'

    def handle(self, *args, **options):
        tours, hotels, rooms = sync_catalog(Tour, Hotel, RoomType, Destination)
        self.stdout.write(self.style.SUCCESS(f'Synced {tours} tours, {hotels} hotels, {rooms} room types.'))
