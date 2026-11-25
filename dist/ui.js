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

// src/ui/button-classes.js
var buttonClasses = {
  base: "inline-flex items-center justify-center gap-2 min-h-control min-w-target rounded-pill border border-transparent px-5 py-2.5 font-semibold cursor-pointer focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-focus motion-safe:transition-[translate,box-shadow,background-color] motion-safe:not-data-disabled:active:translate-y-px data-disabled:cursor-not-allowed data-disabled:border-transparent data-disabled:bg-inset data-disabled:bg-none data-disabled:text-ink-disabled data-disabled:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
  variant: {
    default: "raised not-data-disabled:active:shadow-pressed",
    // The raised pill again, filling with the selection colour on hover like ghost and danger.
    secondary: "raised not-data-disabled:hover:bg-selection not-data-disabled:active:shadow-pressed",
    primary: "signal shadow-signal not-data-disabled:hover:signal-hover not-data-disabled:active:signal-pressed not-data-disabled:active:shadow-signal-pressed",
    danger: "tone-error border-current not-data-disabled:hover:bg-selection not-data-disabled:active:shadow-pressed",
    ghost: "bg-transparent action-link not-data-disabled:hover:bg-selection not-data-disabled:active:shadow-pressed",
    // Signal-coloured, underlined text with the full target. It never fills, even on hover.
    link: "bg-transparent action-link underline underline-offset-[.2em] not-data-disabled:hover:decoration-2 not-data-disabled:active:shadow-pressed"
  },
  size: {
    default: "",
    // A shorter pill for dense layouts. The ::after keeps the full target as the hit area.
    small: "relative min-h-control-compact px-4 py-1.5 leading-[1.25] after:absolute after:inset-x-0 after:top-1/2 after:h-[max(100%,var(--ds-control-target))] after:-translate-y-1/2",
    // A round button the size of the target, for a single icon. It needs an aria-label.
    icon: "size-target p-0 [&_svg]:size-5"
  }
};

// src/ui/button.jsx
import { jsx } from "react/jsx-runtime";
var buttonVariants = cva(buttonClasses.base, {
  variants: { variant: buttonClasses.variant, size: buttonClasses.size },
  defaultVariants: {
    variant: "default",
    size: "default"
  }
});
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

// src/ui/toggle.jsx
import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { cva as cva2 } from "class-variance-authority";
import { jsx as jsx2 } from "react/jsx-runtime";
var toggleVariants = cva2(
  "relative inline-flex items-center justify-center gap-1.5 min-h-control px-3.5 py-2 border border-transparent rounded-pill bg-transparent text-ink-secondary font-semibold text-caption leading-[1.25] whitespace-nowrap cursor-pointer focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus not-data-pressed:not-data-disabled:hover:bg-inset data-disabled:cursor-not-allowed aria-busy:cursor-progress aria-busy:opacity-70",
  {
    variants: {
      tone: {
        default: "data-pressed:text-ink data-pressed:pressed",
        error: "data-pressed:tone-error data-pressed:border-[color-mix(in_srgb,var(--ds-error-text)_30%,transparent)] data-pressed:shadow-none",
        warning: "data-pressed:tone-warning data-pressed:border-[color-mix(in_srgb,var(--ds-warning-text)_30%,transparent)] data-pressed:shadow-none",
        success: "data-pressed:tone-success data-pressed:border-[color-mix(in_srgb,var(--ds-success-text)_30%,transparent)] data-pressed:shadow-none",
        info: "data-pressed:tone-info data-pressed:border-[color-mix(in_srgb,var(--ds-info-text)_30%,transparent)] data-pressed:shadow-none"
      },
      size: {
        default: "",
        // The ::after keeps the full target as the hit area.
        small: "min-h-control-compact px-2.5 py-1 text-[.8125rem] after:absolute after:inset-x-0 after:top-1/2 after:h-[max(100%,var(--ds-control-target))] after:-translate-y-1/2"
      }
    },
    defaultVariants: {
      tone: "default",
      size: "default"
    }
  }
);
function Toggle({ className, tone, size, loading = false, disabled = false, ...props }) {
  return /* @__PURE__ */ jsx2(
    TogglePrimitive,
    {
      ...props,
      "data-slot": "toggle",
      className: cn(toggleVariants({ tone, size, className })),
      disabled: disabled || loading,
      "aria-busy": loading || void 0
    }
  );
}

