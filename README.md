# Doshi design system

Version 0.7.1 keeps Felt, the one identity for the portfolio and every app: Host Grotesk, warm grey wool in light, charcoal in dark, and one signal, a raspberry-to-brick gradient under white text, with raised and stitched surfaces, pressed-in fields and a fibre texture. Global navigation and the labeled System / Light / Dark appearance control are unchanged. Tokens live in `src/tokens.js`; React components and their styles live in `src/react.js`, `src/table.js` and `src/components.css`. Static navigation lives in `src/site.js`. Generated assets must not be edited in consuming repos.

```sh
npm run build
npm test
npm run preview
# Open http://localhost:4174/preview/
```

## Contract

Set `data-project` on the document root to `portfolio`, `experiments`, `visualizations`, `calculator`, `game`, `finance`, or `household`. Set `data-theme` to `light` or `dark`, or omit it for CSS system preference. Set `data-density` to `comfortable`, `compact`, or `game`. Game targets are 60px; compact mode retains 44px targets.

The generated CSS and JavaScript exports have matching concrete values. Semantic tokens cover text, surfaces, status backgrounds/text/icons, actions and their states, focus, categorical chart colors, sequential ramps, spacing, type, radius, and motion. Every project ID resolves to the same palette. `action-gradient` is the signal fill, with white `action-text` on it, and `action-primary` is its solid midpoint for places a gradient cannot go; text in the signal colour uses `action-link`, which is also the focus colour. `surface-inset` colours fields and tracks, `stitch` the dashed inner seams, and `shadow-raised` / `shadow-pressed` the felt depth. Status colors retain their meaning across projects. Density is independent of identity. The locally hosted Host Grotesk variable font ships with its OFL notice and provenance.

Light is wool `#E7E4DE` with raised `#F1EEE9`, inset `#DAD6CE` and ink `#262624`; dark is charcoal `#33322F` with raised `#3E3D39`, inset `#2B2A27` and chalk `#ECE9E3`. The signal is the gradient `#D2386B` to `#C8312F` (solid `#CD354D`), with `#A22826` (light) or `#E89D9C` (dark) for signal-coloured text. Buttons, keys and segments are pills; fields are 14px, surfaces 24px, dialogs 30px. Each page blends a fibre tile into its background; set `data-texture="off"` on the root to remove it. Local app navigation uses `.ds-tabs` / `.ds-tab` underline tabs. See [the visual and copy decisions](docs/identity.md) for the complete direction and rejected treatments.

## Consumers

React/bundled applications can install a release tarball produced by `npm pack` and import:

```js
import {resolveTokens} from '@doshi-experiments/design-system';
import {Button, HelpPopover, SegmentedControl} from '@doshi-experiments/design-system/react';
import '@doshi-experiments/design-system/tokens.css';
import '@doshi-experiments/design-system/components.css';
```

React consumers also install React, React DOM and `@base-ui/react`. They are optional peer dependencies so static consumers need none of them. `Button` preserves native disabled semantics and locks during loading. `HelpPopover` uses Base UI focus/dismissal behavior and a portaled, fixed positioner. These are app-owned initial recipes over the Base UI foundation selected for shadcn; this release does not claim to contain the full shadcn component catalogue.

Static sites and the React apps' snapshots are upgraded centrally. With clean checkouts of every consumer in a rollout workspace (named as in `rollout.json`), prepare and then apply an upgrade:

```sh
npm run rollout -- --workspace /path/to/design-system-rollout
npm run rollout -- --workspace /path/to/design-system-rollout --apply
# Narrow it: --only portfolio-landing,mr-shake
```

The command writes each consumer's snapshot (`scripts/sync.mjs` underneath) and tarball, and changes nothing else; commit each consumer as its own pull request. It does not commit, push or deploy.

