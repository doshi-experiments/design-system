# Doshi design system

Version 0.1.0: shared foundations and the first public-site integration. The source of truth is `src/tokens.js`; generated assets must not be edited in consuming repos.

```sh
npm run build
npm test
npm run preview
# Open http://localhost:4174/preview/
```

## Contract

Set `data-project` on the document root to `portfolio`, `experiments`, `visualizations`, `calculator`, `game`, `finance`, or `household`. Set `data-theme` to `light` or `dark`, or omit it for CSS system preference. Set `data-density` to `comfortable`, `compact`, or `game`. Game targets are 60px; compact mode retains 44px targets.

The generated CSS and JavaScript exports have matching concrete values. Semantic tokens cover text, surfaces, status backgrounds/text/icons, actions and their states, focus, categorical chart colors, sequential ramps, spacing, type, radius, and motion. Status colors are independent of project accents. The checked-in Hanken Grotesk font and OFL notice ship together. The initial project palettes are implementation defaults, ready for visual refinement.

## Consumers

React/bundled applications can install a release tarball produced by `npm pack` and import:

```js
import {resolveTokens} from '@doshi-experiments/design-system';
import {Button, HelpPopover, SegmentedControl} from '@doshi-experiments/design-system/react';
import '@doshi-experiments/design-system/tokens.css';
import '@doshi-experiments/design-system/components.css';
```

React consumers also install React, React DOM and `@base-ui/react`. They are optional peer dependencies so static consumers need none of them. `Button` preserves native disabled semantics and locks during loading. `HelpPopover` uses Base UI focus/dismissal behavior and a portaled, fixed positioner. These are app-owned initial recipes over the Base UI foundation selected for shadcn; this release does not claim to contain the full shadcn component catalogue.

For existing static sites, sync an immutable release snapshot:

```sh
node scripts/sync.mjs /path/to/site/public/design-system
```

Load `tokens.css` and then `legacy.css` after existing styles. The latter maps existing site names onto semantic tokens for incremental migration. `release.json` records the version and SHA-256 hashes. Commit that snapshot with the consuming app; independent deployments do not depend on this directory, a CDN, or a sibling checkout. To upgrade, rebuild one release and sync it to each repo in separate reviewable changes. Do not hand-edit snapshots.

The game and calculator integrations also install the release tarball, committed in its repository, for the React button. A future package registry can replace that file dependency without changing imports. Npm publishing is disabled; this release uses committed snapshots and tarballs.

## Appearance

Keep the existing `sheet-theme` cookie, `.rishabhdoshi.com` scope, localStorage fallback, and pre-paint stamp in public apps. `metadata.js` observes their appearance stamp and updates theme-color. Calculator and game adapters use concrete token values directly. The standalone `installTheme` adapter is for new consumers: an existing stamp wins, persistence is injected, system changes are followed only in system mode, and `onChange` supplies fresh chart values. Call `refresh()` when changing project/density. Stamp appearance before first paint; the preview demonstrates a localStorage adapter. Do not copy the public cookie domain to unrelated household hosts.

## Validation and remaining work

`npm test` checks text/action/status contrast in every project appearance, target-size minima, bad input rejection, and preference behavior. This is not a complete screen accessibility audit. The public-site browser report lives in the adjacent rollout directory.
For the complete integration check, keep the five site checkouts under
`../design-system-rollout/`, build the two React apps, install Chromium with
`npx playwright install --with-deps chromium`, then run `npm run test:browser`.
`DESIGN_WORKSPACE` can override the common parent directory.

This first release migrates public-site tokens, game/calculator buttons, and calculator selection/help controls. Finance's Streamlit replacement and TanStack editor are explicitly deferred. Additional shadcn/Base UI recipes, numeric-entry improvements, intake workflows and selected Magic UI effects remain later components; no Aceternity or Magic UI source is copied in this release. Existing public visualizations and the portfolio's 3D composition remain application-owned.

Upstream references: [shadcn installation](https://ui.shadcn.com/docs/installation), [Base UI quick start](https://base-ui.com/react/overview/quick-start). Base UI and React license notices remain in their installed packages; retain them in distributions. The font OFL notice is included in each static snapshot.
