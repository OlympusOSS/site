---
"site": patch
---

CD: hybrid Containerfile (Node 22 builder + Bun runtime) + remove the
multi-arch escape hatch + switch prebuild scripts to Node.

Site already shipped multi-arch since `103884b`, but the existing
`oven/bun:1-alpine` builder still segfaulted on `next build` under
QEMU-emulated arm64 while generating the 920-page MDX corpus. The
root-cause fix is to keep Bun where it's strong (deps install +
runtime) but swap the **builder stage** to Node 22, which has a
rock-solid arm64 build pipeline under both native and QEMU emulation.

Containerfile changes:

- Stage 1 (`deps`): now does a full `bun install` (was
  `--production`), so the builder can consume the resulting
  `node_modules` directly. Bun's installer is fast on every
  architecture.
- Stage 2 (`builder`): base swapped from `oven/bun:1-alpine` to
  `node:22-alpine`. COPYs `node_modules` from `deps`. Replaces
  `RUN bun run build` with `RUN npm run build`. Keeps the
  `OLYMPUS_GEN_TOLERATE_MISSING=1` env so the doc generators tolerate
  the absent sibling repos inside the build container.
- Stage 3 (`runner`): unchanged. Still
  `FROM oven/bun:1-alpine`, still `CMD ["bun", "server.js"]`.

package.json changes:

- `gen` script: `bun run scripts/gen/index.mjs` →
  `node scripts/gen/index.mjs`. The script body uses no `Bun.*` APIs
  (grep-confirmed), so Node 22 runs it identically.
- `prebuild`: `bun run gen` → `npm run gen`. Keeps the npm-script chain
  intact when the builder is Node-based. Local dev (`bun run dev`)
  still works because Bun executes node-compatible scripts.

CD workflow changes:

- Removed the `workflow_dispatch.inputs.platforms` input. Every CD run
  publishes multi-arch unconditionally. If a build hangs again, fix
  the root cause; don't hide it behind an amd64-only flag.
- Hardcoded `platforms: linux/amd64,linux/arm64` in
  `docker/build-push-action`.