Load `tokens.css`, optional `legacy.css`, and then `components.css`. The compatibility layer maps existing site names onto semantic tokens; it does not resize every button, select, or arbitrary surface. Shared component classes own their dimensions and states. `release.json` records the version and SHA-256 hashes. Commit that snapshot with the consuming app; independent deployments do not depend on this directory, a CDN, or a sibling checkout. To upgrade, rebuild one release and sync it to each repo in separate reviewable changes. Do not hand-edit snapshots.

The game and calculator integrations also install the release tarball, committed in its repository, for their React components. A future package registry can replace that file dependency without changing imports. Npm publishing is disabled; this release uses committed snapshots and tarballs.

## Appearance

Load `prepaint.js` synchronously in the document head before styles or inject that same asset into a bundled application's HTML. It separates the saved preference (`data-appearance-preference`) from its resolved light/dark appearance (`data-theme`), preventing a first-paint flash and preserving System mode. `createAppearanceController` owns storage, OS changes, cross-tab changes, and fresh chart tokens. It retains public apps' existing `sheet-theme` cookie and localStorage choices; cookies use `.rishabhdoshi.com` only on that domain. Unrelated hosts use their own host cookie.

Sites can set `data-appearance-default="dark"` on the root to choose the initial appearance for visitors without a saved preference. Both prepaint and the controller honor this fallback without persisting it; an explicit System, Light, or Dark preference always takes precedence. Omitting the attribute retains System as the default.

```jsx
import {SiteHeader} from '@doshi-experiments/design-system/react';
import {createAppearanceController} from '@doshi-experiments/design-system/theme';

const controller = createAppearanceController();
// Subscribe in the app and pass the saved preference, including "system".
<SiteHeader project="calculator" appearance={preference}
  onAppearanceChange={value => controller.setPreference(value)} />
```

`SiteHeader` always shows Home and Experiments links. Keep local app navigation below it; private Finance is not advertised by the public header. `AppearanceControl` is also exported separately with `value` and `onValueChange` props. Both use a native select with the visible label “Appearance” and System, Light, Dark options. There is no unlabeled icon switch.

Static sites use equivalent lightweight behavior:

```js
import {mountSiteHeader} from './design-system/site.js';
const header = mountSiteHeader(document.querySelector('#family-header'), {
  project: 'visualizations',
});
// header.controller.subscribe(({preference, appearance, tokens}) => ...);
// Call header.destroy() when removing a mounted header.
```

Pass `showProjectTitle:false` to `mountSiteHeader` when the current-page title is redundant. The shared header then places navigation and Appearance in two columns; its default continues to show the title.

For Finance, use `createAppearanceController({storageKey:'finance-appearance', cookie:false})` and set `data-appearance-storage="finance-appearance" data-appearance-cookie="false"` on the root for matching prepaint behavior. Do not copy public cookie settings to private applications. Call `destroy()` when disposing a controller and `refresh()` when changing density or project. The injectable `installTheme` adapter remains available for older consumers; it retains its existing resolved-stamp precedence.

## Validation and remaining work

`npm test` checks text/action/status contrast in every project appearance, target-size minima, bad input rejection, and preference behavior. This is not a complete screen accessibility audit. The public-site browser report lives in the adjacent rollout directory.
For the complete integration check, set `DESIGN_WORKSPACE` to a folder that holds
this repository as `design-system/` and the six consumer checkouts under
`design-system-rollout/`, build the two React apps, install Chromium with
`npx playwright install --with-deps chromium`, then run `npm run test:browser`
and `npm run test:calculator`. Without `DESIGN_WORKSPACE` the parent of this
repository is used. The checks start their own servers on ports 4180 to 4220;
stop any stale `http.server` on those ports first, or they serve directory
listings and every check fails. The portfolio checks read `/versions/`, the only
portfolio page that loads the design system.
`npm run test:identity` checks all six apps' common navigation, appearance,
text selection, and responsive header behavior. Finance needs a running synthetic
preview; set `FINANCE_PREVIEW_URL` to its URL before running that check.

