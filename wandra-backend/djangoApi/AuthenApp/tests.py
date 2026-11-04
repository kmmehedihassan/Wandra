from datetime import date

from django.contrib.auth.models import User
from django.core.cache import cache
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from AuthenApp.models import Profile
from EmployeeApp.models import MyHotelInfo, MyReservation

STRONG_PASSWORD = 'Wandra-Trip-2026'


class AuthTestCase(APITestCase):
    def setUp(self):
        cache.clear()  # reset login/register throttling between tests

    def make_user(self, username='alice', password=STRONG_PASSWORD, **extra):
        return User.objects.create_user(username=username, password=password,
                                        email=f'{username}@example.com', **extra)

    def login_as(self, user):
        token, _ = Token.objects.get_or_create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')


class RegisterLoginTests(AuthTestCase):
    def test_register_hashes_password_and_returns_token(self):
        resp = self.client.post('/auth/register', {
            'username': 'alice', 'email': 'alice@example.com', 'password': STRONG_PASSWORD,
        }, format='json')
        self.assertEqual(resp.status_code, 201)
        self.assertIn('token', resp.data)
        self.assertEqual(resp.data['user']['username'], 'alice')
        self.assertNotIn('password', resp.data['user'])
        user = User.objects.get(username='alice')
        self.assertNotEqual(user.password, STRONG_PASSWORD)
        self.assertTrue(user.check_password(STRONG_PASSWORD))

    def test_register_rejects_weak_password_and_duplicates(self):
        resp = self.client.post('/auth/register', {
            'username': 'bob', 'email': 'bob@example.com', 'password': '1234',
        }, format='json')
        self.assertEqual(resp.status_code, 400)
        self.make_user('carol')
        resp = self.client.post('/auth/register', {
            'username': 'carol', 'email': 'other@example.com', 'password': STRONG_PASSWORD,
        }, format='json')
        self.assertEqual(resp.status_code, 400)
        resp = self.client.post('/auth/register', {
            'username': 'dave', 'email': 'carol@example.com', 'password': STRONG_PASSWORD,
        }, format='json')
        self.assertEqual(resp.status_code, 400)

    def test_login_success_and_failure(self):
        self.make_user()
        ok = self.client.post('/auth/login', {'username': 'alice', 'password': STRONG_PASSWORD}, format='json')
        self.assertEqual(ok.status_code, 200)
        self.assertEqual(ok.data['user']['email'], 'alice@example.com')
        bad = self.client.post('/auth/login', {'username': 'alice', 'password': 'wrong'}, format='json')
        self.assertEqual(bad.status_code, 400)
        self.assertNotIn('token', bad.data)

    def test_me_and_logout_revokes_token(self):
        user = self.make_user()
        self.assertEqual(self.client.get('/auth/me').status_code, 401)
        self.login_as(user)
        self.assertEqual(self.client.get('/auth/me').data['username'], 'alice')
        self.assertEqual(self.client.post('/auth/logout').status_code, 204)
        self.assertFalse(Token.objects.filter(user=user).exists())
        self.assertEqual(self.client.get('/auth/me').status_code, 401)

    def test_login_is_throttled(self):
        self.make_user()
        codes = [self.client.post('/auth/login', {'username': 'alice', 'password': 'nope'},
                                  format='json').status_code for _ in range(11)]
        self.assertEqual(codes[-1], 429)

    def test_old_plaintext_endpoints_are_gone(self):
        self.assertEqual(self.client.get('/register').status_code, 404)
        self.assertEqual(self.client.get('/login').status_code, 404)