// src/ui/badge.jsx
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva as cva3 } from "class-variance-authority";
var badgeVariants = cva3(
  "inline-flex items-center w-fit px-[9px] py-[3px] border-0 rounded-pill font-semibold text-[.6875rem] leading-[1.5]",
  {
    variants: {
      tone: {
        default: "text-ink-secondary bg-inset",
        success: "tone-success",
        warning: "tone-warning",
        error: "tone-error",
        info: "tone-info"
      }
    },
    defaultVariants: {
      tone: "default"
    }
  }
);
function Badge({ className, tone, render, ...props }) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps({ className: cn(badgeVariants({ tone }), className) }, props),
    render,
    state: { slot: "badge", tone }
  });
}

// src/ui/alert.jsx
import { cva as cva4 } from "class-variance-authority";
import { jsx as jsx3 } from "react/jsx-runtime";
var alertVariants = cva4(
  "px-5 py-4 border rounded-control font-normal text-[.9375rem] leading-[1.5] wrap-anywhere",
  {
    variants: {
      tone: {
        info: "tone-info border-[color-mix(in_srgb,var(--ds-info-icon)_35%,transparent)]",
        success: "tone-success border-[var(--ds-success-icon)]",
        warning: "tone-warning border-[var(--ds-warning-icon)]",
        error: "tone-error border-[var(--ds-error-icon)]"
      }
    },
    defaultVariants: {
      tone: "info"
    }
  }
);
function Alert({ className, tone = "info", role, ...props }) {
  return /* @__PURE__ */ jsx3(
    "div",
    {
      ...props,
      "data-slot": "alert",
      "data-tone": tone,
      role: role || (tone === "error" ? "alert" : "status"),
      className: cn(alertVariants({ tone }), className)
    }
  );
}
function AlertTitle({ className, ...props }) {
  return /* @__PURE__ */ jsx3("div", { "data-slot": "alert-title", className: cn("mb-1 font-semibold", className), ...props });
}
function AlertDescription({ className, ...props }) {
  return /* @__PURE__ */ jsx3("div", { "data-slot": "alert-description", className: cn("*:first:mt-0 *:last:mb-0", className), ...props });
}
function AlertAction({ className, ...props }) {
  return /* @__PURE__ */ jsx3("div", { "data-slot": "alert-action", className: cn("flex flex-wrap items-center gap-3 mt-3", className), ...props });
}

// src/ui/card.jsx
import { mergeProps as mergeProps2 } from "@base-ui/react/merge-props";
import { useRender as useRender2 } from "@base-ui/react/use-render";
import { cva as cva5 } from "class-variance-authority";
import { jsx as jsx4 } from "react/jsx-runtime";
var cardVariants = cva5("relative min-w-0 border-0", {
  variants: {
    variant: {
      default: "p-panel rounded-container raised stitched in-data-[slot=card]:rounded-control max-[380.98px]:p-[18px]",
      flat: "px-0 py-4 rounded-none bg-transparent"
    }
  },
  defaultVariants: {
    variant: "default"
  }
});
function Card({ className, variant = "default", render, ...props }) {
  return useRender2({
    defaultTagName: "div",
    props: mergeProps2({ className: cn(cardVariants({ variant }), className) }, props),
    render,
    state: { slot: "card", variant }
  });
}
function CardHeader({ className, ...props }) {
  return /* @__PURE__ */ jsx4("div", { "data-slot": "card-header", className: cn("grid gap-1 pb-5", className), ...props });
}
function CardTitle({ className, render, ...props }) {
  return useRender2({
    defaultTagName: "h2",
    props: mergeProps2({ className: cn("m-0 text-ink font-medium text-card", className) }, props),
    render,
    state: { slot: "card-title" }
  });
}
function CardDescription({ className, ...props }) {
  return /* @__PURE__ */ jsx4("p", { "data-slot": "card-description", className: cn("m-0 text-ink-secondary text-caption", className), ...props });
}
function CardAction({ className, ...props }) {
  return /* @__PURE__ */ jsx4("div", { "data-slot": "card-action", className: cn("flex flex-wrap items-center gap-3", className), ...props });
}
function CardContent({ className, ...props }) {
  return /* @__PURE__ */ jsx4("div", { "data-slot": "card-content", className: cn("min-w-0", className), ...props });
}
function CardFooter({ className, ...props }) {
  return /* @__PURE__ */ jsx4("div", { "data-slot": "card-footer", className: cn("flex flex-wrap items-center gap-3 pt-5", className), ...props });
}

// src/ui/field.jsx
import { useMemo } from "react";
import { cva as cva6 } from "class-variance-authority";

