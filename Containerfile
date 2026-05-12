FROM oven/bun:1-alpine AS deps
WORKDIR /app
ARG CACHE_BUST
COPY package.json ./
RUN --mount=type=secret,id=npmrc,target=/app/.npmrc \
    bun install --production

FROM oven/bun:1-alpine AS builder
WORKDIR /app
ARG CACHE_BUST
COPY package.json ./
RUN --mount=type=secret,id=npmrc,target=/app/.npmrc \
    bun install

COPY . .
RUN bun run build

FROM oven/bun:1-alpine AS runner
WORKDIR /app
RUN apk --no-cache add wget
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000
# Build arg passed from CD's `podman build --build-arg APP_VERSION=...`.
# Baked into the runtime as an ENV so /health reports the right version
# regardless of how next.config.mjs's `env:` substitution behaves under
# `output: "standalone"`. Defaults to "unknown" for local container builds
# that don't supply the arg.
ARG APP_VERSION=unknown
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV APP_VERSION=${APP_VERSION}

HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=3 \
  CMD wget --spider --quiet http://localhost:3000/health || exit 1

CMD ["bun", "server.js"]
