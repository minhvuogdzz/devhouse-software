# Task — Build the MVP in one pass

**Goal:** a complete, runnable MVP of Dev House Software: public website, admin CMS, API and delivery files, built in one continuous pass with a commit per milestone.

**Contract for what "MVP" means:** `docs/architecture/10-scope-and-roadmap.md` §44. Everything in §44.1–44.3 is in scope unless listed under "Deferred from this pass" below.

## Read first

- `GEMINI.md` — rules, including the project-wide rules P1–P5.
- `docs/architecture/README.md`, then each part file as you reach the area it covers:
  - Structure and stack: `01-foundations.md` §7–8, `05-infrastructure-delivery.md` §38
  - Frontends, backend layering, content system: `02-application-architecture.md`
  - Auth, RBAC, media, API contract: `03-auth-media-api.md`
  - SEO, caching, pagination, security, i18n: `04-quality-attributes.md`
  - Schemas: `06-database-schema.md` · Endpoints: `07-api-endpoint-map.md` · Routes and admin modules: `08-route-and-admin-maps.md`
  - Docker, Nginx, CI, env: `05-infrastructure-delivery.md`

## Working conditions

- **No real credentials exist yet.** Use placeholders. Nothing may depend on a real third-party account to run locally:
  - **MongoDB:** a local container in the root `compose.yml` for development; `mongodb-memory-server` in tests.
  - **Cloudinary:** implement the full signed-upload flow behind the `integrations/cloudinary` interface. When the Cloudinary variables are absent, media endpoints return `503` with code `MEDIA_NOT_CONFIGURED` and the admin media screen shows a clear "not configured" state. Tests use a fake.
  - **Email:** behind `integrations/mail`. When SMTP variables are absent, write the message to the log instead of sending.
  - **Domain:** `devhouse.example` everywhere.
- **Infrastructure is written, not executed:** produce Dockerfiles, Nginx config, Compose files, deploy scripts and `.gitlab-ci.yml`, and make sure the images build locally. Do not deploy, push, or create remote resources.
- **Design:** there is no design file. **Use the `hallmark` skill for all UI**, as described in `GEMINI.md` (section "P4 — Design: use the Hallmark skill for all UI"): establish the design system once and write it to `docs/design/design-system.md`, build every screen to it, pass the slop-test gates, and audit at the end. **The primary colour is blue, the Dev House brand colour**; the palette is built around it. Rules P1–P3 and P5 take precedence: light and dark palettes as semantic tokens, fonts that support Vietnamese, no images in default content, **no monospace or code-style fonts or motifs outside real code blocks, and copy written in plain business language rather than technical jargon**.
- **Decisions:** when the documents do not specify something, pick the simplest consistent option, add one line to `docs/tasks/DECISIONS.md`, and continue.

## Milestones (commit after each)

| #   | Milestone                 | Must include                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| --- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| M1  | **Repository foundation** | Exclude the reserved `legacy/` folder from all tooling (see `GEMINI.md`, "Reserved folder `legacy/`"). Yarn 4 workspaces, three apps and three packages scaffolded, ESLint flat config with import-boundary rules and a rule against raw palette colour utilities in feature code, Prettier, Vitest, root scripts (`dev`, `build`, `lint`, `format:check`, `test`), `.env.example` (§36.2), `.gitignore`, `.dockerignore`, root `compose.yml` with MongoDB, `README.md`.                                                                                                                                                                                                                                           |
| M2  | **Shared packages**       | `@devhouse/shared`: `locales.js` (`vi`, `en`, default `vi`), error codes, permission catalog, enums, Zod schemas (including `LocalizedString`), `slugify` with Vietnamese transliteration, Cloudinary URL helper, `localePath`. `@devhouse/content`: `defineSection`/field descriptors, `resolveContent`, `localize`, definitions and bilingual defaults for every page key, settings and navigation, and the default catalog (services, solutions, technologies, categories) in both languages with no images. `@devhouse/config`: shared theme CSS with light and dark semantic tokens, **derived from the Hallmark design system** (OKLCH palette, 2+1 type system) recorded in `docs/design/design-system.md`. |
| M3  | **API core**              | Config validation, logger, request id and request context, response and error envelopes, error middleware, `validate` middleware, Mongoose connection, plugins (`sluggable` incl. per-locale, `publishable`, `softDelete`, `auditable`, `localized`), base repository, list-query builder, cache module, audit module, health endpoints, migrations and idempotent seed, `create-admin` script.                                                                                                                                                                                                                                                                                                                    |
| M4  | **Auth and RBAC**         | Sessions (hashed token, cookie, TTL, cache), login, logout, me, lockout, rate limits, origin check, password change, forgot/reset (email through the mail integration), users, roles, permissions endpoint, `authenticate`, `requirePermission`, escalation guards, the test that fails if any admin route lacks protection.                                                                                                                                                                                                                                                                                                                                                                                       |
| M5  | **Singleton content**     | Pages, site settings, navigation: public resolved endpoints (`/site`, `/pages/:key`) with `locale`, admin endpoints returning `{ defaults, overrides, resolved }`, cache invalidation on write.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| M6  | **Catalog**               | Categories, technologies, services, solutions, projects: models with localized fields and indexes, public list/detail with locale, filters, search, sort, pagination, `alternates`; admin CRUD, status, reorder, soft delete, restore; automatic redirect on slug change.                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| M7  | **Blog**                  | Authors, tags, posts; rich-text JSON validation; derived `contentText`, reading time, excerpt per language; future-dated publishing through the query predicate; public list/detail/tag list.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| M8  | **Media**                 | Signature endpoint, registration with verification, library list, metadata update, usage lookup, delete with in-use guard; `ImageRef` snapshots written by the API.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| M9  | **Contact**               | Public `POST /contact` with full field set, validation, rate limit, honeypot and timing checks, storage with locale, notification through the mail integration with status and retry; admin inbox endpoints (cursor pagination, status, assignee, notes).                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| M10 | **SEO, audit, dashboard** | Sitemap data endpoint (both languages), redirect resolve and admin CRUD, audit-log list endpoints, dashboard summary.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| M11 | **Public website**        | All routes of §41.1 in both languages (`/…` and `/en/…`) with SSR; header with navigation, **language switch and theme switch**; footer; home built from the section registry; list pages with URL-driven filters and pagination; template-driven detail pages; rich-text renderer; contact form; metadata, canonical, `hreflang`, Open Graph, JSON-LD; `sitemap.xml`, `robots.txt`; 404 with real status; redirect handling; loading, empty and error states; fallback to local defaults when the API is unreachable.                                                                                                                                                                                             |
| M12 | **Admin**                 | Shell with sidebar from per-module nav files, **language switch and theme switch** in its header, auth and permission guards, shared `DataTable`, `ResourceForm`, field components (including side-by-side `vi`/`en` inputs and a media picker), `SectionForm`; all modules of §42: dashboard, pages, services, solutions, projects, technologies, categories, blog posts, tags, authors, media, navigation, settings, redirects, contact requests, users, roles, audit logs, account.                                                                                                                                                                                                                             |
| M13 | **Delivery files**        | Dockerfiles for `api`, `web`, `admin`, `edge`; Nginx config per §33 (hosts, routing table, micro-cache, rate limits, headers); `infra/compose/compose.prod.yml` and `compose.staging.yml`; `infra/scripts/deploy.sh` and `rollback.sh` per §37.3; `.gitlab-ci.yml` with the stages of §35; MR template; CODEOWNERS.                                                                                                                                                                                                                                                                                                                                                                                                |
| M14 | **Tests and wrap-up**     | The MVP tests of §29.2 that are not deferred; `docs/development/` guides: setup, how to add an API module, an admin module, a content section, a permission; `hallmark audit` on the home page, a list page, a detail page, the contact page, and the admin shell with one list and one form screen, with flagged issues fixed; final run of all acceptance checks.                                                                                                                                                                                                                                                                                                                                                |

