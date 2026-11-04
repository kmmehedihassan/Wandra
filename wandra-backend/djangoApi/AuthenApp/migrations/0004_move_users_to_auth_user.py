from django.conf import settings
from django.contrib.auth.hashers import make_password
from django.db import migrations


def copy_registered_users(apps, schema_editor):
    """Move accounts from the plaintext RegisterTable into auth.User, hashing passwords."""
    RegisterTable = apps.get_model('AuthenApp', 'RegisterTable')
    User = apps.get_model(*settings.AUTH_USER_MODEL.split('.'))
    for row in RegisterTable.objects.all().order_by('UserId'):
        username = (row.UserName or '').strip()
        if not username or not row.UserPass:
            continue
        if User.objects.filter(username=username).exists():
            continue  # keep the first registration for duplicate usernames
        User.objects.create(
            username=username,
            email=row.UserEmail or '',
            password=make_password(row.UserPass),
        )


class Migration(migrations.Migration):

    dependencies = [
        ('AuthenApp', '0003_uploadprofilefile'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RunPython(copy_registered_users, migrations.RunPython.noop),
        migrations.DeleteModel(name='LogIN'),
        migrations.DeleteModel(name='RegisterTable'),
    ]
