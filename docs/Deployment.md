# Deployment

PulsePoint supports both containerized release delivery and split-cloud deployment.

## Option 1: Docker Compose Release

Use this option for local release validation, demos, or VM deployment.

### Services

- `frontend`: Nginx serving the built Vite SPA on port `8080`
- `backend`: Node/Express API on port `5000`
- `postgres`: PostgreSQL 16 on port `5432`

### Start

```bash
docker compose up --build
```

### Stop

```bash
docker compose down
```

### Environment Notes

- `VITE_API_URL` is passed to the frontend image at build time
- Backend provider keys are injected as container environment variables
- The backend applies the Prisma schema on startup with `prisma db push`

## Option 2: Hosted Split Deployment

### Frontend

- Target: Vercel
- Build command: `npm run build --workspace frontend`
- Output directory: `frontend/dist`
- Required env:
  - `VITE_API_URL=https://your-api.example.com`
  - `VITE_STRIPE_URL=https://stripe.com/payments/checkout`

### Backend

- Target: Railway or Render
- Build command: `npm run build --workspace backend`
- Start command: `npm run start --workspace backend`
- Required env:
  - `DATABASE_URL`
  - `PORT`
  - `CORS_ORIGIN`
  - provider API keys as needed

### Database

- Managed PostgreSQL is recommended for hosted deployment
- Run `npm run prisma:generate --workspace backend` during build if your platform does not cache Prisma artifacts
- Apply schema updates with `npm run prisma:push --workspace backend` or migrations in your deployment pipeline

## Release Checklist

- Confirm `README.md`, `docs/API.md`, `docs/Architecture.md`, and `docs/Routing.md` match the current app behavior
- Confirm frontend routes load without blank states
- Confirm backend health and API routes return structured JSON
- Confirm Prisma schema changes are applied
- Confirm `docker compose config` resolves cleanly
- Confirm `VITE_API_URL` points to the deployed API in production
