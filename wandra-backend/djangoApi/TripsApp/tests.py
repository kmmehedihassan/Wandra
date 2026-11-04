from datetime import timedelta

from django.contrib.auth.models import User
from django.core import mail
from django.test import override_settings
from django.utils import timezone
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from TripsApp.models import Booking, CartItem, RoomType, Tour

CONTACT = {'name': 'Alice', 'email': 'alice@example.com', 'phone': '+880 1711 000000'}


def day(offset):
    return (timezone.localdate() + timedelta(days=offset)).isoformat()


class TripsTestCase(APITestCase):
    def setUp(self):
        self.alice = self.make_user('alice')
        self.login(self.alice)
        self.room = RoomType.objects.get(pk=1)  # Sayeman Beach Resort, Normal, seeded by migration
        self.room.quantity = 3
        self.room.save()
        self.tour = Tour.objects.get(pk=1)
        self.tour.seats_per_date = 5
        self.tour.save()

    def make_user(self, name):
        return User.objects.create_user(username=name, password='Wandra-Trip-2026', email=f'{name}@example.com')

    def login(self, user):
        token, _ = Token.objects.get_or_create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

    def add_hotel(self, rooms=1, checkin=1, checkout=3, room_id=1):
        return self.client.post('/api/cart/', {
            'type': 'hotel', 'roomid': room_id, 'quantity': rooms, 'checkin': day(checkin), 'checkout': day(checkout),
        }, format='json')

    def add_tour(self, tickets=2, date=5, **extra):
        payload = {'type': 'tour', 'refId': self.tour.id, 'quantity': tickets, 'checkin': day(date), 'contact': CONTACT}
        payload.update(extra)
        return self.client.post('/api/cart/', payload, format='json')


class CatalogTests(TripsTestCase):
    def test_catalog_is_seeded(self):
        self.assertEqual(Tour.objects.count(), 31)
        self.assertEqual(RoomType.objects.filter(hotel_id=1).count(), 3)


class CartTests(TripsTestCase):
    def test_cart_requires_login(self):
        self.client.credentials()
        self.assertEqual(self.client.get('/api/cart/').status_code, 401)

    def test_add_hotel_uses_server_price_and_nights(self):
        resp = self.client.post('/api/cart/', {
            'type': 'hotel', 'roomid': 1, 'quantity': 2, 'checkin': day(1), 'checkout': day(4), 'price': 1,
        }, format='json')
        self.assertEqual(resp.status_code, 201)
        item = resp.data['items'][0]
        self.assertEqual(item['price'], 8000)  # client-sent price ignored
        self.assertEqual(item['days'], 3)
        self.assertEqual(item['total'], 8000 * 2 * 3)
        self.assertEqual(resp.data['total'], 48000)
        self.assertEqual(item['name'], 'Sayeman Beach Resort')
        self.assertEqual(item['roomtype'], 'Normal')

    def test_add_tour(self):
        resp = self.add_tour(tickets=3)
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.data['items'][0]['total'], self.tour.price * 3)
        self.assertEqual(resp.data['items'][0]['contact']['email'], CONTACT['email'])

    def test_same_slot_is_merged(self):
        self.add_hotel(rooms=1)
        resp = self.add_hotel(rooms=1)
        self.assertEqual(len(resp.data['items']), 1)
        self.assertEqual(resp.data['items'][0]['totalrooms'], 2)

    def test_rejects_bad_input(self):
        self.assertEqual(self.add_hotel(checkin=-1, checkout=1).status_code, 409)  # past date
        self.assertEqual(self.add_hotel(checkin=3, checkout=3).status_code, 409)  # zero nights
        self.assertEqual(self.add_hotel(rooms=4).status_code, 409)  # more than exist
        self.assertEqual(self.add_hotel(room_id=999).status_code, 400)
        self.assertEqual(self.add_tour(contact=None).status_code, 400)
        self.assertEqual(self.add_tour(tickets=6).status_code, 409)  # more than seats
        self.assertEqual(CartItem.objects.count(), 0)

    def test_remove_and_clear(self):
        item_id = self.add_hotel().data['items'][0]['id']
        self.add_tour()
        resp = self.client.delete(f'/api/cart/{item_id}/')
        self.assertEqual(len(resp.data['items']), 1)
        self.assertEqual(self.client.delete('/api/cart/').data['items'], [])

    def test_users_cannot_touch_each_others_cart(self):
        item_id = self.add_hotel().data['items'][0]['id']
        self.login(self.make_user('bob'))
        self.assertEqual(self.client.get('/api/cart/').data['items'], [])
        self.assertEqual(self.client.delete(f'/api/cart/{item_id}/').status_code, 404)
        self.assertTrue(CartItem.objects.filter(pk=item_id).exists())


