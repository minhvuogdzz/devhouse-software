# Dev House Software — instructions for the implementing agent

You are building this project. The architecture is already decided and documented; build what the task file asks for, in line with it.

## Source of truth

1. `docs/architecture/README.md` — index of the Architecture Design Document, including the three project-wide rules. Read it first.
2. The part files it links to. Read the relevant sections before writing each area.
3. `docs/tasks/mvp-build.md` — the current task.

## Project-wide rules (apply to everything you build)

**P1 — Light and dark themes.** Every page and admin screen works in both. A theme switch sits in the header of both apps. Use semantic colour tokens (`bg-surface`, `text-fg`, …) from the shared theme; never raw palette classes (`bg-white`, `text-gray-900`). Default follows the system; choice stored in `localStorage`; no flash on load. See §9.8.

**P2 — Vietnamese and English.** Everything user-visible exists in both languages. A language switch sits in the header of both apps. Never hardcode a user-visible string in a component: UI text goes through `t('key')` with `locales/vi.js` and `locales/en.js`; content fields are `{ vi, en }` maps. Public URLs: Vietnamese unprefixed, English under `/en`. A page never mixes languages. See §30.

**P3 — Minimal placeholder data, no placeholder images.** Default content is short, real text in both languages. Do not add stock photos, generated or placeholder images, placeholder-image URLs, lorem ipsum, or invented projects, posts, clients, testimonials, team members or statistics. Image fields are empty by default and every component must look right without an image. Use icons, typography and layout for visual interest. See §13.5.

**P5 — A commercial website, not a developer tool.** The audience is business owners and decision-makers, not engineers.

- **No code-style typography.** Monospace or "terminal/code" fonts are not used for headings, body text, navigation, buttons, labels, numbers, eyebrows or decoration, in the website or the admin. The only place a monospace font may appear is an actual code block inside a blog article. No terminal windows, code snippets, `</>`-style motifs, command prompts, ASCII art or "hacker" styling as decoration.
- **Plain business language.** Default copy in both languages describes what the client gets (outcomes, benefits, process, trust), in short everyday sentences. Avoid stacking technical terms, acronyms and buzzwords. Technology names belong on the Technologies page and in project details, each with a plain-language note of what it is for; they do not carry the marketing copy. When a technical term is unavoidable, explain it in a few words. Vietnamese copy is natural Vietnamese, not English jargon left untranslated.

## P4 — Design: use the Hallmark skill for all UI

All visual design in `apps/web` and `apps/admin` is produced with the **`hallmark` skill**. Do not design by default habits.

- **Before writing any UI** (at the start of the theme work in M2), run Hallmark's default build process once for the whole product: survey the genre (a software/technology company site, plus its admin tool), choose the macrostructure, define the OKLCH palette and the 2+1 type system. Record the result in `docs/design/design-system.md` so every later screen follows the same system.
- **Build every page, section and admin screen** according to that system, and run the work through Hallmark's slop-test gates before considering a screen done.
- **At the end** (M14), run `hallmark audit` on the home page, one list page, one detail page, the contact page, and the admin shell with one list and one form screen. Fix what it flags and include the audit result in the final report.

**Brand colour: blue.** Blue is the Dev House colour and is the `primary` token in both apps. Hallmark builds the palette around it; it does not choose a different primary hue. Until an exact brand value is supplied, pick one considered blue in OKLCH (hue roughly 250–265), derive its light-theme and dark-theme variants plus the `primary-fg` that passes AA on it, and record the values in `docs/design/design-system.md` under "Brand blue (provisional)" so it can be swapped in one place. Neutrals and any accent are chosen to support the blue, not compete with it.

Hallmark's output must fit the project rules, which take precedence when they conflict:

- **P1:** the OKLCH palette is defined for **both light and dark** and expressed as the semantic tokens of the shared theme (`packages/config/tailwind/theme.css`). Components use those tokens only. Contrast meets WCAG AA in both themes.
- **P2:** the chosen fonts must fully support **Vietnamese diacritics** and are self-hosted as WOFF2. Layouts must hold with both Vietnamese and English text lengths.
- **P3:** the design gets its character from typography, colour, spacing and layout. **No stock, generated or placeholder images**, and no invented content to fill a layout.
- Structure stays as the architecture defines it: the section registry, templates and routes are fixed; Hallmark decides how they look, not which sections or pages exist.
- **P5:** in the 2+1 type system, the "+1" is **not** a monospace or code-style face. Choose a commercial, editorial pairing (a display face and a text face, both with Vietnamese support). A monospace font is loaded only on blog articles that contain code blocks.
- Accessibility (§23) and performance budgets (§21) still apply: at most two font families on any page, no heavy animation libraries.

## Fixed decisions (do not change)

- Monorepo with Yarn 4 workspaces, `nodeLinker: node-modules`. Package scope `@devhouse/*`.
- JavaScript with ES modules everywhere. No TypeScript source files.
- `apps/web`: React Router in framework mode (Vite plugin) with `ssr: true`.
- `apps/admin`: Vite + React SPA using React Router's data router.
- `apps/api`: Express 5, Mongoose, REST under `/api/v1`. Admin routes under `/api/v1/admin`.
- Tailwind CSS 4, TanStack Query 5, Zod for all validation.
- Authentication is server-side sessions in an HttpOnly cookie. No JWT.
- Browsers call the API same-origin at `/api/v1`. No CORS middleware.
- MongoDB Atlas is external in production (a local MongoDB container for development). Cloudinary for media.
- No Redis, message queues, GraphQL, microservices or Kubernetes.

## Rules for all code

- API layering: route → middleware (authenticate, authorize, validate) → controller → service → repository → model. Controllers contain no business logic. Services do not touch `req`/`res`. A module's model is private to that module.
- Every `/api/v1/admin/*` route has `authenticate` and `requirePermission`.
- In the frontends, `fetch` is called only in `lib/api-client.js`. Components use query-option factories.
- Schemas and contracts live in `packages/shared` and `packages/content`, not duplicated in apps.
- `packages/*` must be isomorphic: no `fs`, no `window`, no Mongoose. Packages never import from `apps/*`.
- No secrets in code, images or frontend bundles. Use placeholders and `.env.example`.
- Never store or render raw HTML from user input. No `dangerouslySetInnerHTML`.
- Keep files small and module-scoped. No giant shared route, component or utils file.
- Follow the folder structure in `docs/architecture/05-infrastructure-delivery.md` §38.

## Working method

- Work through the task in one continuous pass. **Do not stop to ask for approval between milestones.**
- When something is unspecified, choose the simplest option consistent with the architecture, note it in `docs/tasks/DECISIONS.md` (one line each), and continue. Stop only for a real blocker that makes further work impossible.
- Commit after each milestone with a Conventional Commit message. Keep the build, lint and tests passing at each commit.
- **Git:** keep working exactly as you are: on the local `main` branch of this folder, with **no remote**. Do not add a remote, rename or switch branches, rebase, or rewrite history. In `.gitlab-ci.yml`, never hardcode the registry path: use GitLab's predefined variables (`$CI_REGISTRY`, `$CI_REGISTRY_IMAGE`, `$CI_COMMIT_SHORT_SHA`). In Compose and deploy scripts, the registry path is a variable (`REGISTRY`), with `registry.gitlab.com/thedevhouse/web-repo` as the documented value.
- **Reserved folder `legacy/`:** the code will later be merged into the existing GitLab project `thedevhouse/web-repo`, which holds three old inactive projects. The coordinator will place them under `legacy/` at that point; you do not create or fetch them. Make sure `legacy/` is excluded now from ESLint, Prettier (`.prettierignore`), Vitest, `.dockerignore` and CI `rules: changes`, so nothing breaks when it appears. Never read from, edit or reuse anything under `legacy/`.
- Do not push. Do not deploy or create remote repositories or cloud resources.
- At the end, run the acceptance checks in the task file, fix what fails, and give the final report described there.
