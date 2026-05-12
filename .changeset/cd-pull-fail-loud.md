---
"site": patch
---

CD: drop stale GHCR creds on the server before pull and fail loudly on pull
errors. The previous deploy was silently restarting the old container because
`podman compose pull` swallowed a 403 from cached credentials.
