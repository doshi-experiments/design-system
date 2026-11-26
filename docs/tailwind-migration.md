# Moving to Tailwind CSS v4 and shadcn on Base UI

Status: plan approved 21 November 2026, with every open question settled as recommended
(Workers Builds for question 8). Step 0, the 0.10.0 foundation, is merged; 0.10.1 adds
the Vite plugin and `ds-usage.mjs`. Wave 1 (steps 1 to 4), the calculator, experiments-landing,
visualizations and Mr. Shake, is merged and live (22 November). 0.10.2 adds what the audit
after wave 1 asked for: the Button's secondary, link and icon, `ds-button` and `ds-chip` for
plain HTML, Felt's breakpoints, and card sections and titles. Mr. Shake's and the visualizations'
own controls move onto `/ui` in wave 2. Wave 2 began with 0.11.0: Toggle, the field family,
Input, Input Group, Native Select, Checkbox, Card, Badge and Alert; 0.12.0 adds Popover (and
HelpPopover), Slider, Select, Dropdown Menu, Dialog and Combobox.

Every app moves onto Tailwind CSS v4, with React components that follow shadcn's
structure on Base UI. Felt stays exactly as it is: same tokens, same surfaces, same
copy. This document covers the target, the order, each app's steps, the component
mapping, how the `ds-*` classes are retired, the Cloudflare changes and how to roll
back each step. The first release is 0.10.0, the foundation in this repository only.

## Open questions

Each question has a recommendation. Step 3 (the 0.10.0 foundation) needs answers to
1, 2 and 3. The others can wait until the app they affect.

1. **How do the React components get compiled?** `src/react.js` is plain JavaScript
   with `React.createElement` and no JSX, and `dist/react.js` is a straight copy.
   shadcn's source is TSX. *Recommendation:* run the shadcn CLI with `"tsx": false`,
   which writes `.jsx`, keep the sources in `src/ui/`, and compile them with esbuild
   (already a dev dependency) to `dist/ui.js`. That adds no TypeScript. esbuild's
   output is deterministic, so CI's `git diff --exit-code -- dist` still works.
2. **Should the new components support React 18?** The calculator and Mr. Shake run
   React 18.3.1. Finance and household-tasks run React 19. shadcn's current
   components take `ref` as a plain prop, and React 18 drops it. *Recommendation:*
   keep `React.forwardRef` in every ported component until no consumer is on 18, then
   remove it in a later release. Upgrade the calculator and Mr. Shake to React 19
   inside their own migration PRs. The calculator also needs Recharts 2.12.7 moved
   to a version that supports React 19.
3. **What happens to shadcn's own colour names?** shadcn's class strings use
   `bg-primary`, `text-primary`, `ring-ring`, `bg-muted`, `border-input` and similar.
   Mapping `--primary` onto the signal would make `text-primary` produce signal-coloured
   text, which `identity.md` forbids. *Recommendation:* define none of shadcn's names.
   Tailwind v4 emits nothing for a utility whose theme value doesn't exist, so an
   unported class shows up as visibly unstyled, not as something close to Felt.
   A test fails the build if any shadcn default name appears in `src/ui/`.
4. **Vite or Astro for the portfolio?** *Recommendation:* Vite, in multi-page mode.
   The portfolio has five live pages (home, three case studies, `/household/`). The
   three case studies are near-identical 137-line templates. Astro layouts would
   remove that duplication, but most of the portfolio's complexity is `split.js`, the
   same-origin iframe and 28 MB of frozen archives, and Astro doesn't help with any
   of those. The portfolio ran on Astro once (`versions/2026-09-astro/`), so that
   option is familiar if you want it anyway.
5. **Should any page stay hand-editable HTML?** *Recommendation:* yes, two kinds. The
   frozen archives under `versions/` and the generated 2025 copies (`/2025/`,
   `/<study>/2025/`) must stay byte-identical because CI and `check-links` verify
   them. They move into Vite's `public/` folder, which is copied without processing.
   Every live page stays an HTML file too: Vite takes HTML as its entry point, so
   pages are still edited as HTML, now with Tailwind classes.
6. **Do the static sites keep committed snapshots?** Once a site has a build step, it
   can install the release tarball and let the bundler resolve fonts and textures
   through `url()`, as Finance and household-tasks already do. *Recommendation:*
   switch the static sites and the two esbuild apps to tarball only, and drop their
   live `design-system/` snapshots. Releases stay immutable, because the tarball is a
   committed file. The portfolio's archived snapshots under `versions/` stay as they
   are. A small Vite plugin, shipped as `@doshi-experiments/design-system/vite`,
   inlines `prepaint.js` into `<head>`, the way Finance's `vite.config.js` does now.
   `rollout.json` drops `snapshot` for those consumers and gains `packageDirectory`.
