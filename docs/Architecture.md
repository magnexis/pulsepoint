# Architecture

## Overview

PulsePoint is split into two independently deployable applications:

- `frontend/`: React and Vite SPA deployed to Vercel
- `backend/`: Express API deployed to Railway or Render

The frontend never imports backend code directly. All data exchange goes through REST calls to the backend using Axios.

## Workspace Boundaries

- `frontend/` owns UI, routing, navigation, page composition, client-side state, and API consumption
- `backend/` owns ingestion, normalization, scoring, persistence, and structured REST responses
- `docs/` owns release, API, routing, and architecture references
- `docker-compose.yml` owns local release orchestration

## Backend Flow

1. Business search requests hit `GET /businesses`
2. The backend discovers businesses through Google Places and Yelp search adapters
3. Selected businesses are upserted into PostgreSQL through Prisma
4. `syncBusinessIntelligence()` pulls signal batches from:
   - Google reviews
   - Yelp reviews
   - Reddit discussions
   - News articles
   - LinkedIn jobs
   - Indeed jobs
5. Signals are normalized and persisted into `SignalLog` and `HiringSignal`
6. Aggregation computes:
   - weighted sentiment
   - complaint spikes
   - activity consistency
   - responsiveness
   - hiring impact
7. Trend snapshots and alerts are persisted
8. User settings, watchlists, sessions, and history events are persisted alongside business intelligence data
9. The frontend consumes the aggregated business profile and analytics responses

## Data Model

- `Business`: canonical business profile plus current score state
- `Signal`: aggregated source-level summary for each business
- `SignalLog`: raw normalized sentiment and event timeline
- `HiringSignal`: raw normalized hiring events
- `Report`: user-submitted complaints, scam flags, and feedback
- `Alert`: persisted anomaly or health alerts
- `TrendSnapshot`: historical analytics snapshots
- `User`: application identity used by auth, reports, watchlists, and ownership views
- `UserSettings`: profile, privacy, notification, security, and API preferences
- `Watchlist`: saved businesses per user
- `HistoryItem`: viewed businesses, searches, and account actions
- `LoginSession`: current and historical session records
- `AlertRead`: per-user alert read state

## Background Jobs

`node-cron` runs every 15 minutes and refreshes tracked businesses. This keeps scores, alerts, and trends current without coupling updates to user navigation alone.

## Frontend Flow

- Public routes live under `PublicLayout`
- Auth routes live under the public shell
- Workspace routes live under `WorkspaceLayout`
- Owner routes live under `OwnerLayout`
- Settings routes live under `SettingsLayout`
- Admin routes live under `AdminLayout`
- All routes are lazy-loaded for smaller production bundles
- Zustand stores search state
- Axios calls the backend using `VITE_API_URL`
- Loading skeletons and error panels prevent blank screens and hard failures

## Navigation Layers

- Public layout: top navbar, search entry points, pricing, about, contact, profile dropdown
- Dashboard layout: sidebar navigation, page-level stats, settings access
- Owner layout: business operations, analytics, response tooling, and owner configuration
- Admin layout: moderation controls, business overrides, and platform health monitoring

## Release Topology

- Frontend container: Nginx serving the Vite build with SPA route fallback
- Backend container: Node runtime serving the compiled Express app and applying Prisma schema on startup
- Database container: PostgreSQL 16 with a named persistent volume

The same codebase can also be deployed as:

- Vercel frontend + Railway backend + managed PostgreSQL
- Vercel frontend + Render backend + Neon/Supabase/Postgres

## Performance

- In-memory caching is applied to external provider fetches
- Search inputs are debounced in the frontend
- Signal feeds are paginated in the backend and frontend
- Frontend routes are code-split via `React.lazy`
- Compose-based containerization allows environment parity between local release validation and hosted deployment