// src/ui/label.jsx
import { jsx as jsx5 } from "react/jsx-runtime";
function Label({ className, ...props }) {
  return /* @__PURE__ */ jsx5("label", { "data-slot": "label", className: cn(className), ...props });
}

// src/ui/field.jsx
import { jsx as jsx6 } from "react/jsx-runtime";
function FieldSet({ className, ...props }) {
  return /* @__PURE__ */ jsx6(
    "fieldset",
    {
      "data-slot": "field-set",
      className: cn("min-w-0 m-0 mb-7 px-0 pt-6 pb-0 border-0 border-t-[1.5px] border-dashed border-stitch", className),
      ...props
    }
  );
}
function FieldLegend({ className, ...props }) {
  return /* @__PURE__ */ jsx6("legend", { "data-slot": "field-legend", className: cn("p-0 pr-2 text-ink font-semibold text-body leading-[1.4]", className), ...props });
}
function FieldGroup({ className, ...props }) {
  return /* @__PURE__ */ jsx6(
    "div",
    {
      "data-slot": "field-group",
      className: cn(
        "grid grid-cols-2 gap-x-3 gap-y-4 max-[380.98px]:grid-cols-1 *:data-[slot=field]:grid *:data-[slot=field]:grid-rows-subgrid *:data-[slot=field]:row-span-3 *:data-[slot=field]:gap-y-0 [&>[data-slot=field]>[data-slot=field-heading]]:[align-self:end]",
        className
      ),
      ...props
    }
  );
}
var fieldVariants = cva6("min-w-0 font-sans", {
  variants: {
    orientation: {
      vertical: "relative",
      choice: "*:data-[slot=field-description]:ml-8 *:data-[slot=field-description]:mt-0 *:data-[slot=field-error]:ml-8 *:data-[slot=field-error]:mt-0"
    }
  },
  defaultVariants: {
    orientation: "vertical"
  }
});
function Field({ className, orientation = "vertical", ...props }) {
  return /* @__PURE__ */ jsx6("div", { "data-slot": "field", "data-orientation": orientation, className: cn(fieldVariants({ orientation }), className), ...props });
}
function FieldHeading({ className, ...props }) {
  return /* @__PURE__ */ jsx6(
    "div",
    {
      "data-slot": "field-heading",
      className: cn("flex flex-wrap items-end gap-1 min-h-8 mb-1.5 text-ink-secondary text-[.8125rem] font-semibold *:data-[slot=help-trigger]:size-11 *:data-[slot=help-trigger]:bg-transparent *:data-[slot=help-trigger]:shadow-none *:data-[slot=help-trigger]:-my-1.5", className),
      ...props
    }
  );
}
var fieldLabelVariants = cva6("", {
  variants: {
    variant: {
      default: "block m-0 mb-1.5 text-ink-secondary font-semibold text-caption",
      // Inside FieldHeading, which sets the type.
      heading: "flex-1 min-w-0",
      // Wraps a Checkbox: the whole 44px row is the target. A label hidden with sr-only keeps
      // the target square.
      choice: "relative flex items-center gap-3 min-h-target w-fit max-w-full text-ink font-medium text-[.9375rem] leading-[1.5] cursor-pointer has-disabled:text-ink-disabled has-disabled:cursor-not-allowed has-[>.sr-only]:min-w-target has-[>.sr-only]:justify-center"
    }
  },
  defaultVariants: {
    variant: "default"
  }
});
function FieldLabel({ className, variant = "default", ...props }) {
  return /* @__PURE__ */ jsx6(Label, { "data-slot": "field-label", className: cn(fieldLabelVariants({ variant }), className), ...props });
}
function FieldDescription({ className, ...props }) {
  return /* @__PURE__ */ jsx6(
    "p",
    {
      "data-slot": "field-description",
      className: cn(
        "mt-[5px] text-[.75rem] leading-[1.5] text-ink-secondary empty:hidden data-warning:text-[var(--ds-warning-text)]",
        "[[data-slot=field-set]>&]:flex [[data-slot=field-set]>&]:items-center [[data-slot=field-set]>&]:gap-2 [[data-slot=field-set]>&]:mt-0 [[data-slot=field-set]>&]:mb-4 [[data-slot=field-set]>&]:text-caption",
        className
      ),
      ...props
    }
  );
}
function FieldError({ className, children, errors, ...props }) {
  const content = useMemo(() => {
    if (children) return children;
    if (!errors?.length) return null;
    const unique = [...new Map(errors.map((error) => [error?.message, error])).values()];
    if (unique.length === 1) return unique[0]?.message;
    return /* @__PURE__ */ jsx6("ul", { className: "ml-4 flex list-disc flex-col gap-1", children: unique.map((error, index) => error?.message && /* @__PURE__ */ jsx6("li", { children: error.message }, index)) });
  }, [children, errors]);
  if (!content) return null;
  return /* @__PURE__ */ jsx6("p", { role: "alert", "data-slot": "field-error", className: cn("mt-[5px] text-[.75rem] leading-[1.5] text-[var(--ds-error-text)]", className), ...props, children: content });
}

