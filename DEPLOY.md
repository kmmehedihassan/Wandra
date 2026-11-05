# Deploying Wandra (browser only, no local setup)

Everything below is done in web dashboards, and each host redeploys automatically on every push
to `main`. Check each provider's current plans before you start; free tiers change.

- **Free:** [Neon](https://neon.tech) (database) + [Render](https://render.com) (backend) +
  [Cloudflare Pages](https://pages.cloudflare.com) or [Netlify](https://www.netlify.com) (website).
  Render's free backend sleeps after about 15 minutes without visitors, so the first visit after a
  quiet spell takes up to a minute.
- **Paid, always on:** [Railway](https://railway.com) for the backend and database (section B).

---

# A. Free setup

## A1. Database on Neon

1. Sign up at neon.tech (GitHub login works) → **Create project** (any name, region close to
   Bangladesh such as Singapore).
2. On the project dashboard click **Connect** and copy the **connection string**. It looks like
   `postgresql://user:password@ep-xxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`.
   Keep it private.

## A2. Backend on Render

1. Sign up at render.com with GitHub → **New → Blueprint** → choose the **Wandra** repository.
   Render reads `render.yaml` from the repo and sets up a free web service called `wandra-api`.
2. Render asks for these values (the `SECRET_KEY` is generated for you):

   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | the Neon connection string from A1 |
   | `DJANGO_SUPERUSER_USERNAME` | your admin username |
   | `DJANGO_SUPERUSER_EMAIL` | your email |
   | `DJANGO_SUPERUSER_PASSWORD` | a strong password |
   | `CORS_ALLOWED_ORIGINS` | leave as `http://localhost:3000` for now; you'll set it in A4 |
   | `FRONTEND_URL` | same, for now |

3. Click **Apply** and wait for the first deploy (a few minutes). Your backend address appears at
   the top of the service page, e.g. `https://wandra-api.onrender.com` (it's allowed automatically,
   no `ALLOWED_HOSTS` needed).
4. Check it: `https://wandra-api.onrender.com/api/posts/` shows data; `/admin/` is the admin.

## A3. Website on Cloudflare Pages

1. Sign up at dash.cloudflare.com → **Workers & Pages → Create → Pages → Connect to Git** → choose
   **Wandra**.
2. Build settings:
   - **Framework preset:** Create React App
   - **Root directory:** `wandra-frontend`
   - **Build command:** `npm run build`
   - **Build output directory:** `build`
   - **Environment variable:** `REACT_APP_API_URL` = your Render address from A2
3. **Save and Deploy.** You get an address like `https://wandra.pages.dev`.

(Netlify works the same way: base directory `wandra-frontend`, build command `npm run build`,
publish directory `build`, same environment variable.)

## A4. Connect them

In Render → `wandra-api` → **Environment**, change:

| Variable | Value |
|---|---|
| `CORS_ALLOWED_ORIGINS` | your website address, e.g. `https://wandra.pages.dev` |
| `FRONTEND_URL` | the same address |

Save; Render redeploys. Open your website, register and make a test booking. Done.

---

# B. Paid alternative: Railway

## B1. Backend on Railway

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
   `wandra-api.up.railway.app` (it's allowed automatically).
6. Wait for the deploy to finish, then open `https://<your-domain>/api/posts/`: you should see JSON.
   The admin is at `https://<your-domain>/admin/`.

Each start runs `migrate` (database setup and updates), `collectstatic` and `ensure_admin`
automatically.

## B2. Website on Vercel

1. Sign in to Vercel with GitHub → **Add New → Project** → import **Wandra**.
2. **Root Directory:** `wandra-frontend` (the framework is detected as Create React App).
3. **Environment Variables:** `REACT_APP_API_URL` = `https://<your-railway-domain>`
4. **Deploy**. You get an address like `https://wandra.vercel.app`.

(On Netlify or Cloudflare Pages: base directory `wandra-frontend`, build command `npm run build`,
publish/output directory `build`, same environment variable.)

## B3. Connect the two

On the Railway backend service, add:

| Variable | Value |
|---|---|
| `CORS_ALLOWED_ORIGINS` | `https://wandra.vercel.app` (your frontend address) |
| `FRONTEND_URL` | `https://wandra.vercel.app` (used in email links and payment redirects) |

Railway redeploys. Open your frontend address, register an account and make a test booking.

# Optional (both setups)

- **Emails** (password reset, booking confirmations): set `BREVO_API_KEY` and
  `DEFAULT_FROM_EMAIL` on the backend (Render or Railway). See "Email" in `README.md`.
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
  `https://<your-backend-domain>`.
- **Render site is slow to open:** the free plan was asleep; it wakes in under a minute.
- **Run checks:** the backend's deploy logs (Render **Logs** or Railway **Deployments**) show the
  output of `migrate` and `ensure_admin`.