7. **Should household-tasks join the central rollout?** It is a seventh consumer
   (`data-project="household"`), but it is not in `rollout.json`. Its tarball is
   gitignored and built by hand (`git archive` + `npm pack`, as its `CLAUDE.md`
   describes), so "upgrade through `npm run rollout`" can't apply to it today.
   *Recommendation:* register it in `rollout.json` with
   `tarballDirectory: "frontend/vendor"`. Rollout already writes files without
   committing them, so the tarball stays gitignored and the lockfile change is what
   gets committed. This needs a run on the server copy, because that is where the
   app is deployed.
8. **How is each site's Cloudflare deploy configured?** `wrangler.jsonc` in every
   public repo declares Workers static assets. The calculator's README says
   "Cloudflare Pages", though, and Mr. Shake's describes both. Workers Builds has
   **no output-directory field**: the output folder lives in `wrangler.jsonc`
   (`assets.directory`). Pages has one in the dashboard. I can't see the dashboard,
   so please confirm which product each site uses (Workers & Pages → the project →
   Settings → Build). The steps for both are below.
9. **Should the calculator's local navigation change shape?** Its local navigation is
   a gradient pill (`.calc-nav-link[aria-current=page]`), while `identity.md` asks
   for underline tabs (`.ds-tab`) for navigation inside an app. *Recommendation:*
   rebuild it with the Tailwind tab recipe during the calculator's migration, as a
   visible, called-out change. Or keep the pill, if the "identical before and after"
   rule should win here.

## What the audit found

Checked on 21 November 2026 after `git fetch` in every repository.