// src/ui/input.jsx
import { Input as InputPrimitive } from "@base-ui/react/input";
import { jsx as jsx7 } from "react/jsx-runtime";
var inputClasses = "box-border w-full max-w-full min-w-0 min-h-[max(44px,var(--ds-control-height))] px-3.5 py-2.5 border border-line rounded-control text-ink pressed font-normal text-body leading-[1.4] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus aria-invalid:border-[var(--ds-error-text)] disabled:cursor-not-allowed disabled:text-ink-disabled";
function Input({ className, type, ...props }) {
  return /* @__PURE__ */ jsx7(
    InputPrimitive,
    {
      type,
      "data-slot": "input",
      className: cn(inputClasses, "placeholder:text-ink-secondary placeholder:opacity-100", className),
      ...props
    }
  );
}

// src/ui/input-group.jsx
import { jsx as jsx8 } from "react/jsx-runtime";
function InputGroup({ className, ...props }) {
  return /* @__PURE__ */ jsx8(
    "div",
    {
      "data-slot": "input-group",
      className: cn(
        "flex items-center gap-1.5 min-h-12 px-3.5 border border-line rounded-control pressed transition-[border-color,box-shadow] focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-focus has-[input[readonly]]:border-dashed has-[input[readonly]]:bg-transparent has-[input[aria-invalid=true]]:border-[var(--ds-error-text)]",
        className
      ),
      ...props
    }
  );
}
function InputGroupInput({ className, ...props }) {
  return /* @__PURE__ */ jsx8(
    "input",
    {
      "data-slot": "input-group-control",
      className: cn(
        "block w-full min-w-0 min-h-[46px] px-0 py-2 border-0 [outline:0] bg-transparent text-ink font-normal text-body tabular-nums focus-visible:[outline:0] read-only:text-ink-secondary",
        className
      ),
      ...props
    }
  );
}
function InputGroupAddon({ className, ...props }) {
  return /* @__PURE__ */ jsx8("span", { "data-slot": "input-group-addon", "aria-hidden": "true", className: cn("shrink-0 text-ink-secondary text-[.8125rem]", className), ...props });
}

// src/ui/native-select.jsx
import { jsx as jsx9 } from "react/jsx-runtime";
function NativeSelect({ className, ...props }) {
  return /* @__PURE__ */ jsx9(
    "select",
    {
      "data-slot": "native-select",
      className: cn(inputClasses, "cursor-pointer pr-2 [&_option]:text-ink [&_option]:bg-overlay", className),
      ...props
    }
  );
}
function NativeSelectOption(props) {
  return /* @__PURE__ */ jsx9("option", { "data-slot": "native-select-option", ...props });
}
function NativeSelectOptGroup(props) {
  return /* @__PURE__ */ jsx9("optgroup", { "data-slot": "native-select-optgroup", ...props });
}

// src/ui/checkbox.jsx
import * as React2 from "react";
import { jsx as jsx10 } from "react/jsx-runtime";
var Checkbox = React2.forwardRef(function Checkbox2({ className, indeterminate = false, onCheckedChange, onChange, ...props }, forwardedRef) {
  const ref = React2.useRef(null);
  React2.useImperativeHandle(forwardedRef, () => ref.current);
  React2.useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return /* @__PURE__ */ jsx10(
    "input",
    {
      ...props,
      ref,
      type: "checkbox",
      "data-slot": "checkbox",
      className: cn("size-5 shrink-0 m-0 accent-signal cursor-[inherit] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus", className),
      onChange: (event) => {
        onCheckedChange?.(event.target.checked);
        onChange?.(event);
      }
    }
  );
});

