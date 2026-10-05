# Ops Analytics Dashboard

An internal admin dashboard for tracking system health metrics — uptime, response time,
error rate, throughput — with role-based access control: viewers can read dashboards,
admins can record and manage data.

## Stack

- **Frontend:** React 18 + TypeScript, Recharts (line charts), React Router, Axios, Vite
- **Backend:** FastAPI (Python), SQLAlchemy ORM, JWT auth with role claims
- **Database:** SQLite by default (swap `DATABASE_URL` for Postgres in production)
- **Testing:** Pytest (backend, 17 tests covering auth, role-based access, rate
  limiting, and metric aggregation) and Vitest + React Testing Library (frontend,
  component tests)
- **CI/CD:** GitHub Actions — backend tests, frontend type-check and tests on every push/PR
- **Containerization:** Dockerfiles for both services + `docker-compose.yml`

## Features

- Role-based access: the first registered user becomes admin automatically; everyone
  after that registers as a viewer
- Viewers can see KPI summary cards and trend charts across four metric categories
- Admins get an additional panel to add and delete metric entries
- Summary endpoint computes average/min/max/count per category server-side

## Security notes

This is scoped as a portfolio piece, but it implements real security practices rather
than skipping them:

- **Rate limiting on login** — 5 failed attempts per IP per 60-second window, enforced
  server-side (`app/rate_limit.py`), returns `429 Too Many Requests`. In-memory here;
  a production deployment would back this with Redis to work across multiple instances.
- **Role-based authorization enforced server-side** on every write/delete endpoint —
  not just hidden in the UI. A viewer calling the API directly still gets `403`.
- **Security headers** (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`)
  added via middleware.
- **Input validation** via Pydantic — e.g. metric values must be non-negative, notes
  are length-capped.
- **Passwords hashed with bcrypt**, JWTs expire after 60 minutes, secret key read from
  environment variable.

## Accessibility notes

- Chart has an `aria-label` describing its content for screen readers (SVG charts
  aren't inherently accessible, so this is necessary, not decorative)
- Category tabs use `role="tablist"`/`role="tab"`/`aria-selected`
- Summary cards use `aria-label` per card; form inputs use proper label associations
  and `role="alert"` for validation errors

## Running locally

### With Docker (recommended)

```bash
docker-compose up --build
```

Frontend: http://localhost:5173 · Backend docs (Swagger UI): http://localhost:8000/docs

### Without Docker

**Backend**

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

## Running tests

```bash
# Backend
cd backend && pytest -v

# Frontend
cd frontend && npx vitest run
```

## Possible next steps

- Move rate limiting to Redis for multi-instance deployments
- Add CSV export of metric history
- Add email/Slack alerting when a metric crosses a threshold
- Switch to PostgreSQL + Alembic migrations for production
