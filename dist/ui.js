// src/ui/cn.js
import { clsx } from "clsx";
import { extendTailwindMerge, validators } from "tailwind-merge";

// src/tailwind-theme.js
var themeTokens = {
  color: {
    page: "surface-page",
    raised: "surface-raised",
    overlay: "surface-overlay",
    inset: "surface-inset",
    ink: "text",
    "ink-secondary": "text-secondary",
    "ink-disabled": "text-disabled",
    "ink-inverse": "text-inverse",
    line: "border",
    stitch: "stitch",
    selection: "selection",
    link: "action-link",
    focus: "focus",
    "chart-1": "chart-1",
    "chart-2": "chart-2",
    "chart-3": "chart-3",
    "chart-4": "chart-4",
    "ramp-1": "ramp-1",
    "ramp-2": "ramp-2",
    "ramp-3": "ramp-3",
    "ramp-4": "ramp-4",
    "ramp-5": "ramp-5",
    "amount-in": "amount-in",
    "amount-out": "amount-out"
  },
  font: { sans: "font-body", mono: "font-mono" },
  radius: { pill: "radius-pill", control: "radius-control", container: "radius-container", dialog: "radius-dialog" },
  shadow: { raised: "shadow-raised", pressed: "shadow-pressed", overlay: "shadow-overlay", signal: "shadow-signal", "signal-pressed": "shadow-signal-pressed" },
  // Tailwind's own 4px --spacing already is Felt's scale; these are the density-driven sizes.
  spacing: { target: "control-target", control: "control-height", "control-compact": "control-compact-height", panel: "panel-padding", cell: "cell-padding" },
  container: { measure: "measure", page: "page-width" },
  ease: { felt: "ease", spring: "ease-spring" }
};
var typeScale = {
  caption: { size: "text-caption", leading: "1.5", tracking: "normal" },
  body: { size: "text-body", leading: "1.55", tracking: "normal" },
  card: { size: "text-card", leading: "1.4", tracking: "-.01em" },
  section: { size: "text-section", leading: "1.2", tracking: "-.02em" },
  title: { size: "text-title", leading: "1.15", tracking: "-.025em" },
  large: { size: "text-large", leading: "1.1", tracking: "-.03em" },
  hero: { size: "text-hero", leading: "1.05", tracking: "-.04em" },
  display: { size: "text-display", leading: "1.05", tracking: "-.045em" }
};
var durations = { fast: "duration-fast", base: "duration-base", slow: "duration-slow" };
var tones = ["success", "warning", "error", "info"];

// src/ui/cn.js
var names = (entries) => Object.keys(entries);
var twMerge = extendTailwindMerge({
  override: {
    classGroups: {
      "shadow-color": [{ shadow: [validators.isArbitraryVariable, validators.isArbitraryValue] }]
    }
  },
  extend: {
    theme: {
      color: names(themeTokens.color),
      font: names(themeTokens.font),
      text: names(typeScale),
      radius: names(themeTokens.radius),
      shadow: names(themeTokens.shadow),
      spacing: names(themeTokens.spacing),
      container: names(themeTokens.container),
      ease: names(themeTokens.ease)
    },
    classGroups: {
      duration: [{ duration: names(durations) }],
      "felt-surface": ["raised", "pressed"],
      "felt-fill": ["signal", "signal-hover", "signal-pressed", "signal-solid", ...tones.map((tone) => `tone-${tone}`)]
    }
  }
});
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// src/ui/button.jsx
import * as React from "react";
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva } from "class-variance-authority";
import { jsx } from "react/jsx-runtime";
var buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 min-h-control min-w-target rounded-pill border border-transparent px-5 py-2.5 font-semibold cursor-pointer focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-focus motion-safe:transition-[translate,box-shadow,background-color] motion-safe:not-data-disabled:active:translate-y-px data-disabled:cursor-not-allowed data-disabled:border-transparent data-disabled:bg-inset data-disabled:bg-none data-disabled:text-ink-disabled data-disabled:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "raised not-data-disabled:active:shadow-pressed",
        primary: "signal shadow-signal not-data-disabled:hover:signal-hover not-data-disabled:active:signal-pressed not-data-disabled:active:shadow-signal-pressed",
        danger: "tone-error border-current not-data-disabled:hover:bg-selection not-data-disabled:active:shadow-pressed",
        ghost: "bg-transparent action-link not-data-disabled:hover:bg-selection not-data-disabled:active:shadow-pressed"
      },
      size: {
        default: "",
        // A shorter pill for dense layouts. The ::after keeps the full target as the hit area.
        small: "relative min-h-control-compact px-4 py-1.5 leading-[1.25] after:absolute after:inset-x-0 after:top-1/2 after:h-[max(100%,var(--ds-control-target))] after:-translate-y-1/2"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
var Button = React.forwardRef(function Button2({ className, variant, size, loading = false, disabled = false, ...props }, ref) {
  return /* @__PURE__ */ jsx(
    ButtonPrimitive,
    {
      ...props,
      ref,
      "data-slot": "button",
      className: cn(buttonVariants({ variant, size, className })),
      disabled: disabled || loading,
      "aria-busy": loading || void 0
    }
  );
});
export {
  Button,
  buttonVariants,
  cn
};
