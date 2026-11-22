import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva } from "class-variance-authority"
import { cn } from "@/ui/cn"

// From `shadcn add button` (base-nova, 4.23.0), restyled to Felt. It draws exactly what
// .ds-button draws: a raised felt pill that presses in, the signal for primary, and a 44px
// target (60px at game density). Variant and size names are the ones /react's Button takes.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 min-h-control min-w-target rounded-pill border border-transparent px-5 py-2.5 font-semibold cursor-pointer focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-focus motion-safe:transition-[translate,box-shadow,background-color] motion-safe:not-data-disabled:active:translate-y-px data-disabled:cursor-not-allowed data-disabled:border-transparent data-disabled:bg-inset data-disabled:bg-none data-disabled:text-ink-disabled data-disabled:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "raised not-data-disabled:active:shadow-pressed",
        primary:
          "signal shadow-signal not-data-disabled:hover:signal-hover not-data-disabled:active:signal-pressed not-data-disabled:active:shadow-signal-pressed",
        danger:
          "tone-error border-current not-data-disabled:hover:bg-selection not-data-disabled:active:shadow-pressed",
        ghost:
          "bg-transparent action-link not-data-disabled:hover:bg-selection not-data-disabled:active:shadow-pressed",
      },
      size: {
        default: "",
        // A shorter pill for dense layouts. The ::after keeps the full target as the hit area.
        small:
          "relative min-h-control-compact px-4 py-1.5 leading-[1.25] after:absolute after:inset-x-0 after:top-1/2 after:h-[max(100%,var(--ds-control-target))] after:-translate-y-1/2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// forwardRef stays while the calculator and Mr. Shake run React 18, which drops ref as a prop.
const Button = React.forwardRef(function Button(
  { className, variant, size, loading = false, disabled = false, ...props },
  ref
) {
  return (
    <ButtonPrimitive
      {...props}
      ref={ref}
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    />
  )
})

export { Button, buttonVariants }
