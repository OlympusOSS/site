---
"site": patch
---

CD: post-deploy /health verify now hits host port 2000 instead of 3000, matching
the compose port mapping (`2000:3000`). The bad port made the previous deploys
report "unknown" version even though the container was running v1.1.3 correctly.
