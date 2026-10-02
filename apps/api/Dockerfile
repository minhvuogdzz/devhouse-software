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

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY --from=deps /app ./
COPY packages packages
COPY apps/api apps/api

USER node
EXPOSE 4000

HEALTHCHECK --interval=15s --timeout=3s --retries=3 \
  CMD node apps/api/scripts/healthcheck.js

CMD ["node", "apps/api/src/server.js"]
