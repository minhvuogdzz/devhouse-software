# Part K — Architectural Decision Records (§48)

[← Index](README.md)

## 48. ADRs

Initial decision set. When implementation starts, split each into its own file under `docs/adr/` (`0001-monorepo.md`, …). New significant decisions add a record; a reversed decision gets a new record that supersedes the old one.

Status of all records: **Proposed** until the team signs off.

---

### ADR-001 — Monorepo vs multi-repo

| | |
|---|---|
| **Decision** | One GitLab repository using Yarn workspaces: `apps/web`, `apps/admin`, `apps/api`, `packages/shared`, `packages/content`, `packages/config`. |
| **Alternatives** | (a) One repository per app plus a private package registry for shared code. (b) Monorepo with Nx or Turborepo. |
| **Reasoning** | The three apps are one product released together by one team. Contract changes (a new field on a service) touch the API, the admin form and the public template; in a monorepo that is one reviewed, atomic merge request. Shared packages are consumed as source with no publish/version step. |
| **Trade-offs** | A single pipeline must avoid rebuilding everything on every change (solved with `rules: changes`). Repository access is all-or-nothing. Build context for Docker is the repository root. |
| **Consequences** | Import-boundary lint rules are needed to keep packages independent of apps. A task orchestrator can be added later without restructuring if CI time grows. |

### ADR-002 — React SPA vs SSR/SSG-capable architecture

| | |
|---|---|
| **Decision** | The public site (`apps/web`) uses **React Router framework mode with server-side rendering**, built by Vite. The admin (`apps/admin`) is a client-rendered Vite SPA. |
| **Alternatives** | (a) Client-rendered SPA with a head manager. (b) SPA plus server-side meta injection. (c) SPA plus bot-targeted prerendering. (d) Build-time static generation. (e) A different framework (Next.js, Astro). |
| **Reasoning** | The site's purpose is discovery and credibility. A client-rendered SPA serves an empty document to social crawlers and most AI crawlers, delays indexing, cannot return real 404/301 responses and has a slower LCP. SSR fixes all four. React Router's framework mode is a Vite plugin, so the requested stack (Vite, React, JavaScript, Tailwind, React Router, TanStack Query) is preserved; only the rendering mode changes. Static generation was rejected as the primary mode because content is published from Admin at any time. |
| **Trade-offs** | `web` becomes a Node process to run and monitor. Components must be hydration-safe. The team learns loaders and server/client boundaries. Slightly higher memory use on the VPS. |
| **Consequences** | An edge micro-cache is added so SSR cost is paid at most once per page per minute and the site survives upstream restarts. The admin stays simple. If the team declines SSR, the fallback is alternative (b), with the limits documented in §20.2; no other part of the architecture changes. Selected static pages can still be prerendered later through the same framework option. |

### ADR-003 — REST vs GraphQL

| | |
|---|---|
| **Decision** | REST, JSON, versioned under `/api/v1`, with a public namespace and an `/admin` namespace. |
| **Alternatives** | (a) GraphQL. (b) RPC-style typed procedures. |
| **Reasoning** | There are two first-party clients with well-known, stable data needs. REST endpoints map directly to HTTP caching (critical for the public site), to Nginx routing and rate limiting, and to per-route permission checks. GraphQL's benefits (client-shaped queries across many clients) do not apply, while its costs (query complexity limits, harder HTTP caching, per-field authorisation) do. |
| **Trade-offs** | Some pages need several requests (run in parallel on the server). Response shapes are fixed per endpoint, so new needs sometimes mean a new field or endpoint. |
| **Consequences** | Purpose-built list and detail DTOs. OpenAPI generated from Zod schemas. If a future portal or mobile app has divergent needs, a BFF or GraphQL layer can be added in front of the same services. |

### ADR-004 — Authentication: JWT vs cookie/session

