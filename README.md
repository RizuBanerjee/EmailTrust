# EmailTrust — Email Verification API & SaaS Dashboard

EmailTrust is a full-stack SaaS application for verifying email addresses in real time. Users can sign up with Firebase Authentication, manage API keys, verify single emails or batches, subscribe to credit-based plans, and pay via Razorpay. A built-in admin dashboard lets administrators monitor users, revenue, and disposable domains.

> **Note:** Before pushing this project publicly, ensure environment variables and credentials are not committed.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Prerequisites](#prerequisites)
5. [Environment Variables](#environment-variables)
6. [Firebase Setup](#firebase-setup)
7. [Database Setup](#database-setup)
8. [Razorpay Setup](#razorpay-setup)
9. [Running Locally](#running-locally)
10. [Importing Disposable Domains](#importing-disposable-domains)
11. [API Overview](#api-overview)
12. [Admin Access](#admin-access)
13. [Security Notes](#security-notes)
14. [Deployment Checklist](#deployment-checklist)
15. [Contributing](#contributing)
16. [License](#license)

---

## Features

- **User Authentication** — Firebase Authentication (email/password + Google Sign-In) on the frontend; Firebase Admin SDK verifies tokens on the backend.
- **API Key Management** — Users can create, list, regenerate, and delete API keys.
- **Single Email Verification** — Checks syntax, MX records, disposable domains, provider classification, role-based addresses, suspicious TLDs, and common typos. Returns a trust score, risk score, and recommendation (`ALLOW` / `REVIEW` / `BLOCK`).
- **Batch Verification** — Verify a list of emails in one request, with per-email credit deduction.
- **Credit & Subscription System** — Plans include free and paid tiers (`FREE`, `STARTER`, `PRO`, `ENTERPRISE`). Credits are deducted per verification.
- **Razorpay Payments** — Create orders, open Razorpay checkout, and verify payment signatures on the backend.
- **Admin Dashboard** — Admin users can view platform overview, manage users, grant credits, suspend accounts, view revenue, manage disposable domains, and seed demo data.
- **Analytics & Usage Logs** — Users see verification history; admins see platform-level analytics.
- **Disposable Domain Management** — Import and manage a list of disposable/temporary domains.

---

## Tech Stack

### Frontend
- React 19 + React Router 7
- Vite
- Tailwind CSS
- Framer Motion (animations)
- Recharts (charts)
- Axios
- Firebase Client SDK (Authentication)

### Backend
- FastAPI
- SQLAlchemy 2.x
- PostgreSQL (any `psycopg2`-compatible database works)
- Uvicorn
- Firebase Admin SDK
- Razorpay Python SDK
- dnspython (MX checks)

### Tools
- Python 3.10+
- Node.js 20+
- npm / pnpm
- Git

---

## Project Structure

```
EmailTrust/
├── backend/
│   ├── app/
│   │   ├── database/          # DB engine, sessions, and startup init
│   │   ├── middleware/        # Firebase auth, API-key auth, admin auth
│   │   ├── models/            # SQLAlchemy models
│   │   ├── routes/            # FastAPI route modules
│   │   ├── schemas/           # Pydantic request/response schemas
│   │   ├── services/          # Business logic (verification, scoring, payments)
│   │   └── main.py            # FastAPI app entry point
│   ├── data/
│   │   └── disposable_domains.txt
│   ├── scripts/
│   │   └── import_disposable_domains.py
│   ├── requirements.txt
│   ├── .env.example
│   └── serviceAccountKey.json # NOT COMMITTED — see Firebase setup
├── frontend/
│   ├── src/
│   │   ├── api/               # Axios instance
│   │   ├── components/        # Reusable UI components
│   │   ├── contexts/          # Theme context
│   │   ├── firebase/          # Firebase client config (uses env vars)
│   │   ├── layouts/           # Dashboard layout
│   │   ├── pages/             # Application pages
│   │   ├── routes/            # React Router routes
│   │   └── utils/             # Helpers
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
├── README.md
├── LICENSE
├── CONTRIBUTING.md
├── SECURITY.md
└── .gitignore
```

---

## Prerequisites

1. **Python 3.10+** and `pip`.
2. **Node.js 20+** and `npm`.
3. A **PostgreSQL database** (Supabase, local Postgres, or any managed provider).
4. A **Firebase project** with Authentication enabled.
5. A **Razorpay account** (test mode is fine for development).

---

## Environment Variables

Copy the example files and fill in your real values:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### Backend (`backend/.env`)

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string, e.g. `postgresql://user:pass@host:port/db` |
| `RAZORPAY_KEY_ID` | Razorpay key id (test or live) |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret (test or live) |

> **Backend also requires** a `serviceAccountKey.json` file in the `backend/` directory for Firebase Admin. It is **not** an environment variable, but it is required for the server to start. See [Firebase Setup](#firebase-setup).

### Frontend (`frontend/.env`)

| Variable | Description |
| --- | --- |
| `VITE_API_BASE_URL` | URL of the backend, e.g. `http://127.0.0.1:8000` |
| `VITE_FIREBASE_API_KEY` | Firebase web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project id |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender id |
| `VITE_FIREBASE_APP_ID` | Firebase app id |

> **Never commit `.env` or `backend/serviceAccountKey.json`.** They are already listed in `.gitignore`.

---

## Firebase Setup

1. Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com).
2. Enable **Email/Password** and **Google** sign-in providers in **Authentication > Sign-in method**.
3. Add a web app in Firebase Console and copy the client config values (`apiKey`, `authDomain`, `projectId`, etc.) into `frontend/.env`.
4. Restrict the Firebase web API key to your production domain in **Google Cloud Console > APIs & Services > Credentials**.
5. In Firebase Console, go to **Project Settings > Service Accounts**, click **Generate new private key**, and download the JSON file.
6. Rename the downloaded file to `serviceAccountKey.json` and place it in `backend/`.

---

## Database Setup

1. Create a PostgreSQL database.
2. Set `DATABASE_URL` in `backend/.env`.
3. On first startup, the backend runs `init_db()` which creates all tables and adds missing columns (`is_admin`, `is_suspended`) automatically.
4. Optionally, run the disposable-domain import script (see below).

---

## Razorpay Setup

1. Sign up at [https://razorpay.com](https://razorpay.com) and generate test keys.
2. Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `backend/.env`.
3. The payment flow uses the Razorpay checkout script already loaded in `frontend/index.html`.

---

## Running Locally

### 1. Backend

```bash
cd backend
python -m venv venv

# macOS / Linux
source venv/bin/activate

# Windows
venv\Scripts\activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```

The backend will be available at `http://127.0.0.1:8000`.

### 2. Frontend

In a new terminal:

```bash
cd frontend
cp .env.example .env       # fill in the values first
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173` (or `http://0.0.0.0:5173` inside a container).

### 3. Verify the API

Open `http://127.0.0.1:8000/docs` to see the interactive Swagger UI.

---

## Importing Disposable Domains

A disposable-domain list ships with the project at `backend/data/disposable_domains.txt`. To load it into the database:

```bash
cd backend
source venv/bin/activate
python scripts/import_disposable_domains.py
```

> You can run this again after updating the text file to add new domains and importing from a csv file from the Admin Domains webpage.

---

## API Overview

Base URL: `http://127.0.0.1:8000`

### Authentication
- `GET /auth/me` — Returns the current user profile (creates the user in the database if missing).

### Email Verification
- `POST /verify-email/` — Verify a single email address. Requires a valid API key in the `Authorization` header.
- `POST /verify-batch/` — Verify a list of emails. Requires a valid API key in the `Authorization` header.
- `GET /check-disposable/{email}` — Check whether an email's domain is in the disposable list.

### API Keys
- `POST /api-keys/{user_id}` — Create a new API key for a user.
- `GET /api-keys/user/{user_id}` — List all API keys for a user.
- `DELETE /api-keys/{key_id}` — Delete an API key.
- `POST /api-keys/regenerate/{key_id}` — Regenerate an API key.

### Subscription & Credits
- `GET /subscription/plans` — Available plans.
- `GET /subscription/{email}` — Current subscription and credits.
- `POST /subscription/upgrade` — Upgrade a user's plan.
- `POST /subscription/renew?email={email}` — Renew/reset monthly credits.
- `POST /subscription/cancel?email={email}` — Cancel the current subscription.
- `GET /subscription/history/{email}` — Payment history.

### Payments
- `POST /payment/create-order` — Create a Razorpay order.
- `POST /payment/verify` — Verify Razorpay payment signature and upgrade the plan.

### Analytics
- `GET /analytics/overview` — Platform-level analytics (admin only).
- `GET /analytics/user/{email}` — User analytics. Users can view their own; admins can view any.

### Usage
- `GET /usage/{api_key}` — Usage logs for a given API key.

### Admin (requires `is_admin = TRUE` in the database)
- `GET /admin/overview` — Total users, payments, revenue.
- `GET /admin/users` — List all users.
- `DELETE /admin/users/{user_id}` — Delete a user and their subscriptions.
- `POST /admin/users/{user_id}/credits` — Grant credits to a user (body: `{"credits": <int>}`).
- `POST /admin/users/{user_id}/suspend` — Toggle user suspension.
- `GET /admin/revenue` — Revenue analytics by month.
- `POST /admin/seed` — Seed demo data (development only).

### Admin Domains
- `POST /admin/domains/` — Add a disposable domain.
- `POST /admin/domains/import` — Bulk import domains (body: `{"domains": [...]}`).
- `DELETE /admin/domains/{domain}` — Remove a disposable domain.
- `GET /admin/domains/search/{query}` — Search domains.
- `GET /admin/domains/count` — Count total disposable domains.

### Health Check
- `GET /` — Returns API status.

---

## Admin Access

To make an existing user an admin, update the `is_admin` column in the `users` table to `TRUE` directly in your database:

```sql
UPDATE users SET is_admin = TRUE WHERE email = 'your-email@example.com';
```

Then refresh the dashboard and visit `/admin/dashboard` or `/admin/users`.

---

## Security Notes

- Keep `.env` and `backend/serviceAccountKey.json` out of version control. They are ignored by `.gitignore`.
- Restrict your Firebase web API key to your production domain.
- Rotate any credentials that have been exposed or shared accidentally.
- Use Razorpay test keys in development; switch to live keys only after proper testing.
- The backend currently uses `allow_origins=["http://localhost:5173", "http://localhost:5174"]` in development. Update `backend/app/main.py` CORS settings for production.
- The frontend Firebase config is now read from environment variables. If you see a hardcoded config in an older version of the code, replace it with the env-driven approach shown in `frontend/src/firebase/firebase.js`.
- User-scoped endpoints (subscriptions, API keys, credits, dashboard, usage logs, payments) require Firebase authentication and enforce that the authenticated user can only access their own resources. Admins can still access any resource.
- Payment verification now checks that the email and plan in the request match the Razorpay order notes before upgrading a subscription.
- Promote users to admin by setting `is_admin = TRUE` in the database.
- For production, add rate limiting, input validation, security headers, and centralized logging.
- The global exception handler in `backend/app/main.py` returns `str(exc)` to the client. Replace this with generic error messages in production to avoid leaking internal details.
- Never expose the Razorpay key secret or the Firebase service-account private key to the frontend.

---

## Deployment Checklist

- [ ] Replace all placeholder environment variables with production values.
- [ ] Place `backend/serviceAccountKey.json` on the server and keep it out of Git.
- [ ] Fill in `frontend/.env` with your production Firebase config.
- [ ] Update CORS origins in `backend/app/main.py` to your production frontend domain.
- [ ] Replace the development global exception handler with production-friendly error responses.
- [ ] Set up a production database (e.g., Supabase, AWS RDS, Railway Postgres).
- [ ] Use a process manager (e.g., systemd, PM2, Docker, or a PaaS like Railway/Render) for the backend.
- [ ] Build the frontend with `npm run build` and serve the `dist/` folder via a static host or reverse proxy.
- [ ] Import disposable domains before launch.
- [ ] Enable Razorpay live mode and add the live keys to `backend/.env`.
- [ ] Add rate limiting and security headers for production traffic.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on submitting issues, feature requests, and pull requests.

---

## License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.
