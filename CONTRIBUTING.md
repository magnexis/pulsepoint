# Contributing

## Workflow

1. Create a branch for your work.
2. Install dependencies with `npm install`.
3. Copy `backend/.env.example` and `frontend/.env.example` into local `.env` files.
4. Run PostgreSQL locally and apply the Prisma schema with `npm run prisma:push`.
5. Use `npm run dev` to start both applications.

Container-based workflow:

1. Export any provider keys you want available to the stack.
2. Run `npm run docker:up`.
3. Open the frontend on `http://localhost:8080`.
4. Stop the stack with `npm run docker:down`.

## Standards

- Keep frontend and backend separated by API boundaries.
- Do not introduce dead routes, placeholder buttons, or disconnected UI states.
- Validate incoming backend input with Zod.
- Keep new Prisma models indexed when they are part of filtering or timelines.
- Prefer live-source ingestion over mock data.
- Update container and deployment files when runtime assumptions change.

## Verification Before Opening a PR

- `npm run build`
- Verify the route set documented in `docs/Routing.md`
- Confirm backend endpoints return structured JSON errors on invalid requests
- Confirm report submission and live search still work against configured providers
- Run `docker compose config` when editing release or environment wiring
- Verify the container stack still starts when Docker artifacts are touched

## Documentation

Update `README.md`, `docs/API.md`, `docs/Architecture.md`, `docs/Routing.md`, or `docs/Deployment.md` whenever:

- new routes are added
- API shapes change
- environment variables change
- ingestion or scoring logic changes
- container build or deployment behavior changes
