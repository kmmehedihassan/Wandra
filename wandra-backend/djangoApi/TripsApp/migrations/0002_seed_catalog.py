from django.db import migrations


def seed(apps, schema_editor):
    from TripsApp.catalog import sync_catalog

    sync_catalog(apps.get_model('TripsApp', 'Tour'), apps.get_model('TripsApp', 'Hotel'),
                 apps.get_model('TripsApp', 'RoomType'))


class Migration(migrations.Migration):

    dependencies = [
        ('TripsApp', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed, migrations.RunPython.noop),
    ]
