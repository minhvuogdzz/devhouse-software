# Part J — Scope & Roadmap (§44–§47)

[← Index](README.md)

---

## 44. MVP Scope

The MVP is the smallest release that is a real, production-grade corporate platform: every public page is live and content-managed, the admin covers day-to-day operation, and delivery is automated.

### 44.1 Public website

| Area | In MVP |
|---|---|
| Pages | Home, About, Services, Service detail, Solutions, Projects, Project detail, Technologies, Blog, Blog post, Careers (content page), Contact, Privacy, Terms, 404 |
| Recommended additions | Solution detail, blog category and tag pages (low cost once the list template exists) |
| Rendering | Server-rendered with hydration; real status codes; client-side navigation |
| Content | Default content for every page and section; default service, solution and technology catalog seeded; honest empty states for projects and blog |
| Projects | Search, filter by category / service / technology, sort, pagination, featured |
| Blog | List, pagination, category/tag filter, post rendering from rich-text JSON with code highlighting, future-dated publishing |
| Contact | Full field set, validation, rate limiting, honeypot + timing checks, stored in MongoDB, email notification. Attachments included if time allows, otherwise first item after launch (isolated flow). |
| SEO | Per-page metadata, canonical, Open Graph, X cards, JSON-LD (Organization, WebSite, Breadcrumb, Service, FAQ, BlogPosting), sitemap, robots, automatic redirects on slug change |
| Languages | Vietnamese (default, unprefixed) and English (`/en`) for every page, with a header switch, localized slugs, `hreflang` and per-language sitemap entries |
| Themes | Light and dark on every page, header switch, system default, no flash on load |
| Placeholder data | Short real default text in both languages; no placeholder images; no invented projects, posts, clients or statistics |
| Quality | Responsive from 320 px to large desktop; WCAG 2.2 AA in both themes; performance budgets of §21 |

### 44.2 Admin

| Module | In MVP |
|---|---|
| Authentication | Login, logout, session management, password change, password reset (email), lockout |
| Dashboard | Counts, new contact requests, drafts, recent activity |
| Services, Solutions, Projects, Technologies | Full CRUD, publish/unpublish, featured, ordering, soft delete + restore |
| Categories | For services, projects, technologies, posts |
| Blog | Posts with rich-text editor, authors, tags, categories, featured, future-dated publish |
| Media | Signed direct upload, library with search and folders, alt text, usage check, delete, replace |
| Contact requests | Inbox, detail, status, assignee, notes, spam flag |
| Pages | Section-based editing over defaults for all page keys, per-page SEO |
| Site settings | Company, contact, social, default SEO, footer, analytics identifiers, feature flags |
| Navigation | Header, footer, legal menus with reset to default |
| Users and roles | Users CRUD, role assignment, seeded roles, role editor from the permission catalog |
| Audit logs | Recorded for all admin writes and auth events; read-only viewer |
| Redirects | Automatic on slug change; simple manager |

### 44.3 Platform and infrastructure

| Area | In MVP |
|---|---|
| Repository | Yarn workspaces monorepo, lint/format/commit conventions, CODEOWNERS, MR template |
| API | Layered modules, Zod validation, response/error contract, health endpoints, request IDs, structured logs |
| Security | Sessions, RBAC, origin check, rate limits, Helmet, CSP (report-only → enforced), upload validation, secret handling |
| Data | MongoDB Atlas with indexes, migrations, idempotent seed, backups enabled |
| Media | Cloudinary signed upload, folder convention, `f_auto,q_auto`, responsive images |
| Docker | Four images, production and staging Compose, health checks, hardening |
| Nginx | TLS, host routing, micro-cache with stale-if-error, compression, rate limiting, security headers |
| CI/CD | MR pipeline, build + push, automatic staging, gated production, health gate, automatic rollback |
| Observability | External uptime monitor, error tracker, Atlas alerts |
| Tests | MVP column of §29.2 |
| Docs | README, architecture, ADRs, deployment and rollback runbooks, "how to add a module/section" guides |

### 44.4 Explicitly not in MVP

MFA, draft preview on the public site, page revision history, Atlas Search, a third language, GA4 and consent banner, attachment malware scanning, job postings as a collection, newsletter, comments, client accounts, zero-downtime blue/green, log aggregation, review apps.

---

## 45. Phase 2

Improvements that build on the MVP without changing its architecture. Order is by expected value.

| Item | What it adds | Architectural hook already in place |
|---|---|---|
| **MFA (TOTP + recovery codes)** | Closes the largest residual auth risk | Two-step login contract and reserved user fields (§16.8) |
| **Draft preview** | Editors see unpublished changes on the real site | Signed preview token, edge cache bypass on a preview parameter |
| **Page revisions and scheduled page changes** | History, restore, "publish at" for singleton content | `page_revisions` collection alongside `pages`; resolver unchanged |
| **Atlas Search** | Relevance, autocomplete, typo tolerance, site-wide search | `repository.search()` abstraction (§26.4) |
| **Third language** | Another locale beyond Vietnamese and English | Add to `LOCALES`, dictionaries and defaults; localized maps gain a key (§30.9) |
| **Advanced RBAC** | Ownership rules ("edit own posts"), approval workflow (author → reviewer → publish) | Service-layer predicates; `*:publish` already separate |
| **Advanced media** | Bulk upload/tagging, video support, focal point, unused-asset report, malware scanning of attachments | Media registry and usage scan |
| **Careers as a collection** | Job postings with `JobPosting` schema, application intake | New module following the standard pattern; contact pipeline reused for applications |
| **Notifications and email automation** | Auto-reply to enquiries, assignment notifications, digest emails, templated emails | Mail integration interface; introduce a job queue if volume requires |
| **Analytics maturity** | Web-vitals field data, consent banner, optional GA4, lead dashboard | Analytics abstraction and consent gate (§31) |
| **Lighthouse CI, axe and visual regression in the pipeline** | Automated enforcement of quality budgets | Pipeline stages exist |
| **Zero-downtime deploys** | Blue/green switch on the single host | Stateless containers, health endpoints |
| **Log aggregation and dashboards** | Searchable logs, latency and error dashboards | Structured JSON logs with request IDs |
| **Secrets tooling** | Encrypted secrets in Git or a secrets manager; audited rotation | Env-file interface unchanged |
| **Contact export and retention automation** | CSV export, scheduled anonymisation | Cursor streaming, retention policy fields |
| **Client portal foundations** | Second principal type, portal route namespace, token auth strategy | `authenticate` interface, module boundaries |
| **Testimonials, newsletter signup, related-content tuning** | Marketing features | New small modules |

