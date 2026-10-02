# Part G — API Endpoint Map (§40)

[← Index](README.md) · Conventions and contracts: [§19](03-auth-media-api.md#19-rest-api-architecture)

## 40. API Endpoint Map

Base path: `/api/v1`. All responses use the envelope in §19.3–19.4.

**Reading the tables**

- **Auth** — `Public` (no session), `Session` (any authenticated admin user), or a permission key (session + that permission).
- **Request** — named Zod schema in `@devhouse/shared` and its notable fields. Every endpoint validates `params`, `query` and `body`; unknown keys are stripped.
- **Response** — the shape of `data`. `List<T>` means an array plus `meta.pagination`.
- **DB** — the main database operation.
- Standard list query (`ListQuery`): `page`, `limit`, `sort`, `search`, plus the filters named in the row.
- **Locale (rule P2):** every public `GET` accepts `locale=vi|en` (default `vi`). Responses contain flattened strings for that locale and only items available in it; `:slug` is matched against that locale's slug; detail responses include `alternates` (`{ vi, en }` paths for the locales the item exists in). Admin endpoints always return and accept full `{ vi, en }` maps plus the derived `locales` array.

---

### 40.1 Health

| Method | Path | Auth | Request | Response | DB |
|---|---|---|---|---|---|
| GET | `/health` | Public | — | `{ status }` · `503` when degraded | Mongo ping |
| GET | `/health/live` | Public | — | `{ status: "ok" }` | none |
| GET | `/health/ready` | Public | — | `{ status }` (+ dependency detail on the internal network only) | Mongo ping (2 s timeout) |

### 40.2 Public — site, pages, SEO

| Method | Path | Auth | Request | Response | DB |
|---|---|---|---|---|---|
| GET | `/site` | Public | — | `{ settings (public subset, resolved), navigation: { header, footer, legal } }` | `findOne` settings + `find` menus → resolver (cached) |
| GET | `/pages/:key` | Public | `key` ∈ page keys | `{ key, sections (resolved), seo }` | `findOne` page → resolver (cached) |
| GET | `/seo/sitemap` | Public | — | `[{ path, lastModified, changeFrequency }]` | Projection `slug, updatedAt` over published items of each collection |
| GET | `/seo/redirects/resolve` | Public | `?path=` | `{ to, statusCode }` or `404` | `findOne` redirect by `from` |

### 40.3 Public — catalog

| Method | Path | Auth | Request | Response | DB |
|---|---|---|---|---|---|
| GET | `/services` | Public | `ListQuery` + `category` (slug), `featured` | `List<ServiceCard>` | `find` published, sort `sortOrder`, paginate |
| GET | `/services/:slug` | Public | `slug` | `ServiceDetail` incl. `technologies[]`, `relatedProjects[]` (≤ 6) | `findOne` published by slug + `$in` technologies + `find` projects by service |
| GET | `/solutions` | Public | `ListQuery` + `featured` | `List<SolutionCard>` | `find` published |
| GET | `/solutions/:slug` | Public | `slug` | `SolutionDetail` incl. `services[]`, `technologies[]` | `findOne` + `$in` lookups |
| GET | `/projects` | Public | `ListQuery` + `category`, `service`, `technology` (slugs), `featured`; sort ∈ `-publishedAt`, `title`, `sortOrder` | `List<ProjectCard>` | Resolve slugs → ids, `find` published + `countDocuments` |
| GET | `/projects/:slug` | Public | `slug` | `ProjectDetail` incl. `services[]`, `technologies[]`, `related[]` (≤ 3) | `findOne` + `$in` lookups |
| GET | `/technologies` | Public | `ListQuery` + `category` (slug), `featured`, `group=category` | `List<Technology>` or `[{ category, items[] }]` when grouped | `find` published, sort `category, sortOrder` |
| GET | `/technologies/:slug` | Public | `slug` | `TechnologyDetail` incl. `services[]`, `projects[]` | `findOne` + reverse queries |
| GET | `/categories` | Public | `type*` ∈ `service, project, technology, post` | `[Category]` (visible only) | `find` by type, sort `sortOrder` |

### 40.4 Public — blog

| Method | Path | Auth | Request | Response | DB |
|---|---|---|---|---|---|
| GET | `/blog/posts` | Public | `ListQuery` + `category`, `tag`, `author` (slugs), `featured` | `List<PostCard>` (no `content`) | `find` published and due, sort `-publishedAt` |
| GET | `/blog/posts/:slug` | Public | `slug` | `PostDetail` incl. `content`, `author`, `category`, `tags[]`, `related[]` (≤ 3) | `findOne` + lookups |
| GET | `/blog/tags` | Public | — | `[{ name, slug, postCount }]` | Aggregate over published posts (cached) |
| GET | `/blog/authors/:slug` | Public | `slug` | `AuthorProfile` (no `user` link) | `findOne` |

### 40.5 Public — contact

| Method | Path | Auth | Request | Response | DB |
|---|---|---|---|---|---|
| POST | `/contact` | Public · rate-limited | `contact.create`: `name*`, `email*`, `message*`, `consent*`, `phone`, `company`, `country`, `service` (slug), `projectType`, `budget`, `timeline`, `subject`, `preferredContactMethod`, `referralSource`, honeypot + timing fields, optional CAPTCHA token. `multipart/form-data` when attachments (≤ 3 files, ≤ 10 MB each, allow-listed types) else JSON. | `201 { id }` (same response for spam-flagged submissions) | Validate → spam pipeline → upload attachments (private) → `insertOne` → async notify |

---

### 40.6 Auth (admin host only)

| Method | Path | Auth | Request | Response | DB |
|---|---|---|---|---|---|
| POST | `/auth/login` | Public · strict rate limit | `auth.login`: `email*`, `password*` | `{ user, permissions[] }` + `Set-Cookie`; or `{ mfaRequired, challengeId }` (Phase 2) | `findOne` user (+hash) → verify → update counters → `insertOne` session → audit |
| POST | `/auth/logout` | Session | — | `204`, cookie cleared | `deleteOne` session |
| GET | `/auth/me` | Session | — | `{ user, roles[], permissions[] }` | Session lookup (cached) |
| POST | `/auth/password/forgot` | Public · strict rate limit | `email*` | `202` always | `insertOne` auth token → email |
| POST | `/auth/password/reset` | Public · strict rate limit | `token*`, `password*` | `204` | Verify token → update hash → `deleteMany` sessions → audit |
| POST | `/auth/password/change` | Session | `currentPassword*`, `newPassword*` | `204` + rotated cookie | Verify → update → delete other sessions → audit |
| GET | `/auth/sessions` | Session | — | `[{ id, ip, userAgent, lastUsedAt, current }]` | `find` by user |
| DELETE | `/auth/sessions/:id` | Session | `id` (must belong to the caller) | `204` | `deleteOne` |
| PATCH | `/auth/profile` | Session | `name`, `avatar` (mediaId) | `{ user }` | `updateOne` self |

---

### 40.7 Admin — standard resource endpoints

Base: `/api/v1/admin`. All responses `Cache-Control: no-store`. The same nine endpoints exist for each of the five publishable collections; `<r>` and `<perm>` are substituted from the table below.

| Method | Path | Auth | Request | Response | DB |
|---|---|---|---|---|---|
| GET | `/<r>` | `<perm>:read` | `ListQuery` + `status`, `category`, `featured`, `deleted` | `List<AdminListItem>` | `find` (all statuses) + count |
| POST | `/<r>` | `<perm>:create` | `<r>.create` (full entity; `status` forced to `draft` unless caller has `:publish`) | `201` entity | Slug uniqueness check → `insertOne` → audit |
| GET | `/<r>/:id` | `<perm>:read` | `id` | Entity (all fields) | `findById` |
| PATCH | `/<r>/:id` | `<perm>:update` | `<r>.update` (partial) + `updatedAt` for conflict detection | Entity · `409 STALE_UPDATE` on conflict | `findOneAndUpdate` with version guard → redirect on slug change → audit → cache invalidate |
| PATCH | `/<r>/:id/status` | `<perm>:publish` | `status*` ∈ `draft, published, archived`; `publishedAt` (future = scheduled) | Entity | `updateOne` → audit → cache invalidate |
| PATCH | `/<r>/reorder` | `<perm>:update` | `[{ id, sortOrder }]` (≤ 200) | `204` | `bulkWrite` → audit |
| DELETE | `/<r>/:id` | `<perm>:delete` | `id` | `204` | Soft delete → audit → cache invalidate |
| POST | `/<r>/:id/restore` | `<perm>:delete` | `id` | Entity · `409 SLUG_TAKEN` if the slug was reused | Restore → audit |
| POST | `/<r>/:id/duplicate` | `<perm>:create` | `id` | `201` new draft copy with a new slug | `insertOne` → audit [Recommended] |

| `<r>` | `<perm>` | Notes specific to the resource |
|---|---|---|
| `services` | `services` | Image fields accept `mediaId`; the API writes the `ImageRef` snapshot |
| `solutions` | `solutions` | |
| `projects` | `projects` | List filters also accept `service`, `technology` |
| `technologies` | `technologies` | Delete blocked with `409 RESOURCE_IN_USE` when referenced, unless forced |
| `blog/posts` | `blog` | No `reorder`. `content` validated against the rich-text schema; `contentText`, `readingTimeMinutes`, default `excerpt` derived on write. Body limit 1 MB. |

### 40.8 Admin — taxonomy

| Method | Path | Auth | Request | Response | DB |
|---|---|---|---|---|---|
| GET | `/categories` | `categories:read` | `type*`, `ListQuery` | `List<Category>` with usage counts | `find` + aggregate counts |
| POST | `/categories` | `categories:manage` | `type*`, `name*`, `slug*`, `description`, `icon`, `sortOrder`, `isVisible`, `seo` | `201` Category | `insertOne` |
| PATCH | `/categories/:id` | `categories:manage` | Partial | Category | `updateOne` |
| PATCH | `/categories/reorder` | `categories:manage` | `[{ id, sortOrder }]` | `204` | `bulkWrite` |
| DELETE | `/categories/:id` | `categories:manage` | `id` | `204` · `409 RESOURCE_IN_USE` | Usage check → `deleteOne` |
| GET | `/blog/tags` | `tags:read` | `ListQuery` | `List<Tag>` with counts | `find` + counts |
| POST | `/blog/tags` | `tags:manage` | `name*`, `slug*` | `201` Tag | `insertOne` |
| PATCH | `/blog/tags/:id` | `tags:manage` | Partial | Tag | `updateOne` |
| DELETE | `/blog/tags/:id` | `tags:manage` | `id` | `204` | `deleteOne` + `$pull` from posts (transaction) |
| GET | `/blog/authors` | `authors:read` | `ListQuery` | `List<Author>` | `find` |
| POST | `/blog/authors` | `authors:manage` | `name*`, `slug*`, `title`, `bio`, `avatar`, `links`, `user`, `isActive` | `201` Author | `insertOne` |
| GET | `/blog/authors/:id` | `authors:read` | `id` | Author | `findById` |
| PATCH | `/blog/authors/:id` | `authors:manage` | Partial | Author | `updateOne` |
| DELETE | `/blog/authors/:id` | `authors:manage` | `id` | `204` · `409 RESOURCE_IN_USE` | Usage check → `deleteOne` |

### 40.9 Admin — singleton content

| Method | Path | Auth | Request | Response | DB |
|---|---|---|---|---|---|
| GET | `/pages` | `pages:read` | — | `[{ key, label, overriddenSections[], updatedAt }]` | `find` pages + registry |
| GET | `/pages/:key` | `pages:read` | `key` | `{ key, definition, defaults, overrides, resolved, seo, updatedAt }` | `findOne` + registry |
| PUT | `/pages/:key` | `pages:update` | `{ sections (sparse overrides), seo, updatedAt }` validated per section schema | Same as GET | `findOneAndUpdate` upsert → audit → cache invalidate |
| DELETE | `/pages/:key/sections/:section` | `pages:update` | — | Same as GET (section back to defaults) | `$unset` section → audit |
| GET | `/settings` | `settings:read` | — | `{ defaults, overrides, resolved }` | `findOne` |
| PUT | `/settings` | `settings:update` | Sparse overrides validated by the settings schema | Same as GET | Upsert → audit → cache invalidate |
| GET | `/navigation` | `navigation:read` | — | `[{ key, isDefault, items[] }]` | `find` menus + defaults |
| GET | `/navigation/:key` | `navigation:read` | `key` | `{ key, defaults, items, isDefault }` | `findOne` |
| PUT | `/navigation/:key` | `navigation:update` | `{ items[] }` (depth ≤ 2, valid `parentId`, URL rules) | Menu | Upsert → audit → cache invalidate |
| DELETE | `/navigation/:key` | `navigation:update` | — | Default menu | `deleteOne` → audit |

### 40.10 Admin — media

| Method | Path | Auth | Request | Response | DB / external |
|---|---|---|---|---|---|
| POST | `/media/signature` | `media:upload` | `{ folder*, resourceType*, filename }` · or `{ replaceId }` | `{ cloudName, apiKey, timestamp, signature, params }` | None; signs with the Cloudinary secret |
| POST | `/media` | `media:upload` | Cloudinary upload result (`public_id`, `version`, `signature`, …) + `alt`, `title`, `folder`, `tags` | `201` Media | Verify with Cloudinary → `insertOne` → audit |
| GET | `/media` | `media:read` | `ListQuery` + `folder`, `resourceType`, `tag` | `List<Media>` | `find` |
| GET | `/media/:id` | `media:read` | `id` | Media | `findById` |
| PATCH | `/media/:id` | `media:update` | `alt`, `isDecorative`, `title`, `caption`, `folder`, `tags` | Media | `updateOne` → audit |
| GET | `/media/:id/usage` | `media:read` | `id` | `[{ resourceType, id, label, path }]` | Scan registered media paths |
| POST | `/media/:id/replace` | `media:update` | Cloudinary result for the same `public_id` | Media (new `version`, dimensions) | Verify → update → refresh snapshots (transaction) → audit |
| DELETE | `/media/:id` | `media:delete` | `?force=true` to override the in-use guard | `204` · `409 MEDIA_IN_USE` with usages | Usage check → soft delete → Cloudinary destroy + invalidate → audit |

### 40.11 Admin — contact requests

| Method | Path | Auth | Request | Response | DB |
|---|---|---|---|---|---|
| GET | `/contact-requests` | `contact:read` | Cursor list: `cursor`, `limit`, `status`, `assignee`, `service`, `search`, `from`, `to` | `List<ContactRequestSummary>` + `nextCursor` | Keyset `find` |
| GET | `/contact-requests/:id` | `contact:read` | `id` | ContactRequest | `findById` |
| PATCH | `/contact-requests/:id` | `contact:update` | `status`, `assignee` | ContactRequest | `updateOne` → audit |
| POST | `/contact-requests/:id/notes` | `contact:update` | `body*` (≤ 2,000) | ContactRequest | `$push` note |
| GET | `/contact-requests/:id/attachments/:attachmentId/url` | `contact:read` | — | `{ url, expiresAt }` (signed, short-lived, forced download) | `findById` → Cloudinary signed URL → audit |
| DELETE | `/contact-requests/:id` | `contact:delete` | `id` | `204` | Soft delete → audit |
| GET | `/contact-requests/export` | `contact:export` | Same filters; CSV | `text/csv` stream | Cursor stream → audit [Phase 2] |

### 40.12 Admin — SEO

| Method | Path | Auth | Request | Response | DB |
|---|---|---|---|---|---|
| GET | `/redirects` | `redirects:read` | `ListQuery` + `source`, `isActive` | `List<Redirect>` | `find` |
| POST | `/redirects` | `redirects:manage` | `from*`, `to*`, `statusCode`, `isActive` | `201` Redirect · `409` on duplicate or loop | Loop/chain check → `insertOne` → audit |
| PATCH | `/redirects/:id` | `redirects:manage` | Partial | Redirect | `updateOne` |
| DELETE | `/redirects/:id` | `redirects:manage` | `id` | `204` | `deleteOne` |
| GET | `/seo/overview` | `settings:read` | — | Items missing SEO title/description/alt [Phase 2] | Aggregations |

Per-entity SEO fields are edited through each resource's own endpoint (`seo` sub-document); global defaults through `/settings`.

### 40.13 Admin — users, roles, permissions

| Method | Path | Auth | Request | Response | DB |
|---|---|---|---|---|---|
| GET | `/users` | `users:read` | `ListQuery` + `status`, `role` | `List<User>` (never `passwordHash`) | `find` |
| POST | `/users` | `users:create` | `email*`, `name*`, `roles*` (subset rule), invite or temporary password | `201` User | `insertOne` → invite token → audit |
| GET | `/users/:id` | `users:read` | `id` | User | `findById` |
| PATCH | `/users/:id` | `users:update` | `name`, `status` (not self) | User | `updateOne` → revoke sessions if disabled → audit |
| PUT | `/users/:id/roles` | `users:assign-roles` | `roles*` (subset rule; not self; last Super Admin guard) | User | `updateOne` → `deleteMany` sessions → audit |
| POST | `/users/:id/revoke-sessions` | `users:update` | — | `204` | `deleteMany` sessions → audit |
| POST | `/users/:id/reset-password` | `users:update` | — | `202` (reset email sent) | `insertOne` auth token → audit |
| DELETE | `/users/:id` | `users:delete` | `id` (not self; last Super Admin guard) | `204` | Soft delete → revoke sessions → audit |
| GET | `/roles` | `roles:read` | — | `[Role]` with user counts | `find` + counts |
| POST | `/roles` | `roles:manage` | `key*`, `name*`, `description`, `permissions*` (must exist in the catalog; subset rule) | `201` Role | `insertOne` → audit |
| GET | `/roles/:id` | `roles:read` | `id` | Role | `findById` |
| PATCH | `/roles/:id` | `roles:manage` | Partial (system roles rejected) | Role | `updateOne` → revoke affected sessions → audit |
| DELETE | `/roles/:id` | `roles:manage` | `id` | `204` · `409 RESOURCE_IN_USE` | Usage check → `deleteOne` → audit |
| GET | `/permissions` | `roles:read` | — | Catalog grouped by resource `[{ group, items: [{ key, label, description }] }]` | None (code constant) |

### 40.14 Admin — dashboard and audit

| Method | Path | Auth | Request | Response | DB |
|---|---|---|---|---|---|
| GET | `/dashboard` | `dashboard:read` | — | `{ counts by collection and status, newContactRequests, recentContactRequests[5], drafts[5], scheduled[5], recentActivity[10] }`; blocks filtered by the caller's permissions | Parallel counts + small finds (cached 60 s) |
| GET | `/audit-logs` | `audit:read` | Cursor list: `cursor`, `limit`, `actor`, `action`, `resourceType`, `resourceId`, `from`, `to` | `List<AuditLog>` + `nextCursor` | Keyset `find` |
| GET | `/audit-logs/:id` | `audit:read` | `id` | AuditLog | `findById` |

---

### 40.15 Endpoint groups requested in the brief → where they live

| Group | Location |
|---|---|
| auth | §40.6 |
| users, roles, permissions | §40.13 |
| pages | §40.2 (public), §40.9 (admin) |
| navigation | `/site` in §40.2 (public), §40.9 (admin) |
| services, solutions, projects, technologies | §40.3 (public), §40.7 (admin) |
| blog | §40.4 (public), §40.7 + §40.8 (admin) |
| media | §40.10 |
| contact | §40.5 (public), §40.11 (admin) |
| settings | `/site` in §40.2 (public), §40.9 (admin) |
| seo | §40.2 (sitemap, redirect resolve), §40.12 (admin) |
| health | §40.1 |

### 40.16 Rate-limit classes

| Class | Applies to | Indicative limit (per IP unless noted) |
|---|---|---|
| `auth` | `/auth/login`, `/auth/password/*` | 5 / minute, plus per-email lockout |
| `contact` | `POST /contact` | 3 / minute, 10 / hour |
| `public` | Public GETs | 60 / minute burst-tolerant (mostly absorbed by the edge cache) |
| `admin` | `/admin/*` | 300 / minute per session |
| `upload` | `/admin/media/signature` | 60 / minute per session |
