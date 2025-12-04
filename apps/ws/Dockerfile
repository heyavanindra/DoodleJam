# ------------------------
# 1. Base Image
# ------------------------
FROM node:23-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

# ------------------------
# 2. Prune Turborepo (only ws needed)
# ------------------------
FROM base AS builder

WORKDIR /app

RUN apk update && apk add --no-cache libc6-compat

COPY package.json pnpm-lock.yaml turbo.json ./

# 2️⃣ install turbo
RUN pnpm add turbo --global

COPY . .

RUN pnpm dlx turbo prune --scope=ws --docker

# ------------------------
# 3. Install Dependencies (cached layer)
# ------------------------
FROM base AS installer

WORKDIR /app

COPY --from=builder /app/out/json/ .
RUN pnpm install --frozen-lockfile

COPY --from=builder /app/out/full/ .

RUN pnpm turbo build --filter=ws...

# ------------------------
# 4. Production Runner
# ------------------------
FROM base AS runner

WORKDIR /app

# Create non-root user
RUN addgroup -S ws && adduser -S -G ws ws

USER ws

COPY --from=installer /app/apps/ws/dist ./dist
COPY --from=installer /app/apps/ws/package.json ./

EXPOSE 8000

CMD ["node", "dist/server.js"]
