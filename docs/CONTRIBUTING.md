# Contributing

## Workflow

1. Create a branch for your work.
2. Install dependencies with `npm install`.
3. Copy `backend/.env.example` and `frontend/.env.example` into local `.env` files.
4. Run PostgreSQL locally and apply the Prisma schema with `npm run prisma:push`.
5. Use `npm run dev` to start both applications.

## Standards

- Keep frontend and backend separated by API boundaries.
- Do not introduce dead routes, placeholder buttons, or disconnected UI states.
- Validate incoming backend input with Zod.
- Keep new Prisma models indexed when they are part of filtering or timelines.
- Prefer live-source ingestion over mock data.

## Verification Before Opening a PR

- `npm run build`
- Verify the route set: `/`, `/search`, `/business/:id`, `/dashboard`, `/pricing`, `/api-docs`, `/admin`
- Confirm backend endpoints return structured JSON errors on invalid requests
- Confirm report submission and live search still work against configured providers

## Documentation

Update `README.md`, `docs/API.md`, or `docs/Architecture.md` whenever:

- new routes are added
- API shapes change
- environment variables change
- ingestion or scoring logic changes

