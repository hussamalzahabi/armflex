# Render Deployment (Docker)

This app deploys on Render using `Dockerfile` and `render.yaml`.

## Create Service

1. In Render, choose **Blueprint** deployment from your GitHub repo.
2. Render will read `render.yaml` and create web service `armflex`.

## Required Environment Variables

Set these in Render before first successful boot:

- `APP_KEY` (required): generate with `php artisan key:generate --show`
- `APP_URL` (required): your Render URL, e.g. `https://armflex.onrender.com`
- `DB_CONNECTION=pgsql`
- `DB_HOST`, `DB_PORT=5432`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` (from Render Postgres "Connections")
- `SESSION_DRIVER=database`

Already configured by `render.yaml`:

- `APP_ENV=production`
- `APP_DEBUG=false`
- `LOG_CHANNEL=stderr`
- `RUN_MIGRATIONS=true`
- `RUN_SEEDERS=true`

## Health Check

- Render health check path is `/up` (matches Laravel health route in `bootstrap/app.php`).

## Migrations

- Auto-migrate is enabled by default (`RUN_MIGRATIONS=true`).
- Entry point runs `php artisan migrate --force` before starting the server.

## Seeders

- Auto-seeding is enabled by default (`RUN_SEEDERS=true`).
- Entry point runs `php artisan db:seed --force` before starting the server.
- Seeder data is idempotent for equipment seed records.

## Fix Existing Production DB Errors

If deploy logs show DB connection errors:

1. In Render service env vars, set:
   - `DB_CONNECTION=pgsql`
   - `DB_HOST`, `DB_PORT=5432`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` from Postgres
   - `SESSION_DRIVER=database`
2. Redeploy the service.
3. Restart the service once after env updates so Laravel boots with the new config.
