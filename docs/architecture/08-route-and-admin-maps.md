# Part H — Route / Page Map and Admin Module Map (§41–§42)

[← Index](README.md)

---

## 41. Route / Page Map

### 41.1 Public website (`apps/web`, host `www`)

All routes: public, no authentication, server-rendered. "Edge cache" is the Nginx HTML micro-cache; API data behind each page is additionally cached as described in §25.

**Every route below exists twice (rule P2):** unprefixed for Vietnamese and under `/en` for English (`/services/:slug` and `/en/services/:slug`), from one route table. Loaders pass the locale to the API. The header on every page carries the language switch and the theme switch (rule P1).

| URL | Route module → template | Data source (loader) | SEO requirement | Caching |
|---|---|---|---|---|
| `/` | `home` → `HomeTemplate` (section registry) | `/pages/home` + featured services, solutions, technologies, projects | Indexable. `Organization` + `WebSite` JSON-LD. LCP image preloaded. | Edge 60 s |
| `/about` | `about` → `ContentPageTemplate` | `/pages/about` | Indexable, breadcrumbs | Edge 60 s |
| `/services` | `services._index` → `ServiceListTemplate` | `/pages/services-index`, `/services`, `/categories?type=service` | Indexable; filtered views `noindex` | Edge 60 s |
| `/services/:slug` | `services.$slug` → `ServiceDetailTemplate` | `/services/:slug` | Indexable. `Service` + `FAQPage` + `BreadcrumbList`. `404` when unknown. | Edge 60 s |
| `/solutions` | `solutions._index` → `SolutionListTemplate` | `/pages/solutions-index`, `/solutions` | Indexable | Edge 60 s |
| `/solutions/:slug` **[Recommended]** | `solutions.$slug` → `SolutionDetailTemplate` | `/solutions/:slug` | Indexable | Edge 60 s |
| `/projects` | `projects._index` → `ProjectListTemplate` | `/pages/projects-index`, `/projects?…`, `/categories?type=project` | Indexable; page N self-canonical; filter/search combinations `noindex, follow` | Edge 60 s (30 s when filtered) |
| `/projects/:slug` | `projects.$slug` → `ProjectDetailTemplate` | `/projects/:slug` | Indexable. `CreativeWork` + breadcrumbs. Confidential clients omitted. | Edge 60 s |
| `/technologies` | `technologies` → `TechnologyCatalogTemplate` | `/pages/technologies-index`, `/technologies?group=category` | Indexable | Edge 60 s |
| `/blog` | `blog._index` → `BlogListTemplate` | `/pages/blog-index`, `/blog/posts?…`, `/categories?type=post` | Indexable; pagination canonicals | Edge 60 s |
| `/blog/category/:slug` **[Recommended]** | `blog.category.$slug` → `BlogListTemplate` | `/blog/posts?category=` | Indexable landing page | Edge 60 s |
| `/blog/tag/:slug` **[Recommended]** | `blog.tag.$slug` → `BlogListTemplate` | `/blog/posts?tag=` | Indexable (or `noindex` for thin tags) | Edge 60 s |
| `/blog/:slug` | `blog.$slug` → `BlogPostTemplate` | `/blog/posts/:slug` | Indexable. `BlogPosting` + breadcrumbs, `og:type=article`. | Edge 60 s |
| `/careers` | `careers` → `CareersTemplate` | `/pages/careers` | Indexable | Edge 60 s |
| `/contact` | `contact` → `ContactTemplate` | `/pages/contact`, `/services` (for the select) | Indexable. `ContactPoint`. | Edge 60 s; the POST is never cached |
| `/privacy` | `legal.privacy` → `LegalPageTemplate` | `/pages/privacy` | Indexable | Edge 60 s |
| `/terms` | `legal.terms` → `LegalPageTemplate` | `/pages/terms` | Indexable | Edge 60 s |
| `/404` | `not-found` → `NotFoundTemplate` | `/pages/not-found` | **HTTP 404**, `noindex` | Edge 30 s |
| `*` (catch-all) | `catch-all` | `/seo/redirects/resolve?path=` → `301`/`302`, else not-found | **HTTP 404**, `noindex` | Edge 30 s |
| `/sitemap.xml` | Resource route (XML) | `/seo/sitemap` | Lists every indexable URL with `lastmod` | 1 h |
| `/robots.txt` | Resource route (text) | Environment + `SITE_URL` | Production: allow + sitemap. Otherwise: disallow all. | 1 h |
| `/healthz` | `server.js` | — | — | `no-store` |

