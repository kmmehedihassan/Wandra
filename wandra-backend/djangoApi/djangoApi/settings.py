from pathlib import Path
import dj_database_url
from decouple import config, Csv
from django.core.exceptions import ImproperlyConfigured

BASE_DIR = Path(__file__).resolve().parent.parent

DEBUG = config('DEBUG', default=False, cast=bool)

# SECRET_KEY must come from the environment in production. A throwaway key is
# only allowed for local development (DEBUG=True).
SECRET_KEY = config('SECRET_KEY', default='')
if not SECRET_KEY:
    if DEBUG:
        SECRET_KEY = 'django-insecure-local-development-only'
    else:
        raise ImproperlyConfigured('SECRET_KEY environment variable is required when DEBUG is False.')
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=Csv())

# Origins allowed to POST forms (the Django admin) over HTTPS. Defaults to the
# non-local ALLOWED_HOSTS, e.g. https://wandra.up.railway.app.
CSRF_TRUSTED_ORIGINS = config(
    'CSRF_TRUSTED_ORIGINS',
    default=','.join(f'https://{h.lstrip(".")}' for h in ALLOWED_HOSTS if h not in ('localhost', '127.0.0.1', '*')),
    cast=Csv(),
)

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'AuthenApp.apps.AuthenappConfig',
    'PostsApp.apps.PostsappConfig',
    'TripsApp.apps.TripsappConfig',
    'MediaApp.apps.MediaappConfig',
    'rest_framework',
    'rest_framework.authtoken',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    # Anyone may read; writing requires a logged-in user. Views tighten this further.
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'auth': config('AUTH_THROTTLE_RATE', default='10/min'),
        'uploads': config('UPLOAD_THROTTLE_RATE', default='30/hour'),
        'password_reset': config('PASSWORD_RESET_THROTTLE_RATE', default='5/hour'),
    },
}

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# CORS: the React frontend is served from a different origin.
CORS_ALLOW_ALL_ORIGINS = config('CORS_ALLOW_ALL_ORIGINS', default=False, cast=bool)
CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS', default='http://localhost:3000', cast=Csv())

ROOT_URLCONF = 'djangoApi.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'djangoApi.wsgi.application'

# Database — SQLite locally, PostgreSQL on Railway
DATABASES = {
    'default': dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
        conn_max_age=600
    )
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = config('TIME_ZONE', default='Asia/Dhaka')
USE_I18N = True
USE_TZ = True

# Static files (the Django admin's CSS/JS) — WhiteNoise serves them in production.
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STORAGES = {
    'default': {'BACKEND': 'django.core.files.storage.FileSystemStorage'},
    'staticfiles': {
        'BACKEND': 'django.contrib.staticfiles.storage.StaticFilesStorage' if DEBUG
        else 'whitenoise.storage.CompressedManifestStaticFilesStorage',
    },
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Email (password reset). Brevo's free HTTP API is preferred because Railway
# blocks outgoing SMTP on free plans; any SMTP server works via EMAIL_HOST.
# Without either, emails are printed to the server log (fine for development).
BREVO_API_KEY = config('BREVO_API_KEY', default='')
EMAIL_HOST = config('EMAIL_HOST', default='')
if BREVO_API_KEY:
    EMAIL_BACKEND = 'AuthenApp.email.BrevoEmailBackend'
elif EMAIL_HOST:
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
    EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
    EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
    EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
    EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=True, cast=bool)
    EMAIL_TIMEOUT = 15
else:
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='Wandra <no-reply@example.com>')

# Where links in emails point (the React app).
FRONTEND_URL = config('FRONTEND_URL', default=CORS_ALLOWED_ORIGINS[0] if CORS_ALLOWED_ORIGINS else 'http://localhost:3000')
PASSWORD_RESET_TIMEOUT = config('PASSWORD_RESET_TIMEOUT', default=3600, cast=int)  # seconds

# Behind Railway's proxy, so absolute URLs (e.g. uploaded image links) use https.
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# HTTPS hardening in production. Railway's edge already redirects HTTP to
# HTTPS, so Django's own redirect is opt-in (it would break plain-HTTP health checks).
if not DEBUG:
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_SSL_REDIRECT = config('SECURE_SSL_REDIRECT', default=False, cast=bool)
    SECURE_HSTS_SECONDS = config('SECURE_HSTS_SECONDS', default=3600, cast=int)
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_REFERRER_POLICY = 'same-origin'
    # HSTS is limited to this host: on a shared domain like *.up.railway.app we
    # don't control the other subdomains, so includeSubDomains/preload stay off.
    SILENCED_SYSTEM_CHECKS = ['security.W005', 'security.W021']
    if not SECURE_SSL_REDIRECT:
        SILENCED_SYSTEM_CHECKS.append('security.W008')

# Image uploads are sent as multipart form data.
DATA_UPLOAD_MAX_MEMORY_SIZE = 6 * 1024 * 1024
FILE_UPLOAD_MAX_MEMORY_SIZE = 6 * 1024 * 1024
