# Dev House Software

Official corporate website, admin CMS, and API for Dev House Software.

Built as a content-driven modular monolith with:

- **apps/web**: Public website using React Router 7 framework mode with Server-Side Rendering (SSR) and Tailwind CSS 4.
- **apps/admin**: Internal administration CMS SPA using React 19, Vite, React Router 7, and TanStack Query 5.
- **apps/api**: REST API using Express 5, Mongoose 8, structured in clean domain modules.
- **packages/shared**: Shared schemas (Zod), permissions, error codes, and utilities.
- **packages/content**: Code-first default content definitions, section descriptors, and resolution engine.
- **packages/config**: Shared Tailwind CSS theme tokens, ESLint, Prettier, and test configurations.

---

## Project-wide Rules

1. **P1 — Light and Dark Themes**: Every screen supports light and dark modes with zero flash-on-load. Semantic design tokens (`bg-surface`, `text-fg`, `bg-primary`, etc.) are used exclusively.
2. **P2 — Vietnamese and English**: Fully bilingual from day one. Unprefixed URLs for Vietnamese (`/`) and `/en` prefix for English.
3. **P3 — Minimal Placeholder Data, No Placeholder Images**: Default content uses concise, realistic text. No fake metrics, no stock photos, and no broken placeholder images. Every component renders gracefully without images.
4. **P4 — Hallmark Anti-AI-Slop Design**: All UI adheres to the custom design system documented in `docs/design/design-system.md`, with Dev House brand blue as the primary color.
5. **P5 — Commercial Website**: Copy is written in plain business language focused on client outcomes and trust. No code-style typography or programmer motifs outside actual blog code snippets.

---

## Quickstart (5-Minute Local Setup)

### Prerequisites

- Node.js 22+ (v24 LTS recommended, see `.nvmrc`)
- Yarn 4+ (`nodeLinker: node-modules`)
- Local MongoDB running on port 27017 (or run `docker compose up -d mongodb`)

### 1. Install dependencies

```bash
yarn install
```

### 2. Environment Configuration

```bash
cp .env.example .env
```

### 3. Seed Database & Create Admin User

```bash
yarn workspace @devhouse/api seed
node apps/api/scripts/create-admin.js
```

The admin password is generated randomly and printed once to the terminal.
Set `SEED_ADMIN_PASSWORD` in `.env` or inline to supply your own (min 12 chars).

### 4. Start Development Servers

```bash
yarn dev
```

The apps will be available at:

- Public Website (`web`): `http://localhost:3000` (Vietnamese) and `http://localhost:3000/en` (English)
- Admin CMS (`admin`): `http://localhost:5173`
- REST API (`api`): `http://localhost:4000/api/v1`

---

## Common Commands

| Command             | Action                                                |
| ------------------- | ----------------------------------------------------- |
| `yarn dev`          | Run all applications concurrently in development mode |
| `yarn build`        | Build all applications and packages                   |
| `yarn lint`         | Run ESLint across monorepo                            |
| `yarn format:check` | Check code formatting with Prettier                   |
| `yarn format`       | Automatically fix formatting with Prettier            |
| `yarn test`         | Run tests across packages and apps with Vitest        |

---

## Documentation

- [Architecture Design Document](docs/architecture/README.md)
- [Design System & Theme Tokens](docs/design/design-system.md)
- [Decisions Log](docs/tasks/DECISIONS.md)
- [MVP Build Task Specification](docs/tasks/mvp-build.md)