Global to all public routes: the root loader supplies `/site` (settings + navigation); every route has an error boundary; client-side navigation fetches the same API endpoints through TanStack Query.

Assets (not routes): `/assets/*` hashed build output, immutable for one year. No default or placeholder images are shipped (rule P3).

### 41.2 Admin application (`apps/admin`, host `admin`)

All routes: client-rendered, `noindex`, HTML shell cached with `no-cache` (revalidated on every load), hashed assets immutable. The admin shell header also carries a language switch (UI in Vietnamese and English) and a theme switch; content forms edit both languages side by side. Data is never cached at the edge. "Guard" is the UI guard; the API enforces the same permission independently.

| URL | Page | Data source | Auth · Guard |
|---|---|---|---|
| `/login` | `LoginPage` | `POST /auth/login` | Public (redirects away if already signed in) |
| `/forgot-password` | `ForgotPasswordPage` | `POST /auth/password/forgot` | Public |
| `/reset-password` | `ResetPasswordPage` | `POST /auth/password/reset` | Public (token in URL) |
| `/` | `DashboardPage` | `GET /admin/dashboard` | Session · `dashboard:read` |
| `/content/pages` | `PageListPage` | `GET /admin/pages` | `pages:read` |
| `/content/pages/:key` | `PageEditorPage` (section forms) | `GET/PUT /admin/pages/:key` | `pages:read` / `pages:update` |
| `/services`, `/services/new`, `/services/:id` | List, create, edit | `/admin/services…` | `services:read` / `:create` / `:update` |
| `/solutions`, `/solutions/new`, `/solutions/:id` | List, create, edit | `/admin/solutions…` | `solutions:*` |
| `/projects`, `/projects/new`, `/projects/:id` | List, create, edit | `/admin/projects…` | `projects:*` |
| `/technologies`, `/technologies/new`, `/technologies/:id` | List, create, edit | `/admin/technologies…` | `technologies:*` |
| `/categories/:type` | `CategoryManagerPage` (inline create/edit/reorder) | `/admin/categories?type=` | `categories:read` / `:manage` |
| `/blog/posts`, `/blog/posts/new`, `/blog/posts/:id` | List, editor | `/admin/blog/posts…` | `blog:*` |
| `/blog/tags` | `TagManagerPage` | `/admin/blog/tags` | `tags:read` / `:manage` |
| `/blog/authors`, `/blog/authors/:id` | List, edit | `/admin/blog/authors…` | `authors:read` / `:manage` |
| `/media` | `MediaLibraryPage` (grid, upload, detail drawer) | `/admin/media…` + Cloudinary direct upload | `media:read` / `:upload` / `:update` / `:delete` |
| `/contact-requests` | `ContactRequestListPage` | `GET /admin/contact-requests` | `contact:read` |
| `/contact-requests/:id` | `ContactRequestDetailPage` | `/admin/contact-requests/:id…` | `contact:read` / `:update` |
| `/navigation`, `/navigation/:key` | `MenuEditorPage` (tree editor) | `/admin/navigation…` | `navigation:read` / `:update` |
| `/settings/:section` | `SettingsPage` (company, contact, social, SEO, analytics, features) | `GET/PUT /admin/settings` | `settings:read` / `:update` |
| `/seo/redirects` | `RedirectManagerPage` | `/admin/redirects…` | `redirects:read` / `:manage` |
| `/users`, `/users/new`, `/users/:id` | List, invite, edit | `/admin/users…` | `users:*` |
| `/roles`, `/roles/new`, `/roles/:id` | List, role editor (permission matrix) | `/admin/roles…`, `/admin/permissions` | `roles:read` / `:manage` |
| `/audit-logs` | `AuditLogPage` (filters, detail drawer) | `/admin/audit-logs` | `audit:read` |
| `/account` | `AccountPage` (profile, password, sessions) | `/auth/me`, `/auth/password/change`, `/auth/sessions` | Session |
| `/403` | `ForbiddenPage` | — | Session |
| `*` | `NotFoundPage` | — | Session |

