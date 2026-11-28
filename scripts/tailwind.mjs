// Writes dist/tailwind.css, Felt for Tailwind CSS v4, from src/tailwind-theme.js. Utilities read
// the --ds-* custom properties that tokens.css switches by project, appearance and density, so
// the palette changes with the root's attributes and colours need no dark: variant.
import {themeTokens, typeScale, breakpoints, durations, tones, densityVariants} from '../src/tailwind-theme.js';
import {buttonClasses} from '../src/ui/button-classes.js';
import {chipClasses} from '../src/ui/chip-classes.js';

const ds = token => `var(--ds-${token})`;
const block = lines => lines.map(line => `  ${line}`).join('\n');

// /ui's classes, rewritten for a plain <button> or <a>: Base UI's data-disabled becomes :disabled,
// and the disabled look moves into its own block after the variants so it wins over them, as
// data-disabled's higher specificity does in /ui.
const plain = classes => classes.replace(/\bdata-disabled:/g, 'disabled:');
const disabledPrefix = 'data-disabled:';
const enabled = classes => plain(classes.split(' ').filter(name => !name.startsWith(disabledPrefix)).join(' '));
const disabled = classes => classes.split(' ').filter(name => name.startsWith(disabledPrefix)).map(name => name.slice(disabledPrefix.length)).join(' ');
const apply = (selector, classes) => classes ? `  ${selector} {\n    @apply ${classes};\n  }` : '';
function buttonUtility() {
  const {base, variant, size} = buttonClasses;
  const quiet = ':where(:not([data-variant]), [data-variant="default"])';
  return [
    `@utility ds-button {\n  @apply ${enabled(base)};`,
    apply(`&${quiet}`, plain(variant.default)),
    ...Object.entries(variant).filter(([name]) => name !== 'default').map(([name, classes]) => apply(`&[data-variant="${name}"]`, plain(classes))),
    ...Object.entries(size).map(([name, classes]) => apply(`&[data-size="${name}"]`, plain(classes))),
    apply('&:disabled', disabled(base)),
    '}',
  ].filter(Boolean).join('\n');
}

export function tailwindCss() {
  const theme = [
    // Clear Tailwind's defaults so neither its palette nor shadcn's look can leak through:
    // an unported class such as bg-primary or text-sm generates nothing.
    ...['color', 'font', 'text', 'radius', 'shadow', 'inset-shadow', 'drop-shadow', 'text-shadow', 'ease', 'breakpoint'].map(namespace => `--${namespace}-*: initial;`),
    ...Object.entries(themeTokens).flatMap(([namespace, entries]) =>
      Object.entries(entries).map(([name, token]) => `--${namespace}-${name}: ${ds(token)};`)),
    ...Object.entries(breakpoints).map(([name, value]) => `--breakpoint-${name}: ${value};`),
    ...Object.entries(typeScale).flatMap(([name, {size, leading, tracking}]) => [
      `--text-${name}: ${ds(size)};`, `--text-${name}--line-height: ${leading};`, `--text-${name}--letter-spacing: ${tracking};`]),
    `--default-font-family: ${ds('font-body')};`,
    `--default-transition-duration: ${ds('duration-fast')};`,
    `--default-transition-timing-function: ${ds('ease')};`,
  ];
  const appearance = selector => `&:where(${selector}, ${selector} *)`;
  return `/* Generated from src/tailwind-theme.js and src/tokens.js. Do not edit. */
/* Felt for Tailwind CSS v4. Import it after "tailwindcss":
     @import "tailwindcss";
     @import "@doshi-experiments/design-system/tailwind.css";
   It brings tokens.css with it and scans ui.js, ui-table.js and site-contract.js, so the shared
   components and the static header need no config. */
@import "./tokens.css";
@source "./ui.js";
@source "./ui-table.js";
@source "./site-contract.js";

/* The palette already follows the root's data-theme. dark: is for what differs by more than
   colour, such as the fibre's blend mode. A root without data-theme follows the system. */
@custom-variant dark {
  ${appearance('[data-theme="dark"]')} {
    @slot;
  }
  @media (prefers-color-scheme: dark) {
    ${appearance(':root:not([data-theme])')} {
      @slot;
    }
  }
}
${densityVariants.map(density => `@custom-variant ${density} (${appearance(`[data-density="${density}"]`)});`).join('\n')}

@theme inline {
${block(theme)}
}

/* Surfaces. raised and pressed look exactly like .ds-card and the fields; stitched draws the
   1.5px dashed stitch 7px inside the edge and needs a positioned element. */
@utility raised {
  background-color: ${ds('surface-raised')};
  color: ${ds('text')};
  box-shadow: ${ds('shadow-raised')};
}
@utility pressed {
  background-color: ${ds('surface-inset')};
  box-shadow: ${ds('shadow-pressed')};
}
@utility stitched {
  &::after {
    content: "";
    position: absolute;
    inset: 7px;
    border-radius: calc(${ds('radius-container')} - 6px);
    border: 1.5px dashed ${ds('stitch')};
    pointer-events: none;
    transition: border-color ${ds('duration-base')} ${ds('ease')};
  }
}
@utility stitch-rule {
  border-top: 1.5px dashed ${ds('stitch')};
}

/* The signal is a fill under white text, never a text colour. Hover and press deepen it:
   write hover:signal-hover active:signal-pressed. Signal-coloured text uses action-link. */
@utility signal {
  background: ${ds('action-gradient')};
  color: ${ds('action-text')};
}
@utility signal-hover {
  background: ${ds('action-gradient-hover')};
}
@utility signal-pressed {
  background: ${ds('action-gradient-pressed')};
}
@utility signal-solid {
  background-color: ${ds('action-primary')};
  color: ${ds('action-text')};
}
@utility accent-signal {
  accent-color: ${ds('action-primary')};
}
@utility action-link {
  color: ${ds('action-link')};
}

/* Buttons and chips for pages without React: the same classes as /ui's Button, keyed on the
   attributes /react's Button writes, so <button class="ds-button" data-variant="primary"> draws
   what <Button variant="primary"> draws. data-size takes small or icon. */
${buttonUtility()}
@utility ds-chip {
  @apply ${chipClasses.base};
  &:is([aria-pressed="true"], [aria-current]:not([aria-current="false"])) {
    @apply ${chipClasses.selected};
  }
}

/* Status colours come as pairs: the tint and its text. */
${tones.map(tone => `@utility tone-${tone} {\n  background-color: ${ds(`${tone}-bg`)};\n  color: ${ds(`${tone}-text`)};\n}`).join('\n')}

${Object.entries(durations).map(([name, token]) => `@utility duration-${name} {\n  --tw-duration: ${ds(token)};\n  transition-duration: ${ds(token)};\n}`).join('\n')}

/* The wool: a 240px fibre tile blended into the element's own background, multiplied in light
   and overlaid in dark. data-texture="off" on the root removes it. */
@utility fibre {
  background-image: url("./felt/fibre-light.svg");
  background-size: 240px 240px;
  background-blend-mode: multiply;
  @variant dark {
    background-image: url("./felt/fibre-dark.svg");
    background-blend-mode: overlay;
  }
  ${appearance('[data-texture="off"]')} {
    background-image: none;
  }
}
`;
}
