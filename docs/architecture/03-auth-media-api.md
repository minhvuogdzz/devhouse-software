# Part C — Authentication, Authorization, Media, REST API (§16–§19)

[← Index](README.md)

---

## 16. Authentication

Diagram: [§43.8](09-diagrams.md#438-authentication-flow). (ADR-004)

### 16.1 Options evaluated

| Option | Revocation | Complexity | XSS exposure | Fit |
|---|---|---|---|---|
| JWT in `localStorage` / memory + Authorization header | Hard (needs a deny-list) | Medium | **Token readable by any injected script** | Rejected |
| JWT access (short) + rotating refresh token, both in HttpOnly cookies | Delayed by access-token lifetime unless a per-request check is added | **High**: rotation, reuse detection, concurrent-refresh races across tabs, two secrets | Not readable | Viable; more moving parts than needed |
| **Opaque server-side session in an HttpOnly cookie** | **Immediate** (delete the row) | **Low** | Not readable | **Chosen** |

**Reasoning.** The only authenticating client in MVP is a first-party browser SPA on its own host. The usual argument for JWT is stateless verification across services or third-party clients; neither exists here. A session lookup costs one indexed read that is cached in process for 30 seconds. In exchange: logout and "revoke all sessions" are exact, there is no signing key to leak or rotate, and no refresh choreography to get wrong.

**Future implication.** When a mobile app, public API or client portal arrives, a token strategy (OAuth 2.1 / short-lived JWT) is added as a second implementation behind the same `authenticate` middleware interface, which only promises to populate `req.auth`. Nothing built now has to change.

**Fallback if the team mandates JWT:** access token 10–15 min + opaque rotating refresh token stored hashed with family-based reuse detection, both in HttpOnly cookies, refresh cookie scoped to `/api/v1/auth`. The rest of this section (cookies, CSRF, RBAC) applies unchanged.

### 16.2 Session design

| Aspect | Design |
|---|---|
| Token | 256-bit random value from a CSPRNG, base64url. Sent only in the cookie. |
| Storage | `sessions` collection stores **SHA-256(token)**, never the token. A database leak yields no usable sessions. |
| Cookie | `__Host-dh_sid`; `HttpOnly; Secure; SameSite=Strict; Path=/`; no `Domain` attribute (host-only to `admin.devhouse.example`) |
| Idle timeout | 8 hours sliding; `lastUsedAt` written at most once every 5 minutes |
| Absolute timeout | 7 days, then re-authentication |
| Expiry cleanup | TTL index on `expiresAt` |
| Lookup cache | In-process LRU, 30 s TTL, evicted on logout / revoke / role change |
| Rotation | New session id on login and on password change (prevents fixation) |
| Revocation | Logout deletes the session. Password change, role change, user disable → delete **all** of that user's sessions |
| Visibility | A user can list and revoke their own sessions (device, IP, last used) |

### 16.3 Passwords

- **Argon2id** with OWASP-recommended parameters (at minimum 19 MiB memory, 2 iterations, 1 lane; raise memory as VPS headroom allows). Parameters are stored in the hash so they can be increased later with rehash-on-login.
- Policy: minimum 12 characters, maximum 128, checked against a common-password list. No forced composition rules or periodic rotation.
- `passwordHash` has `select: false` and never appears in a DTO or a log.

### 16.4 Login protection

| Control | Detail |
|---|---|
| Edge rate limit | Nginx `limit_req` on `/api/v1/auth/*` per IP |
| App rate limit | Per IP and per email (sliding window) |
| Account lockout | After 5 consecutive failures: lock with increasing duration (`failedLoginCount`, `lockUntil` on the user). Stored in MongoDB so it survives restarts. |
| Enumeration resistance | Identical message and comparable timing for unknown email and wrong password (a dummy hash is verified when the user does not exist). Forgot-password always answers "if the account exists…". |
| Audit | `auth.login.success`, `auth.login.failure`, `auth.lockout`, `auth.logout`, `auth.password.changed`, `auth.session.revoked` |
| Alerting | [Recommended] error-tracker alert on a burst of failures |

### 16.5 CSRF

Cookie authentication requires CSRF defence. Three layers, no token needed:

1. `SameSite=Strict` host-only cookie: never sent on cross-site requests.
2. **Origin check middleware** on every state-changing request: `Origin` (or `Sec-Fetch-Site`) must match the configured admin origin; otherwise `403`.
3. Admin API accepts only `application/json` bodies. A cross-origin form cannot produce that content type without a CORS preflight, and CORS is not enabled.

### 16.6 Password reset

1. `POST /auth/password/forgot` with an email → always `202`.
2. If the user exists and is active: create an `auth_tokens` row (`type: password_reset`, hashed token, 30-minute TTL), email a link to `admin.devhouse.example/reset-password?token=…`.
3. `POST /auth/password/reset` with token + new password → verify hash, single use, set password, delete all sessions, audit.

Until SMTP is configured, a Super Admin can trigger a reset from the Users module or run the `create-admin` / `reset-password` script on the server.

### 16.7 First administrator

A CLI script (`yarn workspace @devhouse/api create-admin`) creates the first Super Admin if none exists, taking the email from the environment and prompting for (or generating) a password that must be changed at first login. There is no default credential in code or seed data.

### 16.8 MFA readiness

**[Future — designed now, built in Phase 2].** The login response contract already allows a two-step flow: `POST /auth/login` may return `{ mfaRequired: true, challengeId }` instead of a session, followed by `POST /auth/mfa/verify`. The user schema reserves `mfa.enabled`, an encrypted TOTP secret and hashed recovery codes. Enabling MFA later requires no migration of existing users and no change to the admin's auth flow shape.

### 16.9 Secrets in the frontend

None. The admin bundle contains no keys. The only values the browser ever receives are the Cloudinary cloud name, API key (public by design) and short-lived upload signatures.

---

## 17. Authorization / RBAC

### 17.1 Model

```
User ──(many)──► Role ──(embeds)──► permission keys  (strings defined in code)
```

- **Permission keys** have the form `resource:action`, defined in `@devhouse/shared/permissions.js`. The catalog (key, label, group, description) is the single source for the API middleware, the role editor and the admin's `usePermission`.
- **Roles** are documents: `key`, `name`, `description`, `permissions[]`, `isSystem`.
- **Users** hold `roles[]`. Effective permissions are the union. There are no per-user permission overrides in MVP (they make access hard to reason about).

### 17.2 Permission catalog (MVP)

| Resource | Actions |
|---|---|
| `dashboard` | `read` |
| `pages`, `settings`, `navigation` | `read`, `update` |
| `services`, `solutions`, `projects`, `technologies`, `blog` | `read`, `create`, `update`, `delete`, `publish` |
| `categories`, `tags`, `authors`, `redirects` | `read`, `manage` |
| `media` | `read`, `upload`, `update`, `delete` |
| `contact` | `read`, `update`, `delete`, `export` |
| `users` | `read`, `create`, `update`, `delete`, `assign-roles` |
| `roles` | `read`, `manage` |
| `audit` | `read` |

`*` is a wildcard held only by the system Super Admin role.

### 17.3 Seeded roles

Roles are data, so these are starting points rather than a fixed list. The brief's "Content Manager" and "Developer" are omitted from the seed because they duplicate Editor/Admin; they can be created in the UI in a minute if wanted.

| Role | `isSystem` | Permissions |
|---|---|---|
| Super Admin | yes (cannot be edited or deleted) | `*` |
| Admin | no | Everything except `roles:manage` |
| Editor | no | All content resources including `publish`; `media:*`; `categories/tags/authors:manage`; no users, roles, settings |
| Support | no | `dashboard:read`, `contact:read`, `contact:update` |

### 17.4 Enforcement

```js
router.patch('/:id',
  authenticate,
  requirePermission('services:update'),
  validate(schemas.service.update),
  controller.update);
```

- `authenticate` resolves the session and loads the user's effective permission set (cached with the session, 30 s).
- `requirePermission` returns `403 FORBIDDEN` with the missing key in `details` (admin audiences only).
- Publishing is checked **inside the service** as well: changing `status` to `published` requires `*:publish` even when the request arrives through the generic update endpoint.
- Every `/api/v1/admin/*` route must declare a permission. A test walks the router and fails the build if any admin route lacks `authenticate` + `requirePermission`.

### 17.5 Privilege-escalation guards (service layer)

- A user cannot change their own roles or disable themselves.
- A user can assign only roles whose permissions are a subset of their own.
- System roles cannot be modified or deleted; a role in use cannot be deleted.
- The last active Super Admin cannot be deleted, disabled or demoted.
- Any role or role-assignment change deletes the affected users' sessions and is audited with before/after role keys.

### 17.6 Future extension points

| Need | How it fits |
|---|---|
| "Authors can edit only their own posts" | Ownership predicate in the service (`createdBy === actor.id`) guarded by a second key such as `blog:update-own`. [Phase 2] |
| Customer accounts / client portal | A separate principal type with its own roles and route namespace (`/api/v1/portal`); the middleware interface is shared. [Phase 3] |
| Multi-tenant | Add `tenantId` to the request context and to repository scopes. [Phase 3] |

---

## 18. Cloudinary / Media Architecture

Diagram: [§43.7](09-diagrams.md#437-cloudinary-upload-architecture). (ADR-005)

### 18.1 Upload options

| Option | Secret exposure | API load | Server-side validation | Verdict |
|---|---|---|---|---|
| Unsigned upload preset from the browser | None, but **anyone can upload** to the account | None | None | Rejected |
| **Signed direct upload** (API signs parameters, browser uploads to Cloudinary) | None | None | Constraints are baked into the signature; result verified afterwards | **Chosen for authenticated admin uploads** |
| **Backend proxy** (browser → API → Cloudinary) | None | Upload passes through the VPS | Full (magic bytes, size) | **Chosen for anonymous contact attachments only** |

Anonymous visitors are never given upload signatures: a signature is a capability to write to the account.

### 18.2 Admin upload flow (signed direct)

1. Admin requests `POST /api/v1/admin/media/signature` with `{ folder, resourceType, filename }`. Requires `media:upload`.
2. API decides everything security-relevant itself: `public_id` (server-generated: `<prefix>/<folder>/<slug>-<random>`), `folder`, `overwrite=false`, `allowed_formats`, `timestamp`. It signs those parameters with `CLOUDINARY_API_SECRET` and returns `{ cloudName, apiKey, timestamp, signature, params }`. The signature is valid for a short window.
3. Browser posts the file and the signed parameters to Cloudinary's upload endpoint. Any parameter the browser alters invalidates the signature.
4. Browser sends Cloudinary's response to `POST /api/v1/admin/media`.
5. API **verifies** the upload (validates the response signature for `public_id` + `version`, or fetches the resource through the Admin API), checks the `public_id` is inside the allowed prefix, and stores authoritative metadata from Cloudinary, not from the browser.
6. Unregistered uploads (step 4 never happened) are found and removed by a periodic reconcile script. [Recommended]

### 18.3 Contact attachment flow (proxy)

- Multipart to `POST /api/v1/contact`, parsed in memory with hard limits (count ≤ 3, size ≤ 10 MB each; matching `client_max_body_size` on that location only).
- Type determined from **magic bytes** (`file-type`), not from the filename or the client's `Content-Type`. Allow-list: PDF, PNG, JPEG, WebP, DOCX, XLSX, PPTX, TXT, ZIP. Executables, scripts, SVG and HTML are refused.
- Uploaded as `resource_type: raw|image`, **`type: private`**, into `<prefix>/contact-attachments/`. They have no public URL.
- An admin with `contact:read` requests `GET /admin/contact-requests/:id/attachments/:attachmentId/url`; the API returns a short-lived signed download URL with forced attachment disposition. Files are never rendered inline on a Dev House origin.
- Residual risk: no malware scanning in MVP. Mitigated by the allow-list, private storage, forced download and admin awareness. A scanning step (Cloudinary add-on or ClamAV sidecar) is **[Phase 2]**.
- Account setting to check: Cloudinary may block PDF/ZIP delivery by default on some plans; enable it or attachments will not download.

If attachments are not needed on day one, ship the form without them; nothing else depends on this flow.

### 18.4 Organisation

| Aspect | Convention |
|---|---|
| Environment separation | Folder prefix per environment: `devhouse/prod`, `devhouse/staging`, `devhouse/dev` (`CLOUDINARY_FOLDER_PREFIX`). Separate Cloudinary product environments if the plan allows. |
| Physical folders | `site/`, `services/`, `solutions/`, `projects/`, `technologies/`, `blog/`, `authors/`, `contact-attachments/` (private) |
| Public IDs | Server-generated, lowercase, no client filename trust, never reused for a different asset |
| Logical organisation in Admin | `folder` and `tags` fields on the `media` document, independent of the physical path |

### 18.5 Delivery and transformations

- Only the `publicId` is stored. URLs are built at render time by one helper in `@devhouse/shared` (`cldUrl(publicId, { width, aspectRatio, crop })`), so delivery policy can change without a data migration.
- Every image URL uses `f_auto` (AVIF/WebP negotiated per browser) and `q_auto`.
- The `<Image>` component emits `srcset` from a **fixed width ladder** (320, 480, 640, 768, 1024, 1280, 1600, 1920) plus `sizes`, `width`/`height` (no layout shift), `loading="lazy"` and `decoding="async"` by default, and `fetchpriority="high"` for the LCP image. A fixed ladder bounds the number of derived assets and therefore cost.
- Cropping uses `c_fill` with `g_auto` for cards and heroes, `c_limit` for content images.
- Open Graph images use a fixed 1200×630 transformation.
- **[Recommended hardening]** Enable Cloudinary *Strict Transformations* and allow only the ladder and named transformations, so third parties cannot generate arbitrary transformations against the account's quota.

### 18.6 Media ↔ content relationship

```
Cloudinary asset  ◄── publicId ──  media document  ◄── mediaId ──  ImageRef snapshot inside content
```

- Content stores an `ImageRef` snapshot: `{ mediaId, publicId, width, height, format, alt }`. Public reads need no join.
- The admin sends only `mediaId` (and an optional per-use `alt`). **The API fills the snapshot from the `media` collection**, so a client cannot point content at an arbitrary Cloudinary asset.
- Each model registers its media paths (e.g. `heroImage`, `gallery.*.image`, `seo.ogImage`, rich-text image nodes). The registry powers:
  - **Usage lookup:** "where is this used?" scans the registered paths (collections are small; this is an admin-only operation).
  - **Delete:** blocked with `409 MEDIA_IN_USE` and the list of usages, unless forced by a user with `media:delete` who confirms. Then: soft-delete the document, `destroy` the Cloudinary asset with CDN invalidation.
  - **Replace:** upload under the **same `public_id`** with overwrite + invalidate, bump `version` on the media document, refresh snapshots' dimensions through the registry. URLs do not change, so content needs no edits. CDN invalidation can take several minutes.
- Alt text: the library holds a default; a usage may override it. Decorative images use empty alt explicitly.

### 18.7 Access control summary

| Asset class | Cloudinary type | Who can read |
|---|---|---|
| Site, content and blog images | `upload` (public CDN) | Anyone |
| Contact attachments | `private` | Admin with `contact:read`, through short-lived signed URLs |
| Upload capability | — | Admin with `media:upload`, through short-lived signatures |
| `CLOUDINARY_API_SECRET` | — | API container only |

---

## 19. REST API Architecture

Endpoint table: [§40](07-api-endpoint-map.md). (ADR-003)

### 19.1 Namespaces

| Prefix | Audience | Auth | Cache | Reachable on host |
|---|---|---|---|---|
| `/api/v1/…` | Public site | None | Public, short TTL | `www`, `admin` |
| `/api/v1/auth/…` | Admin users | Session (except login / forgot / reset) | `no-store` | `admin` only |
| `/api/v1/admin/…` | Admin users | Session + permission | `no-store` | `admin` only |
| `/api/v1/health…` | Monitors, deploy script | None | `no-store` | both |

**Why split public and admin routes instead of one resource path with conditional behaviour:** the two audiences need different representations (published + resolved + lean vs. drafts + all fields + audit metadata), different caching, different rate limits and different exposure. Separate route files make it impossible to leak a draft through a forgotten `if`, and let Nginx refuse the whole admin surface on the public host.

### 19.2 Versioning

- URL versioning: `/api/v1`. Additive changes (new fields, new endpoints, new optional parameters) do not bump the version.
- A breaking change introduces `/api/v2` for the affected module while `/v1` keeps working through a deprecation window. Because both clients ship from the same repository, v2 should be rare; the version prefix exists mainly for future external clients.

### 19.3 Success contract

```json
{
  "success": true,
  "data": { },
  "meta": { "requestId": "…" }
}
```

List responses:

```json
{
  "success": true,
  "data": [ ],
  "meta": {
    "requestId": "…",
    "pagination": { "page": 1, "limit": 20, "total": 57, "totalPages": 3, "hasNext": true }
  }
}
```

Cursor lists use `"pagination": { "limit": 50, "nextCursor": "…" | null }`.

The brief's envelope is kept. RFC 9457 Problem Details was considered for errors; the envelope is preferred because both consumers are first-party, a boolean discriminator keeps the client wrapper trivial, and the same information (`code`, `message`, `details`) is present. `meta.requestId` is added for support and log correlation.

### 19.4 Error contract

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "details": [ { "path": "body.email", "code": "invalid_format", "message": "Enter a valid email address." } ],
    "requestId": "…"
  }
}
```

| HTTP | `code` | When |
|---|---|---|
| 400 | `BAD_REQUEST`, `MALFORMED_JSON` | Unparseable request |
| 401 | `UNAUTHENTICATED`, `INVALID_CREDENTIALS`, `SESSION_EXPIRED` | No or invalid session |
| 403 | `FORBIDDEN`, `ORIGIN_NOT_ALLOWED`, `ACCOUNT_DISABLED` | Authenticated but not allowed |
| 404 | `NOT_FOUND`, `ROUTE_NOT_FOUND` | Unknown resource or route |
| 409 | `CONFLICT`, `SLUG_TAKEN`, `STALE_UPDATE`, `MEDIA_IN_USE`, `RESOURCE_IN_USE` | State conflict |
| 413 | `PAYLOAD_TOO_LARGE` | Body or file too large |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | Wrong content type or file type |
| 422 | `VALIDATION_ERROR` | Schema validation failed |
| 423 | `ACCOUNT_LOCKED` | Login lockout |
| 429 | `RATE_LIMITED` | With `Retry-After` |
| 500 | `INTERNAL_ERROR` | Unexpected; message is generic |
| 502 / 503 | `UPSTREAM_ERROR`, `SERVICE_UNAVAILABLE` | Cloudinary / database unavailable |

Rules: codes are defined once in `@devhouse/shared/error-codes.js`; messages are safe for end users; stack traces, Mongo error text and internal ids never leave the process in production; every 5xx is logged with its stack and request ID. Mongoose errors are mapped (duplicate key → `409`, cast error → `404`/`422`, validation → `422`).

### 19.5 Validation

**Zod**, chosen over the alternatives:

| Library | Assessment |
|---|---|
| **Zod** | Schema-as-code, composable, runs identically in Node and the browser, integrates with react-hook-form, can generate OpenAPI. Schemas double as documentation. **Chosen.** |
| Joi | Mature and capable; heavier in the browser and less natural to share with React forms. |
| Yup | Form-oriented; weaker for strict API input and unions. |
| express-validator | Chain-per-route style couples validation to Express and cannot be shared with the frontend. |

One `validate({ params, query, body })` middleware parses each part with its schema and places the result on `req.valid`. Controllers read only `req.valid`.

- Object schemas strip unknown keys (mass-assignment protection).
- Strings are trimmed and length-limited; ids are validated as ObjectId strings; enums come from shared constants.
- Query parameters are coerced from strings (`page`, `limit`, booleans) with bounds.
- Create and update schemas are derived from one base (`base`, `base.partial()`), not written twice.
- File metadata (count, size, detected type) is validated by a schema after multipart parsing.
- Auth inputs have their own strict schemas with tight length limits.

### 19.6 Standard resource pattern

Every collection resource follows the same shape, so the endpoint map in §40 is mostly this pattern repeated:

| Operation | Public | Admin |
|---|---|---|
| List | `GET /<resource>` (published only, list DTO) | `GET /admin/<resource>` (all statuses, filterable) |
| Read | `GET /<resource>/:slug` | `GET /admin/<resource>/:id` |
| Create | — | `POST /admin/<resource>` |
| Update | — | `PATCH /admin/<resource>/:id` (partial; includes `updatedAt` for conflict detection) |
| Publish state | — | `PATCH /admin/<resource>/:id/status` |
| Reorder | — | `PATCH /admin/<resource>/reorder` |
| Delete / restore | — | `DELETE /admin/<resource>/:id` (soft), `POST /admin/<resource>/:id/restore` |

Public resources are addressed by **slug**; admin resources by **id** (slugs can change).

### 19.7 Conventions

- JSON only (`application/json`), except multipart on `POST /contact`.
- `camelCase` fields, ISO 8601 UTC timestamps, string ids.
- `PATCH` is partial update; `PUT` is used only where the whole value is replaced (settings, page overrides, menus).
- `201` + `Location` on create, `204` on delete, `202` for accepted-async (forgot password).
- Public `GET` responses carry `Cache-Control` and `ETag`; admin responses carry `Cache-Control: no-store`.
- Body size limit 100 kB by default, 1 MB on rich-text endpoints.
- OpenAPI document generated from the Zod schemas and served at `/api/v1/docs` in non-production environments. [Recommended]
