# Stage 1: Base - Install pnpm and dependencies
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

RUN pnpm install --frozen-lockfile=false

# Stage 2: Builder
FROM base AS builder
COPY . .
RUN pnpm --filter @palm-interview/shared build
RUN pnpm --filter api build
RUN pnpm --filter web build

# Stage 3: API Runner (NestJS)
FROM node:20-alpine AS api-runner
WORKDIR /app
ENV NODE_ENV=production

# Copy shared and api artifacts
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json

EXPOSE 3000
# Corrected path for NestJS entry point
CMD ["node", "apps/api/dist/main.js"]

# Stage 4: Web Runner (Next.js Standalone)
FROM node:20-alpine AS web-runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

# Next.js standalone output includes everything needed to run
# Copy static files to their correct locations inside the standalone output structure
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

# Crucial fix for Standalone styling issue
# The static assets need to be located exactly at .next/static and public 
# relative to where server.js runs to serve them properly
COPY --from=builder /app/apps/web/.next/static ./.next/static
COPY --from=builder /app/apps/web/public ./public

EXPOSE 3001
# Next.js standalone puts the entry point here
CMD ["node", "apps/web/server.js"]