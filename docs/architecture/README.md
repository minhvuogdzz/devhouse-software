# Dev House Software — Architecture Design Document

| | |
|---|---|
| **Version** | 1.1 (adds project-wide rules P1–P5: themes, two languages, minimal placeholder data, Hallmark design, commercial tone) |
| **Date** | 2026-10-02 |
| **Status** | Proposed — awaiting sign-off on the six deviations listed below |
| **Scope** | Architecture, data models, API contracts, security, delivery. No application code. |

This document is split into parts so each can be reviewed and owned separately. Section numbers follow the required 52-section structure.

## Reading guide

| Part | File | Sections |
|---|---|---|
| A | [01-foundations.md](01-foundations.md) | 1 Executive Summary · 2 Goals · 3 Non-Goals · 4 Principles · 5 Overview · 6 High-Level System · 7 Technology Stack · 8 Monorepo Strategy |
| B | [02-application-architecture.md](02-application-architecture.md) | 9 Frontend · 10 Backend · 11 Database Architecture · 12 Content Architecture · 13 Default Content / Override · 14 Public Website · 15 Admin CMS |
| C | [03-auth-media-api.md](03-auth-media-api.md) | 16 Authentication · 17 Authorization / RBAC · 18 Cloudinary / Media · 19 REST API |
| D | [04-quality-attributes.md](04-quality-attributes.md) | 20 SEO · 21 Performance · 22 Responsive · 23 Accessibility · 24 Security · 25 Caching · 26 Search / Filtering / Pagination · 27 Logging / Monitoring · 28 Health Checks · 29 Testing · 30 Internationalization · 31 Analytics |
| E | [05-infrastructure-delivery.md](05-infrastructure-delivery.md) | 32 Docker · 33 Nginx · 34 GitLab Repository Strategy · 35 GitLab CI/CD · 36 Environment Management · 37 VPS Deployment · 38 Repository Structure |
| F | [06-database-schema.md](06-database-schema.md) | 39 Database Schema |
| G | [07-api-endpoint-map.md](07-api-endpoint-map.md) | 40 API Endpoint Map |
| H | [08-route-and-admin-maps.md](08-route-and-admin-maps.md) | 41 Route / Page Map · 42 Admin Module Map |
| I | [09-diagrams.md](09-diagrams.md) | 43 Mermaid Diagrams (all ten) |
| J | [10-scope-and-roadmap.md](10-scope-and-roadmap.md) | 44 MVP Scope · 45 Phase 2 · 46 Phase 3 · 47 Future Expansion |
| K | [11-adrs.md](11-adrs.md) | 48 Architectural Decision Records (ADR-001 … ADR-017) |
| L | [12-risks-plan-readiness.md](12-risks-plan-readiness.md) | 49 Risks & Mitigations · 50 Implementation Order · 51 Production Readiness Checklist · 52 Final Summary |

## Classification legend

Every recommendation is tagged so scope discussions stay honest:

| Tag | Meaning |
|---|---|
| **[Required]** | Part of the MVP foundation. Skipping it creates rework or a production risk. |
| **[Recommended]** | Strongly advised for MVP; can slip by a few weeks without architectural damage. |
| **[Optional]** | Useful, not necessary. Adopt when the stated trigger occurs. |
| **[Future]** | Deliberately not built now. The architecture leaves room for it. |

## Project-wide rules (added in revision 1.1)

These five rules come from the product owner and apply to **every** feature, screen and task in both `web` and `admin`. They are not optional and not deferred.

| # | Rule | What it means in practice | Detail |
|---|---|---|---|
| P1 | **Light and dark themes** | Every screen works in both. A theme switch sits in the header. Components use semantic colour tokens, never raw palette colours. | §9.8, ADR-017 |
| P2 | **Vietnamese and English** | Both languages ship from the first release. A language switch sits in the header. No user-visible string is hardcoded; content fields are localized; a page never mixes languages. | §30, ADR-016 |
| P3 | **Minimal placeholder data, no placeholder images** | Default content is short, real text only. No stock photos, generated images, lorem ipsum, or invented projects, posts, clients, testimonials, team members or statistics. Image fields default to empty and every component must look right without an image. | §13.5 |
| P4 | **Design through the Hallmark skill** | All UI in both apps is designed with the implementing agent's `hallmark` skill: one design system (OKLCH palette for both themes with **blue, the Dev House brand colour, as primary**, 2+1 type system with Vietnamese support) recorded in `docs/design/design-system.md`, every screen built to it, audited before delivery. P1–P3 take precedence over it. | `GEMINI.md` |
| P5 | **A commercial website, not a developer tool** | No monospace or code-style fonts or motifs anywhere except a real code block in a blog article. Copy speaks to business owners in plain language about outcomes and benefits; technical terms and acronyms are kept to a minimum and explained when used. | `GEMINI.md` |

