---
"site": patch
---

OAuth2 callback now lands on `#playground` instead of the top of the
homepage. Previously the user would complete the Hera handshake, return
with an authorization code, and end up on the hero section — the
"Authenticated" badge and decoded ID-token claims were below the fold,
so it looked like nothing had happened. The same applies to logout
and to the three error redirects (state mismatch, token exchange
failure, generic callback error): all now land on `#playground` so the
user can see the resulting state without scrolling. `scroll-mt-20` on
the section already accounts for the fixed navbar offset.
