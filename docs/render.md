# Render Deployment (Docker)

This app deploys on Render using `Dockerfile` and `render.yaml`.

## Create Service

1. In Render, choose **Blueprint** deployment from your GitHub repo.
2. Render will read `render.yaml` and create web service `armflex`.

## Required Environment Variables

Set these in Render before first successful boot:

- `APP_KEY` (required): generate with `php artisan key:generate --show`
- `APP_URL` (required): your Render URL, e.g. `https://armflex.onrender.com`
- `DB_CONNECTION=mariadb`
- `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` (required for MariaDB)
- `SESSION_DRIVER=file` (recommended to avoid DB session boot failures)

Already configured by `render.yaml`:

- `APP_ENV=production`
- `APP_DEBUG=false`
- `LOG_CHANNEL=stderr`
- `RUN_MIGRATIONS=true`

## Health Check

- Render health check path is `/up` (matches Laravel health route in `bootstrap/app.php`).

## Migrations

- Auto-migrate is enabled by default (`RUN_MIGRATIONS=true`).
- Entry point runs `php artisan migrate --force` before starting the server.

## Fix Existing Production 500 On Login

If login returns 500 and logs mention `sessions` / `SQLSTATE[1045]`:

1. In Render service env vars, set:
   - `SESSION_DRIVER=file`
   - valid MariaDB values for `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
2. Redeploy the service.
3. Restart the service once after env updates so Laravel boots with the new config.
