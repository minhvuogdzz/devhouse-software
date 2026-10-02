# Part E — Infrastructure & Delivery (§32–§38)

[← Index](README.md)

---

## 32. Docker Architecture

(ADR-010)

### 32.1 Images

| Image | Build stages | Runtime | Notes |
|---|---|---|---|
| `api` | `deps` (immutable install, focused on the API workspace) → `runtime` (production dependencies + source) | `node` LTS slim, non-root | No build step: plain ES modules. Debian-slim base avoids native-module friction (`argon2`). |
| `web` | `deps` → `build` (Vite + React Router build) → `runtime` (server bundle, client assets, production deps) | `node` LTS slim, non-root | Serves SSR and its own hashed assets. |
| `admin` | `deps` → `build` (Vite build) → `runtime` | `nginx` alpine, unprivileged | Static files + SPA fallback + `/healthz`. |
| `edge` | Single stage: Nginx + versioned config from `infra/nginx/` | `nginx` alpine | Config is tested (`nginx -t`) at build time. |

Dockerfile principles:

- Build context is the repository root (workspaces need the root lockfile); a strict `.dockerignore` keeps `.git`, `node_modules`, env files, docs and tests out.
- Copy manifests and lockfile first, install, then copy source, so dependency layers cache.
- `yarn install --immutable`; production stage contains only production dependencies of that workspace.
- `USER node` (or the unprivileged Nginx user); `NODE_ENV=production`; `tini`/`--init` so signals reach Node for graceful shutdown.
- `HEALTHCHECK` on the liveness endpoint.
- Labels: commit SHA, pipeline URL, build date. The SHA is also exposed to the app as `APP_VERSION` for logs and error tracking.
- **No secrets** in build args, layers or env defaults. Frontend bundles contain no environment-specific values (the API is same-origin), which is what allows one image for all environments.

Concept sketch for the API image:

```dockerfile
FROM node:24-bookworm-slim AS deps
WORKDIR /repo
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/releases .yarn/releases
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
COPY packages/content/package.json packages/content/
RUN corepack enable && yarn workspaces focus @devhouse/api --production

FROM node:24-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /repo
COPY --from=deps /repo/node_modules ./node_modules
COPY packages/shared packages/shared
COPY packages/content packages/content
COPY apps/api apps/api
USER node
EXPOSE 4000
HEALTHCHECK --interval=15s --timeout=3s --retries=3 \
  CMD node apps/api/scripts/healthcheck.js
CMD ["node", "apps/api/src/server.js"]
```

### 32.2 Image tagging

| Tag | Meaning | Mutable |
|---|---|---|
| `<registry>/<group>/devhouse/<app>:<git-sha>` | The build artefact; what is deployed | No |
| `:main` | Latest build of `main` (convenience, cache source) | Yes |
| `:vX.Y.Z` | Added to the SHA image when a release tag is promoted | No |

Deployments reference the SHA tag only. `latest` is not used.

### 32.3 Compose files

| File | Purpose |
|---|---|
| `compose.yml` (repo root) | Local development: API and both frontends with hot reload, a local MongoDB container, optional mail catcher |
| `infra/compose/compose.prod.yml` | Production: `edge`, `web`, `admin`, `api` from registry images |
| `infra/compose/compose.staging.yml` | Staging: same services, different project name, hostnames and env files |

A local MongoDB container is used **only** for development and CI convenience. Staging and production always use Atlas.

### 32.4 Production Compose design

