from io import BytesIO

from django.contrib.auth.models import User
from django.core.cache import cache
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from MediaApp.models import StoredImage


def make_image(fmt='PNG', size=(64, 48), color=(255, 104, 26)):
    buf = BytesIO()
    Image.new('RGB', size, color).save(buf, fmt)
    return buf.getvalue()


class ImageUploadTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.user = User.objects.create_user('alice', password='Wandra-Trip-2026')
        token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

    def upload(self, data, name='photo.png', content_type='image/png'):
        return self.client.post('/api/images/', {'file': SimpleUploadedFile(name, data, content_type=content_type)},
                                format='multipart')

    def test_upload_and_serve(self):
        resp = self.upload(make_image())
        self.assertEqual(resp.status_code, 201)
        self.assertTrue(resp.data['url'].startswith('http://testserver/images/'))
        served = self.client.get(f"/images/{resp.data['id']}")
        self.assertEqual(served.status_code, 200)
        self.assertEqual(served['Content-Type'], 'image/png')
        self.assertIn('immutable', served['Cache-Control'])
        self.assertEqual(Image.open(BytesIO(served.content)).size, (64, 48))

    def test_large_images_are_resized(self):
        resp = self.upload(make_image('JPEG', size=(3200, 2000)), name='big.jpg', content_type='image/jpeg')
        self.assertEqual(resp.status_code, 201)
        self.assertEqual((resp.data['width'], resp.data['height']), (1600, 1000))

    def test_rejects_non_images_and_anonymous(self):
        self.assertEqual(self.upload(b'<script>alert(1)</script>', name='x.png').status_code, 400)
        self.assertEqual(self.client.post('/api/images/', {}, format='multipart').status_code, 400)
        self.client.credentials()
        self.assertEqual(self.upload(make_image()).status_code, 401)
        self.assertEqual(StoredImage.objects.count(), 0)

    def test_unknown_image_404(self):
        self.assertEqual(self.client.get('/images/00000000-0000-0000-0000-000000000000').status_code, 404)

    def test_avatar_must_be_own_upload(self):
        image_id = self.upload(make_image()).data['id']
        resp = self.client.patch('/auth/profile', {'avatar_id': image_id}, format='json')
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.data['avatar'].endswith(image_id))
        bob = User.objects.create_user('bob', password='Wandra-Trip-2026')
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {Token.objects.create(user=bob).key}')
        self.assertEqual(self.client.patch('/auth/profile', {'avatar_id': image_id}, format='json').status_code, 400)
