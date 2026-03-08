# Render Deployment (Docker)

This app deploys on Render using `Dockerfile` and `render.yaml`.

## Create Service

1. In Render, choose **Blueprint** deployment from your GitHub repo.
2. Render will read `render.yaml` and create web service `armflex`.

## Required Environment Variables

Set these in Render before first successful boot:

- `APP_KEY` (required): generate with `php artisan key:generate --show`
- `APP_URL` (required): your Render URL, e.g. `https://armflex.onrender.com`
- `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` (if using external database)

Already configured by `render.yaml`:

- `APP_ENV=production`
- `APP_DEBUG=false`
- `LOG_CHANNEL=stderr`
- `RUN_MIGRATIONS=false`

## Health Check

- Render health check path is `/up` (matches Laravel health route in `bootstrap/app.php`).

## Migrations

- Recommended: run migrations manually from Render shell or one-off job first.
- Optional auto-migrate: set `RUN_MIGRATIONS=true` (entrypoint runs `php artisan migrate --force` before start).