| | |
|---|---|
| **Decision** | Opaque, server-side sessions. A random 256-bit token in a host-only `HttpOnly; Secure; SameSite=Strict` cookie; only its SHA-256 hash is stored in the `sessions` collection with a TTL index. |
| **Alternatives** | (a) JWT in browser storage with an Authorization header. (b) Short-lived JWT access token plus rotating refresh token in HttpOnly cookies. |
| **Reasoning** | The only authenticated client is a first-party browser admin on its own host. Sessions provide immediate revocation (logout, role change, disable user), no signing keys to protect or rotate, and no refresh-rotation concurrency problems. The per-request lookup is one indexed read, cached for 30 seconds. (a) exposes tokens to any injected script. (b) works but adds complexity whose benefit (stateless verification across services) is not needed. |
| **Trade-offs** | A database dependency for authentication (mitigated by the short cache). Not directly usable by non-browser clients. |
| **Consequences** | CSRF defence is required and is provided by SameSite=Strict, an origin check and JSON-only bodies. `JWT_*` secrets are not needed. The `authenticate` middleware is an interface: a token strategy for mobile, portal or public API clients can be added later without touching RBAC or modules. |

### ADR-005 — Cloudinary upload architecture

| | |
|---|---|
| **Decision** | **Signed direct upload** for authenticated admin uploads: the API signs server-chosen parameters, the browser uploads to Cloudinary, the API verifies the result and stores metadata. **Backend proxy upload** for anonymous contact attachments, stored as private assets. |
| **Alternatives** | (a) Unsigned upload presets. (b) Proxy every upload through the API. (c) Store files on the VPS. |
| **Reasoning** | Signed direct upload keeps large files off the VPS and never exposes the API secret; the signature fixes folder, public id and allowed formats. Unsigned presets let anyone upload to the account. Anonymous visitors must never receive an upload capability, and their files need server-side inspection, so those go through the API with strict limits. VPS storage would break statelessness. |
| **Trade-offs** | Two upload paths to maintain. Direct upload needs a verification step and a reconcile job for orphans. Proxy upload consumes API memory and bandwidth for attachments. |
| **Consequences** | A `media` collection as the registry; `ImageRef` snapshots in content filled by the API; a media-path registry for usage checks and replace; a fixed transformation ladder and optional Strict Transformations to control cost. |

### ADR-006 — Default content strategy

| | |
|---|---|
| **Decision** | Defaults live in code (`@devhouse/content`). The database stores **sparse overrides** only. One `resolveContent(defaults, overrides)` function produces final content, used by the API (authoritative), the web fallback and the admin. Collections are seeded from the same default catalog. |
| **Alternatives** | (a) Seed full content into the database and read only from it. (b) Fallback logic in each component (`data?.title ?? 'Default'`). (c) Defaults in JSON files edited by admins. |
| **Reasoning** | (a) leaves the site blank or broken when the database is empty or unreachable, and freezes defaults at seed time. (b) scatters and duplicates fallback logic. Sparse overrides make the empty-database case trivially correct, let improved defaults propagate to untouched fields, and make "reset to default" a key deletion. |
| **Trade-offs** | Content shape is defined in code, so adding a field is a deployment. `Mixed` fields in MongoDB rely on Zod for validation rather than Mongoose. Arrays are replaced whole, not merged. |
| **Consequences** | A content model registry (field descriptors) from which schema, admin form and defaults derive. Tests assert that defaults satisfy their schemas and that every public route renders with an empty database. The same resolver later serves locale fallback. |

### ADR-007 — MongoDB embedding vs references