| Repo | Local branch | State | Design system | Tailwind | Build and deploy |
| --- | --- | --- | --- | --- | --- |
| design-system | `field-alignment` (merged as #11) | clean; 6 behind `main` | 0.9.2 is current | none | `npm run build`; `dist/` committed |
| rent-vs-buy-calculator | `design-system-0.9.2` (merged as #3) | clean; 4 behind `main` | tarball and snapshot 0.9.2 | **3.4.17**, CLI, `content: ["./src/App.jsx"]` | `build.sh`: esbuild, then Tailwind CLI, then a `cat` of CSS → `dist/`; Cloudflare |
| mr-shake | `readme-refresh` (merged) | clean; 3 behind | tarball and snapshot 0.8.1 | none | `build.sh`: esbuild → `dist/`; Cloudflare |
| experiments-landing | `readme-refresh` (merged) | clean; 3 behind | snapshot 0.8.1 | none | none; `public/` uploaded |
| visualizations | `readme-refresh` (merged) | clean; 3 behind | snapshot 0.8.1 | none | none; `public/` uploaded |
| portfolio-landing | `readme-refresh` (merged) | clean; 1 behind | snapshot 0.8.1, on `/versions/` only | none | none; repo root uploaded through the `.assetsignore` allow-list |
| finance (private, `master`) | `readme-refresh` (merged) | clean; 2 behind | tarball 0.9.1 in `ingest/frontend/vendor/` | none | Vite 7, React 19; Docker Compose on the home server |
| household-tasks | `readme-refresh` (merged) | clean; 4 behind | tarball 0.9.0, gitignored | none | Vite 7, React 19; Docker Compose on the home server |

Server copies: the deployed checkouts of `finance`, `household-tasks` and `design-system` are each on
their default branch with clean working trees. Each `HEAD` is an ancestor of `origin`,
behind by 2, 4 and 6 commits, all README, licence or 0.9.2 changes. None of them
carries unpushed commits. The server's `design-system` copy is still at 0.9.1.

Every local checkout sits on a branch that has already been merged. Start each
migration with `git switch main && git pull` (`master` for Finance).

### How each app uses the design system

| App | `ds-*` classes in its own source | Shared React components |
| --- | --- | --- |
| experiments-landing | `ds-chip-link` (9), `ds-button` (5), `ds-skip-link` | none: `mountSiteHeader` from `site.js` |
| visualizations | `ds-skip` only; its styles are about 25 `--ds-*` variables inline in `index.html` | none: `mountSiteHeader` |
| portfolio-landing | none. The home page and case studies mirror the signal in `portfolio.css` (`--sig`, `--sig-grad`, `--focus`); only `/versions/` loads the system | none |
| rent-vs-buy-calculator | `ds-field-grid` (12), `ds-card` (10), page header, table and metric classes in `design.css` | Button, HelpPopover, SegmentedControl, NumericField, RangeField, Card, FieldGroup, Metric, DataRow, DataTable, PageHeader, SiteHeader, Disclosure |
| mr-shake | `ds-stepper`, `ds-site-header`, `ds-skip`; 510 lines of its own CSS | Button, NumberStepper, SiteHeader, Disclosure |
| finance | `ds-button` (7), `ds-app-*`, `ds-field*`, `ds-table-wrap`, `ds-line-clamp`, `ds-popover-positioner` | AppShell, Alert, Badge, Button, Card, CheckboxField, DataRow, DataTable, Dialog, Disclosure, EmptyState, FileUpload, Metric, PageHeader, SegmentedControl, SelectField, TextField, WorkflowSteps, EditableTable, SiteHeader |
| household-tasks | `ds-button` (8), `ds-text-input` (6), `ds-tabs`/`ds-tab`, `ds-segmented`, `ds-field*`, `ds-eyebrow`, `ds-badge` | Alert, Badge, Button, Card, CheckboxField, DataTable, DateField, Dialog, EmptyState, MenuButton, PageHeader, SegmentedControl, Select, TextField, TimeField, ToastProvider, toast, ToggleButton |

The calculator's Tailwind usage is layout only: `flex`, `items-center`, `gap-*`,
`mb-*`, `grid-cols-*`, with no colours. It also has 299 inline `style={{…}}` objects,
which are what "page layout in Tailwind utilities" will mostly replace.

### Where the brief needs correcting

- **Mr. Shake's 44px e2e check doesn't run all the way through.** `test/e2e.mjs` looks
  for the removed `.stepper__value` and stops early (its `CLAUDE.md` says so). Target
  sizes and secrecy are covered today by `scripts/check-game-privacy.mjs` and
  `check-rollout.mjs` here. Fix the e2e suite before Mr. Shake migrates.
- **The portfolio's home page and case studies don't use the design system.** Moving
  them to Tailwind means adopting the shared tokens there for the first time, not
  swapping one implementation for another. Their Felt face is hand-made in
  `portfolio.css`, so "identical before and after" is measured against that file.
- **Tailwind v4 defines variants with `@custom-variant`.** `@variant` applies a variant
  inside a rule. The theme file uses both.
- **shadcn's Collapsible and Accordion measure height in JavaScript.**
  `COMPONENTS.md` treats that as a downgrade from the native `<details>` and its
  `0fr → 1fr` transition. `Disclosure` keeps native details.

## Target architecture

```
src/tokens.js  ── the single source (unchanged API) ──┐
                                                       ├─ build.mjs ─► dist/tokens.css     runtime --ds-* values per project × appearance × density
                                                       ├─────────────► dist/tokens.js/json for Recharts and canvas (unchanged)
                                                       └─────────────► dist/tailwind.css   @theme inline + @custom-variant + @utility (new, generated)
src/ui/*.jsx  ── shadcn structure on Base UI, Felt classes ─ esbuild ─► dist/ui.js          (new export: /ui)
src/react.js, src/components.css, src/legacy.css ─ copied ─► dist/ (frozen; retired at 1.0.0)
```

### One source of values

`tokens.css` keeps holding the live values as `--ds-*` custom properties, switched by
`data-project`, `data-theme` and `data-density` on the root. `tailwind.css` points
Tailwind's theme at those properties with `@theme inline`, so a utility such as
`bg-raised` compiles to `background-color: var(--ds-surface-raised)`. The palette
therefore changes with the root attributes and needs no `dark:` variant. `build.mjs`
writes `tailwind.css` from `tokens.js`, so the JS export, `tokens.css` and the
Tailwind theme can't drift apart. A unit test checks that every theme variable refers
to a token that exists. Recharts and canvas code keep calling `resolveTokens()`.

### The theme

Tailwind's default namespaces are cleared first (`--color-*: initial`, and the same
for `--font-*`, `--text-*`, `--radius-*` and `--shadow-*`), so neither Tailwind's
grey palette nor shadcn's look can leak through.

| Felt token | Tailwind variable | Utilities |
| --- | --- | --- |
| `surface-page`, `-raised`, `-overlay`, `-inset` | `--color-page`, `--color-raised`, `--color-overlay`, `--color-inset` | `bg-page`, `bg-raised`, … |
| `text`, `text-secondary`, `text-disabled`, `text-inverse` | `--color-ink`, `--color-ink-secondary`, … | `text-ink`, `text-ink-secondary` |
| `border`, `stitch`, `selection` | `--color-line`, `--color-stitch`, `--color-selection` | `border-line`, `bg-selection` |
| `action-link`, `focus` | `--color-link`, `--color-focus` | `text-link`, `outline-focus` |
| `chart-1…4`, `ramp-1…5`, `amount-in/out` | `--color-chart-1`, … | `fill-chart-2`, `stroke-chart-1`, `text-amount-out` |
| `font-body` | `--font-sans`, `--font-mono` (both Host Grotesk) | `font-sans`; figures use `tabular-nums` |
| type scale 16 to 61px | `--text-caption`, `--text-body`, `--text-card`, `--text-section`, `--text-title`, `--text-large`, `--text-hero`, `--text-display`, each with its line height and tracking | `text-section` |
| radii | `--radius-pill`, `--radius-control`, `--radius-container`, `--radius-dialog` | `rounded-pill`, `rounded-control` |
| shadows | `--shadow-raised`, `--shadow-pressed`, `--shadow-overlay` | `shadow-raised` |
| space | `--spacing: 0.25rem`, Tailwind's default, which is already Felt's 4px scale (`p-2` = 8px, `p-6` = 24px, `p-12` = 48px) | `p-6`, `gap-3` |
| density | `--spacing-target`, `--spacing-control`, `--spacing-control-compact`, `--spacing-panel`, `--spacing-cell` | `min-h-target`, `h-control`, `p-panel` |
| layout | `--container-measure: 64ch`, `--container-page: 1240px` | `max-w-measure`, `max-w-page` |
| motion | `--ease-felt`, `--ease-spring`; durations as utilities | `ease-spring`, `duration-fast` |

Some tokens are deliberately **not** exposed as colours. Putting `action-primary` in
`--color-*` would generate `text-signal`, so the signal only exists as the `signal`
utility below; a solid `signal-solid` and `accent-signal` (for `accent-color`) are
the only other ways to reach it. Status colours are likewise exposed only as pairs
(`tone-error` sets the tinted background and the text together), because error red
always comes with its background and words. Components own their invalid states.

### Surfaces (`@utility`)

| Utility | What it draws | Replaces |
| --- | --- | --- |
| `raised` | `surface-raised`, `shadow-raised`, ink text | `.ds-card`'s surface, raised keys and the header |
| `pressed` | `surface-inset`, `shadow-pressed` | fields, tracks, wells |
| `stitched` | the 1.5px dashed `stitch` line 7px inside the edge, drawn on `::after`; needs `relative` | `.ds-card::after`, `.ds-stitch` |
| `stitch-rule` | a 1.5px dashed top rule | `.ds-metric`, `.ds-field-group` |
| `signal` | `action-gradient` under white `action-text`; hover and press deepen, never lighten | primary buttons, chosen chips, slider fills |
| `action-link` | `action-link` text colour | signal-coloured text and links |
| `fibre` | the fibre tile, multiplied in light and overlaid in dark | the `body` rule in `components.css` |

### Variants (`@custom-variant`)

- `dark` matches `[data-theme=dark]` on the root, plus a
  `prefers-color-scheme: dark` branch for a root without `data-theme` (System before
  any script has run). Colours rarely need it, since they already switch; it is for
  values that differ by more than colour, such as the fibre blend mode.
- `game`, `compact` and `comfortable` match `[data-density=…]` on the root, so Mr.
  Shake can write `game:text-hero` where needed. Target sizes come from
  `--spacing-target`, which is 60px at game density, so `min-h-target` stays correct
  everywhere without a variant.

### How an app uses it

```css
/* app.css */
@import "tailwindcss";
@import "@doshi-experiments/design-system/tailwind.css";
/* While the app still uses ds-* classes. In a layer, so utilities win: */
@import "@doshi-experiments/design-system/components.css" layer(components);
```

`tailwind.css` declares `@source "./ui.js"`, which Tailwind resolves relative to the
stylesheet, so an app's build generates the components' classes without its own
config. Today `components.css` loads unlayered, and unlayered CSS beats every
Tailwind layer whatever its specificity. Loading it in `layer(components)` is what
lets a utility such as `p-0` override a `ds-*` rule during the transition.

### Components

New components live in `src/ui/`, one file each, in shadcn's shape: a `cva` recipe
over a Base UI primitive, `data-slot` attributes, and class merging through `cn()`.
They are published from a new `./ui` export. `./react` stays as it is (bug fixes
only) until 1.0.0, so an app can move one import at a time. Runtime dependencies go
up by `class-variance-authority`, `clsx` and `tailwind-merge`. `cn()` configures
`tailwind-merge` with Felt's theme names. Without that, `cn('text-caption',
'text-ink')` would drop one of the two, because tailwind-merge can't tell a custom
size from a colour.

### Static sites

Each static site gets a `package.json`, Vite, `@tailwindcss/vite` and the release
tarball. Source HTML moves to the repo root (or to `src/` for the portfolio),
untouched assets stay in `public/`, and `vite build` writes `dist/`. Cloudflare
serves `dist/` as the calculator and Mr. Shake already do. `prepaint.js` is inlined
synchronously into `<head>` by the shared plugin, ahead of every stylesheet.

The calculator and Mr. Shake keep their `build.sh` and esbuild. They swap the v3 CLI
for `@tailwindcss/cli` v4. Moving them to Vite would hash asset names, and their
service workers precache a fixed list of names (`app.css`, `app.js`).

## Order of migration

| # | Step | Why it goes here |
| --- | --- | --- |
| 0 | **design-system 0.10.0**: `tailwind.css`, `/ui` with `Button`, comparison preview | Everything else imports it. No consumer changes. |
| 1 | **rent-vs-buy-calculator** | Already runs Tailwind, so the v3 → v4 upgrade is contained. Its utilities are layout only. It exercises the constraint that JS-readable tokens must hold for Recharts, and `test:calculator` already checks six routes at four widths in both appearances. |
| 2 | **experiments-landing** | The smallest static site: one page and 34 lines of its own CSS. It proves the new build step and the Cloudflare settings change where a mistake costs least. |
| 3 | **visualizations** | The second static site, on a proven pattern. It adds canvas token reads, vendored modules that must stay pinned, and `?debug` checks. |
| 4 | **mr-shake** | After the e2e suite is fixed (its own PR first). It needs the `game` density variant, 60px targets and the unchanged secrecy invariant, and its React 19 upgrade is independent of the others. |
| 5 | **design-system 0.11 to 0.13**: port the remaining components (below) | Finance and household-tasks use most of the catalogue, so they wait for it. |
| 6 | **portfolio-landing** | The most visible site, for hiring teams, and the most unusual: a split, an iframe and frozen archives. It goes after two static sites have proven the pattern. |
| 7 | **household-tasks** | Production, deployed on the home server, and the heaviest component consumer: pickers, menus, toasts, toggles, dialogs. It needs the full catalogue and the rollout decision (question 7). |
| 8 | **finance** | Private, works on real financial data, has frozen code surfaces and a rebuild that has slipped before. It goes last, when every component is proven elsewhere. |
| 9 | **design-system 1.0.0**: remove `ds-*` classes, `components.css`, `legacy.css` and `/react` | Only once the usage report shows zero across all seven consumers. |

Each app is one PR in its own repository, with its design-system upgrade in the same
PR (prepared by `npm run rollout -- --only <id>`). A component port is one
design-system release, and a consumer adopts it later in its own PR.

## Per-app steps

Every app's PR follows the same checks:

1. Take screenshots before the change: every page at 390px and 1440px, light and
   dark. Use `portfolio-audit` for the portfolio, and Playwright scripts here for
   the rest.
2. Upgrade with `npm run rollout -- --only <id> --apply`.
3. Make the app-specific changes below.
4. Take the same screenshots after, and compare them with the parity check (see
   Risks). Run the app's own tests and the shared browser checks.
5. Open a PR with the screenshots. In the description, report how many `ds-*`
   classes remain.

### rent-vs-buy-calculator (Tailwind 3.4 → 4)

1. Run `npx @tailwindcss/upgrade` on a branch and review what it changes. Then remove
   `tailwind.config.js`. Its only setting, `content: ["./src/App.jsx"]`, becomes
   `@source "./App.jsx";` in CSS.
2. `src/tw.css` becomes the app stylesheet:
   `@import "tailwindcss"; @import "@doshi-experiments/design-system/tailwind.css";`,
   with `components.css` and `legacy.css` imported in `layer(components)` and
   `design.css` moved into `@layer components`.
3. In `build.sh`, change `npx tailwindcss -c … -i src/tw.css` to `npx @tailwindcss/cli
   -i src/tw.css -o dist/app.css --minify` and drop the `cat` of separate
   stylesheets, because the imports now bundle them. Swap `tailwindcss@3.4.17` for
   `tailwindcss@4` and `@tailwindcss/cli@4` in `devDependencies`.
4. v4 differences that apply here:
   - `hover:` now only fires on devices that can hover. Check the tap paths on 390px.
   - The default border colour is now `currentColor`.
   - The default ring width is 1px instead of 3px.
   - `shadow-sm` is now `shadow-xs`.

   The current markup uses none of the renamed utilities, but recheck after step 1.
5. Rewrite `design.css`'s layout rules and the inline layout styles in Tailwind
   utilities. Colours stay as tokens. Change `palette()` and the Recharts props only
   if a token name changes (none does).
6. Upgrade to React 19 and a Recharts release that supports it. Then move components
   from `/react` to `/ui` as their ports land.
7. Make sure `src/sw.template.js` still lists only files that exist in `dist/`. The
   Tailwind CLI doesn't rebase the package's `url()`s: compiled CSS asks for
   `./fonts/…` and `./felt/…` beside itself. Fonts and fibre tiles are still copied by
   `build.sh` while the snapshot exists; if question 6 drops the snapshot, copy them
   from the tarball's `dist/` instead. (Vite rebases them, so the static sites don't
   need this.)
8. Run `npm run build`, the `MODEL:START`/`END` slice tests, and `test:calculator`.

### experiments-landing

1. Add `package.json` (Vite, `@tailwindcss/vite`, the tarball), `vite.config.js` with
   the prepaint plugin, and `.node-version` set to `22`.
2. Move `public/index.html` to `index.html`. Replace `index-components.css` with
   `src/site.css` written in Tailwind, and convert `ds-chip-link` and `ds-button`
   markup to utilities. Keep the content in the HTML, so the page still works without
   JavaScript, and keep the `#E-01`, `#E-03` and `#E-04` anchors.
