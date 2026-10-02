# Part A — Foundations (§1–§8)

[← Index](README.md)

---

## 1. Executive Summary

Dev House Software is designed as a **content-driven modular monolith**: three deployable applications in one repository, one REST API holding all business logic, one externally hosted database, one media platform.

```
www.devhouse.example ──► web   (React Router + Vite, server-rendered)  ─┐
admin.devhouse.example ─► admin (React + Vite SPA)                      ├─► api (Express, /api/v1) ─► MongoDB Atlas
                                                                        ┘                        └─► Cloudinary
All four run as containers on one VPS behind an edge Nginx, built and deployed by GitLab CI/CD.
```

The six decisions that shape everything else:

1. **Modular monolith.** One Express API organised as self-contained feature modules. No microservices, queues, Redis, or search cluster in the MVP; each has a named trigger for when it becomes justified (§47).
2. **Server-rendered public site, SPA admin.** The public site uses React Router's framework mode (a Vite plugin) so every public URL returns complete HTML, correct status codes, and per-page metadata. The admin panel is a plain Vite SPA because it needs none of that.
3. **Default → Override → Resolve.** All singleton content (pages, settings, navigation) has code-defined defaults. The database stores only *sparse overrides*. One resolver function, shared by API and web, produces the final content. The site renders correctly with an empty database and still renders if the API is unreachable.
4. **Content is data, structure is code.** Services, solutions, projects, technologies and posts are documents rendered by reusable templates at `/…/:slug`. Admin controls content, media, ordering, visibility and publishing. Layout, components and behaviour stay in Git.
5. **Same-origin API, host-isolated admin.** Each host proxies `/api/v1` to the same API container. Browsers never make a cross-origin call, the admin session cookie is invisible to the public host, and the admin API surface is not routable from `www`.
6. **Deploy first.** A walking skeleton (health endpoint, default-content homepage, admin shell) goes through the full GitLab pipeline to the VPS before feature development. Production is never a manual copy.

Three project-wide rules apply to everything built on this foundation: every screen supports **light and dark themes**, everything user-visible exists in **Vietnamese and English** with switches in the header, and default content uses **minimal placeholder data and no placeholder images** (see the index, rules P1–P3).

The stack requested in the brief is retained in full: Yarn, Vite, React, JavaScript, Tailwind CSS, React Router, TanStack Query, Node.js, Express, Mongoose, MongoDB Atlas, Cloudinary, Docker, Nginx, GitLab CI/CD.

---

## 2. Architecture Goals

| Goal | How it is met | Verified by |
|---|---|---|
| Production-ready foundation | Security, logging, health checks, CI/CD and rollback exist before features | §51 checklist |
| Modular | Feature modules in API and both frontends; a module owns its routes, logic, data access and tests | Repo structure §38, CODEOWNERS |
| Maintainable | One layering rule (route → middleware → controller → service → repository), one validation library, one response contract | Lint rules, MR review |
| Scalable (appropriately) | Stateless API containers; cache layers; all state in Atlas/Cloudinary; clear upgrade paths | §47 triggers |
| Secure | Threat model with mitigations; backend-enforced RBAC; no secrets in images or browser | §24 |
| High-performance | SSR + edge micro-cache, hashed immutable assets, Cloudinary `f_auto,q_auto`, indexed queries | §21 budgets, Lighthouse CI |
| SEO-friendly | Server-rendered HTML, real status codes, sitemap, JSON-LD, redirects | §20 |
| Responsive / accessible | Mobile-first fluid layout; WCAG 2.2 AA target | §22, §23 |
| Content-driven / admin-manageable | Schema-described content model, generic section forms, dynamic collections | §12, §13, §15 |
| Easy to deploy / update | Build once, promote the same image; one-command rollback | §35, §37 |
| Team-friendly | Module ownership, shared contracts package, small files, trunk-based flow | §34, Part L |
| Not overengineered | Explicit non-goals and adoption triggers | §3, §47 |

---

## 3. Non-Goals

Not in this architecture until a stated trigger occurs:

- **Microservices, Kubernetes, service mesh, Kafka/RabbitMQ, event sourcing, CQRS.** No requirement in the brief needs them. A single VPS with Compose serves the expected load with large headroom.
- **Redis.** Trigger: more than one API replica (shared rate-limit state and cache invalidation) or a real job queue.
- **Elasticsearch / OpenSearch.** MongoDB text indexes cover MVP search; Atlas Search is the upgrade.
- **GraphQL.** Two first-party clients with known data needs; REST with purpose-built DTOs is simpler to cache and secure.
- **A visual page builder.** Admin edits content inside code-defined sections; it does not compose layouts.
- **Customer accounts, payments, CRM, multi-tenancy.** Phase 3. The module and auth designs leave room (§47).
- **A third language, or automatic language redirection.** Vietnamese and English are built in from the first release (§30). Further locales are additive later. Visitors are never redirected based on browser language, cookie or IP.
- **A guaranteed SLA.** A single VPS is a single point of failure. Targets in §21 are objectives, not guarantees.
- **TypeScript migration.** The stack is JavaScript. Type safety is approximated with Zod contracts and optional JSDoc checking (§7).

---

## 4. Core Architectural Principles

1. **Structure is code; content is data.** If changing it could break layout, security or behaviour, it lives in Git. If it is a word, an image, an order or a visibility flag, it lives in the database.
2. **Defaults always exist.** No public page depends on a database row existing. Missing data degrades to defaults, never to blank.
3. **One source of truth per concern.** Zod schemas define a shape once (API validation, admin form validation, documentation). Permission keys are defined once. Default content is defined once and reused by seed, API and web fallback.
4. **The backend is the security boundary.** Frontend permission checks are UX only. Every write and every admin read is authorised in the API.
5. **Layers only call downward.** Controllers hold no business logic; services hold no HTTP; repositories hold no business rules. Modules talk to each other through services, never through each other's models.
6. **Stateless processes.** No session, upload, or content state on container disk. A container can be destroyed and recreated at any time.
7. **Build once, promote.** The image tested in staging is byte-identical to the one deployed to production. Environment differences are runtime configuration only.
8. **Reads are cheap, writes are careful.** Public reads are cached, lean and index-backed. Admin writes are validated, authorised, audited.
9. **Boring by default.** Add infrastructure only when a measured need exists. Prefer a library to a service, and a service to a cluster.
10. **Additive evolution.** Schema changes follow expand → migrate → contract so the previous release keeps working and rollback stays possible.
11. **Small files, clear owners.** No giant route file, no giant admin component, no shared "utils" dumping ground.

---

## 5. Architecture Overview

### 5.1 Logical view

| Layer | Component | Responsibility |
|---|---|---|
| Edge | Nginx container | TLS, host routing, compression, micro-cache, rate limiting, security headers, static fallback |
| Presentation | `web` (Node SSR) | Public site. Renders HTML on the server, hydrates in the browser, emits SEO metadata, sitemap, robots |
| Presentation | `admin` (static SPA) | Authenticated content management UI |
| Application | `api` (Express) | All business logic, validation, auth, RBAC, content resolution, media signing, audit |
| Shared | `packages/shared`, `packages/content`, `packages/config` | Contracts, default content + resolver, tooling presets |
| Data | MongoDB Atlas | System of record |
| Media | Cloudinary | Asset storage, transformation, CDN delivery |
| Supporting | SMTP provider, error tracker, uptime monitor | Notifications and observability |

### 5.2 Why modular monolith

| Option | Verdict | Reason |
|---|---|---|
| **Modular monolith** | **Chosen** | One deployable API, in-process calls, single transaction scope, trivial local development. Module boundaries (folders, service interfaces, lint rules) give most of the organisational benefit of services with none of the distributed-systems cost. |
| Microservices | Rejected | No independent scaling need, no independent team ownership at this size, and it would add network failure modes, distributed tracing, service discovery and several pipelines for a content platform. |
| Serverless functions | Rejected | Conflicts with the VPS + Docker requirement; cold starts hurt SSR; long-lived Mongo connections fit poorly. |
| Headless SaaS CMS (Strapi, Sanity, etc.) | Rejected | The brief requires a custom Admin on Express/Mongoose. A custom content model also keeps the Default → Override rule enforceable and avoids a second runtime. |