| | |
|---|---|
| **Decision** | Embed data that is owned, bounded and read with its parent (features, FAQs, SEO, menu items, client info, image snapshots). Reference shared, independently managed entities (technologies, services, categories, tags, authors, roles). Derive reverse relationships by query instead of storing both sides. Merge the four category collections into one with a `type` field. Keep permissions in code and SEO embedded. |
| **Alternatives** | (a) Fully normalised, relational-style collections. (b) Fully denormalised documents. (c) Bidirectional reference arrays. |
| **Reasoning** | The read path dominates and should need few queries; owned sub-documents make detail pages one read plus a small number of `$in` lookups. Shared entities change independently and must not be duplicated. Bidirectional arrays drift. A separate `seo_metadata` or `permissions` collection would add joins and orphan risks with no benefit. |
| **Trade-offs** | Image snapshots are denormalised and must be refreshed on media replace. Derived relationships cost a query (indexed and cached). One compound index cannot cover two array fields. |
| **Consequences** | A media-path registry; multikey indexes on reference arrays; in-use guards before deleting referenced documents; 19 collections in total. |

### ADR-008 — Modular monolith vs microservices

| | |
|---|---|
| **Decision** | A modular monolith: one Express API composed of feature modules with enforced boundaries, deployed as one container. |
| **Alternatives** | (a) Microservices per domain. (b) An unstructured monolith. (c) Serverless functions. |
| **Reasoning** | Load, team size and domain do not require independent scaling or deployment. A monolith gives in-process calls, one transaction scope, one pipeline and simple local development. Module boundaries (private models, service-to-service calls, lint rules) retain the option to extract later. |
| **Trade-offs** | One deployable means one failure domain and one release cadence. Discipline is needed to keep boundaries from eroding. |
| **Consequences** | Lint rules for module boundaries; a "how to add a module" guide; extraction criteria documented in §47.2. |

### ADR-009 — GitLab-only vs GitHub + GitLab

| | |
|---|---|
| **Decision** | GitLab is the single source of truth for code, merge requests, CI/CD and the container registry. Trunk-based flow: short-lived branches into `main`; `main` deploys to staging; a protected tag promotes the same images to production. A GitHub mirror is optional and read-only. |
| **Alternatives** | (a) GitHub primary with GitLab mirror. (b) Both active. (c) `feature → develop → main` on GitLab. |
| **Reasoning** | One platform means one permission model, one pipeline and one audit trail. A second active remote invites divergence. A `develop` branch adds merges and usually a production rebuild without improving quality at this team size; staging already provides the pre-production gate. |
| **Trade-offs** | No GitHub-native ecosystem features. Trunk-based flow needs feature flags for unfinished work and a reliably green `main`. |
| **Consequences** | Protected `main` and release tags; protected `production` environment; feature flags in site settings. If the team prefers `develop`, map `develop → staging`, `main → production`; nothing else changes. |

### ADR-010 — Docker deployment

| | |
|---|---|
| **Decision** | Four containers (`edge`, `web`, `admin`, `api`) run with Docker Compose on a single VPS. Images are built in CI, tagged by commit SHA, stored in the GitLab Container Registry and pulled by the host. MongoDB stays on Atlas. |
| **Alternatives** | (a) Process manager on the host without containers. (b) Kubernetes or a managed container platform. (c) Platform-as-a-service. |
| **Reasoning** | Containers give reproducible, immutable artefacts and trivial rollback (run the previous tag). Compose is sufficient for one host and is understood by most developers. Kubernetes adds an operational burden with no payoff at one node. The brief requires a VPS. |
| **Trade-offs** | Single host is a single point of failure. In-place container replacement causes seconds of unavailability, masked by the edge cache. The deploy user's Docker access is powerful and must be constrained. |
| **Consequences** | Stateless containers, health checks and graceful shutdown are mandatory. A forced-command SSH key limits the CI deploy path. The same images run unchanged on a larger setup later. |

### ADR-011 — Separate Admin app vs same app

