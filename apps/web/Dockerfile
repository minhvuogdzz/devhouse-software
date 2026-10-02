FROM node:22-bookworm-slim AS deps
WORKDIR /app
RUN corepack enable

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
COPY packages/shared/package.json packages/shared/
COPY packages/content/package.json packages/content/
COPY packages/config/package.json packages/config/
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY apps/admin/package.json apps/admin/

RUN yarn install --immutable

FROM deps AS builder
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
COPY packages packages
COPY apps/web apps/web

RUN yarn --cwd apps/web build

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production
ENV WEB_PORT=3000
WORKDIR /app

COPY --from=deps /app ./
COPY packages packages
COPY --from=builder /app/apps/web/build ./apps/web/build
COPY apps/web/server.js ./apps/web/server.js
COPY apps/web/package.json ./apps/web/package.json
COPY apps/web/scripts ./apps/web/scripts

USER node
EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=3s --retries=3 \
  CMD node apps/web/scripts/healthcheck.js

CMD ["node", "apps/web/server.js"]
