# Developer Setup Guide

Welcome to the Dev House Software monorepo! This guide walks you through setting up your local development environment from a fresh clone.

---

## Prerequisites

1. **Node.js:** version 22.x LTS (recommended to manage via `nvm` or `fnm`). Check `.nvmrc` for the active version.
2. **Corepack / Yarn:** Yarn modern (v4.x) is configured with `nodeLinker: node-modules`.
3. **MongoDB:** MongoDB 7+ running locally on port 27017, or running via Docker Compose (`docker compose up -d mongodb`).

---

## Five-Minute Local Setup

### 1. Enable Corepack and Install Dependencies

From the repository root:

```bash
corepack enable
yarn install --immutable
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Ensure `MONGODB_URI=mongodb://localhost:27017` and `MONGODB_DB_NAME=devhouse_dev`.

### 3. Seed Database & Create Superadmin

Run the idempotent seed script to populate system roles, default categories, and catalog data:

```bash
yarn --cwd apps/api seed
```

Create your initial local superadmin account. The script generates a secure
random password if `SEED_ADMIN_PASSWORD` is not set:

```bash
node apps/api/scripts/create-admin.js
```

The generated password will be printed once to the terminal. The account
requires a password change on first login.

To supply your own password (minimum 12 characters):

```bash
SEED_ADMIN_PASSWORD='YourStrongPass!1' node apps/api/scripts/create-admin.js
```

### 4. Start Development Servers

Start all workspaces in parallel (API, Web SSR, and Admin CMS):

```bash
yarn dev
```

The services will become available at:

- **Public Website:** `http://localhost:3000` (Vietnamese default) and `http://localhost:3000/en` (English)
- **Admin CMS SPA:** `http://localhost:5173`
- **Express REST API:** `http://localhost:4000/api/v1`

---

## Common Developer Commands

| Command             | Action                                       |
| ------------------- | -------------------------------------------- |
| `yarn dev`          | Start development servers for all workspaces |
| `yarn build`        | Compile production bundles for all apps      |
| `yarn test`         | Run Vitest test suite across all packages    |
| `yarn lint`         | Run ESLint with theme & boundary rules       |
| `yarn format`       | Format all files with Prettier               |
| `yarn format:check` | Verify file formatting                       |
