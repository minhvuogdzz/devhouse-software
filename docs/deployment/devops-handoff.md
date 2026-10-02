# DevOps handoff — Dev House Software MVP

Audience: the person who builds and deploys the first version to the VPS. The application is feature-complete for the MVP and passes lint, format, and 100+ automated tests, but **the Docker images, Nginx config and deploy scripts have never been built or run** (the machine they were written on has no Docker). Expect to fix small things on first build. This document tells you what is there, what you must provide, and what is known to be unfinished.

Architecture background: `docs/architecture/05-infrastructure-delivery.md` (§32–§37). Diagrams: `docs/architecture/09-diagrams.md` §43.9–43.10.

## 1. What runs

Four containers on one VPS, Docker Compose, only `edge` publishes ports.

| Container | Image                    | Internal port | Role                                     |
| --------- | ------------------------ | ------------- | ---------------------------------------- |
| `edge`    | `infra/nginx/Dockerfile` | 80, 443       | TLS, host routing, cache, rate limits    |
| `web`     | `apps/web/Dockerfile`    | 3000          | Public site, server-side rendered (Node) |
| `admin`   | `apps/admin/Dockerfile`  | 80            | Admin app (static files behind Nginx)    |
| `api`     | `apps/api/Dockerfile`    | 4000          | REST API, `/api/v1`                      |

External services: MongoDB Atlas (database), Cloudinary (images, optional for first launch), an SMTP provider (email, optional for first launch).

Hosts: `www.<domain>` (public site + `/api/v1`) and `admin.<domain>` (admin app + `/api/v1`, including auth). The API is same-origin on both hosts, so there is no CORS.

## 2. What you must provide

