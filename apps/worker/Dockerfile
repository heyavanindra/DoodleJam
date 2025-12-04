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

CMD ["node", "dist/index.js"]
