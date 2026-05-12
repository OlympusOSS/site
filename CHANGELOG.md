# site

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
