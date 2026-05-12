---
"site": patch
---

CD: retry GHCR `podman push` up to 3 times. Transient 504s from the registry
were forcing manual re-dispatches; the chain now self-recovers.
