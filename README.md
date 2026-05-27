# FounderMatch

FounderMatch is a lean MVP for AI-powered co-founder discovery. It combines profile creation, compatibility scoring, swipe-based matching, and match-gated messaging.

## Stack

- Frontend: Next.js 14 App Router, TypeScript, Tailwind CSS, Clerk auth UI
- Backend: FastAPI, SQLAlchemy, JWT auth
- Database: PostgreSQL in production, local SQLite fallback for quick backend demos
- Deployment target: Vercel frontend plus API host, with environment-driven configuration

## Features

- Landing page with FounderMatch positioning and conversion CTA
- Clerk-powered sign-in/sign-up pages with Google OAuth support through Clerk
- Protected `/dashboard` route
- Swipe-style matching dashboard with sample founder candidates
- FastAPI auth endpoints: `/auth/register`, `/auth/login`, `/auth/me`
- Profile CRUD through `/api/profiles`
- Compatibility scoring based on complementary skills, looking-for fit, and industry match
- Match creation through `/api/swipe`
- Match-gated messaging through `/api/matches/{match_id}/messages`
- Seed endpoint for demo founder profiles: `/api/seed`

## Quick start

### 1. Environment

```bash
cp .env.example .env
```

Set Clerk values for frontend auth:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### 2. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Seed demo profiles:

```bash
curl -X POST http://localhost:8000/api/seed
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

### 4. PostgreSQL with Docker

```bash
docker compose up postgres backend
```

## API flow

Register and receive JWT:

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"alex@example.com","password":"password123","name":"Alex Morgan"}'
```

Use token:

```bash
curl http://localhost:8000/api/profiles \
  -H "Authorization: Bearer <token>"
```

Create/update profile:

```bash
curl -X POST http://localhost:8000/api/profiles \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Alex Morgan",
    "bio":"Full-stack engineer building vertical AI SaaS.",
    "skills":["Engineering","React","Node.js","PostgreSQL"],
    "industry":"Healthcare AI",
    "startup_idea":"AI ops copilot for clinics.",
    "looking_for":["Sales","Healthcare","Fundraising"],
    "avatar_url":null
  }'
```

Swipe right:

```bash
curl -X POST http://localhost:8000/api/swipe \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"target_user_id":2,"liked":true}'
```

## Deploy

Frontend deploys from `frontend/` on Vercel:

```bash
cd frontend
vercel --prod
```

Set frontend environment variables in Vercel:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Backend needs a Python API host with `DATABASE_URL` and `SECRET_KEY` set. Use Neon for PostgreSQL-compatible serverless storage.