class CheckoutTests(TripsTestCase):
    def test_checkout_creates_bookings_and_empties_cart(self):
        self.add_hotel(rooms=2)
        self.add_tour(tickets=2)
        resp = self.client.post('/api/checkout/')
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(len(resp.data['bookings']), 2)
        self.assertEqual(resp.data['total'], 8000 * 2 * 2 + self.tour.price * 2)
        self.assertEqual(len({b['reference'] for b in resp.data['bookings']}), 1)
        self.assertEqual(CartItem.objects.count(), 0)
        listing = self.client.get('/api/bookings/').data
        self.assertEqual({b['status'] for b in listing}, {'confirmed'})

    def test_empty_cart(self):
        self.assertEqual(self.client.post('/api/checkout/').status_code, 400)

    def test_checkout_rechecks_availability(self):
        self.add_hotel(rooms=2, checkin=1, checkout=3)
        # Bob books 2 of the 3 rooms for an overlapping night first.
        alice_token = self.client._credentials
        self.login(self.make_user('bob'))
        self.add_hotel(rooms=2, checkin=2, checkout=4)
        self.assertEqual(self.client.post('/api/checkout/').status_code, 201)
        self.client.credentials(**alice_token)
        resp = self.client.post('/api/checkout/')
        self.assertEqual(resp.status_code, 409)
        self.assertIn('Only 1', resp.data['detail'])
        self.assertEqual(Booking.objects.filter(user=self.alice).count(), 0)
        self.assertEqual(CartItem.objects.filter(user=self.alice).count(), 1)  # cart kept

    def test_back_to_back_stays_do_not_overlap(self):
        self.add_hotel(rooms=3, checkin=1, checkout=3)
        self.client.post('/api/checkout/')
        self.assertEqual(self.add_hotel(rooms=3, checkin=3, checkout=5).status_code, 201)

    def test_tour_seats_are_per_date(self):
        self.add_tour(tickets=5, date=5)
        self.client.post('/api/checkout/')
        self.assertEqual(self.add_tour(tickets=1, date=5).status_code, 409)
        self.assertEqual(self.add_tour(tickets=5, date=6).status_code, 201)


class BookingTests(TripsTestCase):
    def book(self):
        self.add_hotel(rooms=3)
        return self.client.post('/api/checkout/').data['bookings'][0]['id']

    def test_cancel_frees_rooms(self):
        booking_id = self.book()
        self.assertEqual(self.add_hotel(rooms=1).status_code, 409)
        resp = self.client.post(f'/api/bookings/{booking_id}/cancel/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data['status'], 'cancelled')
        self.assertEqual(self.client.post(f'/api/bookings/{booking_id}/cancel/').status_code, 400)
        self.assertEqual(self.add_hotel(rooms=3).status_code, 201)

    def test_cannot_cancel_started_trip_or_others_booking(self):
        booking_id = self.book()
        Booking.objects.filter(pk=booking_id).update(checkin=timezone.localdate())
        self.assertEqual(self.client.post(f'/api/bookings/{booking_id}/cancel/').status_code, 400)
        self.login(self.make_user('bob'))
        self.assertEqual(self.client.post(f'/api/bookings/{booking_id}/cancel/').status_code, 404)
        self.assertEqual(self.client.get('/api/bookings/').data, [])


class AvailabilityTests(TripsTestCase):
    def test_hotel_and_tour_availability_are_public(self):
        self.add_hotel(rooms=2, checkin=1, checkout=3)
        self.add_tour(tickets=2, date=5)
        self.client.post('/api/checkout/')
        self.client.credentials()
        resp = self.client.get(f'/api/availability/hotels/1/?checkin={day(2)}&checkout={day(5)}')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data['rooms'][0], {'roomid': 1, 'left': 1, 'total': 3})
        resp = self.client.get(f'/api/availability/tours/1/?date={day(5)}')
        self.assertEqual(resp.data['left'], 3)
        self.assertEqual(self.client.get('/api/availability/hotels/1/?checkin=bad').status_code, 400)


