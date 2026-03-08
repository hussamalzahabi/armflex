#!/usr/bin/env sh
set -e

cd /var/www/html

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

exec php artisan serve --host=0.0.0.0 --port="${PORT:-10000}"
