# Part L — Risks, Implementation Order, Readiness (§49–§52)

[← Index](README.md)

---

## 49. Risks & Mitigations

Likelihood (L) and impact (I): Low / Medium / High.

### 49.1 Architectural and technical

| # | Risk | L | I | Mitigation |
|---|---|---|---|---|
| R1 | Team is new to SSR: hydration mismatches, browser-only code run on the server | M | M | Lint rule for `window`/`document` in render; hydration-warning check in E2E; a short "SSR rules" page in `docs/development`; first routes built by the most experienced developer as a reference |
| R2 | JavaScript without static types lets contract drift through | M | M | Zod at every boundary; DTO mappers; `checkJs` in CI; integration tests on the API contract |
| R3 | Content model (definitions, resolver, generic forms) becomes an over-built mini-framework | M | M | Cap field types at the nine listed; no layout fields; review any new field type as an architectural change |
| R4 | `Mixed` content fields accept bad data if validation is skipped | L | H | A single write path through the content service; schema validation on write and re-validation on read with fallback to defaults |
| R5 | Module boundaries erode into a tangled monolith | M | M | Import-boundary lint rules; CODEOWNERS; "how to add a module" guide; review checklist |
| R6 | Image snapshots become stale after media replace | L | L | Replace endpoint refreshes snapshots through the media-path registry in one transaction; test coverage for the registry |
| R7 | Soft delete and unique slugs conflict | L | M | Partial unique index on `isDeleted: false`; restore returns `409 SLUG_TAKEN`; covered by tests |
| R8 | Editors confused by the ~60 s publishing delay | M | L | Explicit notice in the admin; draft preview in Phase 2 |
| R9 | Rich-text JSON schema changes break old posts | L | M | `contentVersion`; renderer ignores unknown nodes gracefully; migrations for schema changes |
| R10 | Search quality in Vietnamese is weak with `$text` | M | L | Accept for MVP; Atlas Search with a language analyser in Phase 2 behind the same repository method |

### 49.2 Infrastructure and operations

| # | Risk | L | I | Mitigation |
|---|---|---|---|---|
| R11 | Single VPS failure takes everything down | L | H | Stateless host rebuildable in under an hour; external uptime alerts; provider snapshots; optional CDN serving stale; documented scale-out path |
| R12 | Latency between VPS and Atlas | M | M | Same region for both; connection pooling; in-process cache; measure in staging before launch |
| R13 | Deploy breaks production | M | H | Same image as staging; health gate; automatic rollback; backward-compatible migrations; edge serves stale during the switch |
| R14 | Migration damages data | L | H | Expand/contract rule; migrations reviewed by two people; run on staging first; Atlas backups with a rehearsed restore |
| R15 | TLS certificate expires | L | H | Automated renewal timer; expiry monitoring; renewal tested once before launch |
| R16 | Disk fills (logs, images, cache) | M | M | Docker log rotation; image pruning in the deploy script; bounded Nginx cache size; disk alert |
| R17 | SSR memory growth or leak in `web` | L | M | Memory limit + restart policy; per-request QueryClient; heap monitoring; edge cache reduces render volume |
| R18 | CI runner or registry unavailable | L | M | Images for the current and previous release remain on the host; rollback works offline; documented manual deploy from a Maintainer machine as a break-glass procedure |

### 49.3 Security and compliance

| # | Risk | L | I | Mitigation |
|---|---|---|---|---|
| R19 | Admin account compromise before MFA exists | M | H | Strong password policy, lockout, session visibility, audit, optional IP restriction on the admin host; MFA first in Phase 2 |
| R20 | Malicious attachment reaches staff | L | M | Type allow-list by magic bytes, private storage, forced download, warning in UI; scanning in Phase 2; ship without attachments if in doubt |
| R21 | Secret leaked through Git, logs or CI | L | H | Secret detection in CI, log redaction, protected variables, runtime secrets only on the host, rotation runbook |
| R22 | Dependency vulnerability | M | M | Weekly automated update MRs, audit and image scan in CI, minimal dependency set |
| R23 | Personal data handling in contact requests is non-compliant | M | M | Consent field, privacy page, retention job, access control and audit; legal review of wording and retention before launch |
| R24 | Cloudinary cost or quota exceeded | L | M | Fixed transformation ladder, Strict Transformations, usage alerts, upload size limits |

### 49.4 Delivery