| Concern | Design |
|---|---|
| Networking | One internal bridge network. Only `edge` publishes ports (80, 443). `web`, `admin`, `api` use `expose`. Services address each other by name (`http://api:4000`). |
| Images | `image: ${REGISTRY}/api:${IMAGE_TAG}`; `IMAGE_TAG` written by the deploy script |
| Environment | `env_file` pointing at files on the VPS (`/opt/devhouse/env/*.env`), not in the repository |
| Restart | `restart: unless-stopped` |
| Health | `healthcheck` per service; `edge` `depends_on` the others with `condition: service_healthy` |
| Hardening | `read_only: true` with `tmpfs` for `/tmp`; `cap_drop: [ALL]`; `security_opt: [no-new-privileges:true]`; non-root users |
| Resources (4 GB host) | Memory limits: `api` 512 MB, `web` 512 MB, `admin` 64 MB, `edge` 256 MB; Node `--max-old-space-size` set below the limit. Leaves headroom for the OS and, if co-located, staging. |
| Logging | `json-file` driver with `max-size: 10m`, `max-file: 5` |
| Volumes | `edge`: TLS certificates (read-only), ACME webroot, cache directory. No application data volumes. |
| Shutdown | `stop_grace_period: 30s` so in-flight requests finish |

---

## 33. Nginx Architecture

(ADR-012)

### 33.1 Host layout decision

| | Option A: `www` / `admin` / `api` subdomains | Option B: paths on one host | **Chosen: `www` + `admin`, API same-origin on each** |
|---|---|---|---|
| CORS | Required for both frontends → preflights, credentialed CORS config | None | **None** |
| Admin cookie scope | Must be shared across `admin` ↔ `api` (domain cookie or `SameSite=None`) | Shared with the public site's origin: any XSS on the marketing site runs in the admin's origin | **Host-only on `admin`; invisible to `www`** |
| Admin isolation | Good | Poor: same origin, same CSP, harder to IP-restrict | **Good: separate origin, own CSP, restrictable at the edge** |
| SEO | Clean | `/admin` must be excluded carefully | **Clean; admin host fully `noindex`** |
| Build-time config | API URL baked into bundles per environment | None | **None: bundles are environment-independent** |
| Certificates / DNS | Three names | One | Two |
| Developer experience | CORS and cookie debugging | Simple | **Simple: a dev proxy maps `/api` exactly like production** |

`api.devhouse.example` is reserved and **not** created in MVP. It becomes the host for external consumers (mobile apps, partners) when they exist, with token auth and explicit CORS.

### 33.2 Routing table

| Host | Location | Upstream | Notes |
|---|---|---|---|
| `devhouse.example`, any `http://` | `/` | — | `301` to `https://www.devhouse.example` |
| `www` | `/api/v1/admin/`, `/api/v1/auth/` | — | `404`. The admin surface is not routable from the public host. |
| `www` | `/api/v1/contact` | `api` | Strict rate limit, larger body limit, no cache |
| `www` | `/api/v1/` | `api` | Micro-cache for `GET`, general rate limit |
| `www` | `/assets/` (hashed) | `web` | `Cache-Control: public, max-age=31536000, immutable` |
| `www` | `/` | `web` | Micro-cache, stale-while-revalidate, stale-if-error |
| `admin` | `/api/v1/auth/` | `api` | Strictest rate limit, `no-store` |
| `admin` | `/api/v1/` | `api` | `no-store`, never cached |
| `admin` | `/` | `admin` | SPA fallback handled by the admin container; `X-Robots-Tag: noindex, nofollow` |
| default server | any | — | `444` (connection closed) for unknown `Host` headers |
| any | `/.well-known/acme-challenge/` | webroot | Certificate issuance and renewal |

### 33.3 Responsibilities

