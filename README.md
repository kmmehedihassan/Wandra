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

Frontend (see `wandra-frontend/.env.example`):

- `REACT_APP_API_URL` — backend base URL
- `REACT_APP_EMAILJS_SERVICE_ID`, `REACT_APP_EMAILJS_TEMPLATE_ID`, `REACT_APP_EMAILJS_PUBLIC_KEY` — optional booking-confirmation emails

## API

| Method | Path | Notes |
|---|---|---|
| POST | `/auth/register` | `{username, email, password}` → `{token, user}` |
| POST | `/auth/login` | `{username, password}` → `{token, user}` |
| POST | `/auth/logout` | revokes the token |
| GET | `/auth/me` | current user |

Send `Authorization: Token <token>` on authenticated requests.

## Notes

- The tour, hotel and destination catalog lives in `wandra-frontend/src/components/Database/`.
- Cart, bookings, profile details and blog posts are currently stored in the browser (`localStorage`); checkout is a demo and takes no real payment.