| Item                                                                          | Where it goes                                                                                                                                                                                                                                                                                                                                                                                                     |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Real domain**                                                               | The code uses the placeholder `devhouse.example`. Replace it in `infra/nginx/conf.d/*.conf`, `infra/nginx/Dockerfile`, `.gitlab-ci.yml` (environment URLs, health check URL), `infra/scripts/deploy.sh` (health gate `Host:` header), and in `WEB_URL`, `ADMIN_URL`, `SITE_URL` of the env files. Search with `grep -rn devhouse.example .`                                                                       |
| **DNS**                                                                       | `A` records for `www`, `admin` and the apex pointing at the VPS. (Staging: its own names.)                                                                                                                                                                                                                                                                                                                        |
| **TLS certificates**                                                          | Nginx expects `/opt/devhouse/certs/live/<domain>/fullchain.pem` and `privkey.pem` on the host (mounted read-only over `/etc/nginx/certs`). The edge image ships a self-signed dummy certificate only so `nginx -t` passes at build time; the host mount hides it. Issue real certificates (Let's Encrypt, webroot challenge at `/opt/devhouse/acme`) before first start, plus a renewal timer that reloads Nginx. |
| **VPS**                                                                       | Ubuntu LTS, 2 vCPU / 4 GB RAM minimum, Docker Engine + Compose plugin, non-root `deploy` user in the `docker` group, SSH key only, firewall 22/80/443.                                                                                                                                                                                                                                                            |
| **Host files**                                                                | `/opt/devhouse/{compose.prod.yml, deploy.sh, rollback.sh}` copied from `infra/` (the CI job does **not** copy them yet), plus `/opt/devhouse/env/api.env` and `web.env` (section 3), mode `0600`.                                                                                                                                                                                                                 |
| **Registry access on the VPS**                                                | `docker login registry.gitlab.com` with a read-only **deploy token** (`read_registry`).                                                                                                                                                                                                                                                                                                                           |
| **GitLab CI/CD variables** (Settings → CI/CD → Variables, protected + masked) | `SSH_PRIVATE_KEY`, `STAGING_SSH_USER`, `STAGING_HOST` for staging; `PROD_SSH_PRIVATE_KEY`, `PROD_SSH_USER`, `PROD_HOST` for production.                                                                                                                                                                                                                                                                           |
| **Atlas**                                                                     | Production cluster on a backed-up tier (M10+), separate database user for production, and the VPS IP in the Network Access list. Use a database name different from development (`devhouse_prod`).                                                                                                                                                                                                                |

## 3. Environment files on the VPS

`/opt/devhouse/env/api.env` (never committed; template is `.env.example`):

```
NODE_ENV=production
APP_ENV=production
PORT=4000
LOG_LEVEL=info
TRUST_PROXY=1
WEB_URL=https://www.<domain>
ADMIN_URL=https://admin.<domain>
MONGODB_URI=<Atlas connection string for the production user>
MONGODB_DB_NAME=devhouse_prod
SESSION_COOKIE_NAME=__Host-dh_sid
CLOUDINARY_CLOUD_NAME= / CLOUDINARY_API_KEY= / CLOUDINARY_API_SECRET=   (leave empty to launch without media upload)
CLOUDINARY_FOLDER_PREFIX=devhouse/prod
SMTP_HOST= / SMTP_PORT=587 / SMTP_USER= / SMTP_PASSWORD=                 (leave empty: emails are written to the log)
MAIL_FROM="Dev House Software <no-reply@<domain>>"
CONTACT_NOTIFY_TO=<inbox that receives contact requests>
DEFAULT_LOCALE=vi
SUPPORTED_LOCALES=vi,en
```

`web.env`: `SITE_URL=https://www.<domain>`. The Compose file already sets `API_INTERNAL_URL=http://api:4000/api/v1`.

Without Cloudinary and SMTP keys the site still works: media upload shows "not configured", and emails go to the API log.

## 4. First deployment, step by step

1. Create the VPS, DNS, certificates, `/opt/devhouse` layout and env files (sections 2–3).
2. In GitLab, merge the code to `main`. The pipeline lint/test/builds, then (on `main`) builds and pushes `api`, `web`, `admin`, `edge` images tagged with the short commit SHA.
3. On the VPS run `/opt/devhouse/deploy.sh <short-sha>`. It pulls the images, runs the idempotent seed in a one-off API container (default roles, categories, services, pages, navigation), starts `api`, `web`, `admin`, then `edge`, waits up to 90 s for health, and rolls back automatically to the previous tag on failure.
4. Create the first administrator (there is no default account):

   ```bash
   docker compose -f /opt/devhouse/compose.prod.yml run --rm \
     -e SEED_ADMIN_EMAIL=<email> -e SEED_ADMIN_PASSWORD='<12+ characters>' \
     api node apps/api/scripts/create-admin.js
   ```

5. Open `https://admin.<domain>`, sign in, change the password.
6. Smoke test: home page in `/` and `/en`, theme and language switches, `/services`, contact form submission (check it appears in Admin → Contact requests), `https://www.<domain>/api/v1/health/ready` returns 200, an unknown URL returns 404.

Rollback: `/opt/devhouse/rollback.sh [tag]` (defaults to the previous tag).

## 5. Known gaps in the delivery files (read before the first build)

Fixed by review on 2026-10-02 (still untested): registry default now `registry.gitlab.com/thedevhouse/web-repo` (must equal `$CI_REGISTRY_IMAGE`); the deploy script's migration step now runs `apps/api/seeds/index.js` (it previously called a `--migrate-only` flag that does not exist and would have hung); deploy and health-check CI jobs no longer end in `|| true`, so failures fail the pipeline; the `api` and `web` Dockerfiles copy the whole dependency stage instead of assuming per-app `node_modules` folders exist.

Still open:

| #   | Gap                                                                                                                                                                                                                                                                                                                           | Impact / suggested fix                                                                 |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 1   | Images and Nginx config never built. `docker build` of all four and `nginx -t` need a first real run.                                                                                                                                                                                                                         | Expect small path or copy mistakes.                                                    |
| 2   | CI deploy jobs set `StrictHostKeyChecking no` for SSH.                                                                                                                                                                                                                                                                        | Replace with a pinned `SSH_KNOWN_HOSTS` variable.                                      |
| 3   | CI does not copy `compose.prod.yml`, `deploy.sh`, `rollback.sh` to the VPS.                                                                                                                                                                                                                                                   | Copy by hand once, or add an `scp` step that runs before `deploy.sh`.                  |
| 4   | Compose lacks `read_only: true` and `cap_drop: [ALL]` on the app containers (architecture §32.4).                                                                                                                                                                                                                             | Add after the first successful run.                                                    |
| 5   | Runtime images contain dev dependencies (installed with `--immutable`, not production-only).                                                                                                                                                                                                                                  | Larger images; optimise later.                                                         |
| 6   | Edge healthcheck always passes (`                                                                                                                                                                                                                                                                                             |                                                                                        | exit 0`), and the post-deploy gate only calls `/health/live`. | Switch to `/api/v1/health/ready`. |
| 7   | No database index/migration step beyond the seed; `autoIndex` behaviour in production should be confirmed.                                                                                                                                                                                                                    | Check `apps/api/src/core/db/connection.js`; create indexes once with a one-off script. |
| 8   | Staging uses `staging.devhouse.example` placeholders and needs its own VPS or Compose project, Atlas database and env files.                                                                                                                                                                                                  | Optional for the first launch.                                                         |
| 9   | Node version: CI and images use Node 22 while `.nvmrc` may say otherwise.                                                                                                                                                                                                                                                     | Keep them identical.                                                                   |
| 10  | Product issues found in review that are **not** blocking deployment but are open: missing canonical/hreflang/Open Graph tags in page HTML, public API returning internal fields, `font-mono` in admin screens, jargon-heavy default copy, `bcryptjs` instead of Argon2id. Tracked in `docs/tasks/fixes-round-1.md` items 3–8. | Safe to deploy as a first version; fix right after.                                    |

## 6. Repository note

The code is meant for `https://gitlab.com/thedevhouse/web-repo`, which already holds three inactive projects (`devhouse_web`, `w1_mobileapp`, `w2_ecommerce`) at its root. They are to be moved unchanged into a `legacy/` folder, and this monorepo takes the root. The pipeline in `.gitlab-ci.yml` must be the only CI file at the root, and the project's CI settings must point to `.gitlab-ci.yml` (the last pipeline of the old repo failed; check Auto DevOps is off).
