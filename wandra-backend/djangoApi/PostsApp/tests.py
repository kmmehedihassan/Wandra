from io import BytesIO

from django.contrib.auth.models import User
from django.core.cache import cache
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from PostsApp.models import Post

BODY = 'We woke up at five to watch the sun rise over the Bay of Bengal. Worth it.'


class PostTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.alice = self.make_user('alice')
        self.login(self.alice)

    def make_user(self, name, **extra):
        return User.objects.create_user(name, password='Wandra-Trip-2026', **extra)

    def login(self, user):
        token, _ = Token.objects.get_or_create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

    def upload(self):
        buf = BytesIO()
        Image.new('RGB', (40, 30), (20, 120, 200)).save(buf, 'JPEG')
        return self.client.post('/api/images/', {'file': SimpleUploadedFile('c.jpg', buf.getvalue(), 'image/jpeg')},
                                format='multipart').data['id']

    def create(self, **extra):
        payload = {'title': 'Sunrise at Kuakata', 'body': BODY, 'categories': ['Beach'], 'image_id': self.upload()}
        payload.update(extra)
        return self.client.post('/api/posts/', payload, format='json')

    def test_starter_posts_are_seeded_and_public(self):
        self.client.credentials()
        resp = self.client.get('/api/posts/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data), 4)
        self.assertEqual(resp.data[0]['author'], 'Fahim')  # newest first
        self.assertEqual(resp.data[0]['image'], '/images/st2.jpg')
        self.assertFalse(resp.data[0]['canEdit'])

    def test_create_post(self):
        resp = self.create(categories=['Tips', 'Beach', 'Beach'], author='someone-else')
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.data['author'], 'alice')
        self.assertEqual(resp.data['categories'], ['Beach', 'Tips'])
        self.assertTrue(resp.data['image'].startswith('http://testserver/images/'))
        self.assertTrue(resp.data['canEdit'])

    def test_create_validation(self):
        self.assertEqual(self.create(title='Hi').status_code, 400)
        self.assertEqual(self.create(body='Too short').status_code, 400)
        self.assertEqual(self.create(categories=[]).status_code, 400)
        self.assertEqual(self.create(categories=['Spam']).status_code, 400)
        self.assertEqual(self.create(image_id=None).status_code, 400)
        self.client.credentials()
        self.assertEqual(self.client.post('/api/posts/', {}, format='json').status_code, 401)

    def test_cannot_use_someone_elses_image(self):
        image_id = self.upload()
        self.login(self.make_user('bob'))
        self.assertEqual(self.create(image_id=image_id).status_code, 400)

    def test_filters(self):
        self.create(categories=['Food'])
        self.assertEqual(len(self.client.get('/api/posts/?cat=Food').data), 2)
        self.assertEqual(len(self.client.get('/api/posts/?author=alice').data), 1)
        self.assertEqual(len(self.client.get('/api/posts/?q=mangroves').data), 1)

    def test_likes_are_one_per_user(self):
        post_id = Post.objects.get(title__startswith='Into the mangroves').id
        self.assertEqual(self.client.post(f'/api/posts/{post_id}/like/').data, {'likes': 1, 'liked': True})
        self.assertEqual(self.client.post(f'/api/posts/{post_id}/like/').data['likes'], 1)
        self.assertTrue(self.client.get(f'/api/posts/{post_id}/').data['liked'])
        self.login(self.make_user('bob'))
        self.assertEqual(self.client.post(f'/api/posts/{post_id}/like/').data['likes'], 2)
        self.assertEqual(self.client.delete(f'/api/posts/{post_id}/like/').data, {'likes': 1, 'liked': False})
        self.client.credentials()
        self.assertEqual(self.client.post(f'/api/posts/{post_id}/like/').status_code, 401)

    def test_only_author_or_staff_can_edit_or_delete(self):
        post_id = self.create().data['id']
        self.login(self.make_user('bob'))
        self.assertEqual(self.client.patch(f'/api/posts/{post_id}/', {'title': 'Hacked title'}, format='json').status_code, 403)
        self.assertEqual(self.client.delete(f'/api/posts/{post_id}/').status_code, 403)
        self.login(self.alice)
        resp = self.client.patch(f'/api/posts/{post_id}/', {'title': 'Sunrise at Kuakata beach'}, format='json')
        self.assertEqual(resp.data['title'], 'Sunrise at Kuakata beach')
        self.login(self.make_user('admin', is_staff=True))
        self.assertEqual(self.client.delete(f'/api/posts/{post_id}/').status_code, 204)
        self.assertFalse(Post.objects.filter(pk=post_id).exists())

    def test_unknown_post(self):
        self.assertEqual(self.client.get('/api/posts/9999/').status_code, 404)
