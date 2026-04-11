# API

Base URL: `http://localhost:5000`

## Health

### `GET /health`

Returns service health metadata.

## Businesses

### `GET /businesses`

Searches businesses, triggers provider-backed discovery, and returns paginated business cards.

Query params:

- `query`
- `location`
- `page`
- `pageSize`

### `GET /business/:id`

Returns a full business profile including:

- current scores
- source breakdown
- trend snapshots
- alerts
- paginated signal feed
- user reports
- hiring insights
- hiring trend series

Query params:

- `page`
- `pageSize`

## Authentication

### `POST /auth/login`

Authenticates a user and returns the signed-in profile, settings, and session metadata for the app shell.

Request body:

```json
{
  "email": "alex@example.com",
  "password": "strongpassword"
}
```

### `POST /auth/register`

Creates a user account, provisions default settings, and creates an active login session.

Request body:

```json
{
  "name": "Alex Johnson",
  "username": "alexj",
  "email": "alex@example.com",
  "password": "strongpassword"
}
```

## Analytics

### `GET /analytics/:id`

Returns business analytics optimized for dashboard consumption:

- health score
- trust score
- risk level
- trend
- source breakdown
- alert list
- trend snapshots
- hiring summary

## Reports

### `POST /report`

Creates a complaint, feedback item, or scam flag and immediately triggers a business resync.

Request body:

```json
{
  "businessId": "string",
  "type": "COMPLAINT",
  "title": "Late and unresponsive",
  "description": "Detailed field report",
  "severity": 4,
  "sentiment": -35,
  "user": {
    "name": "Alex Johnson",
    "email": "alex@example.com"
  }
}
```

### `GET /reports/me`

Returns reports created by the current user with current review status.

## Hiring

### `GET /hiring/:businessId`

Returns hiring analysis:

- classification
- jobs per week
- growth rate
- AI summary
- recent open roles

### `GET /hiring/trends/:businessId`

Returns:

- 7-day hiring series
- 30-day hiring series
- recent hiring roles

## User Settings

### `GET /user/settings`

Returns the current user profile and settings bundle:

- profile
- account
- notifications
- privacy
- security
- preferences
- API key metadata
- active sessions

### `PUT /user/settings`

Updates the settings bundle used by the profile, account, notifications, privacy, security, and API settings pages.

### `POST /user/api-key`

Generates or rotates the user API key.

### `DELETE /user/api-key`

Revokes the current user API key.

## Watchlist

### `GET /watchlist`

Returns the businesses saved by the current user.

### `POST /watchlist`

Adds a business to the current user watchlist.

Request body:

```json
{
  "businessId": "cmbusiness123"
}
```

### `DELETE /watchlist/:id`

Removes a watchlist item by its watchlist record id.

## Alerts

### `GET /alerts`

Returns alert feed items for the current user.

Query params:

- `severity`

### `POST /alerts/read`

Marks an alert as read for the current user.

Request body:

```json
{
  "alertId": "cmalert123"
}
```

## History

### `GET /history`

Returns recent user activity including searches, viewed businesses, watchlist actions, and settings updates.

## Owner

### `GET /owner/overview`

Returns business-owner summary data including health metrics, hiring insight summary, alerts, and complaint trends.

### `GET /owner/analytics`

Returns analytics-oriented owner data for charts and score monitoring.

### `GET /owner/responses`

Returns recent reports and response workflow data for business owners.

### `PUT /owner/settings`

Updates owner-facing business settings and response preferences.

## Admin

### `GET /admin/overview`

Returns system-level metrics, user counts, business counts, alert totals, and moderation summaries.

### `GET /admin/users`

Returns the admin user management list.

### `GET /admin/businesses`

Returns businesses with score and risk information for admin oversight.

### `GET /admin/reports`

Returns moderation-ready report records.

### `GET /admin/system`

Returns system health and ingestion activity metrics.

### `POST /admin/users/:id/ban`

Bans a user account.

### `DELETE /admin/reports/:id`

Deletes a report from the moderation queue.

### `PATCH /admin/businesses/:id/score`

Allows admins to override score values.

## Errors

All backend errors return structured JSON:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed."
  }
}
```

Typical response envelopes use:

```json
{
  "data": {}
}
```
