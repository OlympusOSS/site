# site

## 1.1.13

### Patch Changes

- 3b28c2d: chore(deps): bump @olympusoss/canvas to 2.14.0

  Canvas 2.14.0 aligns its design tokens with the Athena handoff. Site is
  light-only, so the only visible delta is a slightly more saturated
  `--destructive` (`0 84.2% 60.2%`). Visually verified after the bump.

## 1.1.12

### Patch Changes

- 7399703: CD: hybrid Containerfile (Node 22 builder + Bun runtime) + remove the
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

## 1.1.11

### Patch Changes

- 103884b: CD: publish multi-arch (linux/amd64 + linux/arm64) container images via
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

## 1.1.10

### Patch Changes

- b464832: The "try it out" badge above the Live Olympus playground heading now
  pulses with a soft outer-ring glow on a 1.8s cycle. Pure CSS keyframes
  (no JS), uses the indigo from the hero-rainbow palette so the new motion
  matches the existing brand accent, no scale animation so the page layout
  stays stable. Honors `prefers-reduced-motion`.

## 1.1.9

### Patch Changes

- 833998c: Add OpenGraph + Twitter card metadata so olympus.nannier.com renders a
  proper preview when the URL is shared on WhatsApp, Slack, Twitter, etc.

  - `app/opengraph-image.tsx` — Next.js auto-generates `/opengraph-image` as
    a 1200×630 PNG at build time using `next/og`. Layout echoes the hero
    section: Olympus brand row, headline ("Identity and OAuth2, on your
    terms."), supporting copy, and the three feature pills (Apache 2.0,
    OIDC · OAuth2 · PKCE, Self-hosted). Dark navy gradient background with
    subtle orb highlights to match the live hero.
  - `app/layout.tsx` — adds the `metadataBase`, `openGraph`, and `twitter`
    fields. Next.js auto-injects the generated image into `og:image` and
    `twitter:image` because of the convention-routed file above.
  - Drop the lingering `"Open-Source Identity Platform"` title and replace
    with `"Olympus — a free identity solution"` to match the rebrand. The
    title template now respects per-page overrides (`%s — Olympus`).

  WhatsApp caches OG previews aggressively (~24h). After the deploy, use
  https://developers.facebook.com/tools/debug/ or
  https://www.linkedin.com/post-inspector/ to force a re-scrape if a tester
  already pulled the old preview.

## 1.1.8

### Patch Changes

- a2dc8dd: CD: container build no longer fails on missing sibling repos. The doc
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
- 09f271f: Rebrand the user-visible copy:

  - "open-source identity" → "free identity solution" everywhere it refers
    to the Olympus product (nav-bar tagline, hero subhead, what-is-olympus
    intro). Leaves categorical statements about Ory Kratos/Hydra being
    open-source primitives intact — those are factually about Ory, not
    Olympus.
  - Visible "OlympusOSS" brand text → "Olympus" in the footer, README,
    package.json description, and the repo-map doc's lead-in sentence.
    GitHub org URLs (`github.com/OlympusOSS/*`), npm scope
    (`@olympusoss/*`), GHCR image namespace (`ghcr.io/olympusoss/*`), and
    operational `gh` CLI examples (`gh secret list -R OlympusOSS/platform`)
    are intentionally NOT touched — they're real identifiers that would
    404 if changed. They will get a follow-up sweep once the GitHub org
    is actually renamed (the `Olympus` org login is already taken by
    another GitHub user, so the org rename needs a different target).

  Also unblocks CD: temporarily drop linux/arm64 from the build matrix.
  `next build` segfaulted inside the ubuntu-24.04-arm runner while
  generating the 920 static pages (Bun ARM64 regression with the
  doc-heavy MDX set). Production VMs are amd64-only, so a single-arch
  image still ships. Re-enable when Bun's ARM64 stability returns or the
  static-page count drops.

## 1.1.7

### Patch Changes

- 8a88477: OAuth2 callback now lands on `#playground` instead of the top of the
  homepage. Previously the user would complete the Hera handshake, return
  with an authorization code, and end up on the hero section — the
  "Authenticated" badge and decoded ID-token claims were below the fold,
  so it looked like nothing had happened. The same applies to logout
  and to the three error redirects (state mismatch, token exchange
  failure, generic callback error): all now land on `#playground` so the
  user can see the resulting state without scrolling. `scroll-mt-20` on
  the section already accounts for the fixed navbar offset.

## 1.1.6

### Patch Changes

- b0f87f2: Docs site rebuild. 46 commits since v1.1.5 had landed without a changeset,
  so the Release pipeline kept exiting as a no-op and the production site
  was stuck at the May-12 snapshot. This changeset unblocks the next tag.

  Highlights of what's now publishable:

  - Generator pipeline (Phase 2+3) producing 130+ pages from upstream Kratos
    OpenAPI + repo-local data. Subsequent phases expanded to the 770-page
    target with 9 generators (Hera pages, OAuth2 grants, MFA methods, Caddy
    directives, Daedalus steps, secrets, OIDC claims, scopes, glossary).
  - Lifecycle IA reorg (Phase 1) and per-repo docs reorganised into a
    folder tree; em-dashes normalised to commas across all prose.
  - 26 ADRs (Phase 7) and ~100 cookbook recipes (Phase 8) covering
    authentication patterns, deployment, ops, GDPR, migration, social IdP
    integrations, OAuth2 customisation.
  - Compliance pages (GDPR, CCPA, SOC2, HIPAA, ISO27001, PCI), framework
    integrations, supply-chain security, authz patterns (ReBAC, Casbin,
    OWASP).
  - MDX parser fixes for generator output (placeholders, GH Actions
    expressions, `<N` patterns, naked JSX) plus a Shiki theme fix
    (`rehypeCodeOptions` now declares `themes` explicitly and falls back to
    `plaintext` for unknown languages).
  - CI: `bun run gen` tolerates missing sibling repos so the docs build
    works in a CI-only checkout (previously assumed a workspace-style
    clone with athena/hera/sdk siblings present).