| # | Risk | L | I | Mitigation |
|---|---|---|---|---|
| R25 | Admin scope grows and delays launch | H | M | Standard module pattern and shared building blocks first; MVP list in §44 is the contract; anything else goes to Phase 2 |
| R26 | Real content (copy, case studies, images) is not ready | H | M | Default content makes the site launchable; content owners start writing when the admin reaches staging |
| R27 | Parallel work causes merge conflicts | M | L | Per-module folders, per-module route and nav files, short-lived branches, small MRs |
| R28 | Email deliverability (notifications land in spam) | M | M | Transactional provider with SPF, DKIM and DMARC on the sending domain; contact requests are always stored, so no lead depends on email |
| R29 | Architecture document drifts from reality | M | M | Architecture changes update `docs/` in the same MR; ADRs for new decisions |

---

## 50. Implementation Order

### 50.1 What changes from the brief's sequence

The brief's order places Docker, Nginx, CI/CD and VPS deployment at steps 11–13. That postpones the riskiest integration (real server, real TLS, real Atlas, real pipeline) to the end and guarantees a period of manual deployments. The order below moves delivery to the front: a **walking skeleton** is deployed in the second phase, and every later phase ships through the pipeline. Testing is not a phase; each phase includes its tests.

### 50.2 Phases

Durations are indicative for a team of three to five and should be re-estimated by the team.

| Phase | Goal | Work | Exit criteria |
|---|---|---|---|
| **0. Decisions** (2–3 days) | Agree the foundation | Review this document; sign off the six deviations and the ADRs; fix domain, VPS, Atlas region/tier, GitLab setup; create accounts and placeholders for credentials | ADRs accepted; accounts exist |
| **1. Repository foundation** (3–4 days) | A working monorepo | Yarn workspaces, three apps and three packages scaffolded, ESLint + Prettier + import boundaries, commit conventions, Vitest, `.env.example`, local `compose.yml`, README, MR template, CODEOWNERS, MR pipeline (lint, test, build) | `yarn dev` runs all three apps; MR pipeline is green |
| **2. Walking skeleton to production** (about 1 week) | **Something real on the server** | API: config validation, logger, request id, error contract, `/health`. Web: SSR shell, home page rendered from `@devhouse/content` defaults with the resolver (no database yet). Admin: shell and login screen placeholder. Dockerfiles, edge Nginx, staging + production Compose, host provisioning, TLS, registry, deploy and rollback scripts, full pipeline with health gate, uptime monitor. | `https://www…` serves the default-content home page; `/api/v1/health` is green; a merge to `main` reaches staging automatically; a tag reaches production; rollback tested once |
| **3. Backend core** (about 1 week) | The reusable API machinery | Atlas connection and readiness, Mongoose plugins (slug, publish, soft delete, audit fields), base repository, list-query builder, validation middleware, cache module, audit module, request context, migrations and seed tooling | One reference module (technologies + categories) complete with tests; seed runs on deploy |
| **4. Authentication and RBAC** (about 1 week) | Secure admin access | Sessions, login/logout/me, lockout, rate limits, origin check, password change and reset, permission catalog, roles, users, `authenticate` + `requirePermission`, route-coverage test, `create-admin` script | Admin login works on staging; every admin route is permission-protected by test |
| **5. Admin foundation and media** (1–1.5 weeks) | The building blocks every module needs | AdminShell, guards, API client, `DataTable`, `ResourceForm`, field components, toasts, error handling; Cloudinary signing, verification, media library and picker | Technologies and categories manageable end to end in the admin, with images |
| **6. Content engine** (about 1 week) | Default → override → resolve, end to end | Section definitions for all pages, settings and navigation defaults; content, settings and navigation API modules; generic `SectionForm`; `/site` bootstrap; web consumes resolved content with local fallback | Editing the home hero in the admin changes the public site; empty-database test passes for every page |
| **7. Catalog modules and public pages** (2–3 weeks, parallel) | The body of the site | Services, solutions, projects (API + admin + public list/detail templates, filters, pagination); remaining static pages; header/footer from navigation; rich-text renderer | All catalog routes live on staging with seeded content |
| **8. Blog** (1–1.5 weeks, parallel with 7) | Publishing | Authors, tags, posts, rich-text editor, scheduling by date, public list/detail/category/tag pages | A post can be written, scheduled and read publicly |
| **9. Contact** (about 1 week) | Lead capture | Public form, validation, spam pipeline, storage, email notification with retry, admin inbox; attachments if in scope | A submission appears in the admin and triggers an email |
| **10. SEO and quality pass** (about 1 week) | Launch quality | Metadata helper on all routes, JSON-LD, sitemap, robots, redirects, canonical rules; accessibility pass; performance budgets; responsive checks; error and empty states; dashboard and audit-log viewer | Lighthouse and accessibility targets met on key pages; E2E smoke suite green |
| **11. Production hardening** (about 1 week) | Ready for real traffic | CSP enforced, rate limits tuned, security headers verified, dependency and image scans clean, backup restore drill, host rebuild drill, secret rotation runbook, error tracker alerts, legal pages and consent wording reviewed, real content entered | Checklist in §51 complete |
| **12. Launch and iterate** | Continuous improvement | DNS cutover, Search Console, monitoring review after one week, then Phase 2 backlog | — |

