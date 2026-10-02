# Task — Fixes after the MVP pass (round 1)

Context: the MVP is built and `yarn install --immutable`, `yarn lint`, `yarn format:check`, `yarn test` (102 tests) and `yarn build` all pass. A live check against a running API and web server found the issues below. Fix them all in one pass, commit per item, keep lint, tests and build green. Rules in `GEMINI.md` still apply. Do not stop for approval.

## 1. Root `.env` is never loaded (blocker)

`apps/api/src/config/index.js` calls `dotenv.config()` with no path. Both `yarn dev` and `yarn workspace @devhouse/api start` run with the working directory `apps/api`, so the repository-root `.env` is ignored and the API silently uses defaults (`mongodb://localhost`). The root `.env` now points to MongoDB Atlas and must be honoured.

- Load the root `.env` regardless of the working directory (resolve the path from the file location). Apply the same fix to `apps/api/seeds/index.js`, `apps/api/scripts/create-admin.js` and the `web` server if it reads env.
- Do not silently fall back to a local database in `development` when `MONGODB_URI` is missing: log which URI host and database name is being used at startup (never the password).
- Add a test for the loader.

## 2. Unknown URLs return HTTP 200 instead of 404

`GET /does-not-exist`, `/en/does-not-exist` and `/404` return `200` with the "not found" page. They must return real **404** status codes (architecture §14.6, §20.6). Same check for an unknown detail slug such as `/services/nope`. Also resolve the `redirects` collection in the catch-all before returning 404.

## 3. Head metadata is incomplete

On `/services` the HTML head only has `<title>` and `<meta name="description">`. Per §20.3–20.6 and §30.6 every public page needs, in the server-rendered HTML: `rel="canonical"`, `rel="alternate" hreflang` for `vi`, `en` and `x-default` (only for languages the page exists in), Open Graph (`og:title`, `og:description`, `og:type`, `og:url`, `og:locale`, `og:locale:alternate`), Twitter card tags, `robots` where relevant, and the JSON-LD blocks listed in §20.4. `hreflang` already exists in the sitemap; do the same in the page head. Add a test that renders a page and asserts these tags.

## 4. Public API leaks internal fields

`GET /api/v1/services?locale=en` returns raw Mongoose documents including `__v`, `createdBy`, `deletedAt`, `deletedBy`, `_id` structure and other internals. Public endpoints must return explicit DTOs (§10.1, §19), with only the fields the website needs, and flattened to the requested locale. Apply to every public endpoint (services, solutions, projects, technologies, categories, blog, authors, pages, site). Add a test that fails if a public response contains `__v`, `createdBy`, `updatedBy`, `isDeleted`, `deletedAt`, `deletedBy` or `passwordHash`.

## 5. Monospace fonts used outside code blocks (rule P5)

`font-mono` is used in many admin screens (`AuditLogListPage`, `TechnologyListPage`, `SolutionListPage`, `ProjectListPage`, `ServiceListPage`, `RoleListPage`, `RoleEditorPage`, `UserEditorPage`, `CategoryManagerPage`, and others) and `--font-mono` is defined in the shared theme. Rule P5 forbids monospace anywhere except a real code block inside a blog article. Remove `font-mono` from all UI (use the normal text font; use tabular numerals where alignment is needed). Keep a monospace token only for `RichTextRenderer` code blocks and make sure it is not loaded on pages without one. Add a lint rule or a test that fails if `font-mono` appears outside the rich-text renderer.

## 6. Plain business language (rule P5)

Re-read all default copy in `packages/content` in both languages and rewrite anything that is jargon-heavy, for example headings like "Góc nhìn Kỹ thuật & Kiến trúc Phần mềm" and "Dịch vụ Kỹ thuật & Phát triển Phần mềm", and phrases about "hạ tầng đám mây", "architecture", "system modernization". Describe what the client gets, in short everyday sentences; keep a technical term only when needed and explain it in a few words. Vietnamese must read as natural Vietnamese. Keep the English and Vietnamese versions equivalent.

## 7. Password hashing deviates from the architecture

The API uses `bcryptjs`; the architecture (§16.3) specifies Argon2id. Switch to `argon2` (Argon2id, parameters from §16.3) with rehash-on-login support for any existing bcrypt hash. If a native module cannot be built for the Docker base image, keep bcryptjs, and record the reason in `docs/tasks/DECISIONS.md` instead.

## 8. Housekeeping

- Move `CODEOWNERS` from the repository root to `.gitlab/CODEOWNERS`.
- Add `legacy/` to `.prettierignore`, `.dockerignore`, ESLint ignores, Vitest excludes and CI `rules: changes` if it is not there yet.
- Docker is not installed on this machine, so the Docker acceptance checks were never run. Review the three Dockerfiles, `infra/nginx`, and both Compose files by reading them against §32–§33, and fix any mistake you can find by inspection (paths, copied files, ports, health checks, user, read-only filesystem). State plainly in the report that they were not built.
- Run the "empty database" acceptance checks of `docs/tasks/mvp-build.md` against the database configured in `.env` and report each result.

## 9. `create-admin` uses a hardcoded default password (security)

`apps/api/scripts/create-admin.js` falls back to a fixed password written in the source code and prints it to the log. Architecture §16.7 forbids default credentials in code or seed data. Change it so that:

- The password comes from `SEED_ADMIN_PASSWORD`, or is generated randomly (at least 16 characters) when the variable is absent; it is shown once on the terminal and never written to the log file or the repository.
- It refuses to use a password shorter than the policy in §16.3 (minimum 12 characters).
- The created user has `mustChangePassword: true`.
- Remove the old hardcoded value from the source and from any documentation under `docs/` and `README.md`.
- Update `docs/development/setup.md` with the new way to create the first administrator.

## Final report

For each of the 8 items: what changed, the check you ran, and the result. List anything not fixed and why.
