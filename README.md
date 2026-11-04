# Wandra

Travel booking site for destinations in Bangladesh: browse destinations, book guided tours and hotels, and share travel stories on the blog.

| Part | Stack | Folder |
|---|---|---|
| Frontend | React 18, React Router 5 | `wandra-frontend/` |
| Backend | Django 6 + Django REST Framework (token auth) | `wandra-backend/djangoApi/` |

## Run locally

**Backend**

```bash
cd wandra-backend/djangoApi
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # sets DEBUG=True for local development
python manage.py migrate
python manage.py runserver    # http://127.0.0.1:8000
```

Run the API tests with `python manage.py test`.

**Frontend**

```bash
cd wandra-frontend
npm ci
cp .env.example .env          # REACT_APP_API_URL points at the backend
npm start                     # http://localhost:3000
```

## Configuration

Backend (environment variables, see `wandra-backend/djangoApi/.env.example`):

- `SECRET_KEY` — required when `DEBUG` is not `True`
- `DEBUG`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `DATABASE_URL`
- `AUTH_THROTTLE_RATE` — login/register rate limit per IP (default `10/min`)
- `UPLOAD_THROTTLE_RATE` — image uploads per user (default `30/hour`)
- `TIME_ZONE` — defaults to `Asia/Dhaka`

Frontend (see `wandra-frontend/.env.example`):

- `REACT_APP_API_URL` — backend base URL
- `REACT_APP_EMAILJS_SERVICE_ID`, `REACT_APP_EMAILJS_TEMPLATE_ID`, `REACT_APP_EMAILJS_PUBLIC_KEY` — optional booking-confirmation emails

## API

Send `Authorization: Token <token>` on authenticated requests.

**Accounts**

| Method | Path | Notes |
|---|---|---|
| POST | `/auth/register` | `{username, email, password}` → `{token, user}` |
| POST | `/auth/login` | `{username, password}` → `{token, user}` |
| POST | `/auth/logout` | revokes the token |
| GET | `/auth/me` | current user |
| GET / PATCH | `/auth/profile` | own profile: `firstname, lastname, gender, birthday, phone, address, avatar_id` |

**Images** (profile photos and post covers)

| Method | Path | Notes |
|---|---|---|
| POST | `/api/images/` | multipart `file` (JPEG/PNG/WebP/GIF, ≤ 5 MB) → `{id, url}`; resized to ≤ 1600 px and stored in the database |
| GET | `/images/<id>` | public, cached forever |

Uploads are stored in the database rather than on disk because hosts like Railway wipe the disk on every deploy.

**Blog**

| Method | Path | Notes |
|---|---|---|
| GET | `/api/posts/` | public; optional `?q=`, `?cat=`, `?author=` |
| POST | `/api/posts/` | `{title, body, categories, image_id}` as the signed-in user |
| GET / PATCH / DELETE | `/api/posts/<id>/` | editing and deleting: author or staff only |
| POST / DELETE | `/api/posts/<id>/like/` | like / unlike (one like per user) |
| GET | `/api/posts/categories/` | allowed categories |

**Cart and bookings** (login required unless noted)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/cart/` | `{items, total}` |
| POST | `/api/cart/` | tour: `{type: "tour", refId, quantity, checkin, contact: {name, email, phone}}`; hotel: `{type: "hotel", roomid, quantity, checkin, checkout}`. Prices come from the server; `409` if not available |
| DELETE | `/api/cart/` | empty the cart |
| DELETE | `/api/cart/<id>/` | remove one line |
| POST | `/api/checkout/` | books the whole cart or nothing (`409` if something sold out) |
| GET | `/api/bookings/` | the user's bookings, newest first |
| POST | `/api/bookings/<id>/cancel/` | only before the trip starts |
| GET | `/api/availability/hotels/<id>/?checkin=&checkout=` | public — rooms left per room type |
| GET | `/api/availability/tours/<id>/?date=` | public — seats left that day |

Checkout is a demo: card details are validated in the browser and never sent to the server.

## Catalog

The tour, hotel and destination catalog lives in `wandra-frontend/src/components/Database/`.
The backend keeps its own copy of tour/room prices and stock (`TripsApp/catalog.json`, loaded
by `migrate`). After changing prices, rooms or tours in the frontend data, run:

```bash
cd wandra-frontend && npm run export-catalog
```

```bash
cd wandra-backend/djangoApi && python manage.py sync_catalog
```

Hotel rooms and tour seats (30 per date by default) can also be adjusted in the Django admin.

## Notes

- Carts, bookings, profiles and blog posts are stored in the backend. A guest's cart is kept in
  the browser and moved into the account when they log in.
- `migrate` seeds four starter blog posts; delete or edit them in the Django admin.
