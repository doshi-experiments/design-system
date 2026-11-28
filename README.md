# Doshi design system

Version 0.13.0 keeps Felt, the one identity for the portfolio and every app: Host Grotesk, warm grey wool in light, charcoal in dark, and one signal, a raspberry-to-brick gradient under white text, with raised and stitched surfaces, pressed-in fields and a fibre texture. Global navigation underlines the current page; the labeled System / Light / Dark appearance control is unchanged. Tokens live in `src/tokens.js`; React components and their styles live in `src/react.js`, `src/table.js` and `src/components.css`. Static navigation lives in `src/site.js`. From 0.10.0 the same identity also ships for Tailwind CSS v4 (`tailwind.css`, generated from `src/tailwind-theme.js`) with components in shadcn's structure on Base UI (`src/ui/`, exported as `/ui`); see [the migration plan](docs/tailwind-migration.md). Generated assets must not be edited in consuming repos.

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

Deprecated since 0.11.0, and removed at 1.0: `ToggleButton`, `Badge`, `Alert`, `Card`, `CardTitle`, `TextField`, `SelectField`, `CheckboxField`, `FieldGroup` and `NumericField`'s markup, with their `ds-*` classes. Use `/ui`'s `Toggle`, `Badge`, `Alert`, `Card`, `CardTitle`, `Field` with `Input`, `NativeSelect` or `Checkbox`, and `FieldSet` with `FieldGroup`. Deprecated since 0.12.0: `HelpPopover`, `RangeField`'s slider, `Select`, `MenuButton` and `Dialog`; use `/ui`'s `HelpPopover`, `Slider`, `Select`, `DropdownMenu` and `Dialog`. Deprecated since 0.13.0: `DataTable`, `EmptyState` and `/table`'s `EditableTable`; use `/ui`'s `Table` and `Empty`, and `/ui/table`'s `EditableTable`.

React consumers also install React, React DOM and `@base-ui/react`. They are optional peer dependencies so static consumers need none of them. `Button` preserves native disabled semantics and locks during loading. `HelpPopover` uses Base UI focus/dismissal behavior and a portaled, fixed positioner. These are app-owned initial recipes over the Base UI foundation selected for shadcn; this release does not claim to contain the full shadcn component catalogue.

### Tailwind CSS v4 (0.10.0)

An app with a Tailwind CSS v4 build imports Felt's theme after Tailwind, and keeps `components.css` in a layer while it still uses `ds-*` classes, so utilities can override them:

```css
@import "tailwindcss";
@import "@doshi-experiments/design-system/tailwind.css";
@import "@doshi-experiments/design-system/components.css" layer(components);
```

```js
import {Button, Card, CardTitle, Field, FieldLabel, Input, cn} from '@doshi-experiments/design-system/ui';
```

`/ui` holds `Button`; `Toggle`; `Badge`; `Alert` with `AlertTitle`, `AlertDescription` and `AlertAction`; `Card` with `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent` and `CardFooter`; the field family, `Field`, `FieldLabel`, `FieldHeading`, `FieldDescription`, `FieldError`, `FieldSet`, `FieldLegend` and `FieldGroup`; `Input`; `InputGroup` with `InputGroupInput` and `InputGroupAddon`; `NativeSelect`; and `Checkbox`. Each draws what the `/react` component it replaces draws, which `scripts/check-ui.mjs` checks part by part. A text field is composed rather than configured:

```jsx
<Field>
  <FieldLabel htmlFor="price">Purchase price</FieldLabel>
  <Input id="price" value={price} onChange={event => setPrice(event.target.value)} />
  <FieldDescription>Before closing costs.</FieldDescription>
</Field>
<Field orientation="choice">
  <FieldLabel variant="choice"><Checkbox checked={done} onCheckedChange={setDone} /><span>I reviewed the changes</span></FieldLabel>
</Field>
```