3. Move `mountSiteHeader` into a module script that imports from the package.
4. Change `wrangler.jsonc`: `"directory": "./dist"`, and update the comment. Change
   the Cloudflare settings as described below. Add `dist/` and `node_modules/` to
   `.gitignore`.
5. In CI: `npm ci && npm run build`. Point `check-index.mjs` here at `dist/`.

### visualizations

As experiments-landing, plus:

- `public/js/*.js` moves to `src/js/`, so Vite bundles the exhibits. `vendor/` stays
  in `public/` so the pinned files ship byte for byte.
- The `<style>` in `index.html` becomes utilities plus a small `@layer components`
  block for the exhibit chrome.
- Canvas code keeps reading tokens through the controller's `tokens` (from
  `resolveTokens`), so it needs no change.
- `/#growth?debug` and `window.__e03.step(ms)` must keep working. Run
  `check-visualizations.mjs` against `dist/`.

### mr-shake

1. A separate PR first: fix `test/e2e.mjs` for the current `NumberStepper` markup so
   the 44px and 60px checks run to the end.
2. Use `@tailwindcss/cli` in `build.sh`, as the calculator does. `src/app.css` keeps
   the role colours and `--on-role`, written as `@theme` additions or a
   `@layer components` block. Role fills never borrow the signal's `action-text`.