class ProfileTests(AuthTestCase):
    def test_profile_requires_auth(self):
        self.assertEqual(self.client.get('/auth/profile').status_code, 401)
        self.assertEqual(self.client.get('/uploadprofile/').status_code, 404)  # old endpoint removed

    def test_get_creates_empty_profile(self):
        self.login_as(self.make_user())
        resp = self.client.get('/auth/profile')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data['username'], 'alice')
        self.assertEqual(resp.data['email'], 'alice@example.com')
        self.assertIsNone(resp.data['avatar'])

    def test_update_profile(self):
        user = self.make_user()
        self.login_as(user)
        resp = self.client.patch('/auth/profile', {
            'firstname': ' Alice ', 'lastname': 'Khan', 'gender': 'Female', 'birthday': '1990-05-01',
            'phone': '+880 1711 000000', 'address': 'Dhaka',
        }, format='json')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data['firstname'], 'Alice')
        user.refresh_from_db()
        self.assertEqual((user.first_name, user.last_name), ('Alice', 'Khan'))
        self.assertEqual(str(user.profile.birthday), '1990-05-01')

    def test_profile_validation(self):
        self.login_as(self.make_user())
        self.assertEqual(self.client.patch('/auth/profile', {'phone': 'call me'}, format='json').status_code, 400)
        self.assertEqual(self.client.patch('/auth/profile', {'birthday': '2999-01-01'}, format='json').status_code, 400)
        self.assertEqual(self.client.patch('/auth/profile', {'gender': 'robot'}, format='json').status_code, 400)

    def test_profiles_are_private(self):
        bob = self.make_user('bob')
        Profile.objects.create(user=bob, phone='555 1234', address='Somewhere')
        self.login_as(self.make_user())
        resp = self.client.get('/auth/profile')
        self.assertEqual(resp.data['phone'], '')
        self.assertEqual(Profile.objects.get(user=bob).phone, '555 1234')


class LockedDownEndpointTests(AuthTestCase):
    def setUp(self):
        super().setUp()
        MyHotelInfo.objects.create(room_id=1, hotel_id=1, roomquantity=5, remaining=0)
        MyReservation.objects.create(hotel_id=1, room=1, guest='bob', roomquantity=1,
                                     check_in=date(2026, 12, 1), check_out=date(2026, 12, 3))

    def test_anonymous_cannot_delete_all_reservations(self):
        self.assertEqual(self.client.delete('/reserve').status_code, 401)
        self.login_as(self.make_user())
        self.assertEqual(self.client.delete('/reserve').status_code, 400)
        self.assertEqual(MyReservation.objects.count(), 1)

    def test_reservation_listing_is_scoped_to_user(self):
        self.assertEqual(self.client.get('/reserve').status_code, 401)
        self.login_as(self.make_user())
        self.assertEqual(self.client.get('/reserve').json(), [])

    def test_availability_check_is_public(self):
        resp = self.client.get('/reserve/10', {
            'hotel_id': 1, 'room': 1, 'roomquantity': 1,
            'check_in': '2027-01-01', 'check_out': '2027-01-02',
        })
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['msg'], 'Success')

    def test_booking_is_recorded_for_logged_in_user(self):
        self.login_as(self.make_user())
        resp = self.client.post('/reserve/1', {
            'hotel_id': 1, 'room': 1, 'roomquantity': 1, 'guest': 'someone-else',
            'check_in': '2027-02-01', 'check_out': '2027-02-02', 'price': 10, 'cardata': 0,
        }, format='json')
        self.assertEqual(resp.json()['msg'], 'Success')
        self.assertTrue(MyReservation.objects.filter(guest='alice').exists())
        self.assertFalse(MyReservation.objects.filter(guest='someone-else').exists())

    def test_hotel_inventory_writes_require_admin(self):
        payload = {'room_id': 2, 'hotel_id': 1, 'roomquantity': 9, 'remaining': 0}
        self.assertEqual(self.client.post('/myhotel', payload, format='json').status_code, 401)
        self.login_as(self.make_user())
        self.assertEqual(self.client.post('/myhotel', payload, format='json').status_code, 403)
        self.login_as(self.make_user('admin', is_staff=True))
        self.client.post('/myhotel', payload, format='json')
        self.assertTrue(MyHotelInfo.objects.filter(room_id=2).exists())