## 1.1.5

### Patch Changes

- a991958: CD: retry GHCR `podman push` up to 3 times. Transient 504s from the registry
  were forcing manual re-dispatches; the chain now self-recovers.

## 1.1.4

### Patch Changes

- a6234db: CD: post-deploy /health verify now hits host port 2000 instead of 3000, matching
  the compose port mapping (`2000:3000`). The bad port made the previous deploys
  report "unknown" version even though the container was running v1.1.3 correctly.

## 1.1.3

### Patch Changes

- 3ff3d7c: CD: drop stale GHCR creds on the server before pull and fail loudly on pull
  errors. The previous deploy was silently restarting the old container because
  `podman compose pull` swallowed a 403 from cached credentials.

## 1.1.2

### Patch Changes

- a243646: Fix /health version reporting in prod: pass APP_VERSION through the container build
  arg so the runtime env var is set even when next.config.mjs's `env:` substitution
  doesn't reach the standalone server bundle. CD now passes
  `--build-arg APP_VERSION=<tag_version>` and Containerfile sets
  `ENV APP_VERSION=${APP_VERSION}` in the runner stage. The post-deploy verify step
  (athena#121 AC3) confirms the running container reports the tag's version.

## 1.1.1

### Patch Changes

- 16ab032: CI/CD pipeline aligned with the canvas pattern + prod deploy unblocked.

  - New `Release — Site` workflow (`.github/workflows/release.yml`): fires on
    `workflow_run` after CI succeeds on main, consumes pending changesets via
    `bun run version-packages`, commits the version bump as
    `chore: version packages [skip ci]`, rebases against latest main, and
    pushes a `v<X.Y.Z>` tag.
  - Release explicitly dispatches `CD — Site` against the new tag after pushing.
    Tags pushed by `GITHUB_TOKEN` don't trigger other workflows (anti-recursion
    guard), but `workflow_dispatch` IS exempt — so the chain
    `push → CI → Release → CD → deploy` works end-to-end without a PAT.
  - CD's `Login to GHCR on server` step removed — `ghcr.io/olympusoss/site` is
    a public package, anonymous `podman compose pull` works, and the org's
    GHCR_PAT was returning 403 (stale/wrong scope) which gated the whole
    deploy job. Re-add an auth step here only when a private image is added
    to `compose.prod.yml`.
  - CI simplified: drop the `paths:` filter that was silently skipping every
    push to main, swap `npm.pkg.github.com` registry for `registry.npmjs.org`
    to match canvas's actual publish target, and let `next build` cover the
    TypeScript check (a standalone `tsc --noEmit` step runs before
    `fumadocs-mdx` generates `.source/` and trips on a missing module).
  - E2E webServer uses `PORT=2000 bun run dev` instead of `next start`
    (which doesn't work with `output: "standalone"`). OAuth playground
    suite is `test.skip`ped in CI until rewritten to inspect the 302
    response without following the upstream Hydra URL.
  - Type-deps installed for canvas's source-distributed types:
    `@types/leaflet`, `@types/d3-geo`, `@types/react-grid-layout@1.3.6`
    (the 1.x types — 2.x is a stub), `@types/react-simple-maps`.

## 1.1.0

### Minor Changes

- 36e1b79: Marketing site redesign on the canvas hand-off + adopt canvas's new molecules.

  - Implement the canvas hand-off (Identity and OAuth2, on your terms.):
    two-column hero with an animated `octl` terminal, light-by-default theme
    with a sticky frosted-glass NavBar, "Live Olympus, two domains." launcher
    band, dark `<CodeBlock theme="dark" />` SDK section, and a 4-column footer.
  - Swap the bespoke `AuthCard` / inline Hero terminal / `CodeSample` for
    `@olympusoss/canvas`'s `LauncherCard`, `Terminal`, and `CodeBlock theme="dark"`
    (canvas bumped 2.0 → 2.10, including the NavBar sticky/translucent backdrop).
  - Brand: rotate the favicon/logo to the vertical (portrait) orientation that
    matches the canvas Logo atom; add "Olympus" wordmark + "open-source identity"
    slogan stack next to the nav mark.
  - Theme: light default, persistent user override via `next-themes` localStorage.
    Adds a Sun/Moon toggle in the nav and dark-mode variants on the hero
    gradient/grid/fade and playground tinted band so both themes are usable.
  - Hero badge: dynamic — reads `@olympusoss/canvas`'s latest published version
    from the npm registry at build/ISR time, renders `v<X.Y.Z> · canvas design
system` with a rainbow shine, links out to
    `https://olympusoss.github.io/canvas/`.
  - Page reorder: NavBar → Hero → Features → Architecture → Playground →
    CodeSample → Footer. `GettingStartedSection` dropped (the hero terminal
    absorbs its messaging).
  - Copy: sentence-case across all titles/CTAs/badges per the canvas content
    rules; replace dark-mode-only `text-white` / `text-slate-*` with semantic
    tokens so both themes render correctly.
  - Dependency additions to satisfy canvas's optional peers that webpack still
    bundles via the barrel re-export: `libphonenumber-js`, `@rjsf/core`,
    `@rjsf/utils`, `@rjsf/validator-ajv8`.
