# Routing

This document tracks the full frontend route surface for PulsePoint so route additions and navigation changes stay intentional.

## Public Layout Routes

- `/`
- `/search`
- `/business/:id`
- `/pricing`
- `/about`
- `/contact`
- `/api-docs`
- `/login`
- `/register`
- `/404`

Public navigation includes:

- Home logo
- Global business search
- Pricing
- About
- Contact
- Login or profile dropdown

## Workspace Layout Routes

- `/dashboard`
- `/watchlist`
- `/alerts`
- `/reports`
- `/history`

Workspace navigation includes:

- Dashboard
- Watchlist
- Alerts
- Reports
- History
- Settings entry points

## Owner Layout Routes

- `/owner`
- `/owner/analytics`
- `/owner/responses`
- `/owner/settings`

Owner navigation includes:

- Overview
- Analytics
- Responses
- Settings

## Settings Layout Routes

- `/settings/profile`
- `/settings/account`
- `/settings/notifications`
- `/settings/privacy`
- `/settings/security`
- `/settings/api`

Settings pages cover:

- Profile editing
- Account management
- Notification preferences
- Privacy controls
- Security and sessions
- API key lifecycle and usage

## Admin Layout Routes

- `/admin`
- `/admin/users`
- `/admin/businesses`
- `/admin/reports`
- `/admin/system`

Admin navigation includes:

- Platform overview
- User moderation
- Business score oversight
- Report moderation
- System telemetry

## Error Handling

- Unknown routes resolve to the styled 404 experience
- Pages should surface loading skeletons while fetching
- Pages should render user-friendly error states instead of blank screens
