# Changesets

This folder is managed by [changesets](https://github.com/changesets/changesets).

The site is a private app, so changesets here drive **version bumps + git tags**
(not npm publish). When a PR merges to `main`, the Release workflow consumes
pending changesets, bumps `package.json` version, commits the bump to `main`,
and pushes a `v<version>` tag. The existing CD workflow then picks up that tag
and builds + deploys.

## Creating a changeset

```sh
bun changeset
```

The CLI prompts you for:

1. Which packages changed (just `site` for this repo).
2. Semver bump (patch / minor / major).
3. A short description — this becomes the CHANGELOG line.

Commit the generated `.md` file alongside your code change.

## Semver guidelines

- **patch**: copy tweaks, small visual fixes, dependency bumps, internal
  refactors that don't change rendered HTML.
- **minor**: new pages or sections, new components, redesigns visible to
  end users.
- **major**: rarely needed for a marketing site. Reserve for full
  redesigns or breaking changes to public OAuth playground URLs / docs
  routes that downstream consumers might link to.