| Responsibility | Detail |
|---|---|
| TLS termination | Let's Encrypt certificates via Certbot (webroot challenge), renewed by a host timer that reloads Nginx. TLS 1.2 and 1.3, OCSP stapling, HSTS. |
| Protocols | HTTP/2; HTTP/3 [Optional] |
| Compression | Brotli if the module is present, else gzip; text types only; never for already-compressed formats |
| Caching | `proxy_cache` zones for HTML and public API; `proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504`; `proxy_cache_background_update on`; `proxy_cache_lock on`; cache bypass when a session cookie or preview parameter is present; `X-Cache-Status` response header for debugging |
| Rate limiting | `limit_req` zones keyed by client IP: general API, contact, auth. `429` with `Retry-After`. |
| Limits | `client_max_body_size 1m` globally, raised only on the contact location; sane header and timeout limits |
| Proxy headers | `X-Request-Id $request_id`, `X-Forwarded-For`, `X-Forwarded-Proto`, `Host`. The API trusts exactly one proxy hop. If a CDN/WAF is added in front, real-IP configuration is updated to trust only that provider's ranges. |
| Security headers | HSTS, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, CSP for the static admin. CSP for `web` is set by the web server (nonce). `server_tokens off`. |
| Hygiene | Deny dotfiles and `.map` files; no directory listing; JSON access logs including request id, upstream time and cache status |

Concept sketch of the public host:

```nginx
server {
  listen 443 ssl; http2 on;
  server_name www.devhouse.example;

  location ^~ /api/v1/admin/ { return 404; }
  location ^~ /api/v1/auth/  { return 404; }

  location = /api/v1/contact {
    limit_req zone=contact burst=3 nodelay;
    client_max_body_size 32m;
    proxy_pass http://api:4000;
  }

  location /api/v1/ {
    limit_req zone=api burst=40 nodelay;
    proxy_cache api_cache;
    proxy_cache_valid 200 60s;
    proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
    proxy_cache_background_update on;
    proxy_pass http://api:4000;
  }

  location /assets/ {
    add_header Cache-Control "public, max-age=31536000, immutable";
    proxy_pass http://web:3000;
  }

  location / {
    proxy_cache html_cache;
    proxy_cache_valid 200 301 60s;
    proxy_cache_valid 404 30s;
    proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
    proxy_cache_background_update on;
    proxy_pass http://web:3000;
  }
}
```

### 33.4 Optional CDN / WAF in front

**[Optional, Recommended once traffic or abuse appears].** A CDN/WAF proxy in front of the VPS adds DDoS absorption, global edge caching and bot filtering at low cost. It changes nothing in the application; it requires correct real-IP handling at Nginx, origin access restricted to the provider's ranges, and care that the admin host is either excluded or equally protected.

---

## 34. GitLab Repository Strategy

(ADR-009)

### 34.1 Source of truth

GitLab is the only required remote. A GitHub mirror is **[Optional]**: a one-way push mirror for visibility or backup, with no CI and no merge rights. Nothing in the pipeline depends on GitHub.

### 34.2 Branch model

**Trunk-based with short-lived branches.**

```
feature/<ticket>-<slug> ─┐
fix/<ticket>-<slug> ─────┼─► Merge Request ─► main ─► auto-deploy staging ─► tag vX.Y.Z ─► production
hotfix/<slug> ───────────┘
```

| Branch / ref | Purpose | Protection |
|---|---|---|
| `main` | Always releasable; integration branch | Protected: no direct push, no force push, merge through MR only, pipeline must succeed |
| `feature/*`, `fix/*`, `chore/*`, `docs/*` | Short-lived work (target: merged within 1–3 days) | None; deleted on merge |
| `hotfix/*` | Urgent production fix; same flow, expedited review | None |
| Tags `v*` | Production release markers | Protected: only Maintainers may create |

**Why no `develop` branch.** A long-lived `develop` means two integration branches, periodic `develop → main` merges with their own conflicts, and usually a *rebuild* for production, which breaks "deploy what you tested". With `main → staging` and a tag promoting the same image, staging remains the pre-production gate without the extra branch.

**If the team prefers the brief's model:** map `develop → staging` and `main → production`; everything else in this document stays valid. Unfinished work that must merge early is hidden behind feature flags in site settings rather than held on a branch.

### 34.3 Merge requests

