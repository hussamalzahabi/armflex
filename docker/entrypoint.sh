#!/usr/bin/env sh
set -e

cd /var/www/html

# Fail fast on mixed/invalid DB config to avoid runtime 500s.
if [ "${DB_CONNECTION:-}" = "mariadb" ] || [ "${DB_CONNECTION:-}" = "mysql" ] || [ "${DB_CONNECTION:-}" = "pgsql" ]; then
  if [ -z "${DB_HOST:-}" ] || [ -z "${DB_PORT:-}" ] || [ -z "${DB_DATABASE:-}" ] || [ -z "${DB_USERNAME:-}" ] || [ -z "${DB_PASSWORD:-}" ]; then
    echo "ERROR: DB_CONNECTION=${DB_CONNECTION} requires DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD."
    exit 1
  fi

  if [ "${APP_ENV:-}" = "production" ] && { [ "${DB_HOST}" = "localhost" ] || [ "${DB_HOST}" = "127.0.0.1" ]; }; then
    echo "ERROR: Invalid DB_HOST=${DB_HOST} for production ${DB_CONNECTION}. Use your hosted database hostname."
    exit 1
  fi

  if [ "${DB_CONNECTION:-}" = "mariadb" ] || [ "${DB_CONNECTION:-}" = "mysql" ]; then
    case "${DB_DATABASE}" in
      *.sqlite|*/database.sqlite|*"/tmp/database.sqlite"*)
        echo "ERROR: Invalid DB_DATABASE=${DB_DATABASE} for ${DB_CONNECTION}. Use an actual MariaDB/MySQL database name."
        exit 1
        ;;
    esac
  fi
fi

# Laravel needs these writable/cache directories at runtime.
mkdir -p \
  storage/framework/cache \
  storage/framework/sessions \
  storage/framework/views \
  storage/logs \
  bootstrap/cache

if [ "${DB_CONNECTION:-}" = "sqlite" ]; then
  DB_PATH="${DB_DATABASE:-/tmp/database.sqlite}"
  mkdir -p "$(dirname "$DB_PATH")"
  touch "$DB_PATH"
fi

if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
  php artisan migrate --force
fi

if [ "${RUN_SEEDERS:-false}" = "true" ]; then
  php artisan db:seed --force
fi

exec php artisan serve --host=0.0.0.0 --port="${PORT:-10000}"
