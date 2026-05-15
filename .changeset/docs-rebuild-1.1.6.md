---
"site": patch
---

Docs site rebuild. 46 commits since v1.1.5 had landed without a changeset,
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