| | |
|---|---|
| **Decision** | Admin is a separate application (`apps/admin`) with its own build, image and host. |
| **Alternatives** | (a) Admin routes inside the public app. (b) An off-the-shelf admin framework generating screens from the API. |
| **Reasoning** | The two apps have opposite needs: the public site must be small, server-rendered and cacheable; the admin is large, interactive, authenticated and never indexed. Separation keeps the editor, tables and form libraries out of the public bundle, lets each deploy and roll back independently, and gives the admin its own origin and security policy. |
| **Trade-offs** | Two frontends to maintain; some component duplication (accepted; design tokens are shared). |
| **Consequences** | Shared contracts and content packages; identical data-access conventions in both apps; a shared UI package only if real duplication appears. |

### ADR-012 — Admin subdomain vs `/admin`

| | |
|---|---|
| **Decision** | `admin.devhouse.example` on its own host. The API is exposed **same-origin on each host** under `/api/v1`; on the public host the `/api/v1/admin` and `/api/v1/auth` paths are not routed. `api.` is reserved for future external clients. |
| **Alternatives** | (a) `www.devhouse.example/admin` and `/api` on one host. (b) Three hosts including `api.` used by both frontends. |
| **Reasoning** | **Security:** a separate origin means an XSS on the marketing site cannot act in the admin's origin, and the session cookie can be host-only and `SameSite=Strict`. The admin host can be IP-restricted independently. **CORS:** same-origin API calls need none, removing preflights and a common misconfiguration. **Cookies:** no domain-wide or `SameSite=None` cookies. **Deployment:** no API URL is compiled into bundles, so one image serves every environment. **SEO:** the admin host is wholly `noindex`; no path exclusions on the public site. **Maintainability / DX:** local development proxies `/api` exactly as production does. |
| **Trade-offs** | Two DNS names and certificates. The API is reachable through two hosts (by design, with different exposure). |
| **Consequences** | Nginx routing table in §33.2; origin-check middleware with `WEB_URL` and `ADMIN_URL`; no CORS middleware in MVP. |

### ADR-013 — TanStack Query vs custom data fetching

| | |
|---|---|
| **Decision** | TanStack Query in both frontends, fed by query-option factories defined per feature. In `web`, route loaders prefetch into a per-request QueryClient and the cache is dehydrated into the HTML. |
| **Alternatives** | (a) Hand-written `useEffect` + `fetch` hooks. (b) Router loaders only. (c) A global store holding server data. |
| **Reasoning** | Server state needs caching, deduplication, background refresh, retries, pagination helpers and mutation invalidation; hand-written hooks reimplement these poorly. Loaders alone lack a cache and a mutation model, which the admin needs. Using one pattern in both apps reduces what developers must learn. |
| **Trade-offs** | A dependency (~13 kB gzip). SSR requires careful per-request client creation and hydration. |
| **Consequences** | `fetch` is called in exactly one file per app. Query keys are centralised in factories. No global client store is introduced. |

### ADR-014 — SEO strategy

| | |
|---|---|
| **Decision** | Server-rendered HTML for every public URL; metadata built by one helper with a fixed precedence (entity → derived → page → site defaults → code defaults); JSON-LD from typed builders; dynamic `sitemap.xml` and environment-aware `robots.txt`; a `redirects` collection with automatic entries on slug change; real 404 responses; canonical host and URL normalisation at the edge. |
| **Alternatives** | (a) Client-side metadata only. (b) A separate `seo_metadata` collection. (c) Manually maintained sitemap and redirects. |
| **Reasoning** | Metadata must be in the initial HTML to be seen by all crawlers. Embedding `seo` in each entity keeps it with its content and avoids joins. Automated redirects and sitemap prevent the usual decay as content changes. |
| **Trade-offs** | Editors can leave SEO fields empty; derived values are then used (acceptable, and reported in a Phase 2 overview). Short edge caching means metadata changes appear within about a minute, not instantly. |
| **Consequences** | `Seo` sub-schema on all content entities; SEO tab in every admin form; staging hard-blocked from indexing at the edge; Search Console set up at launch. |

### ADR-015 — Caching strategy

