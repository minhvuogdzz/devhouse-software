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
COPY apps/admin apps/admin

RUN yarn --cwd apps/admin build

FROM nginx:alpine AS runtime
COPY --from=builder /app/apps/admin/dist /usr/share/nginx/html
COPY apps/admin/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=3s --retries=3 \
  CMD wget -q -O - http://127.0.0.1/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