// src/ui/popover.jsx
import * as React3 from "react";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { jsx as jsx11, jsxs } from "react/jsx-runtime";
function Popover(props) {
  return /* @__PURE__ */ jsx11(PopoverPrimitive.Root, { "data-slot": "popover", ...props });
}
function PopoverTrigger(props) {
  return /* @__PURE__ */ jsx11(PopoverPrimitive.Trigger, { "data-slot": "popover-trigger", ...props });
}
function PopoverContent({ className, side, align, sideOffset = 8, children, ...props }) {
  return /* @__PURE__ */ jsx11(PopoverPrimitive.Portal, { children: /* @__PURE__ */ jsx11(PopoverPrimitive.Positioner, { positionMethod: "fixed", side, align, sideOffset, className: "z-100", children: /* @__PURE__ */ jsx11(
    PopoverPrimitive.Popup,
    {
      "data-slot": "popover-content",
      className: cn(
        "max-w-[min(28rem,var(--available-width))] max-h-(--available-height) overflow-auto p-panel border-0 rounded-container bg-overlay text-ink shadow-overlay font-normal text-body leading-[1.5] text-left tracking-normal normal-case whitespace-normal",
        className
      ),
      ...props,
      children
    }
  ) }) });
}
function PopoverTitle({ className, ...props }) {
  return /* @__PURE__ */ jsx11(PopoverPrimitive.Title, { "data-slot": "popover-title", className: cn("m-0 mb-2 text-[1.125rem]", className), ...props });
}
function PopoverDescription({ className, ...props }) {
  return /* @__PURE__ */ jsx11(PopoverPrimitive.Description, { "data-slot": "popover-description", className: cn("m-0 mb-4", className), ...props });
}
function PopoverClose({ className, ...props }) {
  return /* @__PURE__ */ jsx11(PopoverPrimitive.Close, { "data-slot": "popover-close", className: cn(buttonVariants(), className), ...props });
}
function HelpPopover({ label = "More information", title, children, className }) {
  const [open, setOpen] = React3.useState(false);
  const restoringFocus = React3.useRef(false);
  return /* @__PURE__ */ jsxs(Popover, { open, onOpenChange: (next) => {
    restoringFocus.current = !next;
    setOpen(next);
  }, children: [
    /* @__PURE__ */ jsx11(
      PopoverTrigger,
      {
        "data-slot": "help-trigger",
        "aria-label": label,
        openOnHover: true,
        className: cn(
          "inline-grid place-items-center shrink-0 size-target border-0 rounded-[50%] p-0 font-semibold text-[1rem] leading-[normal] bg-raised text-ink-secondary shadow-raised cursor-help focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus",
          className
        ),
        onFocus: (event) => {
          if (restoringFocus.current) {
            restoringFocus.current = false;
            return;
          }
          if (event.target.matches(":focus-visible")) setOpen(true);
        },
        children: "i"
      }
    ),
    /* @__PURE__ */ jsxs(PopoverContent, { "data-help-popup": "", children: [
      /* @__PURE__ */ jsx11(PopoverTitle, { children: title }),
      /* @__PURE__ */ jsx11(PopoverDescription, { children }),
      /* @__PURE__ */ jsx11(PopoverClose, { children: "Close" })
    ] })
  ] });
}

// src/ui/slider.jsx
import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import { jsx as jsx12, jsxs as jsxs2 } from "react/jsx-runtime";
function Slider({ className, thumbProps, ...props }) {
  return /* @__PURE__ */ jsx12(SliderPrimitive.Root, { "data-slot": "slider", className: cn("min-w-0", className), ...props, children: /* @__PURE__ */ jsx12(SliderPrimitive.Control, { "data-slot": "slider-control", className: "flex items-center w-full h-11 touch-none select-none cursor-pointer", children: /* @__PURE__ */ jsxs2(SliderPrimitive.Track, { "data-slot": "slider-track", className: "h-2 w-full rounded-pill pressed", children: [
    /* @__PURE__ */ jsx12(SliderPrimitive.Indicator, { "data-slot": "slider-range", className: "h-full rounded-pill [background:var(--ds-action-gradient)]" }),
    /* @__PURE__ */ jsx12(
      SliderPrimitive.Thumb,
      {
        "data-slot": "slider-thumb",
        className: "box-border size-[26px] border-3 border-[#FFFFFF] rounded-[50%] [background:var(--ds-action-gradient)] shadow-[0_0_0_1px_rgba(38,38,36,.18),0_6px_12px_-4px_rgba(0,0,0,.45)] before:absolute before:-inset-3 before:content-[''] has-focus-visible:outline-3 has-focus-visible:outline-offset-4 has-focus-visible:outline-focus",
        ...thumbProps
      }
    )
  ] }) }) });
}