| | |
|---|---|
| **Decision** | Layered caching without new infrastructure: immutable hashed assets; Cloudinary CDN for images; Nginx micro-cache (60 s, stale-while-revalidate, stale-if-error) for public HTML and public API GETs; an in-process LRU in the API invalidated by tag on every write; TanStack Query in the browser. No Redis in MVP. |
| **Alternatives** | (a) Redis for all caching. (b) No server-side caching. (c) Long TTLs with explicit purge. |
| **Reasoning** | With one API replica, an in-process cache is both sufficient and exactly invalidated. A short edge TTL removes the need for purge logic while absorbing spikes and masking restarts. Redis would add a service to run, monitor and secure for no measurable gain today. |
| **Trade-offs** | Published changes take up to about 60 seconds to appear publicly. In-process cache is per-replica and lost on restart. Nginx cache keys need bounded query strings. |
| **Consequences** | Admin UI states the delay; preview bypasses the cache (Phase 2). The cache module exposes an interface so Redis can replace the store when a second replica is introduced. Admin and auth responses are always `no-store`. |

### ADR-016 — Two languages (Vietnamese, English) from the first release

| | |
|---|---|
| **Decision** | Vietnamese (default, unprefixed URLs) and English (`/en` prefix) are built into every page, API response and admin form from the start. Translatable fields are stored as localized maps `{ vi, en }`; services, solutions, projects and posts have a slug per language. A derived `locales` array records which languages a document is complete in. UI chrome uses per-app dictionaries. The URL alone selects the language; the header has a language switch. A page never mixes languages. |
| **Alternatives** | (a) Ship one language and add the second later. (b) One document per language. (c) Base document plus a `translations` overlay. (d) Language chosen by cookie or `Accept-Language`. (e) Translated route segments or per-language subdomains. |
| **Reasoning** | The product owner requires both languages on every feature (rule P2). With no existing data, symmetric localized maps are the simplest shape: repeater arrays keep one structure with localized text inside, relations and images are stored once, and adding a language adds a key. URL-selected language keeps every page cacheable per URL and gives crawlers distinct, linkable pages with `hreflang`. No cross-language fallback keeps pages linguistically clean and makes `hreflang` truthful. |
| **Trade-offs** | Every form, schema and DTO carries two languages, which adds work to each module. An item not yet translated is absent from the English site rather than shown in Vietnamese. Default content must be written twice. One text index must cover both languages' fields. |
| **Consequences** | `LOCALES` constant in `@devhouse/shared`; `localized` Mongoose plugin; `?locale=` on public endpoints and `alternates` in detail responses; `localePath()` for every internal link; dictionary key-parity test; admin completeness indicators. Supersedes the "single locale in MVP" position of revision 1.0. |

### ADR-017 — Light and dark themes

| | |
|---|---|
| **Decision** | Both apps ship light and dark themes on every screen. Colours are semantic CSS-variable tokens in the shared Tailwind theme, switched by `data-theme` on `<html>`. Preference is `system` (default), `light` or `dark`, stored in `localStorage`, applied before first paint by a small nonce-protected inline script. A theme switch sits in the header. |
| **Alternatives** | (a) Light only. (b) `dark:` utility variants written on every element. (c) Theme stored in a cookie and rendered by the server. (d) Follow the system setting only, with no switch. |
| **Reasoning** | The product owner requires both themes everywhere (rule P1). Semantic tokens make a component correct in both themes by construction, whereas per-element `dark:` variants are easy to forget and double the styling surface. A server-rendered cookie theme would make HTML differ per visitor and defeat the per-URL edge cache; the inline script works with identical cached HTML. |
| **Trade-offs** | A small inline script in the document head (covered by the CSP nonce). Designers and developers must think in semantic tokens and verify contrast twice. Logos and code highlighting need two variants. |
| **Consequences** | Lint rule against raw palette utilities in feature code; `company.logoDark` in settings; contrast, visual and accessibility checks run in both themes. |
