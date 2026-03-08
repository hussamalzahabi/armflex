# CI/CD Setup

This repo now has:

- `CI-CD` workflow: commit stage (lint, tests, frontend build, acceptance, Postgres compatibility)
- `CD` workflow: build once, deploy to staging, smoke test, optional production promotion

## Required GitHub Environments

Create two environments in GitHub:

- `staging`
- `production`

Recommended:

- Add required reviewers to `production` for manual approval before deploy.

## Required GitHub Secrets

### Staging

- `STAGING_SSH_HOST`: Staging server hostname
- `STAGING_SSH_USER`: SSH user
- `STAGING_SSH_PRIVATE_KEY`: Private key for deploy user
- `STAGING_DEPLOY_PATH`: Base app path on server (example: `/var/www/armflex`)
- `STAGING_HEALTHCHECK_URL`: Health endpoint URL (example: `https://staging.example.com/up`)

### Production

- `PROD_SSH_HOST`: Production server hostname
- `PROD_SSH_USER`: SSH user
- `PROD_SSH_PRIVATE_KEY`: Private key for deploy user
- `PROD_DEPLOY_PATH`: Base app path on server (example: `/var/www/armflex`)
- `PROD_HEALTHCHECK_URL`: Health endpoint URL (example: `https://app.example.com/up`)

## Expected Server Layout

The deploy jobs use this layout under each deploy path:

- `releases/<git-sha>` for each release
- `shared/.env` as the persisted environment file
- `current` symlink to active release

Before first deploy, create:

- `<DEPLOY_PATH>/shared/.env`

## How CD Runs

- On successful `CI` run for `main`, `CD` builds and deploys to `staging`.
- It then runs smoke test on `STAGING_HEALTHCHECK_URL`.
- Production deploy is opt-in via manual `workflow_dispatch` with `deploy_production=true`.