// src/ui/select.jsx
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { cva as cva7 } from "class-variance-authority";

// src/ui/icons.jsx
import { jsx as jsx13 } from "react/jsx-runtime";
var stroke = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
function ChevronIcon(props) {
  return /* @__PURE__ */ jsx13("svg", { viewBox: "0 0 16 16", width: "14", height: "14", "aria-hidden": "true", ...props, children: /* @__PURE__ */ jsx13("path", { d: "M3.5 6l4.5 4.5L12.5 6", ...stroke }) });
}
function CheckIcon(props) {
  return /* @__PURE__ */ jsx13("svg", { viewBox: "0 0 16 16", width: "14", height: "14", "aria-hidden": "true", ...props, children: /* @__PURE__ */ jsx13("path", { d: "M3 8.5l3.2 3L13 4.5", ...stroke, strokeWidth: 2.2 }) });
}

// src/ui/menu-classes.js
var menuClasses = {
  popup: "box-border p-1.5 rounded-control bg-overlay text-ink shadow-overlay outline-none font-normal text-body leading-[1.4]",
  item: "flex items-center min-h-target rounded-[10px] cursor-pointer outline-none font-medium data-highlighted:bg-selection data-disabled:text-ink-disabled data-disabled:cursor-not-allowed",
  separator: "h-0 mx-1 my-1.5 border-0 border-t-[1.5px] border-dashed border-stitch",
  groupLabel: "px-3 pt-1 pb-1.5 text-[.75rem] font-bold text-ink-secondary"
};

// src/ui/select.jsx
import { jsx as jsx14, jsxs as jsxs3 } from "react/jsx-runtime";
function Select(props) {
  return /* @__PURE__ */ jsx14(SelectPrimitive.Root, { "data-slot": "select", ...props });
}
function SelectGroup({ className, ...props }) {
  return /* @__PURE__ */ jsx14(SelectPrimitive.Group, { "data-slot": "select-group", className: cn("mt-1.5 pt-1.5 border-t-[1.5px] border-dashed border-stitch", className), ...props });
}
function SelectLabel({ className, ...props }) {
  return /* @__PURE__ */ jsx14(SelectPrimitive.GroupLabel, { "data-slot": "select-label", className: cn(menuClasses.groupLabel, className), ...props });
}
function SelectValue({ className, ...props }) {
  return /* @__PURE__ */ jsx14(SelectPrimitive.Value, { "data-slot": "select-value", className: cn("min-w-0 overflow-hidden text-ellipsis whitespace-nowrap", className), ...props });
}
var selectTriggerVariants = cva7(
  "box-border flex items-center justify-between gap-2.5 w-full min-h-[max(44px,var(--ds-control-height))] py-1.5 pr-3 pl-3.5 border border-line rounded-control text-ink font-normal text-body leading-[1.4] text-left cursor-pointer focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus data-disabled:cursor-not-allowed data-disabled:text-ink-disabled",
  {
    variants: {
      variant: {
        field: "pressed",
        quiet: "w-auto max-w-full gap-1.5 px-2 bg-transparent border-transparent font-medium hover:bg-inset hover:border-line data-popup-open:bg-inset data-popup-open:border-line"
      },
      size: {
        default: "",
        small: "relative min-h-control-compact py-1 pr-2.5 pl-3 text-caption leading-[1.4] after:absolute after:inset-x-0 after:top-1/2 after:h-[max(100%,var(--ds-control-target))] after:-translate-y-1/2"
      }
    },
    compoundVariants: [{ variant: "quiet", size: "small", className: "px-2" }],
    defaultVariants: {
      variant: "field",
      size: "default"
    }
  }
);
function SelectTrigger({ className, variant, size, children, ...props }) {
  return /* @__PURE__ */ jsxs3(SelectPrimitive.Trigger, { "data-slot": "select-trigger", className: cn(selectTriggerVariants({ variant, size }), className), ...props, children: [
    children,
    /* @__PURE__ */ jsx14(ChevronIcon, { className: "flex-none text-ink-secondary" })
  ] });
}
function SelectContent({ className, children, align = "start", sideOffset = 6, ...props }) {
  return /* @__PURE__ */ jsx14(SelectPrimitive.Portal, { children: /* @__PURE__ */ jsx14(SelectPrimitive.Positioner, { className: "z-210", align, sideOffset, alignItemWithTrigger: false, children: /* @__PURE__ */ jsx14(
    SelectPrimitive.Popup,
    {
      "data-slot": "select-content",
      className: cn(menuClasses.popup, "min-w-(--anchor-width) max-h-[min(360px,var(--available-height))] overflow-y-auto", className),
      ...props,
      children: /* @__PURE__ */ jsx14(SelectPrimitive.List, { children })
    }
  ) }) });
}
function SelectItem({ className, children, ...props }) {
  return /* @__PURE__ */ jsxs3(
    SelectPrimitive.Item,
    {
      "data-slot": "select-item",
      className: cn(menuClasses.item, "justify-between gap-4 px-3 whitespace-nowrap data-selected:font-bold", className),
      ...props,
      children: [
        /* @__PURE__ */ jsx14(SelectPrimitive.ItemText, { children }),
        /* @__PURE__ */ jsx14(SelectPrimitive.ItemIndicator, { className: "flex action-link", children: /* @__PURE__ */ jsx14(CheckIcon, {}) })
      ]
    }
  );
}
function SelectSeparator({ className, ...props }) {
  return /* @__PURE__ */ jsx14(SelectPrimitive.Separator, { "data-slot": "select-separator", className: cn(menuClasses.separator, className), ...props });
}

