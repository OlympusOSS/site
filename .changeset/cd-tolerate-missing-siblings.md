---
"site": patch
---

CD: container build no longer fails on missing sibling repos. The doc
generator orchestrator already tolerates partial gen runs when
`process.env.CI` is set, which lets the CI workflow pass even though
five generators read from `../athena`, `../sdk`, and `../platform`.
`podman build` doesn't inherit the GH-Actions `CI` env var though, so
the same `bun run build` inside the container saw `failed > 0 && !CI`
and exited 1 — that's why v1.1.6 CD failed at the build step. Adds an
`OLYMPUS_GEN_TOLERATE_MISSING=1` env in the builder stage of
`Containerfile` and teaches `scripts/gen/index.mjs` to honour it, so the
container build behaves like CI. Local builds (with siblings checked out)
are unaffected since failure count is zero.