- Template with: what/why, how tested, screenshots for UI, migration notes, checklist (tests, docs, accessibility, security considerations).
- At least **one approval** from a developer who did not author the change; two for auth, RBAC, security middleware, infrastructure and migrations.
- Pipeline must be green; all threads resolved; squash-merge with a Conventional Commit title (`feat(services): …`) so history and changelogs stay readable.
- Target size: under ~400 changed lines. Larger changes are split or reviewed with the author walking through.
- `CODEOWNERS` maps module folders to owners so the right reviewer is requested automatically.

GitLab tier note: enforced approval rules and CODEOWNERS approval require a paid tier. On the free tier the same rules are a team convention: restrict "allowed to merge" on `main` to Maintainers and require a second person to press merge.

### 34.4 Runners, registry, variables, permissions

| Item | Design |
|---|---|
| Runner | Docker-executor runner on GitLab.com shared runners or a dedicated build machine. **Not** on the production VPS: builds compete for CPU/RAM and a runner on production executes pipeline code there. |
| Container Registry | GitLab project registry. Cleanup policy keeps release tags and the last N SHA tags. The VPS pulls with a **read-only deploy token**. |
| CI variables | Deploy SSH key and host details stored as **protected, masked** variables scoped to the `staging` / `production` environments. Protected variables are exposed only to pipelines on protected branches and tags. |
| Runtime secrets | Not stored in GitLab in MVP; they live on the VPS (§36). CI can deploy but cannot read database credentials. |
| Deployment permissions | `production` is a protected environment: only Maintainers can run its deploy job. Deploy jobs use `resource_group` so two deployments never overlap. |
| Roles | Developers: push branches, open MRs. Maintainers: merge to `main`, create release tags, deploy production. |

---

## 35. GitLab CI/CD

