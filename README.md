# Doshi design system

Version 0.5.0 gives the portfolio and its apps one identity: Commissioner, blue and porcelain surfaces, consistent global navigation, and a labeled System / Light / Dark appearance control. Tokens live in `src/tokens.js`; React components and their styles live in `src/react.js`, `src/table.js` and `src/components.css`. Static navigation lives in `src/site.js`. Generated assets must not be edited in consuming repos.

```sh
npm run build
npm test
npm run preview
# Open http://localhost:4174/preview/
```

## Contract

Set `data-project` on the document root to `portfolio`, `experiments`, `visualizations`, `calculator`, `game`, `finance`, or `household`. Set `data-theme` to `light` or `dark`, or omit it for CSS system preference. Set `data-density` to `comfortable`, `compact`, or `game`. Game targets are 60px; compact mode retains 44px targets.

The generated CSS and JavaScript exports have matching concrete values. Semantic tokens cover text, surfaces, status backgrounds/text/icons, actions and their states, focus, categorical chart colors, sequential ramps, spacing, type, radius, and motion. Every project ID resolves to the same brand palette; status colors retain their meaning across apps. Density is independent of identity. The locally hosted Commissioner variable font ships with its OFL notice and pinned upstream provenance.

The base palette is porcelain `#F1F5F7`, model white `#FFFFFF`, deep ink `#17323D`, enamel blue `#1B5D8A`, glacier `#A8D7EB`, and crane yellow `#E7BD45`. Yellow belongs to the building's crane and meaningful progress, rather than general decoration. Body type uses straight terminals; headings add a modest flare through the font's `FLAR` axis. Controls use 8px corners, surfaces 16px, and dialogs 20px. Shadows belong to overlays. See [the visual and copy decisions](docs/identity.md) for the complete direction and rejected treatments.

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

Load `tokens.css`, optional `legacy.css`, and then `components.css`. The compatibility layer maps existing site names onto semantic tokens; it does not resize every button, select, or arbitrary surface. Shared component classes own their dimensions and states. `release.json` records the version and SHA-256 hashes. Commit that snapshot with the consuming app; independent deployments do not depend on this directory, a CDN, or a sibling checkout. To upgrade, rebuild one release and sync it to each repo in separate reviewable changes. Do not hand-edit snapshots.

The game and calculator integrations also install the release tarball, committed in its repository, for their React components. A future package registry can replace that file dependency without changing imports. Npm publishing is disabled; this release uses committed snapshots and tarballs.

## Appearance

Load `prepaint.js` synchronously in the document head before styles or inject that same asset into a bundled application's HTML. It separates the saved preference (`data-appearance-preference`) from its resolved light/dark appearance (`data-theme`), preventing a first-paint flash and preserving System mode. `createAppearanceController` owns storage, OS changes, cross-tab changes, and fresh chart tokens. It retains public apps' existing `sheet-theme` cookie and localStorage choices; cookies use `.rishabhdoshi.com` only on that domain. Unrelated hosts use their own host cookie.

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

For Finance, use `createAppearanceController({storageKey:'finance-appearance', cookie:false})` and set `data-appearance-storage="finance-appearance" data-appearance-cookie="false"` on the root for matching prepaint behavior. Do not copy public cookie settings to private applications. Call `destroy()` when disposing a controller and `refresh()` when changing density or project. The injectable `installTheme` adapter remains available for older consumers; it retains its existing resolved-stamp precedence.

## Validation and remaining work

`npm test` checks text/action/status contrast in every project appearance, target-size minima, bad input rejection, and preference behavior. This is not a complete screen accessibility audit. The public-site browser report lives in the adjacent rollout directory.
For the complete integration check, keep the five site checkouts under
`../design-system-rollout/`, build the two React apps, install Chromium with
`npx playwright install --with-deps chromium`, then run `npm run test:browser`.
`DESIGN_WORKSPACE` can override the common parent directory.
`npm run test:identity` checks all six apps' common navigation, appearance,
text selection, and responsive header behavior. Finance needs a running synthetic
preview; set `FINANCE_PREVIEW_URL` to its URL before running that check.

The calculator uses shared NumericField, RangeField (Base UI Slider), Card, FieldGroup, Metric, DataRow, DataTable and PageHeader components across all six views. Finance uses the shared application shell, fields, workflow, modal and TanStack table renderer; its Python services continue to own the business rules and financial writes. Mr. Shake keeps its game state and secrecy behavior in the app. Existing public visualizations and the portfolio's building engine remain application-owned. No Aceternity or Magic UI source is copied in this release.

Upstream references: [shadcn installation](https://ui.shadcn.com/docs/installation), [Base UI quick start](https://base-ui.com/react/overview/quick-start). Base UI and React license notices remain in their installed packages; retain them in distributions. The font OFL notice is included in each static snapshot.


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
`fonts/commissioner-variable.woff2` URL into an application asset; no remote font request is
needed. `AppShell` sets shared typography and surface colors inside the shell.
Applications still reset document margins and own their business-specific layout.

| Component | Contract |
| --- | --- |
| `AppShell` | `brand`, `navigation` (`id`, `label`, `href` or `onClick`, `active`, optional `icon`), `actions`, `footer`, `children`. Includes a skip link, navigation landmark and responsive main content. |
| `Button` | Native/Base UI button props plus `variant` (`primary`, `secondary`, `danger`, `ghost`) and `loading`. Loading disables repeat activation. |
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