### 50.3 Parallelisation

After phase 5, work splits cleanly because modules are separate folders in the API and admin:

| Stream | Phases |
|---|---|
| A — Content engine and public shell | 6, then public templates in 7 |
| B — Catalog modules (API + admin) | 7 |
| C — Blog | 8 |
| D — Contact, then SEO/quality | 9, 10 |
| Platform owner (part-time) | Pipeline, infrastructure, security review throughout |

### 50.4 The production-first rule

From the end of phase 2 onward, `main` is always deployable and staging always reflects it. Nothing is built as a throwaway prototype: each phase extends the deployed system. Features that are not finished are hidden behind a feature flag in site settings, not kept on a long-lived branch.

---

## 51. Production Readiness Checklist

### Application

- [ ] Every public route renders with an empty database and returns the correct status code
- [ ] Home page renders when the API is unreachable (default fallback)
- [ ] All list endpoints paginated with enforced maximum `limit`
- [ ] Standard success and error envelopes on every endpoint; no stack traces or internal messages in production responses
- [ ] Loading, empty and error states implemented for every data-driven view
- [ ] Graceful shutdown verified for `api` and `web`

### Security

- [ ] HTTPS only, HSTS enabled, HTTP redirected
- [ ] Session cookie is `__Host-`, `HttpOnly`, `Secure`, `SameSite=Strict`
- [ ] Every `/api/v1/admin/*` route has `authenticate` + `requirePermission` (automated test)
- [ ] `/api/v1/admin` and `/api/v1/auth` return 404 on the public host
- [ ] Origin check active on state-changing requests
- [ ] Rate limits active on auth, contact and general API; verified with a test client
- [ ] Login lockout and generic error messages verified
- [ ] CSP enforced (after a report-only period) with no violations on key pages
- [ ] Security headers verified with an external scanner
- [ ] Upload validation verified: disallowed types and oversize files rejected
- [ ] No secrets in the repository, images or frontend bundles (scan passes)
- [ ] First Super Admin created through the script; no default credentials anywhere
- [ ] Dependency audit and image scan have no unresolved critical findings
- [ ] Containers run as non-root with read-only filesystems; only the edge publishes ports
- [ ] Host: firewall, key-only SSH, automatic security updates, fail2ban

### Data

- [ ] Atlas production cluster on a backed-up tier, in the region nearest the VPS
- [ ] Atlas network access limited to the VPS IP; separate least-privilege database users per environment
- [ ] All indexes from §39 created by migration; `autoIndex` off in production
- [ ] No collection scans on public endpoints (verified with `explain`)
- [ ] Backup restore rehearsed and timed
- [ ] Contact-request retention policy defined and reflected in the privacy page

### Media

- [ ] Cloudinary secret present only in the API environment
- [ ] Environment folder prefixes in place; contact attachments stored as private
- [ ] Images delivered with `f_auto,q_auto`, responsive `srcset`, explicit dimensions
- [ ] Usage alerts configured; Strict Transformations enabled or scheduled

### SEO

- [ ] Unique title, description, canonical, Open Graph and X card on every page (verified in page source, not dev tools)
- [ ] JSON-LD validates in a structured-data testing tool
- [ ] `sitemap.xml` lists all published URLs; `robots.txt` correct in production
- [ ] Staging blocked from indexing at the edge
- [ ] 404 pages return 404; slug changes produce 301 redirects
- [ ] Search Console verified and sitemap submitted
- [ ] Link previews checked on the main social and chat platforms
- [ ] `hreflang` alternates and `x-default` present and reciprocal; both languages in the sitemap

### Performance, responsive, accessibility

