from django.conf import settings
from django.core.checks import Warning, register


@register('deploy', deploy=True)
def email_configured(app_configs, **kwargs):
    """Warn when production would only log password-reset emails."""
    if settings.EMAIL_BACKEND.endswith('console.EmailBackend'):
        return [Warning(
            'No email service is configured, so password-reset emails are only written to the log.',
            hint='Set BREVO_API_KEY and DEFAULT_FROM_EMAIL (free at brevo.com), or EMAIL_HOST for SMTP.',
            id='wandra.W001',
        )]
    return []
