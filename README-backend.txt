# PhoneMarket KE backend starter

## What this does
- `GET /` confirms the API is running.
- `GET /health` returns a health status.
- `GET /api/phones` returns phone listings.
- `POST /api/phones` accepts a new listing.

## Important
This starter stores listings in server memory only. Listings will disappear when the service restarts. In the next step, connect PostgreSQL so listings are saved permanently.

## Render Web Service settings
- Build Command: `npm install`
- Start Command: `npm start`

Do not put database passwords or connection URLs in GitHub. Add them in Render Environment settings when we connect the database.
