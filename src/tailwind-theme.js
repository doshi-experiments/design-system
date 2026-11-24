// Felt's Tailwind CSS v4 theme (0.10). Each entry names a Tailwind theme variable and the
// --ds-* token it reads, so the values themselves stay in tokens.js and switch with the root's
// data-project, data-theme and data-density. scripts/build.mjs writes dist/tailwind.css from
// this file, and src/ui/cn.js teaches tailwind-merge the same names.
//
// The signal is deliberately not a colour: a --color-signal would generate text-signal, and
// signal-coloured text must use action-link. Status colours are pairs (tone-error), never
// single colours, because error red always comes with its tint and words.
export const themeTokens = {
  color: {
    page: 'surface-page', raised: 'surface-raised', overlay: 'surface-overlay', inset: 'surface-inset',
    ink: 'text', 'ink-secondary': 'text-secondary', 'ink-disabled': 'text-disabled', 'ink-inverse': 'text-inverse',
    line: 'border', stitch: 'stitch', selection: 'selection',
    link: 'action-link', focus: 'focus',
    'chart-1': 'chart-1', 'chart-2': 'chart-2', 'chart-3': 'chart-3', 'chart-4': 'chart-4',
    'ramp-1': 'ramp-1', 'ramp-2': 'ramp-2', 'ramp-3': 'ramp-3', 'ramp-4': 'ramp-4', 'ramp-5': 'ramp-5',
    'amount-in': 'amount-in', 'amount-out': 'amount-out',
  },
  font: {sans: 'font-body', mono: 'font-mono'},
  radius: {pill: 'radius-pill', control: 'radius-control', container: 'radius-container', dialog: 'radius-dialog'},
  shadow: {raised: 'shadow-raised', pressed: 'shadow-pressed', overlay: 'shadow-overlay', signal: 'shadow-signal', 'signal-pressed': 'shadow-signal-pressed'},
  // Tailwind's own 4px --spacing already is Felt's scale; these are the density-driven sizes.
  spacing: {target: 'control-target', control: 'control-height', 'control-compact': 'control-compact-height', panel: 'panel-padding', cell: 'cell-padding'},
  container: {measure: 'measure', page: 'page-width'},
  ease: {felt: 'ease', spring: 'ease-spring'},
};
// The type scale: 16, 20, 25, 31, 39, 49 and 61px, with body at 1.55. Headings tighten their
// tracking as they grow, from -.02em at 25px to -.045em at 61px (docs/identity.md).
export const typeScale = {
  caption: {size: 'text-caption', leading: '1.5', tracking: 'normal'},
  body: {size: 'text-body', leading: '1.55', tracking: 'normal'},
  card: {size: 'text-card', leading: '1.4', tracking: '-.01em'},
  section: {size: 'text-section', leading: '1.2', tracking: '-.02em'},
  title: {size: 'text-title', leading: '1.15', tracking: '-.025em'},
  large: {size: 'text-large', leading: '1.1', tracking: '-.03em'},
  hero: {size: 'text-hero', leading: '1.05', tracking: '-.04em'},
  display: {size: 'text-display', leading: '1.05', tracking: '-.045em'},
};
// Breakpoints replace Tailwind's: small phone, phone to tablet, tablet to desktop, desktop, and
// the width at which the page stops growing (page-width). Media queries can't read custom
// properties, so these are values, not tokens (docs/identity.md).
export const breakpoints = {xs: '23.75rem', sm: '40rem', md: '50rem', lg: '64rem', xl: '77.5rem'};
export const durations = {fast: 'duration-fast', base: 'duration-base', slow: 'duration-slow'};
export const tones = ['success', 'warning', 'error', 'info'];
export const densityVariants = ['comfortable', 'compact', 'game'];
