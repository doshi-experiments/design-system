// The Button's Tailwind classes, shared by /ui's Button (through cva) and the ds-button utility
// that scripts/tailwind.mjs writes into dist/tailwind.css for pages without React. Both draw
// exactly what components.css's .ds-button draws; scripts/check-tailwind.mjs compares all three.
// Disabled states are written data-disabled:, which Base UI sets; the utility rewrites them to
// :disabled for plain buttons.
export const buttonClasses = {
  base: "inline-flex items-center justify-center gap-2 min-h-control min-w-target rounded-pill border border-transparent px-5 py-2.5 font-semibold cursor-pointer focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-focus motion-safe:transition-[translate,box-shadow,background-color] motion-safe:not-data-disabled:active:translate-y-px data-disabled:cursor-not-allowed data-disabled:border-transparent data-disabled:bg-inset data-disabled:bg-none data-disabled:text-ink-disabled data-disabled:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
  variant: {
    default: "raised not-data-disabled:active:shadow-pressed",
    // The raised pill again, filling with the selection colour on hover like ghost and danger.
    secondary: "raised not-data-disabled:hover:bg-selection not-data-disabled:active:shadow-pressed",
    primary:
      "signal shadow-signal not-data-disabled:hover:signal-hover not-data-disabled:active:signal-pressed not-data-disabled:active:shadow-signal-pressed",
    danger:
      "tone-error border-current not-data-disabled:hover:bg-selection not-data-disabled:active:shadow-pressed",
    ghost:
      "bg-transparent action-link not-data-disabled:hover:bg-selection not-data-disabled:active:shadow-pressed",
    // Signal-coloured, underlined text with the full target. It never fills, even on hover.
    link:
      "bg-transparent action-link underline underline-offset-[.2em] not-data-disabled:hover:decoration-2 not-data-disabled:active:shadow-pressed",
  },
  size: {
    default: "",
    // A shorter pill for dense layouts. The ::after keeps the full target as the hit area.
    small:
      "relative min-h-control-compact px-4 py-1.5 leading-[1.25] after:absolute after:inset-x-0 after:top-1/2 after:h-[max(100%,var(--ds-control-target))] after:-translate-y-1/2",
    // A round button the size of the target, for a single icon. It needs an aria-label.
    icon: "size-target p-0 [&_svg]:size-5",
  },
}
