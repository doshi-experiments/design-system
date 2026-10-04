# Doshi design system

Version 0.4.0: shared foundations, React application components, editable tables, calculator controls, game counters and static index recipes. Tokens live in `src/tokens.js`; React recipes and their styles live in `src/react.js`, `src/table.js` and `src/components.css`. Generated assets must not be edited in consuming repos.

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

The game and calculator integrations also install the release tarball, committed in its repository, for their React components. A future package registry can replace that file dependency without changing imports. Npm publishing is disabled; this release uses committed snapshots and tarballs.

## Appearance

Keep the existing `sheet-theme` cookie, `.rishabhdoshi.com` scope, localStorage fallback, and pre-paint stamp in public apps. `metadata.js` observes their appearance stamp and updates theme-color. Calculator and game adapters use concrete token values directly. The standalone `installTheme` adapter is for new consumers: an existing stamp wins, persistence is injected, system changes are followed only in system mode, and `onChange` supplies fresh chart values. Call `refresh()` when changing project/density. Stamp appearance before first paint; the preview demonstrates a localStorage adapter. Do not copy the public cookie domain to unrelated household hosts.

## Validation and remaining work

`npm test` checks text/action/status contrast in every project appearance, target-size minima, bad input rejection, and preference behavior. This is not a complete screen accessibility audit. The public-site browser report lives in the adjacent rollout directory.
For the complete integration check, keep the five site checkouts under
`../design-system-rollout/`, build the two React apps, install Chromium with
`npx playwright install --with-deps chromium`, then run `npm run test:browser`.
`DESIGN_WORKSPACE` can override the common parent directory.

The calculator now also uses shared NumericField, RangeField (Base UI Slider), Card, FieldGroup, Metric, DataRow, DataTable and PageHeader recipes across all six views. Version 0.1.0 consumers remain pinned until explicitly upgraded. Finance can use the shared React application shell, fields, workflow, modal and TanStack table renderer. Its Python services continue to own the business rules and financial writes. Further Base UI recipes and selected Magic UI effects can be added centrally; no Aceternity or Magic UI source is copied in this release. Existing public visualizations and the portfolio's 3D composition remain application-owned.

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
check all six routes at 320, 390 and 1440 pixels in both appearances and the real
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
The experiments index demonstrates this contract with hash-addressable sections.


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
`fonts/hanken-grotesk.ttf` URL into an application asset; no remote font request is
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
checks all shared application recipes at 320, 390 and 1440 pixels in light/dark,
44px control targets, action contrast, font loading, native field callbacks,
uploads, editable table callbacks, disclosure keyboard activation, and modal
focus trapping, Escape, focus restoration and dismissal guards.

For repeatable consumer upgrades, see [the central rollout process](docs/rollout.md).
Changes are authored here, then versioned and adopted in each consuming repo;
a source edit by itself does not rebuild already deployed applications.