A numeric field puts `FieldLabel variant="heading"` in a `FieldHeading` and its input in an `InputGroup` with `InputGroupAddon` prefixes or suffixes; fields in a `FieldGroup` share rows so their inputs line up. Hide a label with `sr-only`. `Checkbox` stays the browser's own 20px box in the signal, and `NativeSelect` keeps the browser's arrow. From 0.12, `/ui` also holds the popups: `HelpPopover` (and `Popover` with `PopoverTrigger`, `PopoverContent`, `PopoverTitle`, `PopoverDescription`, `PopoverClose`), `Slider`, `Select` (with `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `SelectGroup`, `SelectLabel`, `SelectSeparator`), `DropdownMenu` (with `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuGroup`, `DropdownMenuLabel`, `DropdownMenuSeparator`), `Dialog` (with `DialogTrigger`, `DialogContent`, `DialogTitle`, `DialogDescription`, `DialogBody`, `DialogFooter`, `DialogClose`) and `Combobox` (with `ComboboxInput`, `ComboboxContent`, `ComboboxList`, `ComboboxItem`, `ComboboxEmpty`). Popups render in a portal: help popovers at z-index 100, dialogs at 200 and 201, and select, menu and combobox popups at 210, above dialogs. From 0.13, `Table` (with `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TableCaption` and `TableEmpty`) draws the raised, scrolling results table around a native table, and `Empty` (with `EmptyTitle`, `EmptyDescription`, `EmptyContent`) the empty state. A column of long text wraps with `whitespace-normal wrap-break-word`. The TanStack table is `EditableTable` from `@doshi-experiments/design-system/ui/table`, a separate entry because `@tanstack/react-table` is an optional peer dependency.

`tailwind.css` brings `tokens.css` with it and declares `@source "./ui.js"`, so the shared components' classes are generated without any app config. Its theme points every utility at the `--ds-*` tokens (`bg-raised`, `text-ink`, `text-caption`, `rounded-pill`, `shadow-raised`, `min-h-target`, `p-panel`, `max-w-measure`), so colours switch with `data-theme` and sizes with `data-density` without a `dark:` variant. Tailwind's default palette, type sizes, radii and shadows are cleared: shadcn's `bg-primary` or `text-sm` generate nothing. Felt's surfaces are utilities: `raised`, `pressed`, `stitched` (on a positioned element), `stitch-rule`, `fibre`, the `signal` fill (with `hover:signal-hover` and `active:signal-pressed`), `signal-solid`, `accent-signal`, `action-link` for signal-coloured text, and `tone-success|warning|error|info` pairs. There is deliberately no signal or status text colour. Variants: `dark:` (for what differs by more than colour, such as the fibre) and `comfortable:`, `compact:` and `game:` for the root's density. Breakpoints are Felt's, not Tailwind's: `xs` 380px, `sm` 640px, `md` 800px, `lg` 1024px and `xl` 1240px (`2xl` is gone). `cn()` merges classes with tailwind-merge taught Felt's names.

A page without React uses the `ds-button` and `ds-chip` utilities, which draw what `/ui`'s `Button` and `.ds-chip-link` draw and are generated only where a page names them. The button reads the attributes `/react` writes, and its disabled look follows `:disabled`:

```html
<button class="ds-button" data-variant="primary">Save changes</button>
<button class="ds-button" data-size="icon" aria-label="Add note"><svg>…</svg></button>
<a class="ds-chip" href="/visualizations/">Visualizations</a>
<button class="ds-chip" aria-pressed="true">Clean</button>
```

Vite's Tailwind plugin rebases the package's `url()`s for fonts and the fibre. The Tailwind CLI keeps them as written (`./fonts/…`, `./felt/…`), so an app built with the CLI copies `dist/fonts/` and `dist/felt/` beside its compiled CSS. A site built with Vite inlines `prepaint.js` with the shared plugin, which puts it straight after `<meta charset>` (or at a `<!-- Shared appearance prepaint -->` marker) and refuses a page whose styles would load first:

```js
import {prepaint} from '@doshi-experiments/design-system/vite';
export default defineConfig({plugins: [tailwindcss(), prepaint()]});
```

`node scripts/ds-usage.mjs <checkout>…` counts the `ds-*` classes and `/react` imports an app still has; each migration PR reports it. `/ui` components need React 18.3 or 19 and `@base-ui/react`; `tailwindcss` 4.3 is an optional peer dependency.

Every consumer is upgraded centrally. With clean checkouts of every consumer in a rollout workspace (named as in `rollout.json`), prepare and then apply an upgrade:

```sh
npm run rollout -- --workspace /path/to/design-system-rollout
npm run rollout -- --workspace /path/to/design-system-rollout --apply
# Narrow it: --only portfolio-landing,mr-shake
```

The command writes each consumer's tarball and lockfile entry, and for the portfolio's `/versions/`, the one consumer that still commits a snapshot, the snapshot through `scripts/sync.mjs`. It changes nothing else; commit each consumer as its own pull request. It does not commit, push or deploy.

Load `tokens.css`, optional `legacy.css`, and then `components.css`. The compatibility layer maps existing site names onto semantic tokens; it does not resize every button, select, or arbitrary surface. Shared component classes own their dimensions and states. `release.json` records the version and SHA-256 hashes. Commit that snapshot with the consuming app; independent deployments do not depend on this directory, a CDN, or a sibling checkout. To upgrade, rebuild one release and sync it to each repo in separate reviewable changes. Do not hand-edit snapshots.

From the Tailwind migration on, a consumer with a build step installs only the committed tarball, which `npm ci` checks against its lockfile, and takes fonts, fibre tiles and `prepaint.js` from it: the calculator, Mr. Shake, experiments-landing and visualizations do, and the others follow as they migrate. Finance also installs only the tarball. The household Tasks app is not in `rollout.json`; it builds the tarball into its own `frontend/vendor/` and does not commit it. A future package registry can replace that file dependency without changing imports. Npm publishing is disabled; this release uses committed snapshots and tarballs.

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


## Licence

MIT, see [LICENSE](LICENSE). The exception: the Host Grotesk font files in `src/fonts/` and `dist/fonts/` are under the SIL Open Font License 1.1 (`host-grotesk-OFL.txt` beside them).

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
  AppShell, Alert, Badge, Button, Card, CardTitle, CheckboxField, Dialog, Disclosure,
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
| `Select` | Styled listbox (Base UI Select) for when a native sheet would break the look: `label`, `value`, `onValueChange`, `options` (`{value, label, disabled}` or `[value, label]`), optional `groups` (`{label, options}` or `[label, options]`, shown after the options under a stitched rule), `hint`, `disabled`, `layout` (`stacked`, `inline` label to the left, or `hidden` for screen readers only), `variant` (`field` pressed in, or `quiet` flat until hovered, for editing in a table), `size` (`"small"`), `className`, `triggerClassName`. Values are strings. An inline picker is at least 128px wide; set `--ds-picker-min-width` on a wrapper to keep a changing value from resizing it. 0.8.0. |
| `DateField` | Calendar popover: `label`, `value` (`YYYY-MM-DD` or `''`), `onValueChange`, optional `min`, `max`, `hint`, `placeholder` (`No date`), `clearable`, `layout`, `size`, `format`, `todayLabel`, `clearLabel`. Monday-first grid; arrows move a day or a week, Page Up/Down a month, Home/End the week, Enter picks; focus stays within `min`..`max`. `formatDate(iso)` gives its `Wed 21 Oct 2026` form. 0.8.0. |
| `TimeField` | `Select` of times of day: `step` minutes (30), `allowEmpty` with `emptyLabel` (`No time`), `format` (12-hour clock); values are `HH:MM` or `''`, and an off-grid value is kept. Other props pass to `Select`. 0.8.0. |
| `MenuButton` | A button that opens a menu of actions: `label`, `items` (`{label, onSelect, disabled}` or `'separator'`), `variant`, `size`, `align` (`end`), `disabled`, `loading`. 0.8.0. |
| `ToggleButton` | Pressed/unpressed status (Base UI Toggle, `aria-pressed`): `pressed`, `onPressedChange`, `tone` (`error`, `warning`, `success`, `info`; untoned is pressed in), `size`, `loading`, `children`. Off is quiet; on carries the tone's tinted background. Always pass words such as “Alarm on” / “Alarm off”; a tone is never shown as bare colour. 0.8.0. |
| `IconButton` | Round icon-only button: `label` (required, becomes `aria-label`), `size` (`"small"` draws 32px over the full target), children. 0.8.0. |
| `ToastProvider` / `toast` | Mount `ToastProvider` once around the app; `toast(title, description?, {tone, timeout})` (tone `success` by default, timeout 4000ms) shows a confirmation that outlives the page that raised it. Bottom right, full width on phones, three at a time; error toasts carry the error tint and announce assertively. 0.8.0. |
| `SelectField` | Native select props, `label`, `value`, `onValueChange`, `options` (`value`, `label`, `disabled`), `hint`, `error`, optional `hideLabel`. Values are strings, as in native selects. |
| `CheckboxField` | Native checkbox props, `label`, `checked`, `onCheckedChange`, optional `hint`, `error`, `indeterminate`, `hideLabel`. Label provides the full touch target; with `hideLabel` (0.9.1) the label is for screen readers only and the box keeps a 44px square target, for a column of checkboxes in a table. |
| `FileUpload` | Native file input props, `label`, `accept`, `multiple`, `onFilesChange(File[])`, `hint`, `error`, `disabled`. Applications enforce file size, content and upload policy. |
| `Alert` / `Badge` | `tone` (`info`, `success`, `warning`, `error`), `children`. Alerts also accept `title`, `actions` and a `role` override; errors announce with `alert`, other tones with `status`. |
| `EmptyState` | `title`, `description`, `actions`, optional `children`. |
| `WorkflowSteps` | `steps` (`id`, `label`, optional `description` / `disabled`), current `value`, optional `onValueChange`. A navigation list with `aria-current="step"`; applications own step eligibility. |
| `Disclosure` | `title`, `children`, optional `defaultOpen` or controlled `open`, `onToggle`. Uses native details/summary keyboard and collapsed-content behavior. |
| `Dialog` | Controlled `open`, `onOpenChange`, `title`, `description`, `children`, `actions`, optional `closeLabel`, `initialFocus`, `finalFocus`, `dismissible`. Base UI provides modal focus trapping and dismissal; focus returns to the launching control. `dismissible={false}` blocks backdrop/Escape dismissal while keeping the explicit close action. |
| `EditableTable` | `data`, TanStack `columns`, stable `getRowId`, `label`, optional `caption`, `emptyMessage`, `maxHeight`, `busy`, `meta`, `rowClassName`. Custom cells receive TanStack context, including `table.options.meta`. A column's `meta.className` and `meta.style` go on its heading and cells. Cells stay on one line; give a column of long text `meta:{className:'ds-table-wrap'}` and a width so it wraps (0.9.1). |

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
whose current page is underlined in the signal (a coral dot until 0.8.1). `.ds-tabs` / `.ds-tab` add underline tabs for
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

## Pickers, menus, toggles and toasts (0.8.0)

Pieces the household Tasks app built for itself move here, so apps stop styling their
own. `Select`, `DateField` and `TimeField` open one raised felt popup instead of the
operating system's sheet; their fields are pressed in like the other inputs and take
`size="small"` and an inline or hidden label for toolbars and tables. `Select` takes
grouped options and a `quiet` variant for in-place editing. `DateField` is a
keyboard-driven month grid with `min`/`max`, Today and Clear; `TimeField` lists the day
in half-hour steps. `MenuButton` puts a list of actions behind one pill, and
`.ds-menu` / `.ds-menu-item` / `.ds-menu-separator` are the shared popup classes for
Base UI menus an app builds itself. `ToggleButton` shows a status that switches, with
the tone's tinted background and words when on, never bare colour; the error tone keeps
error red apart from the signal. `ToastProvider` and `toast()` give app-wide
confirmations. `IconButton` is the round icon-only control the calendar and toasts use.
Picker and menu popups sit above dialogs (z-index 210, dialogs 200), so a `DateField`
inside a `Dialog` opens over it; toasts stay beneath dialogs at 180.

Every target keeps `control-target` (44px; 60px at game density). Options, menu items
and calendar days are full targets, and a day's tile is drawn inset so neighbours never
overlap. Small pickers, toggles and icon buttons draw shorter over an invisible
full-size hit area, as 0.7.1 small buttons do. Picker fields are now 44px tall, the same
as `TextField`. `npm run test:components` covers the new components in both appearances
at all four widths: their hit areas, grouped and keyboard selection, the time slots,
calendar keyboard movement within `min`, Clear, the menu, the toggle's error tint and
dismissing a toast, and a calendar opened inside a dialog.

## Underlined global navigation (0.8.1)

The global header marks its current page, and a link under the pointer, with a 2px
underline in `action-primary` across the link's text instead of a 5px dot, so the
current page reads as a selected tab. The line grows from its centre on hover with the
usual spring and holds still with reduced motion. Nothing else changes: link targets
stay 44px, and the header's markup and `mountSiteHeader` options are the same.

## Toast actions (0.9.0)

`toast()` takes an `action: {label, onAction}` option that adds one small raised button
to the toast, for a reversible step such as Undo. Pressing it closes the toast, then runs
`onAction`. A toast with an action stays up 8 seconds instead of 4 (an explicit
`timeout` still wins), so there is time to reach it. `toast()` now returns the toast's
id, and `toast.close(id)` closes it early. Toasts without an action are unchanged. The
button keeps the 44px target over a shorter pill, like other small controls, and
`npm run test:components` checks its hit area and that it runs and closes.

## Wrapping table cells and hidden checkbox labels (0.9.1)

Table cells stay on one line, which suits dates, amounts and controls but let long
text spill across the next columns once an app capped the column's width. A cell or
heading with `.ds-table-wrap` now wraps inside its column, breaking a long word only
when it would overflow; the app still sets the column's width. `.ds-line-clamp` shows
at most two lines of any block (set `--ds-lines` for another count) and ends with an
ellipsis, so a long description doesn't make every row tall. Put the full text in a
`title` when it is clamped.

`CheckboxField` takes `hideLabel`, as `TextField` and `SelectField` already do. The
label stays the checkbox's accessible name but is hidden on screen, and the label
draws a 44px square target around the box, for a column of checkboxes in a table
under a heading such as "Skip". `npm run test:components` checks the hidden-label
target, that the box still toggles, and that a wrapping, clamped cell keeps its text
inside its column at two lines.

## Aligned numeric fields and one focus ring (0.9.2)

A `NumericField` inside a `.ds-field-grid` (which `FieldGroup` renders) now shares
the grid's rows through CSS subgrid: label, input and hint each take one row, so
inputs side by side line up even when one label wraps to three lines and its
neighbour to one, or their hints wrap differently. Labels sit at the bottom of the
label row, next to their input, and a help button or badge aligns with the label's
last line. An app's own grid of fields can opt in by adding the `ds-field-grid`
class; the app's column rules still win when they load later. Every child of the
grid should be a field, because each one spans three rows.

A focused numeric field showed two rings: the rounded one on the field and a square
one on the input inside it, from `legacy.css`'s global `:focus-visible`. Only the
field's ring remains. The help button in a field label, metric label or data row
no longer carries the raised button's shadow, which drew a circle over the label.

## Tailwind CSS v4 and the first shadcn component (0.10.0)

The foundation for moving every app to Tailwind CSS v4 and shadcn's components on
Base UI, without changing how anything looks. Nothing changes for an app that doesn't
import the new entry points; `ds-*` classes, `components.css` and `/react` work as
before. The plan, the order of migration and the retirement of `ds-*` are in
[docs/tailwind-migration.md](docs/tailwind-migration.md).

- `tailwind.css` (new export, with a `style` condition) is Felt's Tailwind v4 theme,
  variants and utilities, generated from `src/tailwind-theme.js` and `src/tokens.js`.
- `/ui` (new export) holds components in shadcn's shape: a `cva` recipe over a Base UI
  primitive, `data-slot`, and `cn()`. The first is `Button`, brought in with
  `shadcn add button` and restyled to Felt. It takes the same `variant` (`primary`,
  `danger`, `ghost`), `size` (`small`), `disabled` and `loading` as `/react`'s
  `Button`, and keeps `forwardRef` for React 18.
- `shadow-signal` and `shadow-signal-pressed` are new tokens for the primary key's
  shadows, which `components.css` previously wrote out; the drawn result is unchanged.
- The type scale gains a line height and tracking for each step in the Tailwind theme,
  tightening from -.02em at 25px to -.045em at 61px as `identity.md` describes.
- `npm run test:components` adds a parity check: the new `Button` on a Tailwind page
  against `.ds-button` on a page without Tailwind, at rest, hovered, pressed and
  focused, in light and dark, at 390px and 1440px, at comfortable and game density, by
  computed style and by pixel. It also checks that `.ds-button` is unchanged in
  `layer(components)` beside Tailwind. Screenshots land in `test-results/`.
- `preview/tailwind.html` shows the two buttons side by side in light and dark, with a
  density switch; `npm run preview` builds it. The preview's stale "Release 0.8.0" is
  corrected.
- New dependencies: `class-variance-authority`, `clsx` and `tailwind-merge`.

One behaviour differs by design: Tailwind v4's `hover:` applies only on devices that can
hover, so a tapped button on a phone no longer keeps its hover colour.

## A Vite plugin for prepaint, and a usage report (0.10.1)

What the static sites need to move onto Vite and Tailwind. Nothing is drawn differently.

- `/vite` (new export) is a Vite plugin, `prepaint()`, that inlines `prepaint.js` into
  every page straight after `<meta charset>`, or at a `<!-- Shared appearance prepaint -->`
  marker, and fails the build if a stylesheet would load before it.
- `scripts/ds-usage.mjs` counts each consumer's remaining `ds-*` classes and `/react`
  imports, skipping snapshots, archives and built files. `--fail-on-any` is the check
  1.0.0 will run before the old classes are removed.

## Button variants, plain-HTML buttons and chips, breakpoints and card sections (0.10.2)

What the audit after wave 1 asked of the system. Nothing already in use draws differently.

- `/ui`'s `Button` gains `variant="secondary"`, the raised pill with the selection fill on
  hover that `/react`'s secondary already drew, `variant="link"`, underlined signal text
  with the full target, and `size="icon"`, a round button the size of the target for one
  icon (give it an `aria-label`). `components.css` draws `link` and `icon` for `/react` too.
  The classes live in `src/ui/button-classes.js`.
- `ds-button` and `ds-chip` are Tailwind utilities in `tailwind.css` for pages without
  React. `ds-button` is built from the same classes as `/ui`'s `Button` and reads
  `data-variant` and `data-size`; `ds-chip` draws `.ds-chip-link`, and takes the signal
  with `aria-pressed="true"` or `aria-current`. `ds-usage` no longer counts them.
- Felt's breakpoints replace Tailwind's in `tailwind.css`: `xs` 380px, `sm` 640px, `md`
  800px, `lg` 1024px and `xl` 1240px.
- `<Card variant="flat">` is a section inside another card, with no surface or stitch of
  its own, and `CardTitle` (`.ds-card-title`) is a card's heading at the 20px step and
  weight 500.
- `identity.md` names 14px (`text-caption`) as the one step below body text, the card
  heading, and the breakpoints.
- The Button parity check covers 14 cases and the chip, and compares the plain-HTML
  utilities as well as `/ui` against `components.css`. The component lab checks the flat
  card and the card title.

## Toggle, fields, select, checkbox, card, badge and alert in /ui (0.11.0)

The second set of shadcn components on Base UI, restyled to Felt. Nothing already in use
draws differently; apps adopt them in their own pull requests.

- New in `/ui`: `Toggle`, `Badge`, `Alert` (with `AlertTitle`, `AlertDescription`,
  `AlertAction`), `Card` (with `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`,
  `CardContent`, `CardFooter`), the field family (`Field`, `FieldLabel`, `FieldHeading`,
  `FieldDescription`, `FieldError`, `FieldSet`, `FieldLegend`, `FieldGroup`), `Input`,
  `InputGroup` (with `InputGroupInput`, `InputGroupAddon`), `NativeSelect` (with
  `NativeSelectOption`, `NativeSelectOptGroup`) and `Checkbox`. They were added with
  `shadcn add` and restyled; Toggle, Badge and Alert keep `/react`'s `tone` prop.
- Two depart from shadcn on purpose: `Checkbox` is the native input in the signal rather
  than a drawn box, and `NativeSelect` keeps the browser's arrow, because that is what
  Felt draws. `FieldHeading` and `FieldLabel`'s `heading` and `choice` variants are Felt's
  additions for numeric fields and checkbox rows.
- Deprecated, to be removed at 1.0: `/react`'s `ToggleButton` (use `Toggle`), `Badge`,
  `Alert`, `Card` and `CardTitle`, `TextField`, `SelectField` (use `NativeSelect`),
  `CheckboxField`, `FieldGroup` (use `FieldSet` and `FieldGroup`) and `NumericField`'s
  markup, with their `ds-*` classes. `NumericField`'s behaviour (paste sanitising, arrow
  keys, range messages) moves when the app's fields do.
- `scripts/check-ui.mjs` (in `npm run test:components`) renders 25 cases from
  `preview/ui-parity.jsx`, each `/react` component on a Tailwind page with `components.css`
  in a layer beside its `/ui` composition on a page with Tailwind alone, and compares every
  named part by computed style, at rest and hovered and focused for controls, and each
  case by pixel, in light and dark, at 390px and 1440px, at comfortable and game density.
- `identity.md` now lists the shared components' small type accurately: 13px labels,
  affixes and chips, 12px hints and 11px badges.

## Popovers, slider, select, menus, dialogs and a combobox in /ui (0.12.0)

The second wave 2 release: the shared popups as shadcn components on Base UI, restyled to
Felt. Nothing already in use draws differently.

- New in `/ui`: `Popover` and the Felt `HelpPopover` built on it, which keeps `/react`'s
  behaviour: it opens on hover, tap or keyboard focus, closes on Escape or an outside
  press, and returns focus to its key without reopening. Inside `FieldHeading` the key
  loses its surface.
- `Slider`: the signal track and white-rimmed thumb, with a 44px control row and a ring on
  the thumb whose hidden input has focus.
- `Select`: one felt popup in place of the operating system's sheet, `variant="quiet"` and
  `size="small"`, groups with labels and the signal check on the chosen option. Give
  `Select` an `items` list so `SelectValue` shows labels.
- `DropdownMenu`: a button with a chevron that stays pressed in while its menu is open,
  with items, groups and stitched separators.
- `Dialog`: the dimmed backdrop and felt card, with `dismissible={false}` for a decision
  that must be made, and focus returned to whatever had it when the dialog opened, even
  without a trigger. `DialogClose` is the secondary button; `DialogFooter` aligns actions
  right.
- `Combobox` is new to the shared system: the text field's well with the select's popup.
  It replaces Finance's local category picker.
- Deprecated for 1.0: `/react`'s `HelpPopover`, `RangeField`'s slider, `Select`,
  `MenuButton` and `Dialog`.
- `check-ui.mjs` now opens popups: a case can name a trigger to click, and parts starting
  with `@` are found in the whole page, measured open and closed again with Escape. It
  adds help keys (alone and in a field heading), the slider, select (field, small, quiet
  and small, open with groups), the menu (closed and open) and the dialog (open), and
  drives the combobox: typing filters, Enter takes the match, no match says so. With
  0.11's cases that is 33 cases and 1913 checks.

## Tables and the empty state in /ui (0.13.0)

The last component release of wave 2. Every component on the migration plan's list now has
a `/ui` version; nothing already in use draws differently.

- `Table` and its parts: the raised panel that scrolls, as a focusable, labelled region,
  around a native table, with sticky headers, stitched rules between rows, the selection
  colour on a hovered row, and one-line cells unless a column opts into wrapping. Inside a
  card it takes the control radius. `TableEmpty` is the row a table shows when it has none.
- `Empty`, `EmptyTitle`, `EmptyDescription` and `EmptyContent`: the left-aligned empty
  state with its heading, a line in a readable measure, and actions.
- `/ui/table` (new export): `EditableTable` on `/ui`'s `Table`, with the same props as
  `/table`'s. It imports its parts from `ui.js`, and `tailwind.css` scans it.
- Deprecated for 1.0: `/react`'s `DataTable` and `EmptyState`, and `/table`'s
  `EditableTable`.
- `check-ui.mjs` adds the plain table (headers, cells, a wrapping column, a hovered row), a
  table in a card, the editable table with a select in a cell and with no rows, and the
  empty state: 38 cases and 2337 checks. Two fixes to the check itself: the preview build
  resolves its folder's real path, because macOS's temporary folder sits behind a symlink
  and Tailwind silently skipped the cases' own classes (which is why 0.12 excluded the
  slider's widths; they are compared again and match), and a stalled screenshot is retried
  once before it counts as a failure.
- `FieldLabel` resets numerals to proportional, as `.ds-field-label`'s font shorthand did,
  so a label inside a table no longer inherits its tabular figures.

