# Multi-stage Dockerfile for Next.js chatbot application
# Optimized for development with hot-reloading

FROM oven/bun:1.1-alpine AS base

# Install Node.js for Next.js compatibility
RUN apk add --no-cache nodejs

WORKDIR /workspace

# Development stage - optimized for hot-reloading
FROM base AS development

# Install dependencies needed for native modules
RUN apk add --no-cache python3 make g++

# Copy root workspace configuration
COPY package.json bun.lock* ./

# Copy all package.json files for workspace packages
COPY packages/ai-sdk-tools/package.json ./packages/ai-sdk-tools/
COPY packages/agents/package.json ./packages/agents/
COPY packages/artifacts/package.json ./packages/artifacts/
COPY packages/cache/package.json ./packages/cache/
COPY packages/devtools/package.json ./packages/devtools/
COPY packages/memory/package.json ./packages/memory/
COPY packages/store/package.json ./packages/store/

# Copy example app package.json
COPY apps/example/package.json ./apps/example/

# Install all dependencies from workspace root
# Note: Skip frozen-lockfile for development to handle version mismatches
RUN bun install

# Copy all workspace packages source code
COPY packages ./packages

# Build workspace dependencies
RUN cd packages/ai-sdk-tools && bun run build
RUN cd packages/agents && bun run build 2>/dev/null || true
RUN cd packages/artifacts && bun run build 2>/dev/null || true
RUN cd packages/cache && bun run build 2>/dev/null || true
RUN cd packages/devtools && bun run build 2>/dev/null || true
RUN cd packages/memory && bun run build 2>/dev/null || true
RUN cd packages/store && bun run build 2>/dev/null || true

# Copy example app source (excluding node_modules)
COPY apps/example/src ./apps/example/src
COPY apps/example/public ./apps/example/public
COPY apps/example/*.json ./apps/example/
COPY apps/example/*.ts ./apps/example/

WORKDIR /workspace/apps/example

# Expose Next.js port
EXPOSE 3000

# Set environment
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start Next.js in development mode with hot-reloading
CMD ["bun", "run", "dev"]

# Production stage
FROM base AS production

# Copy root workspace configuration
COPY package.json bun.lock* ./

# Copy all package.json files for workspace packages
COPY packages/ai-sdk-tools/package.json ./packages/ai-sdk-tools/
COPY packages/agents/package.json ./packages/agents/
COPY packages/artifacts/package.json ./packages/artifacts/
COPY packages/cache/package.json ./packages/cache/
COPY packages/devtools/package.json ./packages/devtools/
COPY packages/memory/package.json ./packages/memory/
COPY packages/store/package.json ./packages/store/

# Copy example app package.json
COPY apps/example/package.json ./apps/example/

# Install production dependencies only
RUN bun install --production

# Copy all workspace packages source and build
COPY packages ./packages
RUN cd packages/ai-sdk-tools && bun run build
RUN cd packages/agents && bun run build 2>/dev/null || true
RUN cd packages/artifacts && bun run build 2>/dev/null || true
RUN cd packages/cache && bun run build 2>/dev/null || true
RUN cd packages/devtools && bun run build 2>/dev/null || true
RUN cd packages/memory && bun run build 2>/dev/null || true
RUN cd packages/store && bun run build 2>/dev/null || true

# Copy example app source (excluding node_modules)
COPY apps/example/src ./apps/example/src
COPY apps/example/public ./apps/example/public
COPY apps/example/*.json ./apps/example/
COPY apps/example/*.ts ./apps/example/

WORKDIR /workspace/apps/example

# Build Next.js for production
RUN bun run build

# Expose Next.js port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start Next.js in production mode
CMD ["bun", "run", "start"]