- [ ] Core Web Vitals and Lighthouse targets of §21.1 met on home, a service page, a project page and a blog post
- [ ] Bundle sizes within budget
- [ ] Edge cache working (`X-Cache-Status` shows hits) and serving stale when `web` is stopped
- [ ] Layout verified at 320, 375, 768, 1024, 1440 and 1920 px and on real iOS and Android devices
- [ ] Keyboard-only walkthrough of navigation, contact form and admin login
- [ ] Screen-reader pass on key pages; automated accessibility checks clean
- [ ] `prefers-reduced-motion` respected
- [ ] Every public page and every admin screen checked in **light and dark** themes; contrast AA in both; no theme flash on first load
- [ ] Every public page reachable in **Vietnamese and English**; header language switch lands on the equivalent page; no page mixes languages; dictionaries have identical keys

### Delivery and operations

- [ ] `main` protected; merge requests required; pipeline must pass
- [ ] Production environment protected; deploy requires a Maintainer
- [ ] Deploy script health gate and automatic rollback tested by deploying a deliberately broken image to staging
- [ ] Manual rollback job tested
- [ ] Host rebuild from scratch rehearsed
- [ ] Certificate auto-renewal tested; expiry monitored
- [ ] External uptime monitor alerting to the team channel
- [ ] Error tracker receiving events from web, admin and api with release tags
- [ ] Log rotation and image pruning confirmed; disk alert set
- [ ] Runbooks present: deploy, rollback, restore, secret rotation, incident contacts

### Content and legal

- [ ] Default content reviewed and approved as launch-acceptable, in both languages
- [ ] No placeholder images, lorem ipsum or invented projects, posts, clients or statistics anywhere
- [ ] Real company details in site settings (name, contact, social, logo, favicon, default OG image)
- [ ] Privacy policy and terms reviewed by a qualified person
- [ ] Contact form consent wording matches the privacy policy
- [ ] Email sending domain has SPF, DKIM and DMARC; notification email received in a real inbox

---

## 52. Final Architecture Summary

```
                              DEV HOUSE SOFTWARE
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        ▼                             ▼                             ▼
   Public Web                       Admin                          API
 React Router + Vite             React + Vite                 Express /api/v1
 server-rendered                 SPA, own host                modular monolith
        │                             │                             │
        └────────── same-origin /api/v1 through edge Nginx ─────────┘
                                      │
                    route → validate → service → repository
                 sessions · RBAC · audit · content resolver · cache
                                      │
                     ┌────────────────┴────────────────┐
                     ▼                                 ▼
               MongoDB Atlas                       Cloudinary
          19 collections, indexed            signed upload, CDN delivery
                                      │
                    Docker Compose on a VPS, behind Nginx
                                      │
              GitLab CI/CD: build once, promote, health-gate, rollback
```

**What this architecture is**

- A **real platform**, not a landing page: 19 collections, a permissioned admin with 19 modules, a versioned API, audit trail and automated delivery.
- **Content-driven without hardcoded pages:** services, solutions, projects, technologies and posts are data rendered by templates; fixed pages are code-defined sections with admin-editable content.
- **Never blank:** defaults in code, sparse overrides in the database, one resolver, seeded catalogs, and an edge cache that serves stale during failures.
- **Search-visible:** server-rendered HTML, real status codes, structured data, sitemap and redirects, using the requested stack.
- **Bilingual and dual-theme by default:** Vietnamese and English, light and dark, on every page and admin screen, switched from the header.
- **Honest content:** short real defaults, no placeholder images or invented data.
- **Secure by construction:** host-isolated admin, same-origin API, server-side sessions, backend-enforced RBAC, no stored HTML, signed uploads, no secrets in the browser or images.
- **Simple where simplicity wins:** one API process, one VPS, no Redis, no queue, no search cluster, no orchestrator, each with a written trigger for when that changes.
- **Deployable from week two and continuously thereafter:** the same image flows from merge request to staging to production, with a health gate and one-command rollback.

**What it deliberately is not**

A static site, a set of per-service React pages, a microservice estate, a page builder that lets Admin alter structure, or a prototype awaiting a rewrite.

**Decisions awaiting confirmation before implementation**

1. Server-side rendering for the public site (ADR-002).
2. Server-side sessions instead of JWT (ADR-004).
3. Host layout: `www` + `admin`, API same-origin (ADR-012).
4. Trunk-based branching without `develop` (ADR-009).
5. Collection consolidation: permissions in code, SEO embedded, one `categories` collection (ADR-007).
6. Delivery pipeline built in phase 2, before features (§50).

Each has a documented fallback that leaves the rest of the architecture intact, so a "no" on any of them is a local change, not a redesign.
