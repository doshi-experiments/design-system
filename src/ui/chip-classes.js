// The chip's Tailwind classes, for the ds-chip utility in dist/tailwind.css: a pressed felt pill
// for filters and links between related pages, drawn as components.css's .ds-chip-link draws it.
// A chip marked aria-pressed="true" or aria-current takes the signal.
export const chipClasses = {
  base: "pressed inline-flex items-center border-none min-h-target py-2 px-3.5 rounded-pill font-sans text-[.8125rem] font-semibold leading-[1.4] text-ink no-underline cursor-pointer hover:bg-selection focus-visible:outline-3 focus-visible:-outline-offset-4 focus-visible:outline-focus",
  selected: "signal shadow-signal hover:signal-hover",
}
