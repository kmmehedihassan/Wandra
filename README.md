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

## Deploying (Railway)

**Step-by-step, browser-only guide: [DEPLOY.md](DEPLOY.md)** — free (Neon + Render + Cloudflare Pages) or Railway.

The backend's `Procfile` runs `migrate` and `collectstatic` before starting gunicorn, so a deploy
applies database changes automatically. Python is pinned in `wandra-backend/djangoApi/.python-version`.

Set these variables on the backend service: `DEBUG=False`, `SECRET_KEY`, `ALLOWED_HOSTS`
(your Railway domain), `CORS_ALLOWED_ORIGINS` (your frontend's URL) and `DATABASE_URL`
(added automatically when you attach a Railway Postgres database). On the frontend, set
`REACT_APP_API_URL` to the backend URL before building.

Set `DJANGO_SUPERUSER_USERNAME`, `DJANGO_SUPERUSER_EMAIL` and `DJANGO_SUPERUSER_PASSWORD` and the admin
account is created on the next start (`ensure_admin`, never overwritten); sign in at `/admin/`.

## Payments (SSLCOMMERZ)

Customers pay on SSLCOMMERZ's secure page with bKash, Nagad, Rocket or a card; card and wallet
details never reach this server. Bookings are created only after the server re-checks the payment
with SSLCOMMERZ's validation API (status, amount, currency, transaction id), and the IPN
notification books the order even if the customer closes the tab.

**Test for free (sandbox)**

1. Register at https://developer.sslcommerz.com/registration/ — you get a sandbox store id and
   password by email.
2. Set on the backend: `SSLCOMMERZ_STORE_ID`, `SSLCOMMERZ_STORE_PASSWORD` (leave
   `SSLCOMMERZ_SANDBOX=True`). The cart now shows "Pay with SSLCOMMERZ" and a "Test mode" badge.
3. Pay with SSLCOMMERZ's sandbox test cards or test mobile-banking numbers (listed in their
   developer docs). No real money moves.

**Go live:** apply for a live merchant account with SSLCOMMERZ (business documents required;
they charge a percentage per transaction), then replace the two credentials with the live ones
and set `SSLCOMMERZ_SANDBOX=False`. No code changes are needed.

Without credentials the site uses the demo checkout (no real payment). Payments and their status
(paid, failed, cancelled, or "needs refund" if something sold out while the customer was paying)
are listed under **Trips → Orders** in the Django admin.

| Method | Path | Notes |
|---|---|---|
| GET | `/api/payments/config/` | `{provider: sslcommerz\|demo, sandbox}` |
| POST | `/api/payments/start/` | `{name, phone, address, city}` → `{url}` of the SSLCOMMERZ payment page |
| GET | `/api/payments/orders/<reference>/` | your order's status and bookings |
| POST | `/api/payments/sslcommerz/{success,fail,cancel,ipn}/` | called by SSLCOMMERZ |

## Email (password reset and booking confirmations)

Password-reset, booking-confirmation and cancellation emails are sent with [Brevo](https://www.brevo.com) — free for 300 emails a day,
no credit card. It sends over HTTPS, so it works on Railway (which blocks outgoing SMTP on free
plans).

1. Create a free Brevo account.
2. **Senders, Domains & Dedicated IPs → Senders → Add a sender**: add the address emails should
   come from (e.g. your Gmail) and click the confirmation link Brevo sends to it.
3. **SMTP & API → API Keys → Generate a new API key**.
4. Set on the backend service:
   - `BREVO_API_KEY=<the key>`
   - `DEFAULT_FROM_EMAIL=Wandra <the-sender-you-verified@example.com>`
   - `FRONTEND_URL=https://your-frontend.example.com` (where links in the email point; defaults to
     the first `CORS_ALLOWED_ORIGINS` entry)

Any SMTP server works instead (e.g. Gmail with an app password, on hosts that allow SMTP): set
`EMAIL_HOST`, `EMAIL_PORT` (587), `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD` and `DEFAULT_FROM_EMAIL`.
With neither configured, emails are printed to the server log, which is handy for local development;
`manage.py check --deploy` warns about this in production.

## Configuration

Backend (environment variables, see `wandra-backend/djangoApi/.env.example`):

- `SECRET_KEY` — required when `DEBUG` is not `True`
- `DEBUG`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `DATABASE_URL`
- `AUTH_THROTTLE_RATE` — login/register rate limit per IP (default `10/min`)
- `UPLOAD_THROTTLE_RATE` — image uploads per user (default `30/hour`)
- `TIME_ZONE` — defaults to `Asia/Dhaka`
- `CSRF_TRUSTED_ORIGINS` — defaults to `https://` + each non-local `ALLOWED_HOSTS` entry (needed for the admin login)
- `SECURE_HSTS_SECONDS` (default `3600`), `SECURE_SSL_REDIRECT` (default `False`; Railway already redirects to HTTPS)

Frontend (see `wandra-frontend/.env.example`):

- `REACT_APP_API_URL` — backend base URL

## API

Send `Authorization: Token <token>` on authenticated requests.

**Accounts**

| Method | Path | Notes |
|---|---|---|
| POST | `/auth/register` | `{username, email, password}` → `{token, user}` |
| POST | `/auth/login` | `{username, password}` (username or email, any case) → `{token, user}` |
| POST | `/auth/logout` | revokes the token |
| GET | `/auth/me` | current user |
| POST | `/auth/password` | `{current_password, new_password}` → new `{token, user}`; signs out other devices |
| POST | `/auth/password/reset` | `{email}` → emails a reset link (same reply whether or not the email exists; 5/hour per IP) |
| POST | `/auth/password/reset/confirm` | `{uid, token, new_password}` from the link → `{token, user}`; links expire after 1 hour and work once |
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
| GET / POST | `/api/posts/<id>/comments/` | public list; POST `{body}` (≤ 1000 chars, 30/hour per user) |
| DELETE | `/api/posts/<id>/comments/<comment_id>/` | comment author, post author or staff |

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
| GET | `/api/reviews/?tour=<id>` or `?hotel=<id>` | public — average, count, reviews, and whether you can review |
| POST | `/api/reviews/` | `{tour or hotel, rating 1–5, text}`; only after a completed, non-cancelled trip; one per user (re-posting edits it) |
| DELETE | `/api/reviews/<id>/` | own review (or staff) |
| GET | `/api/reviews/summary/` | public — average and count for every reviewed tour and hotel |
| GET / POST | `/api/wishlist/` | your saved items; POST `{kind: destination\|tour\|hotel, refId}` |
| DELETE | `/api/wishlist/<kind>/<refId>/` | unsave |

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

## Images

Photos live in `wandra-frontend/public/images`. After adding or replacing photos, run
`npm run optimize-images` in `wandra-frontend` to generate the responsive WebP copies in
`public/images/opt` and update `src/imageManifest.json` (sizes and placeholder colours). Pages use
those automatically through the `<Img>` component.

## Notes

- Carts, bookings, profiles and blog posts are stored in the backend. A guest's cart is kept in
  the browser and moved into the account when they log in.
- `migrate` seeds four starter blog posts; delete or edit them in the Django admin.
- Dates ("today", check-in limits, cancellation cut-off) always use Bangladesh time on both the
  server and the browser, so travellers abroad see the same rules the server applies.
