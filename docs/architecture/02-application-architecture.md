# Part B — Application Architecture (§9–§15)

[← Index](README.md)

---

## 9. Frontend Architecture

Two applications with the same conventions and different rendering models. Diagram: [§43.2](09-diagrams.md#432-frontend-architecture).

| | `apps/web` | `apps/admin` |
|---|---|---|
| Rendering | Server-rendered, then hydrated | Client-rendered SPA |
| React Router mode | Framework mode (Vite plugin, `ssr: true`) | Data router (`createBrowserRouter`) |
| Runtime | Node container | Static files behind Nginx |
| Data | Loaders prefetch into TanStack Query; components read the cache | TanStack Query queries and mutations |
| Priority | SEO, Core Web Vitals, small JS | Productivity, forms, tables, permissions |

### 9.1 Component taxonomy (both apps)

| Level | Example | Rule |
|---|---|---|
| **UI primitives** `components/ui` | `Button`, `Input`, `Dialog`, `Badge`, `Skeleton` | No data fetching, no business terms. Styled with Tailwind, accessible by construction. |
| **Composed components** `components/*` | `Image` (Cloudinary-aware), `RichText`, `Pagination`, `Breadcrumbs`, `Seo` | Reusable across features. May read props only. |
| **Sections** `components/sections` (web) | `Hero`, `ServiceGrid`, `ProcessSteps`, `CtaBanner`, `FaqList` | Receive already-resolved content as props. Never fetch. Reused across pages. |
| **Feature modules** `features/<name>` | `features/projects` | Own their API functions, query options, feature-specific components and page templates. |
| **Page templates** | `ServiceDetailTemplate`, `ProjectDetailTemplate` | Compose sections from one entity. Render a section only when its data exists. |
| **Route modules** `routes/` | `services.$slug.jsx` | Thin: `loader`, `meta`, error boundary, and one template. No markup of their own beyond composition. |
| **Layouts** | `SiteLayout`, `AdminShell` | Header, footer, navigation, skip link, outlet. |

### 9.2 Data-access architecture

No component calls `fetch`. There is exactly one path from UI to network:

```
component / loader
   └─ query options factory      features/<name>/api/<name>.queries.js
        └─ API function          features/<name>/api/<name>.api.js
             └─ API client       lib/api-client.js   (the only file that calls fetch)
```

- **API client** (`lib/api-client.js`): sets the base URL (`/api/v1` in the browser, `API_INTERNAL_URL` on the server), sends credentials, attaches `X-Request-Id`, parses the response envelope, and throws a typed `ApiError { status, code, message, details, requestId }`. Around 60 lines; no Axios.
- **API functions**: one per endpoint, e.g. `getService(slug)`, `listProjects(params)`. Plain functions returning `data`.
- **Query option factories**: the centralised query management the brief asks for.

```js
// features/services/api/services.queries.js  (concept)
export const serviceQueries = {
  all:    () => ['services'],
  list:   (params) => queryOptions({ queryKey: ['services', 'list', params], queryFn: () => listServices(params) }),
  detail: (slug)   => queryOptions({ queryKey: ['services', 'detail', slug],  queryFn: () => getService(slug) }),
};
```

- **Web loaders** call `queryClient.ensureQueryData(serviceQueries.detail(slug))`, the dehydrated cache is sent with the HTML, and components call `useSuspenseQuery(serviceQueries.detail(slug))`. One definition serves SSR, hydration and client navigation. A `QueryClient` is created **per request** on the server so data never leaks between visitors.
- **Admin mutations** live beside queries (`useUpdateService`) and invalidate by key prefix (`serviceQueries.all()`).

**Why TanStack Query and not loaders alone:** loader-only data refetches on every navigation and has no mutation/invalidation model. The admin needs both; using the same pattern in the web app gives instant back/forward navigation and one mental model. (ADR-013)

### 9.3 State management

| Kind of state | Where it lives |
|---|---|
| Server data | TanStack Query cache |
| Filters, search, page, sort | URL search params (shareable, crawlable, back-button safe) |
| Form state | react-hook-form |
| Session / current user / permissions (admin) | One `auth` query (`GET /auth/me`) exposed through `useAuth()` and `usePermission()` |
| Ephemeral UI (open menus, dialogs) | Local component state |
| Global client store | None. Add one only if a concrete cross-cutting client state appears. |

### 9.4 `apps/web` structure

```
apps/web/
├── app/
│   ├── root.jsx                 # html shell, providers, site bootstrap loader, root error boundary
│   ├── routes.js                # route config (single small file; each entry points to a route module)
│   ├── entry.client.jsx / entry.server.jsx
│   ├── routes/                  # thin route modules: loader + meta + template
│   ├── features/
│   │   ├── home/  services/  solutions/  projects/  technologies/  blog/  careers/  contact/  legal/
│   │   │   ├── api/             # *.api.js, *.queries.js
│   │   │   ├── components/      # feature-specific pieces
│   │   │   └── templates/       # page templates
│   ├── components/
│   │   ├── ui/  layout/  sections/  media/  rich-text/  seo/  feedback/
│   ├── lib/                     # api-client, query-client, seo, cloudinary, analytics, i18n (t, localePath), theme
│   ├── locales/                 # vi.js, en.js (UI chrome strings)
│   ├── hooks/
│   └── styles/                  # tailwind entry, imports shared theme
├── public/                      # favicon and brand assets only (no stock or placeholder images)
├── server.js                    # small Express host: request id, logging, CSP nonce, /healthz
├── react-router.config.js       # ssr: true
├── vite.config.js
└── Dockerfile
```

### 9.5 `apps/admin` structure

```
apps/admin/
├── src/
│   ├── app/                     # providers, router assembly, AdminShell, auth + permission guards
│   ├── features/
│   │   ├── auth/ dashboard/ pages/ settings/ navigation/ services/ solutions/ projects/
│   │   ├── technologies/ categories/ blog/ media/ contact-requests/ redirects/ users/ roles/ audit-logs/
│   │   │   ├── api/             # queries + mutations
│   │   │   ├── components/      # forms, tables, pickers
│   │   │   ├── pages/           # list, create, edit
│   │   │   ├── routes.js        # this module's routes (lazy) + required permission per route
│   │   │   └── nav.js           # this module's sidebar entry + required permission
│   ├── components/              # ui/, form/ (field components), data-table/, media-picker/, rich-text-editor/
│   ├── lib/                     # api-client, query-client, permissions
│   ├── hooks/
│   └── styles/
├── nginx.conf                   # SPA fallback, cache headers, /healthz
├── vite.config.js
└── Dockerfile
```

Each feature exports its own `routes.js` and `nav.js`; `app/router.jsx` only concatenates them. Adding a module never edits a shared giant file, which keeps merge conflicts rare.

### 9.6 Loading, empty and error states

| Situation | Web | Admin |
|---|---|---|
| Initial load | HTML arrives rendered; no spinner | Route-level `Suspense` skeleton matching the page shape |
| Client navigation | Pending UI on the link + top progress bar; previous page stays visible | Same |
| Empty collection | Designed empty state, or section omitted (home) | Empty state with a primary "Create" action if permitted |
| 404 entity | Loader throws a 404 response → `NotFound` page with **HTTP 404** | "Not found" panel |
| API/network error | Route error boundary with retry; content pages fall back to defaults (§13) | Inline error with retry and the request ID for support |
| 401 | n/a | Global handler → redirect to `/login?next=…` |
| 403 | n/a | "No access" page; the action button was already hidden by `usePermission` |
| Validation error (422) | Field-level messages mapped from `error.details` | Same |
| Render error | Root + per-route error boundaries; reported to the error tracker | Same |

Retry policy: queries retry twice with backoff on network errors and 5xx only; never on 4xx. Mutations do not retry automatically.

### 9.7 Styling

- Tailwind 4 with a shared theme file (`packages/config/tailwind/theme.css`) defining colour, typography, spacing and radius tokens as CSS variables. Both apps import it; each may extend it.
- Class composition through a single `cn()` helper. Component variants via a small variants helper where a component has more than two visual states.
- No arbitrary one-off colours or font sizes in feature code; tokens only. This is what keeps the two apps visually coherent without a shared UI package.

### 9.8 Theming: light and dark (project rule P1)

Every screen in both apps ships in both themes. (ADR-017)

| Aspect | Design |
|---|---|
| Tokens | Semantic CSS variables in the shared theme: `bg`, `surface`, `surface-raised`, `fg`, `fg-muted`, `border`, `primary`, `primary-fg`, `accent`, `success`, `warning`, `danger`, `ring`. Light values by default, dark values under `[data-theme="dark"]`. |
| Usage rule | Components use semantic utilities only (`bg-surface`, `text-fg`, `border-border`). Raw palette classes (`bg-white`, `text-gray-900`) are not allowed in feature code. The `dark:` variant is an exception for rare cases, not the method. Lint rule forbids raw colour utilities outside the theme file. |
| State | `data-theme="light\|dark"` on `<html>`. Preference is three-way: `system` (default, follows `prefers-color-scheme`), `light`, `dark`. Stored in `localStorage` (`dh-theme`). |
| No flash | A tiny inline script in `<head>` (with the CSP nonce) sets `data-theme` before first paint. A cookie is **not** used: public HTML is edge-cached per URL and must be identical for every visitor. |
| Switch | A button in the header of both apps, keyboard operable, with an accessible name and current state. |
| Browser integration | `color-scheme` set per theme so native controls and scrollbars match; two `<meta name="theme-color">` values. |
| Assets | Logo has light and dark variants (`company.logo`, `company.logoDark`); icons use `currentColor`; code highlighting has a palette per theme; content images are never filtered or inverted. |
| Verification | Contrast meets AA in both themes; visual and accessibility checks run in both. |

### 9.9 UI language (project rule P2)

No user-visible string is written in a component. UI chrome comes from per-app dictionaries (`locales/vi.js`, `locales/en.js`) through `t('key')`; content comes localized from the API. A language switch sits in the header of both apps. Full design in §30.

---

## 10. Backend Architecture

Diagram: [§43.3](09-diagrams.md#433-backend-request-flow).

### 10.1 Layering

The brief's order places validation after the controller. Validation should run **before** the controller, as middleware, so controllers only ever see parsed, typed input.

```
HTTP request
  → global middleware     request id · logger · helmet · body limits · origin check · rate limit
  → router                modules/<name>/<name>.routes.js
  → authenticate          session cookie → req.auth { user, permissions, sessionId }   (admin + auth routes)
  → authorize             requirePermission('services:update')
  → validate              Zod: params, query, body → req.valid
  → controller            HTTP only: read req.valid, call service, shape the response envelope
  → service               business rules, orchestration, transactions, audit, cache invalidation
  → repository            all Mongoose access for one aggregate; query building; lean reads
  → Mongoose model        schema, indexes, plugins
  → MongoDB Atlas
  → DTO mapper            entity → public or admin representation
  → error middleware      any thrown error → standard error envelope
```

| Layer | May | Must not |
|---|---|---|
| Route | Declare path, middleware chain, controller | Contain logic |
| Controller | Translate HTTP ↔ service call | Touch Mongoose, contain business rules |
| Service | Enforce rules, call repositories and **other modules' services**, emit audit events | Read `req`/`res`, build Mongo queries inline |
| Repository | Build queries, apply soft-delete/publish scopes, paginate | Decide permissions or business outcomes |
| Model | Define schema, indexes, plugins | Contain workflow logic or call services |

**Is the repository layer worth it over calling Mongoose from services?** Yes, kept thin. It centralises three things that otherwise get copy-pasted and forgotten: the soft-delete scope, the published scope (`status` + `publishedAt <= now`), and the list/pagination builder. A `createRepository(model, options)` factory supplies the common methods; a module adds custom queries only when needed.

### 10.2 Folder structure

```
apps/api/
├── src/
│   ├── server.js                # process bootstrap, graceful shutdown
│   ├── app.js                   # express app assembly (no listen) — importable by tests
│   ├── config/                  # env parsing with Zod; fails fast on invalid config
│   ├── core/
│   │   ├── http/                # response helpers, async wrapper, envelope
│   │   ├── errors/              # AppError classes, error middleware, error-code mapping
│   │   ├── middleware/          # request-id, authenticate, authorize, validate, rate-limit, origin-check, cache-control
│   │   ├── db/                  # connection, plugins (softDelete, publishable, auditable, sluggable), base repository
│   │   ├── query/               # list-query parser → { filter, sort, skip, limit }
│   │   ├── cache/               # lru wrapper + tag invalidation
│   │   ├── context/             # AsyncLocalStorage request context (requestId, actor)
│   │   ├── audit/               # audit.record()
│   │   └── logger/
│   ├── modules/
│   │   ├── auth/ users/ roles/
│   │   ├── content/             # pages (sparse overrides + resolver)
│   │   ├── settings/ navigation/
│   │   ├── services/ solutions/ projects/ technologies/ categories/
│   │   ├── blog/                # posts, tags, authors
│   │   ├── media/ contact/ seo/ # seo = sitemap + redirects
│   │   ├── audit-logs/ dashboard/ health/
│   │   │   ├── <name>.routes.js        # public routes
│   │   │   ├── <name>.admin.routes.js  # admin routes
│   │   │   ├── <name>.controller.js
│   │   │   ├── <name>.service.js
│   │   │   ├── <name>.repository.js
│   │   │   ├── <name>.model.js
│   │   │   ├── <name>.dto.js
│   │   │   └── <name>.test.js
│   ├── integrations/            # cloudinary, mail, captcha — each behind a small interface
│   └── routes.js                # mounts module routers under /api/v1 and /api/v1/admin
├── migrations/                  # migrate-mongo
├── seeds/                       # idempotent seeders using @devhouse/content
├── scripts/                     # create-admin, sync-indexes
└── Dockerfile
```

Request schemas live in `@devhouse/shared` (so the admin can reuse them); a module imports them rather than redefining.

### 10.3 Module rules

- A module's model is private. Another module needing its data calls its **service**.
- Cross-module writes that must be atomic use a MongoDB transaction started in the calling service (Atlas clusters are replica sets, so transactions are available). Used sparingly: role deletion, media replace.
- Integrations are injected into services (`mailer`, `mediaProvider`) so tests can substitute fakes.
- Each module declares its **media paths** and **reference paths** in a small registry used by the media-usage check and by cascade guards (e.g. "cannot delete a category in use").

### 10.4 Cross-cutting concerns

| Concern | Mechanism |
|---|---|
| Configuration | `config/` parses `process.env` through a Zod schema at boot. Missing or malformed variables stop the process with a clear message. |
| Request context | `AsyncLocalStorage` carries `requestId`, actor and IP so logging and audit need no parameter threading. |
| Errors | Typed `AppError` subclasses → one error middleware → standard envelope (§19.4). |
| Caching | `core/cache` with tags; services call `cache.invalidate('services')` after writes (§25). |
| Audit | Services call `audit.record({ action, resource, changes })` after successful writes (§27.4). |
| Background work | No queue. Email notifications are dispatched after the response with their status stored on the document and retried by a small in-process interval (§14.7). |
| Graceful shutdown | On `SIGTERM`: stop accepting connections, finish in-flight requests, close Mongoose, exit. Required for clean deploys. |

---

## 11. Database Architecture

Relationship diagram: [§43.4](09-diagrams.md#434-database-architecture). Field-level schemas: [§39](06-database-schema.md).

### 11.1 Collection decisions

| Proposed in brief | Decision | Reasoning |
|---|---|---|
| `users` | **Collection** | |
| `roles` | **Collection** | Roles are data: admins create and edit them. |
| `permissions` | **No collection — code constant** | A permission exists only if code checks it. Storing them invites orphans. The catalog is served read-only to the role editor. |
| `site_settings` | **Collection, single document** | Stores sparse overrides only. |
| `pages` | **Collection, one document per page key** | Sparse section overrides + SEO. |
| `navigation` | **Collection `navigation_menus`, one document per menu** | Items embedded: small, bounded, always read together. |
| `services`, `solutions`, `projects`, `technologies` | **Collections** | Independently listed, filtered and linked. |
| `service_categories`, `project_categories`, `technology_categories`, `blog_categories` | **One `categories` collection with `type`** | Identical schema. Unique on `{type, slug}`. |
| `blog_posts` | **Collection** | |
| `tags` | **Collection** | Needed for tag pages, renaming and counts. |
| *(authors)* | **Collection `authors`** (added) | Public author profiles must not expose admin user records; guest authors need no login. Optional link to a user. |
| `media` | **Collection** | Metadata registry for Cloudinary assets. |
| `contact_requests` | **Collection** | |
| `seo_metadata` | **No collection — embedded `seo` sub-document** | Always read and written with its parent. Global defaults live in settings. |
| `audit_logs` | **Collection, append-only** | |
| *(sessions)* | **Collection `sessions`** (added) | Server-side sessions with a TTL index. |
| *(auth tokens)* | **Collection `auth_tokens`** (added) | Password-reset and invite tokens, hashed, TTL index. |
| *(redirects)* | **Collection `redirects`** (added) | Needed for the redirect strategy when slugs change. |

Result: **19 collections.**

### 11.2 Embed vs reference

Rule: **embed what is owned, bounded and read together; reference what is shared, independently managed or unbounded.** (ADR-007)

| Relationship | Choice | Why |
|---|---|---|
| Service → features, benefits, process steps, FAQs, CTA, SEO | Embed | Owned by the service, small, never queried alone |
| Service → technologies | Reference (array of ids) | Technologies are a shared catalog |
| Service → related projects | **Derived** (query `projects` where `services` contains the id) | Storing both sides creates drift |
| Technology → related services / projects | **Derived** by reverse query | Same; indexes on `services.technologies` and `projects.technologies` |
| Project → services, technologies, category | Reference | Shared |
| Project → client, features, results, gallery | Embed | Owned |
| Post → author, category, tags | Reference | Shared |
| Post → content | Embed (rich-text JSON) | Owned; a typical post is far below the 16 MB document limit |
| User → roles | Reference | Roles change independently |
| Role → permissions | Embed (array of strings) | Bounded list of code-defined keys |
| Menu → items | Embed (flat list with `parentId`) | Small; edited as a whole |
| Any content → image | **Embed an `ImageRef` snapshot** `{ mediaId, publicId, width, height, format, alt }` | Reads need no join; see §18.6 for how snapshots stay correct |
| Contact request → service | Reference + name snapshot | The request must stay readable if the service is later renamed or deleted |
| Audit log → actor, resource | Snapshot (ids + labels) | Logs must not change when the subject changes |

### 11.3 Cross-cutting schema behaviours (Mongoose plugins)

| Plugin | Fields | Applied to |
|---|---|---|
| `timestamps` | `createdAt`, `updatedAt` | Every collection |
| `auditable` | `createdBy`, `updatedBy` | All admin-managed content |
| `sluggable` | `slug` (lowercase, kebab-case, validated) + uniqueness. Per-locale (`slug.vi`, `slug.en`) on services, solutions, projects and posts; a single shared slug elsewhere. | services, solutions, projects, technologies, posts, tags, authors, categories |
| `localized` | Declares which paths are `{ vi, en }` maps; maintains the derived `locales` array (locales in which the document is complete) | All content with translatable text (§30.4) |
| `publishable` | `status: draft \| published \| archived`, `publishedAt` | services, solutions, projects, technologies, posts |
| `softDelete` | `isDeleted`, `deletedAt`, `deletedBy`; default query scope excludes deleted | services, solutions, projects, technologies, posts, media, users, contact requests |

Hard delete (with in-use guards): categories, tags, authors, roles, redirects, sessions, auth tokens. Audit logs are never deleted by the application (optional TTL).

**Slug uniqueness with soft delete:** a partial unique index `{ slug: 1 }` with `partialFilterExpression: { isDeleted: false }` lets a deleted item's slug be reused without colliding.

**Scheduled publishing without a scheduler:** "published" for the public means `status = 'published' AND publishedAt <= now`. Setting a future `publishedAt` schedules the item. No cron, no job runner; the item appears when the short caches roll over (≤ 60 s late).

### 11.4 Index strategy

- Every public list endpoint has a compound index matching its filter + sort (equality fields first, then sort field). Listed per collection in §39.
- Array references (`services`, `technologies`, `tags`) get multikey indexes. A compound index may contain only one array field, so combined array filters rely on index intersection or the more selective index; acceptable at this data size.
- One text index per searchable collection with field weights and `default_language: 'none'` (Vietnamese is not a supported stemming language; `none` gives plain tokenisation and remains diacritic-insensitive).
- Indexes are created by migrations / an explicit `sync-indexes` step during deploy. `autoIndex` is **off** in production so a deploy never triggers a surprise index build on boot.
- Review Atlas Performance Advisor monthly; no public endpoint may run a collection scan.

### 11.5 Operational notes

- Connection: one Mongoose connection per API process, pool size sized to the Atlas tier (start at 10), `serverSelectionTimeoutMS` ~5 s so failures surface quickly in health checks.
- Atlas network access: allow-list the VPS static IP only. Separate database users for production, staging and migration tooling, each with least privilege.
- Separate databases per environment (`devhouse_prod`, `devhouse_staging`); development uses a local container or a personal Atlas database, never staging/production.
- Backups: Atlas continuous/snapshot backups on the production tier; a restore drill before launch (§51).
- Reads use `.lean()` and explicit projections for list endpoints.

---

## 12. Content Architecture

### 12.1 The separation

| Controlled by developers (Git) | Controlled by Admin (database) |
|---|---|
| React components, layouts, section set | Text, headings, descriptions, CTAs |
| Which sections a page has and their component | Whether a section is visible; order of *items* within it |
| Routing, URL structure | Slugs of content items; redirects |
| Field definitions and validation | Field values |
| API behaviour, security, permissions catalog | Role composition, user assignments |
| Default content | Overrides of default content |
| Design tokens, styling | Images, alt text, SEO metadata, navigation, site settings |

Admin never stores HTML, CSS, component names or layout trees. The only "structural" inputs are whitelisted enums (e.g. an icon key, a CTA style) validated by schema.

### 12.2 Two kinds of content

| Kind | Examples | Storage | Empty-database behaviour |
|---|---|---|---|
| **Singletons** | Site settings, header/footer navigation, page content (home, about, contact, careers, privacy, terms, list-page intros) | One document holding **sparse overrides** | Defaults from code |
| **Collections** | Services, solutions, technologies, projects, posts, categories, tags, authors | One document per item | Seeded from the default catalog; honest empty states where no defaults make sense (projects, posts) |

### 12.3 Content model registry

Each page and section is declared once in `@devhouse/content`:

```js
// packages/content/pages/home/hero.js  (concept)
export const hero = defineSection({
  key: 'hero',
  label: 'Hero',
  fields: {
    eyebrow:    field.text({ max: 60 }),
    heading:    field.text({ max: 120, required: true }),
    subheading: field.textarea({ max: 300 }),
    image:      field.image(),
    primaryCta: field.link(),
    secondaryCta: field.link(),
  },
  defaults: {
    heading:    { vi: 'Phần mềm, AI và tự động hoá cho doanh nghiệp', en: 'Software, AI and automation built for real businesses' },
    subheading: { vi: '…', en: '…' },
    primaryCta: { label: { vi: 'Bắt đầu dự án', en: 'Start a project' }, url: '/contact' },
    // image: no default (rule P3). The section must look right without one.
  },
});
```

Text fields (`text`, `textarea`, `richText`, link labels) are **localized leaves**: a `{ vi, en }` map in both defaults and overrides. Images, booleans, selects and URLs are shared across languages. Defaults must provide every text in both languages; a unit test enforces it.

From that single declaration the system derives:

1. the **Zod schema** that validates admin overrides (all fields optional, unknown keys stripped);
2. the **admin form** (a generic `SectionForm` renders inputs from field descriptors, showing the default as placeholder with "reset to default");
3. the **defaults** used by the resolver, the seeder and the web fallback;
4. a unit test asserting the defaults satisfy the full schema.

Field types are deliberately few: `text`, `textarea`, `richText`, `image`, `link`, `boolean`, `select`, `list` (of a group), `group`. This is a content model, not a page builder.

Adding a section is a developer task: declare it, build its React component, register it on the page. It is then editable in Admin with no admin code written.

### 12.4 Page keys

`home`, `about`, `services-index`, `solutions-index`, `projects-index`, `technologies-index`, `blog-index`, `careers`, `contact`, `privacy`, `terms`, `not-found`. Each has `sections` and `seo`.

### 12.5 Rich text storage (decision)

Used for blog content, service/solution/project long descriptions, legal pages.

| Option | Security | Editing | Rendering / SEO | Migration | Verdict |
|---|---|---|---|---|---|
| Raw HTML | Requires sanitisation on every write and read; highest XSS risk | WYSIWYG friendly | Trivial | Hard to restructure | Rejected |
| Markdown | Safe only if raw HTML is disabled; still needs a sanitising renderer | Good for developers, weak for non-technical editors and media | Good | Very portable | Viable for a developer-only blog; rejected for mixed editors |
| Editor.js-style blocks | Safe (typed blocks) | Block-oriented, weaker inline formatting | Custom renderer | Proprietary shape | Viable |
| Portable Text | Safe | Needs a compatible editor; best inside the Sanity ecosystem | Custom renderer | Good | Rejected: no first-class standalone editor |
| **ProseMirror/TipTap JSON** | **Safe by construction: typed nodes and marks, rendered through a whitelist; no HTML stored** | **Mature headless editor, fits Tailwind, extensible (code blocks, callouts, media)** | **JSON → React on the server; full HTML in SSR output** | **Structured; exportable to Markdown/HTML** | **Chosen** |

Rules:

- Stored as `{ type: 'doc', content: [...] }` with a `contentVersion` so node schemas can evolve.
- The API validates the tree against a node/mark whitelist and validates every link `href` scheme (`http`, `https`, `mailto`, `tel` only).
- Images inside content are a custom node carrying an `ImageRef`, chosen through the media picker.
- The web app renders JSON → React with a small node-to-component map. `dangerouslySetInnerHTML` is not used anywhere.
- The API derives and stores `contentText` (plain text) for search, excerpts and reading time.
- Code blocks are highlighted during server rendering so no highlighter ships to the browser.

---

## 13. Default Content / Override Strategy

Diagram: [§43.5](09-diagrams.md#435-content-resolution-architecture). (ADR-006)

### 13.1 Mechanism

```
defaults (code, @devhouse/content)  +  overrides (database, sparse)
                     │
             resolveContent(defaults, overrides)
                     │
              resolved content  →  API response  →  React props
```

One function, used in exactly three places: the API (authoritative), the web app's fallback path, and the admin preview.

```js
// packages/content/resolve.js  (concept — the whole algorithm)
export function resolveContent(defaults, override) {
  if (override === undefined || override === null) return defaults;      // missing → default
  if (Array.isArray(defaults) || Array.isArray(override)) return override; // arrays replace as a whole
  if (isPlainObject(defaults) && isPlainObject(override)) {
    const out = {};
    for (const key of Object.keys(defaults)) out[key] = resolveContent(defaults[key], override[key]);
    return out;                                                           // unknown override keys are dropped
  }
  return override;                                                        // primitive override wins
}
```

### 13.2 Merge rules

| Case | Result |
|---|---|
| Field missing, `null` or `undefined` in DB | Default |
| Primitive present in DB | DB value |
| Object | Merged key by key, recursively |
| Array (e.g. process steps, "why us" reasons) | DB array replaces the default array entirely; never merged by index |
| Key in DB that no longer exists in the definition | Ignored (a removed field cannot break the page) |
| Required text set to empty | Rejected at write time by the schema; to hide something use the section's `visible` flag |
| Override has the wrong type (blocked by the schema on write, but defended anyway) | The API re-validates the resolved section; on failure that section falls back to its defaults and an error is logged |
| Whole document missing | Defaults |
| Database unreachable | API serves last cached resolved value; if none, defaults |
| API unreachable from web | Web resolves `defaults` locally with no overrides; response is sent `no-store` so recovery is immediate |

### 13.3 Why store sparse overrides, not a full copy

If the database held a full copy of each page, improving a default in code would have no effect on any site that had saved the page once. With sparse overrides, untouched fields track the code defaults, and "reset to default" is simply deleting a key.

### 13.4 Collections

A resolver does not apply to lists of documents. For them:

1. **Seed.** `seeds/` inserts the default catalog from `@devhouse/content/catalog` (services, solutions, technologies, categories, system roles). Seeding is idempotent: insert when the slug is absent, never update an existing document. It runs on every deploy.
2. **API fallback.** If a seedable collection is *entirely* empty (never populated), the public list and detail endpoints serve the default catalog and mark the response `meta.source = "defaults"`. Once any document exists, the database is authoritative, including when an admin intentionally unpublishes everything.
3. **Honest empty states.** Projects and blog posts have no fabricated defaults. The home page omits "Featured projects" when there are none; list pages show a designed empty state.

### 13.5 Placeholder data policy (project rule P3)

Default content exists so the site is never blank. It is not a demo dataset.

| Allowed | Not allowed |
|---|---|
| Short, real text for fixed pages and sections, in Vietnamese and English | Lorem ipsum or filler paragraphs |
| The default catalog of services, solutions and technologies the company actually offers, with a name and a one- or two-sentence description | Invented projects, case studies, clients, testimonials, team members, awards or statistics |
| Technology names shown as text badges until a real logo is uploaded | Stock photos, AI-generated or placeholder images, placeholder-image services, bundled sample galleries |
| Icons from the icon set, typography, colour and layout as the visual language | Fake blog posts, fake contact requests, fake users (only the first administrator is created) |
| The company logo and favicon once supplied; a text wordmark until then | A "demo seed" that fills the database for looks |

Consequences for implementation:

- **Every image field defaults to empty.** An image value is always an `ImageRef` chosen in Admin; default content never contains one. Each section and card has a designed no-image layout, so a missing image is a normal state, not an error.
- Seeds insert only the default catalog, categories and system roles. Tests create their own data through factories inside the test run and never write to a development or shared database.
- Empty collections (projects, posts) show a designed empty state or the section is omitted.

### 13.6 Localization of content

Singleton content and collections use the same localized-leaf shape (`{ vi, en }`). For singletons, `resolveContent` merges defaults and overrides leaf by leaf, then `localize(resolved, locale)` picks one language. Because defaults exist in both languages, an English page never falls back to Vietnamese text. Collections follow §30.4.

### 13.7 Guarantees and their tests

| Guarantee | Test |
|---|---|
| Every default satisfies its full schema | Unit test over the registry |
| Empty database renders every public route with HTTP 200 | Integration test with an empty in-memory MongoDB |
| API down still renders the home page | Web test with the API client mocked to fail |
| An override with unknown or malformed keys cannot break rendering | Resolver unit tests |

---

## 14. Public Website Architecture

Route table: [§41](08-route-and-admin-maps.md#41-route--page-map).

### 14.1 Rendering model

Every public route is rendered on the server by `web`, cached at the edge for a short time, and hydrated in the browser. Subsequent navigation is client-side, fetching JSON from `/api/v1`. Trade-offs are in ADR-002.

### 14.2 Site bootstrap

`root.jsx` loads `GET /api/v1/site` once per request: resolved public settings and both navigation menus. This single source feeds the header, footer, default SEO, JSON-LD Organization data and the analytics configuration. Header and footer are therefore driven by one data structure and one component each. The header always contains the **language switch** (VI / EN, linking to the same page in the other language, §30.2) and the **theme switch** (§9.8).

### 14.3 Home page

A code-defined ordered registry:

```
hero → intro → services → solutions → technologies → featuredProjects → whyDevHouse → process → aiAutomation → cta
```

- The loader fetches, in parallel over the internal network: `pages/home`, featured services, solutions, featured technologies, featured projects.
- Each entry maps a section key to a component. A section renders when `visible !== false` **and** its data is non-empty.
- Text comes from resolved page content; lists come from collections. Neither is hardcoded in the component.
- Section order is fixed in code for MVP. **[Optional, Phase 2]** an admin-editable order restricted to a whitelist of the existing keys.

### 14.4 Template-driven detail pages

`/services/:slug`, `/projects/:slug`, `/blog/:slug` (and `/solutions/:slug`, recommended) each use one template. The template lists the possible sections and renders each only when the entity has data for it. A new service is a database document; no React file is created.

### 14.5 List pages

Filters, search, sort and page live in the URL (`/projects?category=fintech&technology=react&page=2`). The loader parses them with the same Zod schema the API uses, so invalid parameters normalise instead of erroring. Paginated URLs are canonicalised (§20).

### 14.6 Errors and not-found

| Case | Behaviour |
|---|---|
| Unknown URL | Catch-all route → check `redirects` → 301 if matched, else `NotFound` page with **HTTP 404** and `noindex` |
| Unknown slug | Loader receives API 404 → same as above |
| `/404` | Explicit route rendering the same page (status 404), useful for linking and testing |
| API failure on a content page | Fallback to defaults where they exist; otherwise the route error boundary with HTTP 503 and `Retry-After` |
| Render exception | Root error boundary, HTTP 500, reported to the error tracker; no stack trace shown |

### 14.7 Contact flow

1. The form is built with react-hook-form and the shared `contact.create` schema; the service dropdown is populated from the services collection.
2. Submission posts from the browser directly to `/api/v1/contact` so the API sees the real client IP for rate limiting.
3. The API validates, runs the spam pipeline (honeypot, minimum fill time, link heuristics, optional CAPTCHA), stores the request, responds `201`, then dispatches the notification email asynchronously. Delivery status is recorded on the document and failed sends are retried.
4. The visitor sees a confirmation state. A conversion event is emitted through the analytics abstraction (§31).

Spam-flagged submissions are stored with `status: spam` and receive the same success response, giving bots no signal.

---

## 15. Admin CMS Architecture

Diagram: [§43.6](09-diagrams.md#436-admin-architecture). Module table: [§42](08-route-and-admin-maps.md#42-admin-module-map).

### 15.1 Shape

A separate SPA at `admin.devhouse.example` using the same API (ADR-011, ADR-012). It is excluded from indexing (`X-Robots-Tag: noindex`, `robots.txt` disallow) and can be IP-restricted or put behind a VPN at the edge without touching the public site **[Optional]**.

### 15.2 Shell and guards

```
<AuthGuard>            → requires a valid session (GET /auth/me), else /login
  <AdminShell>         → sidebar built from each module's nav.js, filtered by permission
    <PermissionGuard>  → per-route required permission, else 403 page
      <Module pages>
```

Permission checks in the UI hide what the user cannot do. They are convenience only; the API rejects the request regardless.

### 15.3 Standard module pattern

Almost every module is the same three screens, built from shared building blocks so a new module is mostly configuration:

| Screen | Building blocks |
|---|---|
| List | `DataTable` (server-side pagination, sort, search, filters synced to the URL), status badges, bulk actions, empty state |
| Create / Edit | `ResourceForm` on react-hook-form + shared Zod schema, field components (`TextField`, `SlugField`, `RichTextField`, `MediaField`, `ReferenceField`, `RepeaterField`, `SeoFields`), dirty-state guard, save / publish actions |
| Detail (where relevant) | Read view with history from audit logs |

Shared behaviours: optimistic concurrency (the form sends the `updatedAt` it loaded; the API returns `409 CONFLICT` if the document changed meanwhile), unsaved-changes prompt, toast feedback including the request ID on failure, confirm dialog for destructive actions.

### 15.4 Content editing

- **Pages:** the editor lists a page's sections from the content registry and renders `SectionForm` for each. Every field shows its default and an indicator when overridden.
- **Collections:** standard module pattern.
- **Ordering:** `sortOrder` edited by drag-and-drop on list screens, saved with one bulk endpoint.
- **Publishing:** separate action and separate permission (`*:publish`) from editing.
- **Slug changes:** the form warns that changing a published slug creates a 301 redirect; the API creates it automatically.

### 15.5 Staleness expectation

Public pages are cached for up to 60 seconds at the edge. The admin shows "Changes appear on the public site within about a minute" after publishing. A proper draft preview (signed preview token, cache bypass) is **[Recommended, Phase 2]**.

### 15.6 What Admin cannot do

Edit component structure, inject scripts or HTML, add arbitrary page routes, change validation or permissions definitions, or read secrets. Analytics is configured by provider + ID fields, never by a free-form script box.
