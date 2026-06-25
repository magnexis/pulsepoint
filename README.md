# PulsePoint

[![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite-61dafb?style=for-the-badge)](./frontend)
[![Backend](https://img.shields.io/badge/backend-Express%20%2B%20Prisma-0c4b33?style=for-the-badge)](./backend)
[![Database](https://img.shields.io/badge/database-PostgreSQL-336791?style=for-the-badge)](./backend/prisma/schema.prisma)
[![Container Ready](https://img.shields.io/badge/container-ready-2496ed?style=for-the-badge)](./docker-compose.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-black?style=for-the-badge)](./LICENSE)
[![npm](https://img.shields.io/npm/v/pulsepoint-2?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/pulsepoint-2)

PulsePoint is a production-oriented business intelligence SaaS platform for monitoring local business trust, operational risk, customer sentiment, and hiring momentum from live external signals.

## Highlights

- Fully separated frontend and backend workspaces
- Route-complete React SPA with public, workspace, owner, admin, auth, settings, and custom 404 pages
- Live signal ingestion from Google, Yelp, Reddit, news, LinkedIn, and Indeed adapters
- Advanced health scoring with sentiment weighting, trend analysis, alerting, and hiring intelligence
- PostgreSQL persistence through Prisma with historical analytics, watchlists, user settings, sessions, and alerts
- Containerized release workflow with Docker Compose for frontend, backend, and PostgreSQL

## Stack

- Frontend: React, TypeScript, Vite, TailwindCSS, shadcn/ui patterns, Framer Motion, Zustand, Axios, Leaflet
- Backend: Node.js, Express, Prisma, PostgreSQL, Zod, node-cron
- Delivery: Docker, Docker Compose, Nginx, Vercel-ready frontend, Railway/Render-ready backend

## Monorepo Layout

```text
pulsepoint/
├── frontend/
├── backend/
├── docs/
├── docker-compose.yml
├── README.md
├── CONTRIBUTING.md
├── CHANGELOG.md
└── LICENSE
```

## Route Coverage

Public routes:

- `/`
- `/search`
- `/business/:id`
- `/pricing`
- `/about`
- `/contact`
- `/api-docs`
- `/404`

Auth routes:

- `/login`
- `/register`

User routes:

- `/dashboard`
- `/watchlist`
- `/alerts`
- `/reports`
- `/history`

Owner routes:

- `/owner`
- `/owner/analytics`
- `/owner/responses`
- `/owner/settings`

Settings routes:

- `/settings/profile`
- `/settings/account`
- `/settings/notifications`
- `/settings/privacy`
- `/settings/security`
- `/settings/api`

Admin routes:

- `/admin`
- `/admin/users`
- `/admin/businesses`
- `/admin/reports`
- `/admin/system`

## API Surface

Core endpoints:

- `GET /health`
- `GET /businesses`
- `GET /business/:id`
- `GET /analytics/:id`
- `POST /report`
- `GET /hiring/:businessId`
- `GET /hiring/trends/:businessId`

Auth and user endpoints:

- `POST /auth/login`
- `POST /auth/register`
- `GET /user/settings`
- `PUT /user/settings`
- `POST /user/api-key`
- `DELETE /user/api-key`
- `GET /watchlist`
- `POST /watchlist`
- `DELETE /watchlist/:id`
- `GET /alerts`
- `POST /alerts/read`
- `GET /reports/me`
- `GET /history`

Owner and admin endpoints:

- `GET /owner/overview`
- `GET /owner/analytics`
- `GET /owner/responses`
- `PUT /owner/settings`
- `GET /admin/overview`
- `GET /admin/users`
- `GET /admin/businesses`
- `GET /admin/reports`
- `GET /admin/system`
- `POST /admin/users/:id/ban`
- `DELETE /admin/reports/:id`
- `PATCH /admin/businesses/:id/score`

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 15+ for local non-container development
- Docker Desktop or Docker Engine for containerized release runs

## Environment Variables

Frontend: `frontend/.env`

```bash
VITE_API_URL=http://localhost:5000
VITE_STRIPE_URL=https://stripe.com/payments/checkout
```

Backend: `backend/.env`

```bash
DATABASE_URL="postgresql://pulsepoint:pulsepoint@localhost:5432/pulsepoint?schema=public"
PORT=5000
CORS_ORIGIN="http://localhost:5173"
GOOGLE_PLACES_API_KEY=""
YELP_API_KEY=""
NEWS_API_KEY=""
ENABLE_SYNC_JOBS="true"
SYNC_LOOKBACK_MINUTES=15
CACHE_TTL_SECONDS=600
SEARCH_CACHE_TTL_SECONDS=300
LINKEDIN_JOBS_URL_TEMPLATE=""
INDEED_JOBS_URL_TEMPLATE="https://www.indeed.com/jobs?q={query}&l={location}"
DEMO_USER_EMAIL="demo@pulsepoint.app"
DEMO_USER_NAME="PulsePoint Demo"
DEMO_USER_USERNAME="pulsepoint-demo"
```

## Local Development

1. Install dependencies.

```bash
npm install
```

2. Create local environment files.

```bash
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

3. Start PostgreSQL.

```bash
docker compose up -d postgres
```

4. Generate Prisma client and apply the schema.

```bash
npm run prisma:generate
npm run prisma:push
```

5. Start the full stack.

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`.
Backend runs on `http://localhost:5000`.

## Containerized Release

PulsePoint now ships with Dockerfiles for both apps and a top-level Compose stack.

1. Optionally export provider keys in your shell.
2. Build and start the full release stack.

```bash
npm run docker:up
```

Or use Compose directly:

```bash
docker compose up --build
```

Container ports:

- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:5000`
- PostgreSQL: `localhost:5432`

## Build Commands

```bash
npm run build
```

Useful release commands:

```bash
npm run docker:build
npm run docker:up
npm run docker:down
```

## Documentation Index

- [Architecture](./docs/Architecture.md)
- [API](./docs/API.md)
- [Routing](./docs/Routing.md)
- [Deployment](./docs/Deployment.md)

## Deployment Targets

- Frontend: Vercel or the included Nginx container
- Backend: Railway, Render, or the included Node container
- Database: Managed Postgres or the included Postgres container

For production deploys, set `VITE_API_URL` to the public backend URL and configure provider API keys on the backend environment.

## Verification

Recommended verification steps:

- `npm run prisma:generate`
- `npm run build --workspace backend`
- `npm run build --workspace frontend`
- `npm run build`
- `docker compose config`
