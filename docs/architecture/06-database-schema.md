# Part F — Database Schema (§39)

[← Index](README.md) · Relationship diagram: [§43.4](09-diagrams.md#434-database-architecture) · Design rationale: [§11](02-application-architecture.md#11-database-architecture)

Conceptual Mongoose schemas. `*` marks a required field. All collections have `timestamps: true` (`createdAt`, `updatedAt`).

## 39. Database Schema

### 39.0 Shared building blocks

**Embedded sub-schemas** (`_id: false`)

| Name | Fields |
|---|---|
| `ImageRef` | `mediaId*` ObjectId → `media` · `publicId*` String (filled by the API) · `width` Number · `height` Number · `format` String · `alt` String (≤ 200) |
| `Seo` | `title` String (≤ 70) · `description` String (≤ 160) · `canonicalUrl` String · `ogTitle` String · `ogDescription` String · `ogImage` ImageRef · `noIndex` Boolean (default `false`) |
| `Link` | `label*` String · `url*` String (relative path or `http(s)`/`mailto`/`tel`) · `target` enum `_self \| _blank` (default `_self`) |
| `RichText` | Mixed: `{ type: 'doc', content: [...] }`, validated by the rich-text schema; sibling field `contentVersion` Number |

**Plugins**

| Plugin | Adds | Behaviour |
|---|---|---|
| `sluggable` | `slug*` String, lowercase, `^[a-z0-9]+(?:-[a-z0-9]+)*$`, ≤ 120. **Per-locale** (`slug: { vi*, en }`) on services, solutions, projects, blog posts; a single shared slug on the other collections. | Unique via partial index where `isDeleted: false` (or plain unique where no soft delete). Per-locale slugs get one unique partial index per locale. |
| `localized` | `locales*` [String] (derived) | Recomputed on save: contains each locale whose required localized fields are filled. Public queries filter on it. |
| `publishable` | `status*` enum `draft \| published \| archived` (default `draft`) · `publishedAt` Date | `published()` scope = `status: 'published'` and `publishedAt <= now`. A future `publishedAt` is a scheduled item. |
| `softDelete` | `isDeleted` Boolean (default `false`) · `deletedAt` Date · `deletedBy` ObjectId → `users` | Default finds exclude deleted; `restore()` |
| `auditable` | `createdBy` ObjectId → `users` · `updatedBy` ObjectId → `users` | Set from request context |

**Localization (project rule P2, §30.4)**

| Type | Definition |
|---|---|
| `LocalizedString` | `{ vi*: String, en: String }` — Vietnamese required, English optional |
| `LocalizedRichText` | `{ vi: RichText, en: RichText }` |

The collection tables below show each field's logical type. **Every field listed here is stored as the localized map**, and takes precedence over the type shown in the table.

| Collection | Localized fields | Shared (not localized) |
|---|---|---|
| `Seo` sub-schema | `title`, `description`, `ogTitle`, `ogDescription` | `canonicalUrl`, `ogImage`, `noIndex` |
| `ImageRef`, `media` | `alt`; on `media` also `title`, `caption` | everything else |
| `Link` | `label` | `url`, `target` |
| `categories` | `name`, `description` | `slug` |
| `tags` | `name` | `slug` |
| `authors` | `title`, `bio` | `name`, `slug` |
| `technologies` | `description` | `name`, `slug` |
| `services` | `name`, `slug`, `shortDescription`, `longDescription`, text of `features[]`, `benefits[]`, `process[]`, `faqs[]`, `cta` | relations, images, icons, flags, order |
| `solutions` | `title`, `slug`, `summary`, `description`, text of `problems[]`, `outcomes[]`, `cta` | `industries` keys, relations, images |
| `projects` | `title`, `slug`, `shortDescription`, `description`, `challenge`, `solution`, text of `features[]`, `results[].label`, `results[].description`, `gallery[].caption`, `client.industry` | `client.name`, `results[].value`, URLs, dates, relations |
| `blog_posts` | `title`, `slug`, `excerpt`, `content`, `contentText`, `readingTimeMinutes` | author, category, tags, cover image, dates |
| `navigation_menus` | `items[].label` | `url`, structure, order |
| `pages`, `site_settings` | Every text leaf, as declared by the content definition | images, flags, URLs, analytics, feature flags |

Index consequences: collections with per-locale slugs use `{ 'slug.vi': 1 }` and `{ 'slug.en': 1 }` (unique, partial) instead of `{ slug: 1 }`. Public list indexes start with `locales` where the index has no other array field (a compound index may contain only one array). Text indexes list both languages' subfields.

Rule P3 applies to data as well: every image field is optional and empty by default; seeds insert no images.

---

### 39.1 `users`

| Field | Type | Notes |
|---|---|---|
| `email*` | String | Lowercase, trimmed, unique |
| `passwordHash*` | String | `select: false`; Argon2id |
| `name*` | String | ≤ 100 |
| `avatar` | ImageRef | |
| `roles*` | [ObjectId → `roles`] | At least one |
| `status*` | enum `active \| invited \| disabled` | Default `active` |
| `mustChangePassword` | Boolean | Default `false` |
| `lastLoginAt`, `passwordChangedAt` | Date | |
| `failedLoginCount` | Number | Default `0` |
| `lockUntil` | Date | |
| `mfa` | `{ enabled: Boolean (false), secretEnc: String (select: false), recoveryCodeHashes: [String] (select: false) }` | Reserved for Phase 2 |

Plugins: softDelete, auditable. **Indexes:** `{ email: 1 }` unique · `{ roles: 1 }` · `{ status: 1, isDeleted: 1 }`.
On soft delete the email is suffixed so the address can be re-invited.

### 39.2 `roles`

| Field | Type | Notes |
|---|---|---|
| `key*` | String | Slug, unique (e.g. `editor`) |
| `name*` | String | |
| `description` | String | |
| `permissions*` | [String] | Each validated against the code catalog; `*` only on the system Super Admin |
| `isSystem` | Boolean | Default `false`; system roles are immutable |

Plugins: auditable. Hard delete, blocked when any user references the role. **Indexes:** `{ key: 1 }` unique.

### 39.3 `sessions`

| Field | Type | Notes |
|---|---|---|
| `tokenHash*` | String | SHA-256 of the cookie token; unique |
| `user*` | ObjectId → `users` | |
| `expiresAt*` | Date | Idle expiry, extended on activity |
| `absoluteExpiresAt*` | Date | Hard limit |
| `lastUsedAt` | Date | |
| `ip`, `userAgent` | String | For the user's session list |

**Indexes:** `{ tokenHash: 1 }` unique · `{ user: 1 }` · `{ expiresAt: 1 }` TTL (`expireAfterSeconds: 0`). Hard delete on logout/revoke.

### 39.4 `auth_tokens`

| Field | Type | Notes |
|---|---|---|
| `user*` | ObjectId → `users` | |
| `type*` | enum `password_reset \| invite` | |
| `tokenHash*` | String | Unique |
| `expiresAt*` | Date | |
| `usedAt` | Date | Single use |

**Indexes:** `{ tokenHash: 1 }` unique · `{ user: 1, type: 1 }` · `{ expiresAt: 1 }` TTL.

### 39.5 `site_settings`

Single document.

| Field | Type | Notes |
|---|---|---|
| `key*` | String | Always `global`; unique |
| `data` | Mixed | **Sparse overrides** validated by the settings schema in `@devhouse/content` |
| `updatedBy` | ObjectId → `users` | |

Shape of the resolved settings (defaults in code, any subset may be overridden):

```
company   { name, legalName, tagline, description, logo: Image, logoDark: Image, favicon: Image, foundedYear }
contact   { email, phone, address { line1, line2, city, country }, mapUrl, businessHours [{ days, hours }] }
social    [{ platform, url }]
seo       { titleTemplate, defaultTitle, defaultDescription, defaultOgImage: Image, twitterHandle }
footer    { about, copyright, columns [{ heading, menuKey }] }
analytics { provider: none|plausible|umami|ga4, siteId, searchConsoleVerification }
features  { blog: Boolean, careers: Boolean, contactAttachments: Boolean, captcha: Boolean }
```

Only a whitelisted public subset is returned by the public API (never internal flags or anything sensitive).

### 39.6 `pages`

One document per page key; absence means "all defaults".

| Field | Type | Notes |
|---|---|---|
| `key*` | String | `home`, `about`, `services-index`, `solutions-index`, `projects-index`, `technologies-index`, `blog-index`, `careers`, `contact`, `privacy`, `terms`, `not-found`; unique |
| `sections` | Mixed | Sparse overrides keyed by section: `{ hero: { heading, …, visible }, … }`, validated per section schema |
| `seo` | Seo | |
| `updatedBy` | ObjectId → `users` | |

**Indexes:** `{ key: 1 }` unique. No status or soft delete: a page always exists through its defaults. **[Phase 2]** `page_revisions` for history and draft/preview.

### 39.7 `navigation_menus`

One document per menu; absence means default menu.

| Field | Type | Notes |
|---|---|---|
| `key*` | String | `header`, `footer`, `legal`; unique |
| `items*` | [Item] | Embedded flat list; the whole array replaces the default |
| `updatedBy` | ObjectId → `users` | |

`Item`: `id*` String (stable client-generated id) · `label*` String · `type*` enum `internal \| external` · `url*` String · `parentId` String \| null · `order*` Number · `visible` Boolean (default `true`) · `target` enum `_self \| _blank` · `icon` String (key from the icon set) · `rel` String.

Validation: maximum depth 2; `parentId` must reference an item in the same menu; external URLs must be `http(s)`; `_blank` adds `rel="noopener"`. **Indexes:** `{ key: 1 }` unique.

### 39.8 `categories`

Shared by services, projects, technologies and posts.

| Field | Type | Notes |
|---|---|---|
| `type*` | enum `service \| project \| technology \| post` | |
| `name*` | String | |
| `slug*` | String | Unique per type |
| `description` | String | |
| `icon` | String | |
| `sortOrder` | Number | Default `0` |
| `isVisible` | Boolean | Default `true` |
| `seo` | Seo | Used by post category landing pages |

Plugins: auditable. Hard delete, blocked when in use. **Indexes:** `{ type: 1, slug: 1 }` unique · `{ type: 1, sortOrder: 1 }`.
Seeded technology categories: Frontend, Backend, Database, Mobile, Desktop, AI, DevOps, Cloud, Infrastructure, Game Development, Tools.

### 39.9 `technologies`

| Field | Type | Notes |
|---|---|---|
| `name*` | String | |
| `logo` | ImageRef | |
| `description` | String | ≤ 500 |
| `category*` | ObjectId → `categories` (`type: technology`) | |
| `websiteUrl` | String | |
| `isFeatured` | Boolean | Default `false` |
| `sortOrder` | Number | Default `0` |

Plugins: sluggable, publishable, softDelete, auditable.
Related services and projects are **derived** by reverse query, not stored.
**Indexes:** `{ slug: 1 }` unique partial · `{ status: 1, isDeleted: 1, category: 1, sortOrder: 1 }` · `{ isFeatured: 1, status: 1, sortOrder: 1 }` · text `{ name, description }`.

### 39.10 `services`

| Field | Type | Notes |
|---|---|---|
| `name*` | String | ≤ 120 |
| `category` | ObjectId → `categories` (`type: service`) | |
| `shortDescription*` | String | ≤ 300; used on cards and as the SEO description fallback |
| `longDescription` | RichText | |
| `icon` | String | Key from the icon set |
| `heroImage` | ImageRef | |
| `features` | [{ `title*`, `description`, `icon` }] | |
| `benefits` | [{ `title*`, `description` }] | |
| `process` | [{ `title*`, `description` }] | Array order is the step order |
| `technologies` | [ObjectId → `technologies`] | |
| `faqs` | [{ `question*`, `answer*` }] | |
| `cta` | { `heading`, `text`, `button`: Link } | Falls back to the global CTA |
| `seo` | Seo | |
| `isFeatured` | Boolean | Default `false` |
| `sortOrder` | Number | Default `0` |

Plugins: sluggable, publishable, softDelete, auditable.
Related projects are derived from `projects.services`.
**Indexes:** `{ slug: 1 }` unique partial · `{ status: 1, isDeleted: 1, sortOrder: 1 }` · `{ isFeatured: 1, status: 1, sortOrder: 1 }` · `{ category: 1, sortOrder: 1 }` · `{ technologies: 1 }` · text `{ name: 10, shortDescription: 5 }`.

### 39.11 `solutions`

| Field | Type | Notes |
|---|---|---|
| `title*` | String | |
| `summary*` | String | ≤ 300 |
| `description` | RichText | |
| `icon` | String | |
| `image` | ImageRef | |
| `problems` | [{ `title*`, `description` }] | What it addresses |
| `outcomes` | [{ `title*`, `description` }] | What the client gets |
| `services` | [ObjectId → `services`] | |
| `technologies` | [ObjectId → `technologies`] | |
| `industries` | [String] | |
| `cta` | { `heading`, `text`, `button`: Link } | |
| `seo` | Seo | |
| `isFeatured` | Boolean | |
| `sortOrder` | Number | |

Plugins: sluggable, publishable, softDelete, auditable.
**Indexes:** `{ slug: 1 }` unique partial · `{ status: 1, isDeleted: 1, sortOrder: 1 }` · `{ services: 1 }` · text `{ title: 10, summary: 5 }`.

### 39.12 `projects`

| Field | Type | Notes |
|---|---|---|
| `title*` | String | ≤ 150 |
| `shortDescription*` | String | ≤ 300 |
| `description` | RichText | |
| `client` | { `name`, `industry`, `country`, `logo`: ImageRef, `isConfidential`: Boolean (false) } | When confidential, the public DTO omits `name` and `logo` |
| `category` | ObjectId → `categories` (`type: project`) | |
| `services` | [ObjectId → `services`] | |
| `technologies` | [ObjectId → `technologies`] | |
| `challenge`, `solution` | RichText | |
| `features` | [{ `title*`, `description` }] | |
| `results` | [{ `label*`, `value*`, `description` }] | e.g. "Load time", "−62 %" |
| `coverImage` | ImageRef | |
| `gallery` | [{ `image*`: ImageRef, `caption` }] | |
| `projectUrl`, `repositoryUrl` | String | `http(s)` only; repository shown only if set |
| `startedAt`, `completedAt` | Date | |
| `isFeatured` | Boolean | |
| `sortOrder` | Number | |
| `seo` | Seo | |

Plugins: sluggable, publishable, softDelete, auditable.
**Indexes:** `{ slug: 1 }` unique partial · `{ status: 1, isDeleted: 1, publishedAt: -1 }` · `{ category: 1, status: 1, publishedAt: -1 }` · `{ services: 1, publishedAt: -1 }` · `{ technologies: 1, publishedAt: -1 }` · `{ isFeatured: 1, status: 1, sortOrder: 1 }` · text `{ title: 10, shortDescription: 5, 'client.name': 3 }`.

### 39.13 `authors`

| Field | Type | Notes |
|---|---|---|
| `name*` | String | |
| `slug*` | String | Unique |
| `title` | String | Job title |
| `bio` | String | ≤ 600 |
| `avatar` | ImageRef | |
| `links` | [{ `platform`, `url` }] | |
| `user` | ObjectId → `users` | Optional; never exposed publicly |
| `isActive` | Boolean | Default `true` |

Plugins: auditable. Hard delete, blocked when posts reference the author. **Indexes:** `{ slug: 1 }` unique · `{ user: 1 }` sparse.

### 39.14 `tags`

| Field | Type | Notes |
|---|---|---|
| `name*` | String | |
| `slug*` | String | Unique |

Hard delete removes the tag from posts in the same operation. **Indexes:** `{ slug: 1 }` unique.

### 39.15 `blog_posts`

| Field | Type | Notes |
|---|---|---|
| `title*` | String | ≤ 180 |
| `excerpt` | String | ≤ 320; auto-derived from content when empty |
| `content*` | RichText | |
| `contentVersion` | Number | Default `1` |
| `contentText` | String | Derived plain text; `select: false`; feeds the text index |
| `readingTimeMinutes` | Number | Derived |
| `coverImage` | ImageRef | |
| `author*` | ObjectId → `authors` | |
| `category` | ObjectId → `categories` (`type: post`) | |
| `tags` | [ObjectId → `tags`] | |
| `isFeatured` | Boolean | |
| `seo` | Seo | |

Plugins: sluggable, publishable (with scheduling through future `publishedAt`), softDelete, auditable.
**Indexes:** `{ slug: 1 }` unique partial · `{ status: 1, isDeleted: 1, publishedAt: -1 }` · `{ category: 1, status: 1, publishedAt: -1 }` · `{ tags: 1, publishedAt: -1 }` · `{ author: 1, publishedAt: -1 }` · `{ isFeatured: 1, status: 1, publishedAt: -1 }` · text `{ title: 10, excerpt: 5, contentText: 1 }` with `default_language: 'none'`.

Extensible without redesign: series, co-authors, related posts and further languages are additive fields; comments or reactions would be separate collections.

### 39.16 `media`

| Field | Type | Notes |
|---|---|---|
| `publicId*` | String | Cloudinary public id; unique |
| `resourceType*` | enum `image \| video \| raw` | |
| `deliveryType*` | enum `upload \| private` | Default `upload` |
| `format`, `mimeType` | String | From Cloudinary |
| `bytes*`, `width`, `height` | Number | |
| `version` | Number | Bumped on replace |
| `originalFilename` | String | Display only |
| `title` | String | |
| `alt` | String | Default alt; required for images unless `isDecorative` |
| `isDecorative` | Boolean | Default `false` |
| `caption` | String | |
| `folder` | String | Logical folder in the library |
| `tags` | [String] | |
| `uploadedBy` | ObjectId → `users` | |

Plugins: softDelete, auditable.
**Indexes:** `{ publicId: 1 }` unique · `{ isDeleted: 1, folder: 1, createdAt: -1 }` · `{ resourceType: 1, createdAt: -1 }` · text `{ title, alt, originalFilename, tags }`.
Contact attachments are **not** registered here; they are stored on the contact request.

### 39.17 `contact_requests`

| Field | Type | Notes |
|---|---|---|
| `name*` | String | ≤ 100 |
| `email*` | String | Lowercase |
| `phone`, `company`, `country` | String | |
| `service` | ObjectId → `services` | |
| `serviceName` | String | Snapshot at submission |
| `projectType` | String | Enum from shared constants |
| `budget` | String | Enum range (e.g. `lt_5k`, `5k_20k`, …) |
| `timeline` | String | Enum |
| `subject` | String | ≤ 150 |
| `message*` | String | 10–5,000 characters |
| `preferredContactMethod` | enum `email \| phone \| chat` | |
| `referralSource` | String | "How did you hear about us?" |
| `attachments` | [{ `publicId*`, `filename*`, `mimeType*`, `bytes*` }] | Private Cloudinary assets; ≤ 3 |
| `status*` | enum `new \| in_review \| replied \| closed \| spam` | Default `new` |
| `assignee` | ObjectId → `users` | |
| `notes` | [{ `author`: ObjectId, `body`, `createdAt` }] | Internal only |
| `spam` | { `score`: Number, `reasons`: [String] } | |
| `consent` | { `accepted*`: Boolean, `acceptedAt`: Date, `policyVersion`: String } | |
| `meta` | { `ip`, `userAgent`, `referrer`, `pageUrl`, `locale` (`vi` \| `en`, drives the notification language), `utm`: { `source`, `medium`, `campaign` } } | `ip` kept only as long as needed for abuse handling |
| `notification` | { `status`: enum `pending \| sent \| failed`, `attempts`: Number, `lastError`: String, `sentAt`: Date } | |

Plugins: softDelete.
**Indexes:** `{ status: 1, createdAt: -1 }` · `{ createdAt: -1, _id: -1 }` (cursor pagination) · `{ email: 1 }` · `{ assignee: 1, status: 1 }` · `{ 'notification.status': 1 }` partial where `pending | failed`.
Retention: a scheduled script anonymises or deletes requests older than the period stated in the privacy policy, and destroys their attachments.

### 39.18 `redirects`

| Field | Type | Notes |
|---|---|---|
| `from*` | String | Normalised path (lowercase, no trailing slash, no query); unique |
| `to*` | String | Path or absolute URL |
| `statusCode*` | enum `301 \| 302` | Default `301` |
| `isActive` | Boolean | Default `true` |
| `source` | enum `auto \| manual` | `auto` when created by a slug change |

Plugins: auditable. **Indexes:** `{ from: 1 }` unique. Writes reject loops and flatten chains.

### 39.19 `audit_logs`

Append-only.

| Field | Type | Notes |
|---|---|---|
| `actor*` | { `id`: ObjectId, `email`: String, `roleKeys`: [String] } | Snapshot; `id` null for anonymous events such as failed logins |
| `action*` | String | `resource.verb`, e.g. `service.update`, `blog.publish`, `auth.login.failure` |
| `resource` | { `type`: String, `id`: String, `label`: String } | |
| `changes` | { `fields`: [String], `before`: Mixed, `after`: Mixed } | Values only for whitelisted non-sensitive fields |
| `outcome*` | enum `success \| failure` | |
| `requestId`, `ip`, `userAgent` | String | |
| `createdAt*` | Date | `timestamps: { updatedAt: false }` |

**Indexes:** `{ createdAt: -1, _id: -1 }` · `{ 'resource.type': 1, 'resource.id': 1, createdAt: -1 }` · `{ 'actor.id': 1, createdAt: -1 }` · `{ action: 1, createdAt: -1 }` · optional TTL on `createdAt` (24 months).

---

### 39.20 Summary matrix

| Collection | Slug | Publish status | Soft delete | Audited | Unique constraints |
|---|---|---|---|---|---|
| users | | | ✔ | ✔ | email |
| roles | | | | ✔ | key |
| sessions | | | | | tokenHash |
| auth_tokens | | | | | tokenHash |
| site_settings | | | | ✔ | key |
| pages | | | | ✔ | key |
| navigation_menus | | | | ✔ | key |
| categories | ✔ | visibility flag | | ✔ | type + slug |
| technologies | ✔ | ✔ | ✔ | ✔ | slug (partial) |
| services | ✔ | ✔ | ✔ | ✔ | slug (partial) |
| solutions | ✔ | ✔ | ✔ | ✔ | slug (partial) |
| projects | ✔ | ✔ | ✔ | ✔ | slug (partial) |
| authors | ✔ | active flag | | ✔ | slug |
| tags | ✔ | | | | slug |
| blog_posts | ✔ | ✔ + schedule | ✔ | ✔ | slug (partial) |
| media | | | ✔ | ✔ | publicId |
| contact_requests | | workflow status | ✔ | (status changes) | — |
| redirects | | active flag | | ✔ | from |
| audit_logs | | | never deleted | — | — |
