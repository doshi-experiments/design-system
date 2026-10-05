# Change the source once, prepare every consumer upgrade

The component implementations, component styles, and tokens live in this repository.
The React applications import `@doshi-experiments/design-system/react`; their tarballs
are distribution artifacts, not independent copies to maintain. Static sites consume
the shared CSS recipes and token snapshots. Their application-specific content and
interaction logic remain in their own repositories.

`rollout.json` records all six consumers and their package/snapshot locations. The
rollout command builds and packs the source once, copies the same release to every
selected checkout, updates npm dependencies and lockfiles, and replaces explicit
Docker tarball references. Finance uses its nested `ingest/frontend/vendor/` folder
so its existing `./ingest` Docker build context can include the dependency.

## Prepare a release

1. Change the shared source and bump `package.json` and `package-lock.json` to a new
   stable version. Run `npm run build` and `npm test`. An already-used version must
   not acquire different assets or a different tarball.
2. Put current consumer checkouts or worktrees under one parent directory, with the
   names listed in `rollout.json`. Start a review branch from each consumer's current
   default branch. The command does not fetch or switch branches for you.
3. Inspect the plan, then prepare every consumer upgrade:

   ```sh
   npm run rollout -- --workspace /opt/stacks/design-system-rollout
   npm run rollout -- --workspace /opt/stacks/design-system-rollout --apply
   ```

   `DESIGN_WORKSPACE` can replace `--workspace`. Without either, the default is
   `../design-system-rollout` relative to this repository. Without `--apply`, the
   command only reads files and git status; it does not build, pack, install, or write.

4. In the React consumers, run `npm ci`, the normal app tests, and the production
   build. Check the static previews and the shared browser checks too. Commit each
   complete upgrade, including new and removed tarballs, and open its normal PR.
   Finance also needs its Python and synthetic browser checks and an image rebuild.

A source change reaches each running app **after that consumer's update is merged
and deployed**. The command prepares those updates in one place; it does not commit,
push, open PRs, merge, or deploy them. Existing `node_modules` directories are not
updated by lockfile preparation, so run `npm ci` before building React consumers.
There is no mutable runtime CDN dependency or requirement for cross-repository
GitHub credentials. Every deployment remains reproducible and independently
revertible through its ordinary git release process.

## Targeted updates and safeguards

```sh
# Prepare only Finance, or a comma-separated group of consumers.
npm run rollout -- --only finance --apply
npm run rollout -- --only rent-vs-buy-calculator,mr-shake --apply

# Use only locally cached npm metadata when resolving the new lockfiles.
npm run rollout -- --only finance --apply --offline
```

Every selected consumer is checked before any consumer file is changed. Paths must
remain inside their checkout, the package/snapshot must already be registered, and
version downgrades are rejected. The default requires clean working trees. For an
intentional update during development, `--allow-dirty` explicitly permits existing
changes; the tool preserves those pre-existing contents if its own update fails.

Applying a release builds `dist/` in the shared source and resolves npm lockfiles
with lifecycle scripts disabled. Npm may read its configured registry unless
`--offline` is used. If packing, resolution, or file updates fail, modified consumer
files are restored to their exact prior contents; npm's cache and the generated
shared `dist/` are not rolled back. Inspect the reported error and git diff before
retrying. No consumer's application build or deployment is run automatically.

To add another consumer, add its checkout name and a snapshot path and/or a package
directory to `rollout.json`. Tarball paths are relative to that package directory.
Optional `references` are repository-relative text files containing an explicit
tarball filename (for example, a Dockerfile). The command fails if a registered
reference stops matching, rather than silently leaving a stale build dependency.
Consumer packages must use npm lockfile version 2 or 3 and a local release tarball
for the shared dependency. `--manifest PATH` supports an alternate consumer list.

Static `scripts/sync.mjs` remains available for individual snapshot setup. The
central rollout command and that script share the same release asset list and
SHA-256 metadata generation.

## Identity release 0.5.0

This release adopts one palette and Commissioner across all six consumers. Its
static snapshot includes `site.js`, `site-contract.js`, and `prepaint.js`, along
with the Commissioner WOFF2, OFL notice, and source provenance. React consumers
import `SiteHeader` and `AppearanceControl` from `/react`; static sites mount the
same header through `/site`. Load or inject the shared prepaint script before
styles, using the same storage key and cookie setting as the running controller.

Remove obsolete Hanken font assets when adopting the snapshot. Rebuild bundled
apps so their local font asset and inline prepaint code also advance to the new
release. In Finance, check the nested frontend build and Docker tarball reference;
its public navigation is shared, but its appearance preference remains private.
Use synthetic review fixtures for browser mutations and verify deployed private
entry points with read-only checks. [Identity decisions](identity.md) record the
palette, typography, layout, copy rules, and treatments intentionally rejected.