@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend', FRONTEND_URL='https://wandra.example')
class BookingEmailTests(TripsTestCase):
    def test_confirmation_email_lists_every_line(self):
        self.add_hotel(rooms=2, checkin=1, checkout=3)
        self.add_tour(tickets=2)
        data = self.client.post('/api/checkout/').data
        self.assertEqual(len(mail.outbox), 1)
        msg = mail.outbox[0]
        self.assertEqual(msg.to, ['alice@example.com'])
        self.assertEqual(msg.subject, 'Your Wandra booking is confirmed')
        self.assertIn(data['reference'][:8].upper(), msg.body)
        self.assertIn('Sayeman Beach Resort', msg.body)
        self.assertIn(self.tour.title, msg.body)
        self.assertIn(f"Total: ৳{data['total']:,}", msg.body)
        self.assertIn('https://wandra.example/dashboard?tab=bookings', msg.alternatives[0][0])

    def test_cancellation_email(self):
        self.add_hotel(rooms=1)
        booking_id = self.client.post('/api/checkout/').data['bookings'][0]['id']
        self.client.post(f'/api/bookings/{booking_id}/cancel/')
        self.assertEqual(len(mail.outbox), 2)
        self.assertEqual(mail.outbox[1].subject, 'Your Wandra booking was cancelled')

    def test_failed_checkout_sends_nothing(self):
        self.client.post('/api/checkout/')
        self.assertEqual(len(mail.outbox), 0)

    @override_settings(EMAIL_BACKEND='django.core.mail.backends.smtp.EmailBackend', EMAIL_HOST='127.0.0.1', EMAIL_PORT=1)
    def test_email_failure_does_not_break_checkout(self):
        self.add_hotel(rooms=1)
        self.assertEqual(self.client.post('/api/checkout/').status_code, 201)



class ReviewTests(TripsTestCase):
    def finished_booking(self, user=None, kind='hotel'):
        """Create a confirmed booking that ended yesterday."""
        user = user or self.alice
        start, end = timezone.localdate() - timedelta(days=3), timezone.localdate() - timedelta(days=1)
        if kind == 'tour':
            return Booking.objects.create(user=user, kind='tour', tour=self.tour, quantity=1, checkin=start,
                                          unit_price_paid=self.tour.price, total=self.tour.price)
        return Booking.objects.create(user=user, kind='hotel', room=self.room, quantity=1, checkin=start,
                                      checkout=end, unit_price_paid=self.room.price, total=self.room.price * 2)

    def review(self, **payload):
        body = {'hotel': 1, 'rating': 5, 'text': 'Lovely stay right by the beach.'}
        body.update(payload)
        body = {k: v for k, v in body.items() if v is not None}
        return self.client.post('/api/reviews/', body, format='json')

    def test_reviews_are_public_and_need_a_target(self):
        self.client.credentials()
        resp = self.client.get('/api/reviews/?hotel=1')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual((resp.data['count'], resp.data['average'], resp.data['canReview']), (0, None, False))
        self.assertEqual(self.client.get('/api/reviews/').status_code, 400)
        self.assertEqual(self.client.post('/api/reviews/', {}, format='json').status_code, 401)

    def test_only_after_a_finished_trip(self):
        self.assertEqual(self.review().status_code, 403)  # no booking
        upcoming = self.add_hotel(rooms=1)
        self.assertEqual(upcoming.status_code, 201)
        self.client.post('/api/checkout/')
        self.assertEqual(self.review().status_code, 403)  # trip hasn't happened yet
        self.finished_booking()
        self.assertTrue(self.client.get('/api/reviews/?hotel=1').data['canReview'])
        self.assertEqual(self.review().status_code, 201)

    def test_cancelled_booking_does_not_count(self):
        booking = self.finished_booking()
        booking.status = Booking.Status.CANCELLED
        booking.save()
        self.assertEqual(self.review().status_code, 403)

    def test_one_review_per_user_updates_in_place(self):
        self.finished_booking()
        self.review(rating=5)
        resp = self.review(rating=3, text='Good, but the pool was closed.')
        self.assertEqual(resp.status_code, 200)
        data = self.client.get('/api/reviews/?hotel=1').data
        self.assertEqual((data['count'], data['average']), (1, 3.0))
        self.assertEqual(data['myReview']['rating'], 3)

    def test_average_summary_and_validation(self):
        self.finished_booking()
        self.finished_booking(kind='tour')
        self.review(rating=4)
        self.review(hotel=None, tour=self.tour.id, rating=5, text='Best tour of the year, highly recommended.')
        bob = self.make_user('bob')
        self.finished_booking(user=bob)
        self.login(bob)
        self.review(rating=2, text='Rooms were noisy at night.')
        summary = self.client.get('/api/reviews/summary/').data
        self.assertEqual(summary['hotels'][1], {'average': 3.0, 'count': 2})
        self.assertEqual(summary['tours'][self.tour.id], {'average': 5.0, 'count': 1})
        self.assertEqual(self.review(rating=6).status_code, 400)
        self.assertEqual(self.review(text='ok').status_code, 400)
        self.assertEqual(self.review(tour=self.tour.id).status_code, 400)  # both targets

    def test_delete_own_review_only(self):
        self.finished_booking()
        review_id = self.review().data['id']
        self.login(self.make_user('bob'))
        self.assertEqual(self.client.delete(f'/api/reviews/{review_id}/').status_code, 403)
        self.login(self.alice)
        self.assertEqual(self.client.delete(f'/api/reviews/{review_id}/').status_code, 204)