---

## 42. Admin Module Map

Every module follows the standard pattern in §15.3 unless noted. "CRUD" lists the operations the module offers.

### 42.1 Core

| Module | Purpose | Main pages | CRUD | Permissions | API | Collections | UX considerations |
|---|---|---|---|---|---|---|---|
| **Auth** | Sign in, recover and manage own account | Login, forgot/reset password, account | Update own profile and password; revoke own sessions | Session only | `/auth/*` | users, sessions, auth_tokens | Generic login errors; lockout message with remaining time; password-manager friendly fields; session list shows device and last use |
| **Dashboard** | Orientation and triage | Dashboard | Read | `dashboard:read` | `/admin/dashboard` | Aggregates across collections | Cards shown only for modules the user can access; new contact requests most prominent; links into filtered lists |

### 42.2 Content

| Module | Purpose | Main pages | CRUD | Permissions | API | Collections | UX considerations |
|---|---|---|---|---|---|---|---|
| **Pages** | Edit text, images and CTAs of fixed pages | Page list, page editor | Read, update, reset section | `pages:read`, `pages:update` | `/admin/pages…` | pages | Forms generated from section definitions; default shown as placeholder; "overridden" indicator and per-field reset; section visibility toggle; SEO tab; notice that changes go live within about a minute |
| **Services** | Manage service catalog | List, create, edit | Full CRUD, publish, reorder, duplicate, restore | `services:*` | `/admin/services…` | services (+ categories, technologies, media) | Tabbed form (Basics, Content, Features/Benefits/Process, Technologies, FAQs, CTA, SEO); repeater fields with drag ordering; slug auto-generated and locked after publish with a redirect warning |
| **Solutions** | Manage solution packages | List, create, edit | Full CRUD, publish, reorder | `solutions:*` | `/admin/solutions…` | solutions | Reference pickers for services and technologies |
| **Projects** | Manage case studies | List, create, edit | Full CRUD, publish, feature, restore | `projects:*` | `/admin/projects…` | projects (+ categories, services, technologies, media) | Gallery manager with captions and ordering; "confidential client" switch with a preview of what the public sees; results as label/value pairs |
| **Technologies** | Manage the technology catalog | List (grouped by category), create, edit | Full CRUD, publish, reorder | `technologies:*` | `/admin/technologies…` | technologies (+ categories, media) | Compact form; logo picker; in-use warning before delete listing services and projects |
| **Categories** | Manage categories for services, projects, technologies, posts | One manager page per type | Create, update, reorder, delete | `categories:read`, `categories:manage` | `/admin/categories…` | categories | Inline editing; usage counts; delete disabled while in use |
| **Blog posts** | Write and publish articles | List, editor | Full CRUD, publish, schedule, feature, restore | `blog:*` | `/admin/blog/posts…` | blog_posts (+ authors, categories, tags, media) | Rich-text editor lazy-loaded; autosave of drafts to local storage; scheduled state shown with date; excerpt and reading time derived; SEO preview snippet; unsaved-changes guard |
| **Tags** | Manage blog tags | Tag manager | Create, rename, delete | `tags:read`, `tags:manage` | `/admin/blog/tags…` | tags | Can also be created inline from the post editor; merge duplicates [Phase 2] |
| **Authors** | Manage public author profiles | List, edit | Create, update, delete | `authors:read`, `authors:manage` | `/admin/blog/authors…` | authors (+ media, users) | Optional link to a user account; clear that the profile is public |
| **Media** | Central asset library | Library grid, detail drawer, upload dialog | Upload, read, update metadata, replace, delete | `media:read`, `media:upload`, `media:update`, `media:delete` | `/admin/media…`, Cloudinary upload | media | Drag-and-drop multi-upload with progress; alt text required (or "decorative"); search and folder filter; "used in" list; delete blocked when in use; also embedded as a picker dialog in every image field |

