---
"site": patch
---

Add OpenGraph + Twitter card metadata so olympus.nannier.com renders a
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
