FROM composer:2 AS composer_deps

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-progress \
    --prefer-dist \
    --optimize-autoloader \
    --no-scripts

FROM node:20-bookworm-slim AS frontend_build

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./

RUN corepack enable && corepack prepare yarn@4.13.0 --activate
RUN yarn install --immutable

COPY resources ./resources
COPY public ./public
COPY vite.config.js ./

RUN yarn build

FROM php:8.3-cli-bookworm AS app

WORKDIR /var/www/html

ARG INSTALL_XDEBUG=0

RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    unzip \
    libzip-dev \
    libpq-dev \
    postgresql-client \
    && docker-php-ext-install pdo_mysql pdo_pgsql bcmath opcache \
    && if [ "${INSTALL_XDEBUG}" = "1" ]; then \
        apt-get update && apt-get install -y --no-install-recommends ${PHPIZE_DEPS} && \
        pecl install xdebug && \
        docker-php-ext-enable xdebug && \
        { \
            echo "xdebug.mode=\${XDEBUG_MODE}"; \
            echo "xdebug.start_with_request=\${XDEBUG_START_WITH_REQUEST}"; \
            echo "xdebug.client_host=\${XDEBUG_CLIENT_HOST}"; \
            echo "xdebug.client_port=\${XDEBUG_CLIENT_PORT}"; \
            echo "xdebug.idekey=\${XDEBUG_IDEKEY}"; \
            echo "xdebug.discover_client_host=0"; \
        } > /usr/local/etc/php/conf.d/99-xdebug.ini && \
        apt-get purge -y --auto-remove ${PHPIZE_DEPS} && \
        rm -rf /tmp/pear; \
    fi \
    && rm -rf /var/lib/apt/lists/*

COPY . .
COPY --from=composer_deps /app/vendor ./vendor
COPY --from=frontend_build /app/public/build ./public/build
COPY docker/entrypoint.sh /usr/local/bin/entrypoint

RUN chmod +x /usr/local/bin/entrypoint \
    && rm -f bootstrap/cache/packages.php bootstrap/cache/services.php \
    && php artisan package:discover --ansi \
    && chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 10000

ENTRYPOINT ["entrypoint"]