A future extraction (e.g. an AI-agent service or client portal) is possible because modules already communicate through service interfaces and the API is versioned.

### 5.3 Architectural risks and conflicts found in the brief

| # | Conflict | Resolution |
|---|---|---|
| C1 | "SEO-friendly" vs "Vite + React SPA" | Server rendering through React Router framework mode; no stack change (ADR-002). |
| C2 | "Website must never be blank" vs "content from database" | Sparse overrides over code defaults; collections seeded from the same defaults; edge serves stale HTML during outages (§13, §25). |
| C3 | "JWT" vs "session/token invalidation, logout" | Server-side sessions; revocation is a delete (ADR-004). |
| C4 | "No Redis" vs "rate limiting, caching" | In-process stores are correct while there is one API replica; Nginx handles the coarse limits. Redis trigger documented. |
| C5 | "Scheduled publishing" vs "no job infrastructure" | Scheduling is a query predicate (`publishedAt <= now`), not a job (§11). |
| C6 | "Admin controls ordering/visibility" vs "admin must not control structure" | Sections expose a `visible` flag and item ordering; the section set and their components are fixed in code. |
| C7 | "JavaScript only" vs "multi-developer maintainability" | Zod as the runtime contract, shared schemas, optional `checkJs`; TypeScript remains a future, non-blocking option. |
| C8 | "Attachment upload from anonymous visitors" vs "never expose Cloudinary secret / malicious uploads" | Attachments are proxied and validated by the API and stored as private assets; only authenticated admin uploads use signed direct upload (§18). |
| C9 | "Deploy early" vs "DevOps at the end of the list" | Reordered implementation plan (§50). |

---

## 6. High-Level System Architecture

