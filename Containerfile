# Stage 1 — install ALL deps with Bun. Bun's installer is fast and stable on
# both arm64 and amd64 (native and emulated). The output is a standard
# node_modules tree that the Node-based builder stage can consume directly.
FROM oven/bun:1-alpine AS deps
WORKDIR /app
ARG CACHE_BUST
COPY package.json ./
RUN --mount=type=secret,id=npmrc,target=/app/.npmrc \
    bun install

# Stage 2 — build with Node. The previous Bun-based builder ran fine on
# amd64 but segfaulted on `next build` under QEMU-emulated arm64 while
# generating the 920-page MDX corpus. Node 22's arm64 build pipeline is
# rock-solid under native and emulated arm64, so the switch is the
# root-cause fix for multi-arch publishing.
FROM node:22-alpine AS builder
WORKDIR /app
ARG CACHE_BUST
# Tell scripts/gen/index.mjs to tolerate missing sibling repos
# (../athena, ../platform, ../sdk, ../daedalus). The doc generators write
# into content/docs/ which is already committed; the per-build run is just
# a refresh and is allowed to produce a partial set when running inside
# `podman build`, where the GH-Actions `CI` env var is not visible. Mirrors
# the existing CI tolerance in scripts/gen/index.mjs.
ENV OLYMPUS_GEN_TOLERATE_MISSING=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3 — run with Bun. Bun's runtime is faster than Node for the Next.js
# standalone server and is stable on both arm64 and amd64.
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
