from django.apps import AppConfig


class AuthenappConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'AuthenApp'

    def ready(self):
        from AuthenApp import checks  # noqa: F401  (registers system checks)