3. Write targets as `min-h-target min-w-target`, which is 60px under
   `data-density="game"`. Check them with the fixed e2e suite and
   `check-game-privacy.mjs`.
4. Secrecy: no change to `game.js` or the shape of reveal payloads. The privacy
   check's reveal, conceal, reload and Home/Back paths must pass unchanged.
5. Upgrade to React 19. Mr. Shake has no Recharts, so it's a small change.
6. The headline is still exactly "Everyone gets the same word." with "Kind of" on the
   next line.

### portfolio-landing

1. Add `package.json` and `vite.config.js` in multi-page mode, with inputs for
   `index.html`, `shipment/`, `genai/`, `healthcare/` and `household/`.
2. Move `versions/`, `2025/`, each `<study>/2025/`, `fonts/`, `felt/`, `favicon.svg`
   and the large `household/` media into `public/`, so they are copied byte for byte.
   Update the output paths in `tools/copy-2025-studies.mjs` and the roots in
   `tools/check-links.mjs`, and run both against `dist/` in CI. The `release.json`
   hash check keeps working, because it searches for every `release.json`.
3. `split.js`, `portfolio.js` and `household.js` become module scripts bundled by
   Vite. The inline script that applies the saved split position before first paint
   stays inline and synchronous.
4. Rewrite `portfolio.css` and `household.css` as utilities over the shared theme,
   replacing the mirrored `--sig`, `--sig-grad`, `--on-sig`, `--sig-tint` and
   `--focus` with the shared tokens. The 2025 face keeps its own coral `#FF5E7C`,
   because it is an archive. The glass panes and the divider stay portfolio-owned.
