"""Create the admin account from environment variables, once.

Set DJANGO_SUPERUSER_USERNAME, DJANGO_SUPERUSER_EMAIL and
DJANGO_SUPERUSER_PASSWORD on the server (e.g. Railway variables). Runs on
every start (see Procfile) but only creates the account if it doesn't exist,
and never changes an existing password. Does nothing if the variables are unset.
"""
import os

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Create the admin account from DJANGO_SUPERUSER_* environment variables if it does not exist.'

    def handle(self, *args, **options):
        username = os.environ.get('DJANGO_SUPERUSER_USERNAME', '').strip()
        email = os.environ.get('DJANGO_SUPERUSER_EMAIL', '').strip()
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', '')
        if not username or not password:
            self.stdout.write('ensure_admin: DJANGO_SUPERUSER_* not set, skipping.')
            return
        User = get_user_model()
        if User.objects.filter(username__iexact=username).exists():
            self.stdout.write(f'ensure_admin: "{username}" already exists.')
            return
        try:
            validate_password(password, user=User(username=username, email=email))
        except ValidationError as exc:
            self.stderr.write('ensure_admin: password rejected: ' + ' '.join(exc.messages))
            return
        User.objects.create_superuser(username=username, email=email, password=password)
        self.stdout.write(self.style.SUCCESS(f'ensure_admin: created admin "{username}".'))
