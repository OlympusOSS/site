---
"site": patch
---

CD: publish multi-arch (linux/amd64 + linux/arm64) container images via
docker buildx + QEMU.

The previous matrix-based CD dropped `linux/arm64` after v1.1.7 because
`next build` segfaulted inside the `ubuntu-24.04-arm` runner while
generating the 920 static pages — almost certainly a native-arm64 SWC /
lightningcss / next-swc binary interaction with the doc-heavy MDX set,
not Bun itself. QEMU-translated arm64 binaries run a different code
path and dodge that bug class.

Replaces the per-platform matrix + separate manifest-merge job with a
single buildx-driven build that writes the multi-arch manifest list in
one shot. Mirrors the pattern already in use at
`platform/.github/workflows/caddy-build.yml`.

Also drops the 3-attempt podman-push retry loop — buildkit handles
transient registry errors internally. If GHCR 504s come back as a real
problem, the right fix is the standard `nick-fields/retry@v3` wrapper,
not a hand-rolled loop.

Side effects:

- Apple Silicon dev macs can now run `octl deploy` (demo mode) — the
  manifest mismatch that broke the previous attempt goes away.
- The Raspberry Pi deployment cookbook entry (which already promises
  multi-arch) now matches reality.
- `workflow_dispatch` gains a `platforms` input that defaults to
  `linux/amd64,linux/arm64`. Override to `linux/amd64` for emergency
  amd64-only builds without editing YAML.
- GHA buildx cache (`type=gha`) replaces the runner-local
  `--layers=true` cache, so the slow `bun install` step is now reused
  across runs.

No Containerfile changes. No deploy / verify behaviour changes
(production VMs are amd64 and podman picks the matching manifest entry
automatically).

Caveat: site is the largest build of the three (920-page MDX corpus).
If QEMU-emulated arm64 also hangs, fall back via
`gh workflow run cd.yml -f platforms=linux/amd64` and escalate to the
hybrid Containerfile contingency (Node-based builder, Bun-based
runner).