5. `.assetsignore` is no longer needed at the repo root, because `dist/` only holds
   the site. Keep a copy in `public/`, so `versions/**/README.md` and `SOURCES.md`
   still stay out of the deployment.
6. Delete the stale, untracked `dist/` left over from the September Astro build
   before the first Vite build.
7. Compare screenshots of every live page with `portfolio-audit` before and after.
   Copy and claims don't change.

### household-tasks

1. Settle question 7, then upgrade through rollout or the documented hand build.
2. Add `@tailwindcss/vite` to the existing Vite 7 config. Rewrite `tasks.css` as
   utilities. The dnd-kit board stays app-made.
3. Move to `/ui` components as they land, and don't override shared classes locally.
4. Verify with the offline tests, and run visual checks on the Mac against a local
   build with synthetic data, never on the server. Its `CLAUDE.md` records
   that headless Chromium there overloaded the container. If there is no synthetic
   preview, build one first.
5. Deploy: `git status` on the server copy, `git pull`, then `docker compose up -d
   --build tasks`. Send no test notifications without asking.

### finance

1. Compare `git log -1` locally, on the server copy and on `origin/master`, and
   check `git status` on the server copy before anything else.
2. `npm run rollout -- --only finance --apply`, then add `@tailwindcss/vite`.
   Rewrite `finance.css` and `local-components.css` in utilities. Move
   `category-picker.jsx` to the shared Combobox once it ships.
3. Don't touch `importkey.py`, `normalize.py` or `adapter/src/actual.js`. Use only
   synthetic fixtures. Leave how the app is served unchanged. Keep the private
   `finance-appearance` key, with no cookie.
4. Run unittest, the frontend build and `npm run test:browser --prefix tools`
   against `preview_design.py --review-fixtures`. Then rebuild **both** the `ingest`
   and `review-ui` images.

## Which shadcn components to adopt

All come from shadcn's `base-*` registry (Base UI). Each is restyled to Felt before
release, with no shadcn colour or radius names left (question 3).

| shadcn (Base UI) | Replaces | Release | Notes |
| --- | --- | --- | --- |
| Button | `Button`, `IconButton` | 0.10.0 | Variants: `primary` (signal), `secondary` (raised felt, the default), `danger` (error tint with words), `ghost`, `link` (`action-link`). Sizes: default, `small`, `icon`. Keeps `loading` and the real disabled lockout. |
| Toggle | `ToggleButton` | 0.11 | Tones stay tinted, always with words. |
| Field, Label, Input, Input Group | `TextField`, the `NumericField` shell, `FieldGroup`, `.ds-field*` | 0.11 | Keeps `NumericField`'s paste-sanitising feedback and the 0.9.2 subgrid alignment. |
| Native Select | `SelectField` | 0.11 | |
| Checkbox | `CheckboxField` | 0.11 | 44px target, `hideLabel`. |
| Card | `Card` | 0.11 | Raised and stitched; flush variant. |
| Badge, Alert | `Badge`, `Alert` | 0.11 | Tones as pairs; errors announce with `alert`. |
| Popover | `HelpPopover` | 0.12 | Fixed positioning, hover, tap and focus, Escape, outside click. |
| Slider | `RangeField`'s slider | 0.12 | Signal thumb with a white rim. |
| Select | `Select` (Base UI Select) | 0.12 | Groups, `quiet`, small, inline and hidden labels; popups at z-index 210. |
| Dropdown Menu | `MenuButton`, `.ds-menu*` | 0.12 | |
| Dialog | `Dialog` | 0.12 | `dismissible={false}` kept. |
| Combobox | Finance's local `category-picker.jsx` | 0.12 | New to the shared system. |
| Table | `DataTable` markup | 0.13 | TanStack stays in `EditableTable`. |
| Empty | `EmptyState` | 0.13 | |

