# site

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
