---
"site": patch
---

Fix /health version reporting in prod: pass APP_VERSION through the container build
arg so the runtime env var is set even when next.config.mjs's `env:` substitution
doesn't reach the standalone server bundle. CD now passes
`--build-arg APP_VERSION=<tag_version>` and Containerfile sets
`ENV APP_VERSION=${APP_VERSION}` in the runner stage. The post-deploy verify step
(athena#121 AC3) confirms the running container reports the tag's version.