// src/ui/dropdown-menu.jsx
import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { jsx as jsx15, jsxs as jsxs4 } from "react/jsx-runtime";
function DropdownMenu(props) {
  return /* @__PURE__ */ jsx15(MenuPrimitive.Root, { "data-slot": "dropdown-menu", ...props });
}
function DropdownMenuTrigger({ className, variant, size, loading = false, disabled = false, children, ...props }) {
  return /* @__PURE__ */ jsxs4(
    MenuPrimitive.Trigger,
    {
      "data-slot": "dropdown-menu-trigger",
      className: cn(buttonVariants({ variant, size }), "gap-1.5 pl-4 pr-3 data-popup-open:bg-inset data-popup-open:bg-none data-popup-open:shadow-pressed", className),
      disabled: disabled || loading,
      "aria-busy": loading || void 0,
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsx15(ChevronIcon, {})
      ]
    }
  );
}
function DropdownMenuContent({ className, align = "end", sideOffset = 6, children, ...props }) {
  return /* @__PURE__ */ jsx15(MenuPrimitive.Portal, { children: /* @__PURE__ */ jsx15(MenuPrimitive.Positioner, { className: "z-210", align, sideOffset, children: /* @__PURE__ */ jsx15(MenuPrimitive.Popup, { "data-slot": "dropdown-menu-content", className: cn(menuClasses.popup, "min-w-[180px]", className), ...props, children }) }) });
}
function DropdownMenuGroup(props) {
  return /* @__PURE__ */ jsx15(MenuPrimitive.Group, { "data-slot": "dropdown-menu-group", ...props });
}
function DropdownMenuLabel({ className, ...props }) {
  return /* @__PURE__ */ jsx15(MenuPrimitive.GroupLabel, { "data-slot": "dropdown-menu-label", className: cn(menuClasses.groupLabel, className), ...props });
}
function DropdownMenuItem({ className, ...props }) {
  return /* @__PURE__ */ jsx15(MenuPrimitive.Item, { "data-slot": "dropdown-menu-item", className: cn(menuClasses.item, "px-3.5", className), ...props });
}
function DropdownMenuSeparator({ className, ...props }) {
  return /* @__PURE__ */ jsx15(MenuPrimitive.Separator, { "data-slot": "dropdown-menu-separator", className: cn(menuClasses.separator, className), ...props });
}