The calculator uses shared NumericField, RangeField (Base UI Slider), Card, FieldGroup, Metric, DataRow, DataTable and PageHeader components across all six views. Finance uses the shared application shell, fields, workflow, modal and TanStack table renderer; its Python services continue to own the business rules and financial writes. Mr. Shake keeps its game state and secrecy behavior in the app. Existing public visualizations remain application-owned. The portfolio's home page and case studies are hand-built and mirror the signal tokens in their own stylesheet. No Aceternity or Magic UI source is copied in this release.

Upstream references: [shadcn installation](https://ui.shadcn.com/docs/installation), [Base UI quick start](https://base-ui.com/react/overview/quick-start). Base UI and React license notices remain in their installed packages; retain them in distributions. The font OFL notice is included in each static snapshot.


## Release history

The sections below record each release in order. The current palette and type are
in [docs/identity.md](docs/identity.md); the newest release is at the end.

## Calculator components (0.2.0)

`NumericField` accepts application-owned `sanitize`, `parse` and `format` functions,
so adopting its presentation does not replace financial parsing. It preserves raw
text, announces removed characters and bounds feedback, supports read-only fields,
affixes and arrow-key stepping. `RangeField` combines Base UI Slider with that
numeric field; Home/End and arrow keys stay synchronized with the editable value.
Cards, field groups, metrics, rows and the scrollable semantic table share token
styles. `PageHeader` provides the page's primary heading.

Run `npm run test:calculator` against the built adjacent calculator checkout to
check all six routes at 320, 390, 768 and 1440 pixels in both appearances and the real
numeric/slider/help/navigation interactions. This remains a targeted check, not
a complete accessibility audit.

## Game and static index components (0.3.0)

`NumberStepper` accepts a label, numeric value, min/max, optional step/suffix and
`onValueChange`. Buttons clamp changes to bounds, announce the current value and
inherit the density target size (60px in game mode). Game rules stay in the app.

Static consumers can load the synced `components.css` after the compatibility
stylesheet. Use `ds-disclosure` and `ds-disclosure-trigger` for collapsible sections,
`ds-project-link` for project cards, `ds-badge` with `data-status="live"` or `"wip"`
for semantic status, and `ds-chip-link` for related links. Native buttons and anchors
retain their semantics. The application must manage `aria-expanded`,
`aria-controls` and collapsed content's `inert` state; CSS does not add behavior.
The experiments index now uses open project rows and native details for related
pages; the older button disclosure classes remain available for existing consumers.


## Application components (0.4.0)

Import the actual React components from `@doshi-experiments/design-system/react`:

```jsx
import {
  AppShell, Alert, Badge, Button, Card, CheckboxField, Dialog, Disclosure,
  EmptyState, FileUpload, PageHeader, SelectField, TextField, WorkflowSteps,
} from '@doshi-experiments/design-system/react';
import {EditableTable} from '@doshi-experiments/design-system/table';
import '@doshi-experiments/design-system/tokens.css';
import '@doshi-experiments/design-system/components.css';

<SelectField
  label="Category"
  value={categoryId}
  onValueChange={setCategoryId}
  options={[{value: '', label: 'Uncategorized'}, {value: 'food', label: 'Food'}]}
/>
<Button variant="primary" loading={saving} onClick={save}>Save</Button>
```

The token stylesheet includes the local font face. Bundlers resolve its relative
`fonts/host-grotesk-latin.woff2` and `fonts/host-grotesk-latin-ext.woff2` URLs into application assets; no remote font request is
needed. `AppShell` sets shared typography and surface colors inside the shell.
Applications still reset document margins and own their business-specific layout.

| Component | Contract |
| --- | --- |
| `AppShell` | `brand`, `navigation` (`id`, `label`, `href` or `onClick`, `active`, optional `icon`), `actions`, `footer`, `children`. Includes a skip link, navigation landmark and responsive main content. |
| `Button` | Native/Base UI button props plus `variant` (`primary`, `secondary`, `danger`, `ghost`), `loading` and `size` (`"small"` for dense layouts, 0.7.1). Loading disables repeat activation. Static markup uses `data-size="small"`. |
| `TextField` | Native input props, `label`, `value`, `onValueChange`, `hint`, `error`, optional `hideLabel`. For number parsing use `NumericField`. |
| `SelectField` | Native select props, `label`, `value`, `onValueChange`, `options` (`value`, `label`, `disabled`), `hint`, `error`, optional `hideLabel`. Values are strings, as in native selects. |
| `CheckboxField` | Native checkbox props, `label`, `checked`, `onCheckedChange`, optional `hint`, `error`, `indeterminate`. Label provides the full touch target. |
| `FileUpload` | Native file input props, `label`, `accept`, `multiple`, `onFilesChange(File[])`, `hint`, `error`, `disabled`. Applications enforce file size, content and upload policy. |
| `Alert` / `Badge` | `tone` (`info`, `success`, `warning`, `error`), `children`. Alerts also accept `title`, `actions` and a `role` override; errors announce with `alert`, other tones with `status`. |
| `EmptyState` | `title`, `description`, `actions`, optional `children`. |
| `WorkflowSteps` | `steps` (`id`, `label`, optional `description` / `disabled`), current `value`, optional `onValueChange`. A navigation list with `aria-current="step"`; applications own step eligibility. |
| `Disclosure` | `title`, `children`, optional `defaultOpen` or controlled `open`, `onToggle`. Uses native details/summary keyboard and collapsed-content behavior. |
| `Dialog` | Controlled `open`, `onOpenChange`, `title`, `description`, `children`, `actions`, optional `closeLabel`, `initialFocus`, `finalFocus`, `dismissible`. Base UI provides modal focus trapping and dismissal; focus returns to the launching control. `dismissible={false}` blocks backdrop/Escape dismissal while keeping the explicit close action. |
| `EditableTable` | `data`, TanStack `columns`, stable `getRowId`, `label`, optional `caption`, `emptyMessage`, `maxHeight`, `busy`, `meta`, `rowClassName`. Custom cells receive TanStack context, including `table.options.meta`. |

`EditableTable` requires the additional optional peer `@tanstack/react-table`
8.21.3 or later in version 8. Its separate `/table` export keeps that dependency
out of consumers that only use the other React components. It renders a semantic
HTML table with a labeled scroll region and sticky headings. Editing cells use
shared fields through column renderers; the application owns parsing, saving,
revision checks and error recovery. It does not claim spreadsheet keyboard-grid
behavior or silently make every column editable.

Run `npm run build && npm run test:components` after installing Chromium. This
checks all shared application recipes at 320, 390, 768 and 1440 pixels in light/dark,
44px control targets, action contrast, font loading, native field callbacks,
uploads, editable table callbacks, disclosure keyboard activation, and modal
focus trapping, Escape, focus restoration and dismissal guards. It also checks
global navigation, visible preference persistence, System appearance changes,
and genuine mouse-drag text selection. Selectable text is the default; suppress
selection only on drag controls and private game-reveal surfaces.

For repeatable consumer upgrades, see [the central rollout process](docs/rollout.md).
Changes are authored here, then versioned and adopted in each consuming repo;
a source edit by itself does not rebuild already deployed applications.

## Interface fixes (0.5.1)

Focused slider thumbs show the focus ring. Base UI focuses the hidden range input
inside the thumb, so the ring is drawn on `.ds-slider-thumb:has(:focus-visible)`.
Disclosure, project-link and chip-link rings are inset and outrank the compatibility
stylesheet's global ring, which the disclosure's overflow used to clip; triggers
follow the section's corner radius. `.ds-button` scales to 0.96 on press when motion
is allowed. Cards, metrics and table scrollers nested in a card use the control
radius. Appearance changes turn transitions off until the new colors have painted,
so a theme switch snaps instead of smearing. `npm test` also checks text, secondary
text and the action color on the selection token, which open disclosures, hovered rows and hovered chip links paint
behind text.

## Portfolio presentation (0.5.2)

The portfolio's dark palette combines charcoal `#252A2B`, raised slate `#343B3C`, pale stone `#F0EBE3`, secondary stone `#BEB8AE`, and rust `#D17C54`. Rust is light enough to serve as a readable link on charcoal; primary buttons use dark `#171D1E` text. The light companion pairs mineral `#EFEEE8` with burnt orange `#A84B2A`. Crane yellow and semantic statuses stay shared. Palette changes remain in the source token resolver and are released through the central rollout command; this release can be adopted by the portfolio independently.

## Felt (0.6.0)

One identity for the portfolio and every app, adopted from the portfolio's "made with
an AI in the room" face. Host Grotesk replaces Commissioner. Light is wool and dark is
charcoal; the coral `#FF5E7C` is the single signal, used as a fill under ink. Because
coral fails as text on wool, the new `action-link` token carries signal-coloured text and
focus rings (`#A1263F` light, `#FF7F96` dark), and `npm test` checks it on every surface
and on the selection colour. New tokens: `surface-inset`, `stitch`, `shadow-pressed`,
`radius-pill`, `ease-spring`; `shadow-raised` now carries the felt depth, and
`shadow-overlay` moves into each appearance. `projectAppearanceOverrides` is empty:
every project resolves to the same palette.

Components follow: buttons and segments are raised pills that press in; a segmented
control is a recessed track with a raised key; fields, selects, file inputs and slider
tracks are pressed into the page; cards, tables, disclosures and project links are
raised, with a stitch on cards and project links; metrics sit under a stitched rule
instead of a box, so results never read as fields. The global header is a raised pill
whose current page carries a coral dot. `.ds-tabs` / `.ds-tab` add underline tabs for
local navigation. Each page blends a fibre tile into its background, multiplied in
light and overlaid in dark; `data-texture="off"` removes it. The release ships
`felt/fibre-light.svg` and `felt/fibre-dark.svg` beside the fonts, and the rollout
removes the Commissioner files from every snapshot.

Consumers that coloured text with `--ds-action-primary` move that text to
`--ds-action-link`; fills keep `--ds-action-primary` with `--ds-action-text`.

## Signal red (0.7.0)

The signal moves from coral `#FF5E7C` under ink to a subtle raspberry-to-brick gradient,
`action-gradient` (`#D2386B` to `#C8312F`), under white `action-text`. Both ends keep white
at 4.5:1 or better, and `npm test` checks every stop of the rest, hover and pressed
gradients. Hover and press deepen rather than lighten. `action-primary` becomes the solid
midpoint `#CD354D` for dots, `accent-color` and chart fills. `action-link` and `focus`
follow the new hue (`#A22826` light, `#E89D9C` dark), as do `selection`, `chart-2` and the
ramps. The slider thumb becomes the signal with a white rim, so it reads on wool and on
charcoal; it was a raised disc that nearly vanished on its track.

Consumers that paint text on `action-primary` or `--on-accent` now get white. Any fill
that is not the signal needs its own text colour.

## Small controls (0.7.1)

`Button` and `SegmentedControl` take `size="small"` (static markup: `data-size="small"` on
`.ds-button` or `.ds-segmented`) for dense app layouts such as boards and tables. The pill
is drawn at the new density token `control-compact-height` (36px; 60px at game density, so
game controls never shrink) with tighter padding, while an invisible hit area keeps the
full `control-target` height, so the 44px target minimum still holds. The default size is
unchanged. `npm test` checks that the compact height stays between 32px and the control
height, and equals it at game density.
