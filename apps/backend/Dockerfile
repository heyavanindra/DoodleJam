

## Multi-stage Dockerfile for apps/backend in a pnpm + turborepo workspace
## Stages: prune -> deps (dev) -> builder -> deps-prod -> runner
## - turbo prune reduces workspace to only the packages needed for backend
## - deps installs dev deps needed for build; deps-prod installs production deps only
## - builder produces the compiled output under apps/backend/dist (esbuild)

FROM node:20-alpine AS base

WORKDIR /app
ENV NODE_ENV=production

# Small utilities needed for some packages and turbo
RUN apk add --no-cache libc6-compat bash git

## Prune: create a minimal project graph for backend
FROM base AS prune

RUN npm install -g turbo pnpm@9

# Copy the whole repo (turbo will read turbo.json/package files)
COPY . .

# Produce a pruned workspace in ./out (only packages required for backend)
RUN turbo prune --scope=backend --docker

## Deps (dev): install dependencies required for building (dev deps included)
FROM base AS deps

WORKDIR /app

# Copy only pruned package jsons and lockfiles to speed up install
COPY --from=prune /app/out/json/ ./

RUN npm install -g pnpm@9

# Install all deps (including dev) required to build the backend
RUN pnpm install --frozen-lockfile

## Builder: copy pruned full source + node_modules and build the backend
FROM base AS builder

WORKDIR /app

# Reuse node_modules (with dev deps) for build
COPY --from=deps /app/node_modules /app/node_modules

# Copy the pruned full source (only packages required for backend)
COPY --from=prune /app/out/full/ ./

RUN npm install -g pnpm@9

RUN pnpm install
# Build backend (uses script from apps/backend/package.json — esbuild output goes to dist)
RUN pnpm --filter ./apps/backend... run build

## Deps-prod: install only production deps for final image
FROM base AS deps-prod

WORKDIR /app

# Copy pruned package jsons for install
COPY --from=prune /app/out/json/ ./

RUN npm install -g pnpm@9

# Install only production dependencies (no dev deps)
RUN pnpm install --frozen-lockfile --prod

## Runner: minimal production image
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Copy production node_modules from deps-prod stage
COPY --from=deps-prod /app/node_modules /app/node_modules

# Copy built backend output from builder
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist

# Keep package.json for the backend (optional, helpful for some platforms)
COPY --from=prune /app/out/json/apps/backend/package.json ./apps/backend/package.json

WORKDIR /app/apps/backend

ENV PORT=3000
EXPOSE 3000

# Start the compiled app (per apps/backend/package.json start: node ./dist/app.js)
CMD ["node", "dist/app.js"]

