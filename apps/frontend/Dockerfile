# --------------------------
# Base image
# --------------------------
FROM node:23-alpine AS base

# Install dependencies needed by Node & Alpine
RUN apk update && apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app

# Enable pnpm
RUN corepack enable

# --------------------------
# Prepare stage: prune turbo workspace
# --------------------------
FROM base AS prepare

# Copy the full repo
COPY . .

# Prune only the frontend workspace for Docker
RUN pnpm dlx turbo prune frontend --docker

# --------------------------
# Builder stage: install deps & build
# --------------------------
FROM base AS builder

# Copy pruned package.json & lockfiles
COPY --from=prepare /app/out/json/ .

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy full pruned frontend workspace
COPY --from=prepare /app/out/full/ .

# Build frontend app
RUN pnpm dlx turbo run build --filter=frontend...

# --------------------------
# Runner stage: production image
# --------------------------
FROM base AS runner

# Create non-root user
RUN addgroup -S --gid 1001 nodejs
RUN adduser -S --uid 1001 frontend

# Switch to non-root user
USER frontend

# Copy production build from builder
COPY --from=builder --chown=frontend:nodejs /app/apps/frontend/.next/standalone ./
COPY --from=builder --chown=frontend:nodejs /app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=builder --chown=frontend:nodejs /app/apps/frontend/public ./apps/frontend/public

# Expose port 3000 (default Next.js port)
EXPOSE 3000

# Start Next.js server
CMD ["node", "apps/frontend/server.js"]