These stay Felt-owned, rebuilt with Tailwind on the same Base UI pieces: `SiteHeader`,
`AppearanceControl` (native select), `SegmentedControl` (Base UI RadioGroup, because
it chooses a value), `NumberStepper`, `Metric`, `DataRow`, `PageHeader`,
`WorkflowSteps`, `FileUpload`, `AppShell`, `DateField`, `TimeField` and `toast`.

Not adopted:

- Calendar: it brings react-day-picker and would replace a keyboard grid that
  already meets the brief.
- Sonner: Base UI Toast already backs `toast()`.
- Collapsible and Accordion: they measure height in JavaScript; `Disclosure` stays
  native `<details>`.
- Sidebar: too heavy for `AppShell`.
- Tabs: the calculator's tabs are routes. Local navigation stays links styled as
  underline tabs (`tab` recipe).

## Retiring the `ds-*` classes

The `--ds-*` custom properties are **not** retired. The Tailwind theme reads them,
and so do canvas and chart code. Only the classes, `components.css`, `legacy.css` and
the `/react` export are retired.

1. **0.10.0, coexistence.** Nothing is removed or restyled. `tailwind.css` and `/ui`
   are additions. New: `scripts/ds-usage.mjs`, which lists every `ds-*` class and
   `/react` import in a rollout workspace, by consumer.
2. **0.11 to 0.13, deprecation.** Every ported component's `/react` and `ds-*` entry
   in the README is marked "Deprecated: use `/ui` `X`". `components.css` gains no new
   rules; fixes only. Each consumer PR reports its remaining count from
   `ds-usage.mjs`.
3. **Freeze.** Once the last consumer has migrated, `ds-usage.mjs --fail-on-any`
   runs in this repo's CI against the rollout workspace.
4. **1.0.0, removal.** Delete `components.css`, `legacy.css`, `react.js` and
   `table.js`'s old styling, the `./react` and `./components.css` exports and the
   Playwright checks that only cover them. The static header (`site.js`) is rebuilt
   on utilities in an earlier minor release. The portfolio's archived snapshots keep
   their own copies, untouched.

## Cloudflare settings for the static sites

Change the dashboard **just before merging** each site's PR. A build that fails
leaves the current deployment live, so the order is:

1. Open the PR.
2. Change the build command. The PR's preview build now succeeds; `main` hasn't
   changed yet.
3. Merge.

| Site | `wrangler.jsonc` change | Workers Builds (Settings → Build) | If the project is on Pages instead |
| --- | --- | --- | --- |
| experiments-landing | `assets.directory`: `"./public"` → `"./dist"` | Build command: *(empty)* → `npm run build`. Deploy command stays `npx wrangler deploy`. Root directory stays blank. | Build command `npm run build`; output directory `public` → `dist` |
| visualizations | `"./public"` → `"./dist"` | same as above | same as above |
| portfolio-landing | `"."` → `"./dist"` | same as above | Build command `npm run build`; output directory → `dist` |

For all three:

- Commit a `.node-version` of `22`, because Vite and Tailwind v4 need Node 20.19 or
  newer.
- `not_found_handling` doesn't change: SPA for experiments-landing and
  visualizations, `404-page` for the portfolio.
- Leave the build-cache and watch-path settings as they are.

I couldn't see the dashboards, so confirm the product for each site before the first
change (question 8).

## Risks and rollback