Diagram: [§43.1](09-diagrams.md#431-high-level-system-architecture).

### 6.1 Runtime components

| Container | Image base | Exposed | Talks to | State |
|---|---|---|---|---|
| `edge` | `nginx` (stable, alpine) | 80, 443 (only container with published ports) | `web`, `admin`, `api` | Cache dir + certificates on volumes |
| `web` | `node` (LTS, slim) | 3000 (internal) | `api` over the Docker network | None |
| `admin` | `nginx` (alpine) serving static build | 8080 (internal) | — | None |
| `api` | `node` (LTS, slim) | 4000 (internal) | Atlas, Cloudinary, SMTP | None (in-memory cache only) |

### 6.2 Request paths

| Request | Path |
|---|---|
| Visitor opens `/services/mobile-apps` | Browser → edge (micro-cache hit? serve) → `web` SSR → loader calls `api` internally → Atlas → HTML returned, cached 60 s at edge |
| Visitor navigates client-side | Browser → edge → `/api/v1/services/...` → `api` (in-memory cache / Atlas) → JSON |
| Visitor submits contact form | Browser → edge (rate limit) → `api` → validate, spam-check, store, notify |
| Editor saves a service | Admin SPA → edge (`admin` host) → `/api/v1/admin/services/:id` → session + permission → validate → service → repository → Atlas → audit log → cache invalidation |
| Editor uploads an image | Admin SPA → `api` for a signature → browser uploads **directly to Cloudinary** → SPA registers the result with `api` → `api` verifies and stores metadata |
| Image display | Browser → Cloudinary CDN (`f_auto,q_auto`, responsive widths). Never through the VPS. |

### 6.3 Trust boundaries

1. **Internet ↔ edge.** Everything outside is untrusted. TLS, rate limits and header hygiene are applied here.
2. **`www` host ↔ `admin` host.** Different origins. The session cookie is host-only on `admin`. Nginx on `www` does not route `/api/v1/admin` or `/api/v1/auth`.
3. **edge ↔ internal network.** `web`, `admin`, `api` publish no ports. The API trusts exactly one proxy hop for client IP.
4. **API ↔ third parties.** Atlas restricted by IP allow-list and credentials; Cloudinary secret and SMTP credentials exist only in the API container's environment.

---

## 7. Technology Stack

Versions are "current stable/LTS at project setup"; the examples are what that means in late 2026 and must be confirmed on day one, then pinned.

### 7.1 Core stack (from the brief — retained)

| Area | Choice | Notes |
|---|---|---|
| Package manager | **Yarn 4** workspaces, `nodeLinker: node-modules` | Node-modules linker avoids Plug'n'Play friction with native modules and Docker layers. |
| Runtime | **Node.js LTS** (24.x) | Same version in dev, CI and images via `.nvmrc` and base image tag. |
| Language | **JavaScript (ES modules)** everywhere | See 7.4 for the type-safety mitigation. |
| Build | **Vite** | Both frontends. |
| UI | **React 19** | |
| Styling | **Tailwind CSS 4** | Shared theme tokens in `packages/config`. |
| Routing | **React Router 7** | Framework mode in `web` (SSR); data-router/library mode in `admin`. |
| Server state | **TanStack Query 5** | Query-option factories shared by loaders and components. |
| API | **Express 5** | Native async error propagation; simple query parser by default. |
| ODM | **Mongoose** (current major) | Strict schemas, `strictQuery`, `sanitizeFilter`. |
| Database | **MongoDB Atlas** | External to the VPS. |
| Media | **Cloudinary** | Signed uploads only. |
| Infra | **Docker, Docker Compose, Nginx, GitLab CI/CD, GitLab Container Registry** | |

### 7.2 Additions with justification

| Library | Where | Tag | Why |
|---|---|---|---|
| `zod` | shared, api, admin, web | [Required] | Single validation/contract source for API input, admin forms, content schemas. |
| `pino`, `pino-http` | api, web server | [Required] | Structured JSON logs with request IDs. |
| `helmet`, `express-rate-limit`, `compression` (web only) | api, web | [Required] | Baseline security headers and abuse control. |
| `argon2` | api | [Required] | Argon2id password hashing. |
| `lru-cache` | api | [Required] | Bounded in-process cache for resolved content and sessions. |
| `cloudinary` (Node SDK) | api | [Required] | Signature generation, verification, deletion. |
| `multer` + `file-type` | api | [Required if attachments ship] | Bounded multipart parsing and magic-byte validation for contact attachments. |
| `nodemailer` | api | [Recommended] | Provider-agnostic SMTP for notifications and password reset. |
| `migrate-mongo` | api | [Recommended] | Versioned, reviewable data migrations and index changes. |
| `react-hook-form` + Zod resolver | admin, web (contact) | [Required] | Performant forms using the shared schemas. |
| TanStack Table | admin | [Recommended] | Headless tables for every list screen. |
| Radix UI primitives (or React Aria) | admin, web | [Recommended] | Accessible dialog, menu, popover, tabs; avoids hand-rolled focus traps. |
| TipTap (ProseMirror) | admin editor; JSON renderer in web | [Required] | Structured rich text stored as JSON (decision in §12.5). |
| `dnd-kit` | admin | [Optional] | Drag-to-reorder for navigation and sort order. |
| Vitest, Testing Library, Supertest, `mongodb-memory-server`, Playwright | all | [Required] (subset in MVP, §29) | One test runner across workspaces. |
| ESLint, Prettier, lint-staged, commitlint | root | [Required] | Enforced in CI; import-boundary rules keep layering honest. |
| Error tracker (Sentry SaaS or self-hosted GlitchTip) | web, admin, api | [Recommended] | Without it, frontend production errors are invisible. |
| OpenAPI generation from Zod | api | [Recommended] | API docs that cannot drift from validation. |

### 7.3 Deliberately not added

Redux/Zustand (no global client state that needs it), Axios (a 60-line `fetch` wrapper is enough), Turborepo/Nx (Yarn workspaces + GitLab `rules:changes` suffice at three apps), Redis, any message broker, any ORM alternative, CSS-in-JS.

### 7.4 JavaScript without TypeScript — risk and mitigation

Plain JavaScript in a multi-developer codebase loses compile-time contract checking. Mitigation, in order of value:

1. **[Required]** Zod schemas in `packages/shared` are the contract for every API request body, query and content shape.
2. **[Required]** Response DTO mappers in the API (never return raw Mongoose documents).
3. **[Recommended]** `jsconfig.json` with `checkJs: true` and JSDoc types inferred from Zod (`@typedef {import('zod').infer<typeof schema>}`), run as `tsc --noEmit` in CI. This gives editor IntelliSense and type errors without changing the language.
4. **[Future]** Incremental TypeScript adoption per package. Vite and Node tooling support it with no architectural change.

---

## 8. Repository / Monorepo Strategy

### 8.1 Decision

**One GitLab repository, Yarn workspaces monorepo.** (ADR-001)

| Option | Assessment |
|---|---|
| **Monorepo (chosen)** | Atomic changes across API + admin + web + contracts in one merge request. One lint/test/tooling setup. Shared packages consumed as source with no publish step. Suits one team shipping one product. |
| Multi-repo | Independent release cadence, but contract changes need coordinated MRs and a private package registry. Cost without benefit here. |
| Monorepo + Nx/Turborepo | Adds task caching and affected-graph. Worth it past roughly 6–8 packages or when CI exceeds ~10 minutes. [Future] |

### 8.2 Evaluation of the proposed structure

The proposed `apps/{web,admin,api}` + `packages/shared` layout is sound. Changes:

| Change | Reason |
|---|---|
| Split `packages/shared` into **`shared`**, **`content`**, **`config`** | Contracts, default content and tooling presets change for different reasons and have different owners. A single `shared` package becomes a dumping ground. |
| Rename `docker/` → **`infra/`** | It holds Nginx config, Compose files and deploy scripts, not only Dockerfiles. Each app keeps its own `Dockerfile` next to its code. |
| Add **`e2e/`** at the root | End-to-end tests span apps and belong to none. |
| Root `docker-compose.yml` → **`compose.yml`** (local dev only); production/staging Compose files under `infra/compose/` | Prevents accidentally running a dev file in production. |
| `.gitlab-ci.yml` plus **`.gitlab/ci/*.yml`** includes | Keeps the pipeline definition reviewable per stage. |
| No `packages/ui` in MVP | The marketing site and the admin panel have different component needs. Sharing design tokens (Tailwind theme) is enough. Extract a UI package only when real duplication appears. [Optional] |

Full tree: [§38](05-infrastructure-delivery.md#38-repository-structure).

### 8.3 Workspace rules

- Package names are scoped: `@devhouse/web`, `@devhouse/admin`, `@devhouse/api`, `@devhouse/shared`, `@devhouse/content`, `@devhouse/config`.
- **Dependency direction:** `apps/*` may depend on `packages/*`. Packages never depend on apps. `content` may depend on `shared`; `shared` depends on nothing internal. Enforced with an ESLint import-boundary rule.
- **Shared packages ship as ES-module source.** No build step: Vite bundles them into the frontends, Node imports them directly. They must therefore be isomorphic (no `fs`, no `window`, no Mongoose).
- One `yarn.lock` at the root; CI uses `yarn install --immutable`.
- Root scripts fan out: `yarn dev`, `yarn lint`, `yarn test`, `yarn build` call the same script in each workspace.
- CI builds an app's image when its own folder or any `packages/**` path changed (§35).

### 8.4 What lives in each shared package

| Package | Contents | Consumers |
|---|---|---|
| `@devhouse/shared` | Zod schemas (requests, entities, pagination), enums (status, category types), permission catalog, error codes, slug and Cloudinary-URL helpers | api, admin, web |
| `@devhouse/content` | Section and page definitions (field descriptors + defaults), default settings, default navigation, default catalogs for seeding, the `resolveContent` function | api (authoritative resolve, seed), web (last-resort fallback), admin (form generation, "reset to default") |
| `@devhouse/config` | ESLint config, Prettier config, Tailwind theme CSS, Vitest base config | all |
