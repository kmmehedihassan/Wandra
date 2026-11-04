"""Email delivery and the password-reset message.

Brevo (https://www.brevo.com) is used in production: its free plan sends 300
emails a day and works over HTTPS, which matters on hosts such as Railway
that block outgoing SMTP on their free plans. Set BREVO_API_KEY to enable it;
see README.md. Any SMTP server can be used instead via EMAIL_HOST.
"""
import json
import logging
import urllib.error
import urllib.request
from email.utils import getaddresses, parseaddr

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.core.mail.backends.base import BaseEmailBackend
from django.utils.encoding import force_bytes
from django.utils.html import escape
from django.utils.http import urlsafe_base64_encode

logger = logging.getLogger(__name__)

BREVO_URL = 'https://api.brevo.com/v3/smtp/email'


class BrevoEmailBackend(BaseEmailBackend):
    """Django email backend that sends through Brevo's transactional email API."""

    def __init__(self, api_key=None, fail_silently=False, **kwargs):
        super().__init__(fail_silently=fail_silently, **kwargs)
        self.api_key = api_key or settings.BREVO_API_KEY

    def send_messages(self, email_messages):
        sent = 0
        for message in email_messages:
            try:
                self._send(message)
                sent += 1
            except Exception:
                logger.exception('Brevo could not send email to %s', message.to)
                if not self.fail_silently:
                    raise
        return sent

    def _send(self, message):
        name, address = parseaddr(message.from_email or settings.DEFAULT_FROM_EMAIL)
        payload = {
            'sender': {'email': address, **({'name': name} if name else {})},
            'to': [{'email': a, **({'name': n} if n else {})} for n, a in getaddresses(message.to)],
            'subject': message.subject,
            'textContent': message.body,
        }
        for content, mimetype in getattr(message, 'alternatives', []):
            if mimetype == 'text/html':
                payload['htmlContent'] = content
        if message.reply_to:
            payload['replyTo'] = {'email': parseaddr(message.reply_to[0])[1]}
        request = urllib.request.Request(
            BREVO_URL,
            data=json.dumps(payload).encode(),
            headers={'api-key': self.api_key, 'content-type': 'application/json', 'accept': 'application/json'},
            method='POST',
        )
        try:
            with urllib.request.urlopen(request, timeout=15) as response:
                if response.status >= 300:
                    raise RuntimeError(f'Brevo returned HTTP {response.status}')
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode(errors='replace')[:300]
            raise RuntimeError(f'Brevo returned HTTP {exc.code}: {detail}') from exc


def send_password_reset(user, token):
    """Email a reset link for `user`. Returns True if the message was handed to the backend."""
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    link = f"{settings.FRONTEND_URL.rstrip('/')}/reset-password?uid={uid}&token={token}"
    minutes = settings.PASSWORD_RESET_TIMEOUT // 60
    name = user.first_name or user.username
    text = (
        f'Hi {name},\n\n'
        f'Someone asked to reset the password for your Wandra account ({user.username}).\n'
        f'Open this link to choose a new password:\n\n{link}\n\n'
        f'The link works once and expires in {minutes} minutes. '
        "If you didn't ask for this, you can ignore this email — your password won't change.\n\n"
        '— Wandra'
    )
    safe_name, safe_user, safe_link = escape(name), escape(user.username), escape(link)
    html = f"""\
<div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#1d2127;line-height:1.5">
  <h2 style="color:#ff681a;margin:0 0 16px">Reset your Wandra password</h2>
  <p>Hi {safe_name},</p>
  <p>Someone asked to reset the password for your Wandra account (<strong>{safe_user}</strong>).</p>
  <p style="margin:28px 0">
    <a href="{safe_link}" style="background:#ff681a;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:bold">Choose a new password</a>
  </p>
  <p style="font-size:14px;color:#6b7280">The link works once and expires in {minutes} minutes.
  If you didn't ask for this, you can ignore this email — your password won't change.</p>
  <p style="font-size:12px;color:#6b7280;word-break:break-all">If the button doesn't work, paste this link into your browser:<br>{safe_link}</p>
</div>"""
    message = EmailMultiAlternatives('Reset your Wandra password', text, settings.DEFAULT_FROM_EMAIL, [user.email])
    message.attach_alternative(html, 'text/html')
    try:
        return message.send() == 1
    except Exception:
        logger.exception('Password reset email to user %s failed', user.pk)
        return False