// src/ui/dialog.jsx
import * as React4 from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { jsx as jsx16, jsxs as jsxs5 } from "react/jsx-runtime";
function Dialog({ dismissible = true, onOpenChange, ...props }) {
  return /* @__PURE__ */ jsx16(
    DialogPrimitive.Root,
    {
      "data-slot": "dialog",
      disablePointerDismissal: !dismissible,
      onOpenChange: (next, details) => {
        if (!dismissible && !next && ["escape-key", "outside-press"].includes(details.reason)) {
          details.cancel();
          return;
        }
        onOpenChange?.(next, details);
      },
      ...props
    }
  );
}
function DialogTrigger(props) {
  return /* @__PURE__ */ jsx16(DialogPrimitive.Trigger, { "data-slot": "dialog-trigger", ...props });
}
function DialogClose({ className, ...props }) {
  return /* @__PURE__ */ jsx16(DialogPrimitive.Close, { "data-slot": "dialog-close", className: cn(buttonVariants({ variant: "secondary" }), className), ...props });
}
function DialogContent({ className, children, initialFocus, finalFocus, ...props }) {
  const [origin] = React4.useState(() => typeof document === "undefined" ? null : { current: document.activeElement });
  return /* @__PURE__ */ jsxs5(DialogPrimitive.Portal, { children: [
    /* @__PURE__ */ jsx16(DialogPrimitive.Backdrop, { "data-slot": "dialog-overlay", className: "fixed inset-0 z-200 bg-[rgba(38,38,36,.5)]" }),
    /* @__PURE__ */ jsx16(DialogPrimitive.Viewport, { "data-slot": "dialog-viewport", className: "fixed inset-0 z-201 grid place-items-center overflow-auto overscroll-contain box-border p-5 max-[380.98px]:p-3", children: /* @__PURE__ */ jsx16(
      DialogPrimitive.Popup,
      {
        "data-slot": "dialog-content",
        initialFocus,
        finalFocus: finalFocus ?? origin,
        className: cn(
          "box-border max-w-full w-[36rem] max-h-[calc(100dvh-40px)] overflow-auto p-panel border-0 rounded-dialog bg-overlay text-ink shadow-overlay font-normal text-body max-[380.98px]:max-h-[calc(100dvh-24px)] max-[380.98px]:p-5",
          className
        ),
        ...props,
        children
      }
    ) })
  ] });
}
function DialogTitle({ className, ...props }) {
  return /* @__PURE__ */ jsx16(DialogPrimitive.Title, { "data-slot": "dialog-title", className: cn("m-0 mb-3 font-medium text-section leading-[1.2] tracking-[-.025em] wrap-anywhere", className), ...props });
}
function DialogDescription({ className, ...props }) {
  return /* @__PURE__ */ jsx16(DialogPrimitive.Description, { "data-slot": "dialog-description", className: cn("m-0 mb-5 text-ink-secondary", className), ...props });
}
function DialogBody({ className, ...props }) {
  return /* @__PURE__ */ jsx16("div", { "data-slot": "dialog-body", className: cn("min-w-0 wrap-anywhere", className), ...props });
}
function DialogFooter({ className, ...props }) {
  return /* @__PURE__ */ jsx16("div", { "data-slot": "dialog-footer", className: cn("flex flex-wrap items-center justify-end gap-3 mt-6", className), ...props });
}

// src/ui/combobox.jsx
import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { jsx as jsx17 } from "react/jsx-runtime";
function Combobox(props) {
  return /* @__PURE__ */ jsx17(ComboboxPrimitive.Root, { "data-slot": "combobox", ...props });
}
function ComboboxInput({ className, ...props }) {
  return /* @__PURE__ */ jsx17(ComboboxPrimitive.Input, { "data-slot": "combobox-input", className: cn(inputClasses, "placeholder:text-ink-secondary placeholder:opacity-100", className), ...props });
}
function ComboboxContent({ className, children, align = "start", sideOffset = 4, ...props }) {
  return /* @__PURE__ */ jsx17(ComboboxPrimitive.Portal, { children: /* @__PURE__ */ jsx17(ComboboxPrimitive.Positioner, { className: "z-210", align, sideOffset, children: /* @__PURE__ */ jsx17(
    ComboboxPrimitive.Popup,
    {
      "data-slot": "combobox-content",
      className: cn(menuClasses.popup, "min-w-(--anchor-width) max-w-(--available-width) max-h-[min(360px,var(--available-height))] overflow-y-auto", className),
      ...props,
      children
    }
  ) }) });
}
function ComboboxList(props) {
  return /* @__PURE__ */ jsx17(ComboboxPrimitive.List, { "data-slot": "combobox-list", ...props });
}
function ComboboxItem({ className, ...props }) {
  return /* @__PURE__ */ jsx17(ComboboxPrimitive.Item, { "data-slot": "combobox-item", className: cn(menuClasses.item, "px-3 data-selected:font-bold", className), ...props });
}
function ComboboxEmpty({ className, ...props }) {
  return /* @__PURE__ */ jsx17(ComboboxPrimitive.Empty, { "data-slot": "combobox-empty", className: cn("px-3 py-2.5 text-ink-secondary empty:hidden", className), ...props });
}
export {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldHeading,
  FieldLabel,
  FieldLegend,
  FieldSet,
  HelpPopover,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  Slider,
  Toggle,
  alertVariants,
  badgeVariants,
  buttonVariants,
  cardVariants,
  cn,
  selectTriggerVariants,
  toggleVariants
};