| Risk | Guard | Rollback |
| --- | --- | --- |
| Felt looks different after a port | **Parity check:** for each ported component, Playwright renders the `ds-*` version and the `/ui` version side by side. It compares computed `background-image`, `background-color`, `box-shadow`, `border-radius`, `color`, `padding`, `min-height`, font and the `::after` stitch in light and dark at 390px and 1440px, and saves screenshots for review. | Don't adopt the release; consumers stay on the previous tarball. |
| Preflight changes pages that never had it (all but the calculator) | Before and after screenshots of every page in each app PR. Tailwind's `base` layer loses to the app's own unlayered CSS. | Revert the app PR. |
| Unlayered `components.css` blocks utilities | Import it in `layer(components)` | (none needed) |
| `tailwind-merge` drops a Felt class | `cn()` configured with Felt's names, with a unit test for each group | (fix forward) |
| shadcn defaults leak in | Namespaces cleared; a test fails on shadcn names in `src/ui/` | (none needed) |
| Signal used as text | No `--color-*` for the signal; a test fails on `text-signal` or `text-[…signal…]` | (none needed) |
| `prepaint.js` stops running first | The Vite plugin inlines it as the first child of `<head>`. `check-identity.mjs` asserts there is no flash and that the cookie keeps its name and scope. | Revert the app PR. |
| `sheet-theme` cookie renamed or rescoped | `theme.js` and `prepaint.js` are unchanged by this plan. The existing tests cover them. | (none needed) |
| Static deploy breaks | Change the dashboard just before merging; failed builds don't replace the live site | Roll back to the previous version under Workers → Deployments, which is instant. Then revert the PR **and** put the build command and output directory back, together. |
| Service worker precache 404s (calculator, Mr. Shake) | Fixed asset names kept. CI checks that every `sw.template.js` entry exists in `dist/`. | Revert the app PR; the old worker keeps serving. |
| React 18 drops refs | `forwardRef` kept until React 19 everywhere | (none needed) |
| household-tasks or Finance break in production | Local synthetic checks first; server `git status` and `log` compared before each deploy | `git checkout` the previous commit on the server copy, then `docker compose up -d --build` (rebuild both Finance images). |
| A release is wrong | Version numbers are never reused | Consumers pin the previous tarball. Publish a fix as the next version. |

## Step 3: the 0.10.0 foundation (after approval)

In this repository only, on branch `tailwind-v4-foundation` from `main`:

1. `build.mjs` generates `dist/tailwind.css` (theme, variants, utilities and
   `@source`) from `tokens.js`, and compiles `src/ui/*.jsx` with esbuild to
   `dist/ui.js`. External to the bundle: React, Base UI, `cva`, `clsx` and
   `tailwind-merge`.
2. `src/ui/button.jsx` from `npx shadcn@4.23.0 add button` with a `base-*` style and
   `"tsx": false`, restyled to Felt, plus `src/ui/cn.js`. `components.json` is
   committed so later ports come through the same CLI.
3. `package.json`: version 0.10.0. New exports `./tailwind.css` (with a `style`
   condition) and `./ui`. `cva`, `clsx` and `tailwind-merge` as dependencies, an
   optional `tailwindcss@^4.3` peer, and `tailwindcss` with `@tailwindcss/cli` as
   dev dependencies. The README and the release history get a 0.10.0 section.
4. `preview/tailwind.html`: the old `.ds-button` and the new `Button` side by side,
   in every variant and size, disabled and loading, light and dark next to each other,
   with a density switch. It also corrects the stale "Release 0.8.0" text in
   `preview/index.html`.
5. Tests:
   - Unit: every theme variable maps to a real token; no shadcn names; no signal
     text utility; `cn()` merges Felt classes correctly.
   - Component: the Button parity check above at 390px and 1440px in both themes;
     44px targets, and 60px at game density; disabled and loading lockout.
6. Run `npm run build && npm test` and `npm run test:components`. Commit `dist/`,
   open the PR and stop. Nothing is rolled out.

### What building 0.10.0 found

- **The shadcn CLI now brings its own `cn`.** `shadcn@4.23.0 add button` imports `cn`
  from the `cn` npm package (shadcn's replacement for clsx + tailwind-merge) and
  installs it, ignoring the `utils` alias. 0.10.0 removes it and keeps clsx +
  tailwind-merge as planned, so every later port needs the same one-line fix
  (`CLAUDE.md` says so). `cn/config`'s `createCn` takes the same configuration as
  `extendTailwindMerge`, so switching later is a small, separate change.
- **tailwind-merge needs one override.** `raised` and `overlay` name both a colour and
  a shadow, and tailwind-merge read `shadow-raised` as a shadow colour. Felt has no
  shadow colours, so `cn()` limits that group to arbitrary values. Tailwind itself
  compiles `shadow-raised` as the shadow.
- **The Tailwind CLI doesn't rebase `url()`s** from the package; Vite's plugin does,
  including inside `@utility`. See the calculator's step 7.
- **Two new tokens.** The primary key's shadows were literals in `components.css`;
  they are now `shadow-signal` and `shadow-signal-pressed`, used by both.
- **Line height and tracking per type step** were not tokens. They now live in
  `src/tailwind-theme.js`: 1.5 and 1.55 for caption and body, then 1.4 down to 1.05
  with tracking from -.01em to -.045em. The 25px and 61px values come from
  `identity.md`; the steps between are interpolated, so check them as apps adopt
  them.
- **Hover differs on touch screens.** Tailwind v4's `hover:` only applies where the
  device can hover, so a tapped button no longer keeps its hover colour on a phone.
  Everything else matches: the parity check compares computed styles and pixels for
  nine cases in four states, in both appearances, at 390px and 1440px, at comfortable
  and game density.
- **A Chromium quirk in the parity check.** The first signal edge a fresh browser
  screenshots comes out a shade lighter (12 pixels on the top edge of one button),
  whichever page and setting runs first, and the identical setting passes when run
  again. The check runs its first setting twice and discards the first pass.
