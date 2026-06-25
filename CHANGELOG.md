# Changelog

## 1.0.1

### Bug Fixes

- Fixed plaintext password storage; passwords are now properly hashed with bcrypt.
- Fixed authentication bypass on login and session validation endpoints.
- Fixed admin role escalation allowing non-admin users to access admin-only functionality.

## 1.1.0 - 2026-04-11

- Expanded PulsePoint into a route-complete SaaS shell with public, auth, user, owner, settings, admin, and custom error pages
- Added watchlist, alerts, reports, history, profile dropdown, and user settings flows across frontend and backend
- Added Prisma-backed user settings, alert read state, history, watchlists, and login session models
- Added Dockerfiles for frontend and backend plus a full `docker-compose.yml` release stack
- Refreshed project documentation with release, routing, API, and deployment coverage

## 1.0.0 - 2026-04-11

- Built a separated frontend and backend workspace for PulsePoint
- Added live-source ingestion services for Google, Yelp, Reddit, news, LinkedIn, and Indeed
- Added sentiment analysis, hiring analysis, aggregation, trend detection, alert persistence, and scheduled refresh jobs
- Added Prisma models for businesses, reports, raw signals, hiring signals, alerts, and trend snapshots
- Added a premium routed frontend with public pages, workspace pages, hiring insights, maps, charts, loading skeletons, and structured error states
- Added setup, architecture, and API documentation