Diagram: [§43.10](09-diagrams.md#4310-gitlab-cicd-pipeline).

### 35.1 Pipelines by trigger

| Trigger | Jobs |
|---|---|
| Merge request | install → lint, format check, type check (JSDoc) → unit + integration + component tests → build (no push) → secret detection, dependency audit |
| Push to `main` | All of the above → build and push images tagged with the SHA → image scan → **deploy to staging (automatic)** → health gate → E2E smoke against staging |
| Tag `v*` on a commit already built from `main` | Verify the SHA images exist → **deploy to production (manual approval)** → health gate → auto-rollback on failure → add the `vX.Y.Z` tag to the images |
| Schedule (weekly) | Dependency audit, base-image rebuild, full E2E |
| Manual | `rollback:production` with a chosen previous version |

### 35.2 Stages

```
prepare → verify → test → build → package → scan → deploy:staging → e2e → deploy:production → post-deploy
```

| Stage | Detail |
|---|---|
| prepare | `yarn install --immutable`; cache keyed on `yarn.lock` |
| verify | ESLint (including import-boundary rules), Prettier check, `tsc --noEmit` over JSDoc, `nginx -t` on the edge config, commit-message lint |
| test | Vitest per workspace in parallel; integration tests use `mongodb-memory-server` (no service container needed); JUnit and coverage reports published to the MR |
| build | Vite builds for `web` and `admin` to catch build errors early on MRs |
| package | BuildKit image builds with registry layer cache; one job per app; `rules: changes` skips apps whose folder and `packages/**` are unchanged |
| scan | Image vulnerability scan and dependency audit; fail on critical findings with a fix available. Secret detection on every pipeline. (GitLab's built-in templates where the tier includes them; otherwise Trivy + `yarn npm audit`.) |
| deploy | SSH to the VPS and invoke the deploy script with the image tag (§37) |
| e2e | Playwright smoke suite against staging |
| post-deploy | Health verification, release annotation in the error tracker, notification to the team channel |

Pipeline hygiene: `interruptible: true` on MR pipelines so superseded runs cancel; `needs:` for a DAG so tests and builds run in parallel; target under 10 minutes for an MR pipeline.

### 35.3 Environments

| Environment | Deployed from | Trigger | Database | Cloudinary prefix | URL |
|---|---|---|---|---|---|
| Development | Local Compose | — | Local container or personal Atlas DB | `devhouse/dev` | `localhost` |
| Staging | `main` | Automatic | `devhouse_staging` | `devhouse/staging` | `staging.devhouse.example`, `admin.staging.devhouse.example` (basic-auth and `noindex` at the edge) |
| Production | Tag `v*` | Manual approval | `devhouse_prod` | `devhouse/prod` | `www.devhouse.example`, `admin.devhouse.example` |

Three environments are justified: staging is where the exact production image, real Atlas, real Cloudinary and the Nginx config are exercised together. A separate long-lived "development server" is not; local Compose covers it. Per-MR review apps are **[Future]**.

### 35.4 Build once, promote

The production deploy job does not build. It deploys the SHA-tagged images that staging already ran. This is possible because no environment-specific value is compiled into any image.

### 35.5 Database migrations in the pipeline

- The deploy script runs migrations (`migrate-mongo up`) and the idempotent seed **before** switching containers.
- Migrations must be backward compatible with the previous release (expand → migrate → contract across two releases). This is what keeps rollback safe: old code can run against the new schema.
- A destructive "contract" migration ships only after the release that stopped using the old shape is stable.

---

## 36. Environment Management

### 36.1 Principles

- Configuration is read from environment variables, parsed and validated at boot by a Zod schema. Invalid configuration stops the process.
- `.env.example` is committed and documents every variable. Real `.env` files are git-ignored. CI secret detection blocks accidental commits.
- Only the API and the web server read environment variables. The browser bundles contain none.

### 36.2 `.env.example`

```dotenv
# ───────── Common ─────────
NODE_ENV=development                 # development | test | production
APP_ENV=development                  # development | staging | production
LOG_LEVEL=debug

# ───────── API ─────────
PORT=4000
TRUST_PROXY=1                        # number of trusted proxy hops in front of the API

WEB_URL=http://localhost:3000        # canonical public origin
ADMIN_URL=http://localhost:5173      # admin origin (allowed Origin for state-changing requests)

MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=devhouse_dev

SESSION_COOKIE_NAME=__Host-dh_sid
SESSION_IDLE_TTL_MINUTES=480
SESSION_ABSOLUTE_TTL_DAYS=7

CLOUDINARY_CLOUD_NAME=<placeholder>
CLOUDINARY_API_KEY=<placeholder>
CLOUDINARY_API_SECRET=<placeholder>  # API container only. Never in a frontend or an image.
CLOUDINARY_FOLDER_PREFIX=devhouse/dev

SMTP_HOST=<placeholder>
SMTP_PORT=587
SMTP_USER=<placeholder>
SMTP_PASSWORD=<placeholder>
MAIL_FROM="Dev House Software <no-reply@devhouse.example>"
CONTACT_NOTIFY_TO=<placeholder>

CAPTCHA_PROVIDER=none                # none | turnstile
CAPTCHA_SECRET_KEY=

SENTRY_DSN=                          # optional
DEFAULT_LOCALE=vi
SUPPORTED_LOCALES=vi,en

# First-run only (used by the create-admin script, then removed)
SEED_ADMIN_EMAIL=

# ───────── Web (SSR server) ─────────
WEB_PORT=3000
API_INTERNAL_URL=http://localhost:4000/api/v1   # http://api:4000/api/v1 inside Compose
SITE_URL=http://localhost:3000
```

Differences from the brief's list: `JWT_SECRET` and `JWT_REFRESH_SECRET` are absent because sessions are opaque random tokens that need no signing key (ADR-004). `CORS_ORIGIN` is replaced by `WEB_URL` / `ADMIN_URL`, used for the origin check rather than CORS. `API_URL` is unnecessary for browsers (same-origin); the server-side equivalent is `API_INTERNAL_URL`.

### 36.3 Per environment

| | Development | Staging | Production |
|---|---|---|---|
| Config source | Local `.env` copied from `.env.example` | Env files on the staging host | Env files on the production VPS |
| Database | Local container / personal DB | Atlas `devhouse_staging`, own DB user | Atlas `devhouse_prod`, own DB user, backups on |
| Cloudinary | `devhouse/dev` | `devhouse/staging` | `devhouse/prod` |
| Email | Local mail catcher | Real SMTP, restricted recipients | Real SMTP |
| Cookies | Dev cookie name without `__Host-` (no HTTPS on localhost) | As production | `__Host-`, `Secure`, `SameSite=Strict` |
| Errors | Full stack in response | Generic | Generic |
| Indexing | n/a | Blocked | Allowed |
| Logs | Pretty | JSON | JSON |

### 36.4 Secret management

| Where | What it holds | Protection |
|---|---|---|
| **VPS** `/opt/devhouse/env/api.env`, `web.env` | Runtime secrets: MongoDB URI, Cloudinary secret, SMTP password, CAPTCHA secret | Owned by root, mode `0600`, read by Compose via `env_file`; not in any image; documented in a runbook; backed up in the company password manager |
| **GitLab CI/CD variables** | Deploy SSH private key, VPS host/user, registry credentials (job token), error-tracker upload token | Protected + masked, environment-scoped |
| **Developer machines** | Personal dev credentials only | Never production secrets |
| **Git** | `.env.example` with placeholders | Secret detection in CI; pre-commit hook |

Rationale for keeping runtime secrets on the VPS rather than in GitLab for MVP: a compromised pipeline or leaked CI token cannot read the production database credentials directly. The trade-off is a manual step when a secret rotates. **[Phase 2 option]** encrypted secrets in the repository (SOPS + age) or a secrets manager, decrypted on the host at deploy time, for auditable rotation.

Rotation runbook (in `docs/security/`): how to rotate the MongoDB user password, Cloudinary secret, SMTP credentials and deploy key, and how to invalidate all sessions (delete the `sessions` collection).

---

## 37. VPS Deployment Architecture

Diagram: [§43.9](09-diagrams.md#439-production-deployment).

### 37.1 Improvements to the brief's diagram

- `web` reaches data **through `api`**, not directly; Cloudinary is called by the **API** (signing, deletion) and by **browsers** (upload, image delivery), not by the `web` or `admin` containers.
- `web` is a Node SSR container; `admin` is static.
- The edge cache sits between the internet and the apps and keeps the public site serving during restarts.
- Supporting services appear explicitly: SMTP, error tracking, external uptime monitoring, Certbot.

### 37.2 Host layout

```
/opt/devhouse/
├── compose.prod.yml          # copied from the repo at deploy time (versioned with the release)
├── env/api.env  env/web.env  # secrets (0600), never in Git
├── releases.log              # timestamp, image tag, actor, result
├── current_tag  previous_tag
├── deploy.sh  rollback.sh    # from infra/scripts
└── data/ certs/ acme/ nginx-cache/
```

Host preparation (one-time, documented as a runbook; optionally automated with a provisioning script): OS updates and unattended security upgrades, a non-root `deploy` user, SSH key-only access, firewall (22/80/443), fail2ban, Docker Engine + Compose plugin, log rotation, swap, time sync, registry login with the read-only deploy token, initial certificates, Atlas IP allow-list entry for the VPS address.

### 37.3 Deployment lifecycle

```
Developer → feature branch → Merge Request → CI (lint, tests, build) → review → merge to main
  → build images (SHA) → push to GitLab Container Registry → scan
  → deploy to staging → health gate → E2E smoke
  → release tag vX.Y.Z → manual approval
  → deploy to production (same images) → health gate → live      (failure → automatic rollback)
```

The CI deploy job connects over SSH as `deploy` using a key whose `authorized_keys` entry has a **forced command**: the key can only execute `deploy.sh <tag>` or `rollback.sh`, not an arbitrary shell. This limits what a leaked CI key can do.

`deploy.sh <tag>` does, in order:

1. Record the currently running tag as `previous_tag`.
2. `docker compose pull` for the new tag.
3. Run migrations and the idempotent seed in a one-off `api` container of the **new** image. Abort on failure (nothing has been switched).
4. `docker compose up -d` services in dependency order: `api`, then `web` and `admin`, then reload `edge`.
5. Wait for health: container health status plus `GET /api/v1/health/ready` and a `200` from the home page through the edge. Timeout ~90 s.
6. On success: write `current_tag`, append to `releases.log`, prune old images (keep the last three).
7. On failure: redeploy `previous_tag`, verify health, exit non-zero so the pipeline is red and the team is notified.

### 37.4 Rollback

| Scenario | Action |
|---|---|
| Health gate fails during deploy | Automatic: script redeploys `previous_tag` |
| Problem found after deploy | Manual `rollback:production` job (or re-run the previous successful deploy job in the GitLab environment page). Typically under two minutes because images are already on the host. |
| Bad data migration | Code rollback is safe because migrations are backward compatible. Data is repaired with a forward fix migration; destructive changes are avoided by the expand/contract rule. |
| Data loss or corruption | Atlas point-in-time / snapshot restore; procedure rehearsed before launch |
| Bad content published | Not a deployment issue: unpublish or edit in Admin; audit log shows who changed what |

### 37.5 Downtime during deploys

Compose recreates a container in place, so each service is unavailable for a few seconds. For public visitors this is masked by the edge serving stale cached pages (`proxy_cache_use_stale`) and by graceful shutdown. Admin users may see a brief error and retry.

**[Phase 2]** true zero-downtime: start the new container alongside the old one, health-check it, switch the Nginx upstream, then stop the old one (blue/green on a single host). Not required for MVP given the masking above.

### 37.6 Single-VPS limits and the path beyond

One VPS is a single point of failure and has a vertical ceiling. This is acceptable for the stated scope. The growth path needs no redesign because containers are stateless:

1. Scale the VPS vertically.
2. Add a CDN/WAF in front.
3. Move staging off the production host (if co-located).
4. Run two API replicas behind Nginx on the same host → introduces Redis for shared rate limits and cache invalidation.
5. Second VPS + load balancer, or a managed container platform. The same images run unchanged.

Backups: the VPS holds no primary data. A rebuilt host needs only the env files (kept in the password manager), DNS, and a deploy. Target: full rebuild from a bare VPS in under one hour, verified once before launch.

---

## 38. Repository Structure

```
dev-house-software/
├── apps/
│   ├── web/                              # Public site — React Router framework mode (SSR), Vite, Tailwind
│   │   ├── app/
│   │   │   ├── root.jsx  routes.js  entry.client.jsx  entry.server.jsx
│   │   │   ├── routes/                   # thin route modules
│   │   │   ├── features/                 # home, services, solutions, projects, technologies, blog, careers, contact, legal
│   │   │   ├── components/               # ui, layout, sections, media, rich-text, seo, feedback
│   │   │   ├── lib/  hooks/  styles/  locales/          # locales: vi.js, en.js
│   │   ├── public/                       # favicon and brand assets only (no placeholder images)
│   │   ├── server.js
│   │   ├── react-router.config.js  vite.config.js  package.json  Dockerfile
│   │
│   ├── admin/                            # Admin CMS — React SPA, Vite, Tailwind
│   │   ├── src/
│   │   │   ├── app/                      # providers, router assembly, shell, guards
│   │   │   ├── features/                 # one folder per admin module (api, components, pages, routes.js, nav.js)
│   │   │   ├── components/               # ui, form, data-table, media-picker, rich-text-editor
│   │   │   ├── lib/  hooks/  styles/
│   │   ├── index.html  nginx.conf  vite.config.js  package.json  Dockerfile
│   │
│   └── api/                              # Express REST API
│       ├── src/
│       │   ├── server.js  app.js  routes.js
│       │   ├── config/
│       │   ├── core/                     # http, errors, middleware, db, query, cache, context, audit, logger
│       │   ├── modules/                  # auth, users, roles, content, settings, navigation, services, solutions,
│       │   │                             # projects, technologies, categories, blog, media, contact, seo,
│       │   │                             # audit-logs, dashboard, health
│       │   └── integrations/             # cloudinary, mail, captcha
│       ├── migrations/  seeds/  scripts/
│       ├── tests/                        # integration helpers, fixtures (unit tests sit beside the code)
│       ├── package.json  Dockerfile
│
├── packages/
│   ├── shared/                           # @devhouse/shared — contracts
│   │   ├── schemas/                      # Zod: entities, requests, list queries
│   │   ├── constants/                    # enums, error codes, category types
│   │   ├── permissions.js
│   │   └── utils/                        # slug, cloudinary url, formatting
│   ├── content/                          # @devhouse/content — default content system
│   │   ├── define.js                     # defineSection / definePage / field descriptors
│   │   ├── resolve.js
│   │   ├── pages/                        # home/, about/, contact/, …
│   │   ├── settings.js  navigation.js
│   │   └── catalog/                      # default services, solutions, technologies, categories (seed + fallback)
│   └── config/                           # @devhouse/config — eslint, prettier, tailwind theme, vitest base
│
├── e2e/                                  # Playwright: specs, fixtures, config
│
├── infra/
│   ├── nginx/                            # edge Dockerfile, nginx.conf, conf.d/, snippets/
│   ├── compose/                          # compose.prod.yml, compose.staging.yml
│   └── scripts/                          # deploy.sh, rollback.sh, provision-host.sh, renew-certs.sh
│
├── docs/
│   ├── architecture/                     # this document
│   ├── adr/                              # one file per decision, numbered
│   ├── api/                              # conventions, generated OpenAPI, error-code catalog
│   ├── database/                         # schema reference, index list, migration guide
│   ├── deployment/                       # runbooks: provision, deploy, rollback, restore, certificates
│   ├── security/                         # threat model, secret rotation, incident response
│   └── development/                      # setup, conventions, how to add a module / section / permission
│
├── scripts/                              # repo tooling (codegen for a new module, checks)
│
├── .gitlab/
│   ├── ci/                               # verify.yml, test.yml, build.yml, deploy.yml
│   ├── merge_request_templates/
│   └── CODEOWNERS
├── .gitlab-ci.yml
├── compose.yml                           # local development only
├── package.json  yarn.lock  .yarnrc.yml  .nvmrc
├── eslint.config.js  .prettierrc  .editorconfig  .dockerignore  .gitignore
├── .env.example
└── README.md
```

### 38.1 Documentation contents

| Path | Contains |
|---|---|
| `README.md` | What the project is, prerequisites, five-minute local setup, common commands, links into `docs/` |
| `docs/architecture/` | This document, kept current: update the relevant part in the same MR as an architectural change |
| `docs/adr/` | One short file per decision (context, decision, alternatives, consequences). New significant decisions add a file; superseded ones are marked, never deleted. The ADRs in Part K are the initial set. |
| `docs/api/` | API conventions, response and error contract, error-code catalog, link to generated OpenAPI |
| `docs/database/` | Collection reference, indexes, relationship diagram, how to write a safe migration |
| `docs/deployment/` | Host provisioning, deploy and rollback, certificate renewal, backup restore, environment variable reference |
| `docs/security/` | Threat model, secret inventory and rotation, session invalidation, incident checklist, dependency policy |
| `docs/development/` | Coding standards, branch and commit conventions, MR checklist, testing guide, and step-by-step guides: add an API module, add an admin module, add a content section, add a permission |

The "how to add…" guides matter most for a growing team: they turn the architecture into a repeatable recipe and are where consistency is won or lost.
