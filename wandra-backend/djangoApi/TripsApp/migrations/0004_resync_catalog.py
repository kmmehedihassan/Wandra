from django.db import migrations


def resync(apps, schema_editor):
    """Pick up catalog.json changes (corrected hotel names) on existing databases."""
    from TripsApp.catalog import sync_catalog

    sync_catalog(apps.get_model('TripsApp', 'Tour'), apps.get_model('TripsApp', 'Hotel'),
                 apps.get_model('TripsApp', 'RoomType'))


class Migration(migrations.Migration):

    dependencies = [
        ('TripsApp', '0003_drop_legacy_employeeapp'),
    ]

    operations = [
        migrations.RunPython(resync, migrations.RunPython.noop),
    ]