### 42.3 Site configuration

| Module | Purpose | Main pages | CRUD | Permissions | API | Collections | UX considerations |
|---|---|---|---|---|---|---|---|
| **Navigation** | Edit header, footer and legal menus | Menu list, tree editor | Read, replace, reset to default | `navigation:read`, `navigation:update` | `/admin/navigation…` | navigation_menus | Drag-and-drop tree limited to two levels; internal link picker (pages and content items) vs external URL; visibility toggle; reset to default |
| **Site settings** | Company, contact, social, default SEO, footer, analytics, feature flags | Settings with section tabs | Read, update | `settings:read`, `settings:update` | `/admin/settings` | site_settings | Defaults shown as placeholders; analytics configured by provider + id only; feature flags explained in plain language |
| **SEO** | Redirects and SEO health | Redirect manager; overview [Phase 2] | Create, update, delete redirects | `redirects:read`, `redirects:manage` | `/admin/redirects…`, `/admin/seo/overview` | redirects | Auto-created redirects labelled; loop and chain prevention with clear errors; per-entity SEO is edited in each module's SEO tab |

### 42.4 Operations

| Module | Purpose | Main pages | CRUD | Permissions | API | Collections | UX considerations |
|---|---|---|---|---|---|---|---|
| **Contact requests** | Triage and follow up leads | Inbox list, detail | Read, update status/assignee, add notes, delete | `contact:read`, `contact:update`, `contact:delete`, `contact:export` | `/admin/contact-requests…` | contact_requests | Status filter tabs with counts; unread emphasis; spam tab; attachment download through signed link with a caution notice; reply via `mailto:`; usable on a phone |
| **Users** | Manage admin accounts | List, invite, edit | Create (invite), update, disable, assign roles, revoke sessions, delete | `users:read`, `users:create`, `users:update`, `users:delete`, `users:assign-roles` | `/admin/users…` | users, sessions, auth_tokens | Cannot edit own roles or disable self; only assignable roles are selectable; last Super Admin protected with an explanation |
| **Roles** | Define roles from the permission catalog | List, role editor | Create, update, delete | `roles:read`, `roles:manage` | `/admin/roles…`, `/admin/permissions` | roles | Permission matrix grouped by resource with descriptions; system roles read-only; shows affected users; warns that saving signs those users out |
| **Audit logs** | Accountability and troubleshooting | Log list, detail drawer | Read only | `audit:read` | `/admin/audit-logs…` | audit_logs | Filters by actor, action, resource, date; link to the affected item; request ID shown for correlation with server logs; no edit or delete controls exist |

### 42.5 Module delivery order

1. Auth, shell, guards, shared building blocks (`DataTable`, `ResourceForm`, field components, media picker).
2. Media (other modules depend on the picker).
3. Categories → Technologies → Services (establishes the full pattern end to end).
4. Pages, Site settings, Navigation (default/override system).
5. Projects, Solutions.
6. Authors, Tags, Blog posts.
7. Contact requests.
8. Users, Roles, Audit logs, Dashboard.

Steps 3–8 can be parallelised across developers once step 1 is merged, because each module is a separate folder in both `apps/api` and `apps/admin`.
