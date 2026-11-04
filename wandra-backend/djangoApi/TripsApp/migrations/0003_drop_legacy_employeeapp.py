"""Drop the tables of the removed EmployeeApp.

EmployeeApp held tutorial models (departments, employees, students, modules,
file uploads) and the old /reserve and /myhotel booking endpoints, all
replaced by TripsApp. Its tables are dropped here because the app itself is
gone, so its own migrations can no longer run.
"""
from django.db import migrations

LEGACY_TABLES = [
    'EmployeeApp_students_modules',
    'EmployeeApp_students',
    'EmployeeApp_modules',
    'EmployeeApp_departments',
    'EmployeeApp_employees',
    'EmployeeApp_uploadfile',
    'EmployeeApp_myreservation',
    'EmployeeApp_myhotelinfo',
    'EmployeeApp_mytourinfo',
    'EmployeeApp_mytour',
]


def drop_legacy(apps, schema_editor):
    connection = schema_editor.connection
    existing = set(connection.introspection.table_names())
    cascade = ' CASCADE' if connection.vendor == 'postgresql' else ''
    for table in LEGACY_TABLES:
        if table in existing:
            schema_editor.execute(f'DROP TABLE {schema_editor.quote_name(table)}{cascade}')
    # Forget the app's migrations, content types and permissions.
    with connection.cursor() as cursor:
        cursor.execute('DELETE FROM django_migrations WHERE app = %s', ['EmployeeApp'])
    ContentType = apps.get_model('contenttypes', 'ContentType')
    ContentType.objects.filter(app_label='EmployeeApp').delete()


class Migration(migrations.Migration):

    dependencies = [
        ('TripsApp', '0002_seed_catalog'),
        ('contenttypes', '0002_remove_content_type_name'),
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.RunPython(drop_legacy, migrations.RunPython.noop),
    ]
