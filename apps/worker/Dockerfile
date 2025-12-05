# ------------------------
# 1. Base Image
# ------------------------
FROM node:23-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

# ------------------------
# 2. Prune Turborepo (only worker needed)
# ------------------------
FROM base AS builder

WORKDIR /app

RUN apk update && apk add --no-cache libc6-compat

COPY package.json pnpm-lock.yaml turbo.json ./

# 2️⃣ install turbo
RUN pnpm add turbo --global

COPY . .

RUN pnpm dlx turbo prune --scope=worker --docker

# ------------------------
# 3. Install Dependencies (cached layer)
# ------------------------
FROM base AS installer

WORKDIR /app

COPY --from=builder /app/out/json/ .
RUN pnpm install --frozen-lockfile

COPY --from=builder /app/out/full/ .

RUN pnpm turbo build --filter=worker...

RUN cp -r node_modules/.pnpm/@prisma+client@6.15.0_prisma@6.15.0_typescript@5.9.2__typescript@5.9.2/node_modules/.prisma ./apps/worker/dist/

# ------------------------
# 4. Production Runner
# ------------------------
FROM base AS runner

WORKDIR /app

# Create non-root user
RUN addgroup -S worker && adduser -S -G worker worker

USER worker

COPY --from=installer /app/apps/worker/dist ./dist
COPY --from=installer /app/apps/worker/package.json ./
COPY --from=installer /app/node_modules ./node_modules

ENV PRISMA_QUERY_ENGINE_LIBRARY=/app/dist/.prisma/client/libquery_engine-linux-musl-openssl-3.0.x.so.node

CMD ["node", "dist/index.js"]