## Where this design deviates from the brief

The brief asked not to follow its assumptions blindly. Six recommendations differ from what it suggested. Each has an ADR; these are the decisions to confirm before implementation starts.

| # | Brief suggested | This document recommends | Why (one line) | ADR |
|---|---|---|---|---|
| 1 | Public site as a Vite + React SPA | Public site runs **React Router in framework mode (its Vite plugin) with server-side rendering**. Admin stays a plain Vite SPA. Same libraries, same language. | A client-rendered SPA gives social crawlers and most AI crawlers an empty page, and cannot return real 404/301 status codes. For a company whose website is its sales channel this is the largest risk in the brief. | 002, 014 |
| 2 | JWT access + refresh tokens | **Opaque server-side sessions** in a host-only HttpOnly cookie, stored hashed in MongoDB | The only client is a first-party browser admin. Sessions give immediate revocation with fewer secrets and no refresh-rotation race conditions. JWT is kept as a future strategy for mobile / third-party clients. | 004 |
| 3 | `api.` subdomain **or** `/admin` path | **`www.` + `admin.` hosts, API served same-origin under `/api/v1` on each** | No CORS, host-only cookies that the public site can never see, one image promotable across environments, admin API unreachable from the public host. | 012 |
| 4 | `feature → develop → main` | **Trunk-based: `feature/* → main`**, main auto-deploys to staging, a protected tag promotes the *same image* to production | `develop` adds merge overhead and rebuild-for-production risk without benefit at this team size. | 009 |
| 5 | Collections for `permissions`, `seo_metadata`, four `*_categories` | Permissions defined **in code**; SEO **embedded**; one `categories` collection with a `type` field | A permission that no code checks is meaningless; SEO is always read with its parent; the four category schemas are identical. | 007 |
| 6 | Docker / CI / VPS as steps 11–13 | **Deployment pipeline is step 2**: a walking skeleton ships to the VPS before feature work starts | The default-content system means the skeleton is already a presentable site, and every later merge flows through CI/CD. | — (see §50) |

## Assumptions made where the brief was ambiguous

| # | Ambiguity | Assumption used |
|---|---|---|
| A1 | Domain name | Placeholder `devhouse.example` → `www.devhouse.example`, `admin.devhouse.example`. |
| A2 | GitLab hosting | **Confirmed: GitLab.com, group `thedevhouse`** (`https://gitlab.com/thedevhouse`, private). The repository is the existing project **`thedevhouse/web-repo`**. It held three old, inactive projects (`devhouse_web`, `w1_mobileapp`, `w2_ecommerce`); they are moved unchanged into `legacy/` and excluded from all tooling, and this monorepo occupies the repository root. The MVP is built locally first, then merged with that repository's history and delivered through the `feature/mvp-foundation` branch and a merge request into `main`. Images go to `registry.gitlab.com/thedevhouse/web-repo`, referenced in CI as `$CI_REGISTRY_IMAGE`. Assumes a Docker-capable runner that is **not** the production VPS (GitLab.com shared runners qualify). Some features named (approval rules, CODEOWNERS enforcement, dependency scanning) depend on the GitLab tier; fallbacks are given. |
| A3 | VPS size | One production VPS, Ubuntu LTS, at least 2 vCPU / 4 GB RAM, static IP. Staging on a second small VPS if budget allows, otherwise an isolated Compose project on the same host. |
| A4 | Traffic | Low to moderate (well under 1M page views / month at launch). Nothing here needs horizontal scaling at that level. |
| A5 | Team | 3–6 developers working in parallel. |
| A6 | Languages | Vietnamese and English ship together (rule P2). Vietnamese is the default locale with unprefixed URLs; English lives under `/en`. |
| A7 | "Solutions" vs "Services" | A *service* is a capability sold (e.g. Mobile App Development). A *solution* is an outcome-oriented package combining several services (e.g. "Internal ERP for SMEs", "AI customer-support agent"). |
| A8 | Careers | A CMS-managed page listing open roles in MVP. A job-posting collection and application intake are Phase 2. |
| A9 | Email | A transactional SMTP provider will be available (contact notifications, password reset). Credentials are placeholders. |
| A10 | MongoDB Atlas tier | Production on a dedicated tier with backups (M10 or above) in the region closest to the VPS. A free/shared tier is acceptable for development and staging only. |
| A11 | Existing website | None to migrate. If one exists, its URLs are imported into the `redirects` collection before launch. |
| A12 | Projects and blog at launch | No fabricated default case studies or posts (rule P3). Those sections show a designed empty state or are hidden until real content exists. |
