# Deploying Wandra (browser only, no local setup)

Everything below is done in web dashboards. Both hosts redeploy automatically on every push to
`main`.

- **Backend + database:** [Railway](https://railway.com) (Django + PostgreSQL)
- **Frontend:** [Vercel](https://vercel.com), [Netlify](https://www.netlify.com) or
  [Cloudflare Pages](https://pages.cloudflare.com) (the repo has rewrite rules for all three)

Check each host's current pricing before you start. At the time of writing Railway gives new
accounts trial credit and then charges a small monthly amount; the frontend hosts have free plans
(Vercel's free plan is for non-commercial use, while Netlify and Cloudflare Pages allow commercial
sites on their free plans).

## 1. Backend on Railway

1. Sign in to Railway with GitHub → **New Project** → **Deploy from GitHub repo** → choose
   **Wandra**.
2. Open the new service → **Settings**:
   - **Root Directory:** `wandra-backend/djangoApi`
   - **Start Command:** leave empty (Railway uses the `Procfile`). If it doesn't, paste the `web:`
     line from `wandra-backend/djangoApi/Procfile` without the `web: ` prefix.
3. In the project, click **+ New → Database → PostgreSQL**.
4. Back on the backend service → **Variables** → add:

   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (Railway's reference to the database) |
   | `DEBUG` | `False` |
   | `SECRET_KEY` | a long random string (50+ characters, e.g. from a password manager) |
   | `DJANGO_SUPERUSER_USERNAME` | your admin username |
   | `DJANGO_SUPERUSER_EMAIL` | your email |
   | `DJANGO_SUPERUSER_PASSWORD` | a strong password (the admin account is created on first start) |

5. **Settings → Networking → Generate Domain**. You get something like
   `wandra-api.up.railway.app`. Add one more variable:
   `ALLOWED_HOSTS` = that domain (no `https://`).
6. Wait for the deploy to finish, then open `https://<your-domain>/api/posts/`: you should see JSON.
   The admin is at `https://<your-domain>/admin/`.

Each start runs `migrate` (database setup and updates), `collectstatic` and `ensure_admin`
automatically.

## 2. Frontend on Vercel

1. Sign in to Vercel with GitHub → **Add New → Project** → import **Wandra**.
2. **Root Directory:** `wandra-frontend` (the framework is detected as Create React App).
3. **Environment Variables:** `REACT_APP_API_URL` = `https://<your-railway-domain>`
4. **Deploy**. You get an address like `https://wandra.vercel.app`.

(On Netlify or Cloudflare Pages: base directory `wandra-frontend`, build command `npm run build`,
publish/output directory `build`, same environment variable.)

## 3. Connect the two

On the Railway backend service, add:

| Variable | Value |
|---|---|
| `CORS_ALLOWED_ORIGINS` | `https://wandra.vercel.app` (your frontend address) |
| `FRONTEND_URL` | `https://wandra.vercel.app` (used in email links and payment redirects) |

Railway redeploys. Open your frontend address, register an account and make a test booking.

## 4. Optional

- **Emails** (password reset, booking confirmations): set `BREVO_API_KEY` and
  `DEFAULT_FROM_EMAIL` on Railway. See "Email" in `README.md`.
- **Payments** (bKash, Nagad, cards): set `SSLCOMMERZ_STORE_ID` and `SSLCOMMERZ_STORE_PASSWORD`.
  See "Payments" in `README.md`.
- **Your own domain:** add it in the frontend host's **Domains** settings (and for the API, in
  Railway's **Networking**), then update `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `FRONTEND_URL`
  and `REACT_APP_API_URL` to match.

## Troubleshooting

- **Backend won't start, log says `SECRET_KEY environment variable is required`:** add `SECRET_KEY`.
- **`Bad Request (400)` on the API:** `ALLOWED_HOSTS` doesn't match the domain you opened.
- **Site loads but nothing works / "Could not reach the server":** check `REACT_APP_API_URL`
  (then redeploy the frontend; it's read at build time) and `CORS_ALLOWED_ORIGINS` (exact address,
  `https://`, no trailing slash).
- **Admin login fails with "CSRF verification failed":** add `CSRF_TRUSTED_ORIGINS` =
  `https://<your-railway-domain>`.
- **Run checks:** Railway's deploy logs show the output of `migrate` and `ensure_admin`.
