---
"site": patch
---

Rebrand the user-visible copy:

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