## Deferred from this pass (do not build)

Contact form attachments · media replace · CAPTCHA · OpenAPI generation · error-tracker integration (leave a no-op hook) · Playwright end-to-end tests · `checkJs` type checking · Lighthouse CI · drag-and-drop ordering (use numeric order inputs or up/down buttons) · resource "duplicate" endpoint · contact CSV export · everything in §44.4.

## Acceptance checks

From the repository root, all must pass:

```bash
yarn install --immutable
yarn lint
yarn format:check
yarn test
yarn build
docker compose -f infra/compose/compose.prod.yml config
docker build -f apps/api/Dockerfile -t devhouse-api:check .
docker build -f apps/web/Dockerfile -t devhouse-web:check .
docker build -f apps/admin/Dockerfile -t devhouse-admin:check .
```

With MongoDB running and `yarn dev` started on an **empty database** (seed run, no content entered):

- `GET /api/v1/health/ready` returns `200`.
- Every public route in §41.1 returns `200` in both `/…` and `/en/…`, with its main heading present in the server-rendered HTML, and unknown URLs return `404`.
- A Vietnamese page contains no English UI text and an English page no Vietnamese UI text.
- The language switch on a service detail page leads to the same service in the other language.
- Toggling the theme changes `data-theme` on `<html>`, persists across reload, and no page shows unreadable text in either theme.
- No `<img>` in default content points to a placeholder or stock image; pages look complete without images.
- No monospace font is loaded or used on any page other than a blog article containing a code block; no terminal or code motifs are used as decoration.
- Default copy on the home, services, solutions, about and contact pages reads as plain business language in both Vietnamese and English: benefits and outcomes, not lists of technical terms.
- `docs/design/design-system.md` exists, the theme tokens match it, and the `hallmark audit` of the M14 screens has no unresolved findings.
- `/sitemap.xml` lists both language versions; pages emit `hreflang` alternates.
- After `create-admin`: log in to the admin, create and publish a service in both languages, and see it on `/services` and `/en/services` within the cache window.
- Editing the home hero heading in Admin → Pages changes the public home page; "reset to default" restores it.
- Submitting the contact form creates a request visible in the admin inbox, and the notification appears in the API log.
- A user with the Support role receives `403` from `PATCH /api/v1/admin/services/:id`, and the admin UI hides the Services module for that user.

## Final report

1. **Built** — per milestone, what exists, by path.
2. **Acceptance checks** — each check and its real result; output for any failure.
3. **Not done or partial** — anything in scope that is missing or incomplete, stated plainly.
4. **Decisions** — pointer to `docs/tasks/DECISIONS.md`.
   **Design** — pointer to `docs/design/design-system.md` and the `hallmark audit` results for the screens listed in M14.
5. **Dependencies added** beyond those named in the architecture, with reason.
6. **How to run** — exact commands from a fresh clone.