---

## 46. Phase 3

Long-term capabilities. Each is a new bounded context added as modules to the monolith first, and extracted only if it earns it.

| Capability | Shape | Likely new infrastructure |
|---|---|---|
| **Client accounts and portal** | `portal` modules with their own principal type, roles and UI app (`apps/portal`); project status, documents, invoices | Token-based auth (OAuth 2.1 / OIDC), possibly an identity provider |
| **CRM and lead pipeline** | Contact requests evolve into leads → opportunities; or integration with an external CRM through webhooks | Outbound webhook delivery with retries → job queue |
| **Quotation system** | Quote builder, templates, PDF generation, approval, e-signature integration | Background jobs, document rendering worker |
| **Project management / internal dashboard** | Internal modules for projects, milestones, time, resources | Possibly a relational store if reporting needs joins; evaluated then |
| **AI chatbot and AI agent services** | A public assistant grounded in site content; agent services offered to clients | LLM provider integration, vector search (Atlas Vector Search keeps it in one database), streaming endpoints, usage metering. A natural first candidate for a separate service because its scaling and failure profile differ. |
| **SaaS products and subscriptions** | Product modules with plans, entitlements, metering | Payment provider, webhook processing, job queue |
| **Payment systems** | Hosted checkout and invoicing through a provider; never raw card handling | Payment provider SDK, idempotent webhook handlers |
| **Advanced analytics** | Warehouse or product-analytics pipeline | Event pipeline, separate analytics store |
| **Multi-tenant infrastructure** | Tenant scoping in request context and repositories; per-tenant configuration and branding | Tenant-aware indexes, isolation testing, possibly per-tenant databases for larger customers |
| **High availability** | Multiple hosts, load balancer or managed container platform | Redis, shared cache, orchestrator only when the scale and team justify it |

---

## 47. Future Expansion

### 47.1 How the architecture leaves room

| Future need | Why no rewrite is required |
|---|---|
| Client portal, customer accounts | Auth is behind one `authenticate` interface; RBAC is principal-agnostic; the API namespaces by audience (`/admin`, later `/portal`); a third frontend app joins the monorepo and reuses `shared` contracts |
| Project management, quotations, CRM | New modules follow the same route → service → repository pattern; cross-module access goes through services, so a module can later be moved behind HTTP |
| AI chatbot / agent services | The content is structured and already has derived plain text (`contentText`); the API can expose a retrieval endpoint; Atlas offers vector search in the same database; a separate service can consume the versioned API |
| Subscriptions, payments | Idempotent, webhook-driven modules fit the existing service layer; the audit log and request context are already present |
| Notification system, email automation | Mail sits behind an integration interface; the "outbox-lite" pattern on contact requests generalises to an outbox collection and then to a queue |
| Advanced analytics | Events flow through one abstraction; server-side events can be added in the service layer |
| More languages | Vietnamese and English are built in; localized maps accept additional locale keys without restructuring |
| Multi-tenant | Request context (AsyncLocalStorage) and repository scopes are the two places tenant filtering is applied |
| More traffic | Stateless containers, cache interface, CDN option, documented scale-out path (§37.6) |
| External API consumers | Versioned API, OpenAPI from schemas, reserved `api.` host, token auth strategy slot |
| TypeScript | Zod contracts and JSDoc types make incremental adoption mechanical |

### 47.2 Adoption triggers for deferred infrastructure

Do not add these on a schedule. Add them when the trigger is observed.

| Technology | Trigger | First use |
|---|---|---|
| **Redis** | A second API replica; or a real job queue; or measured session/cache pressure | Shared rate-limit counters, cache invalidation pub/sub, queue backend |
| **Job queue** | Work that must survive restarts or be retried at volume: bulk email, PDF generation, webhooks, scheduled tasks beyond a simple timer | Outbound email and webhooks |
| **CDN / WAF** | Abuse, bot traffic, an international audience, or a traffic spike risk | Edge caching and DDoS absorption |
| **Atlas Search** | Users ask for better search, or content exceeds a few hundred items | Site search and autocomplete |
| **Vector search** | An AI feature needing retrieval over site content | Chatbot grounding |
| **Second VPS / load balancer** | Availability target above what one host can give, or sustained CPU saturation after vertical scaling | Redundant web/API |
| **Container orchestrator** | Several hosts, several services, and a team able to operate it | Only then |
| **Service extraction** | A module with a clearly different scaling, security or release profile, and a team to own it | AI/agent workloads are the likely first |
| **GraphQL / BFF** | Many heterogeneous clients with divergent data needs | A portal or mobile app with complex screens |
| **Message broker, event sourcing, CQRS** | Not foreseeable from the current roadmap | — |
