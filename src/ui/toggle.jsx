import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import { cva } from "class-variance-authority"
import { cn } from "@/ui/cn"

// From `shadcn add toggle` (base-nova, 4.23.0), restyled to Felt as /react's ToggleButton draws
// it: a pressed/unpressed status such as "Alarm on" / "Alarm off". Off is quiet; on presses in,
// or carries its tone's tint. Always pass words: a tone is never shown as bare colour.
const toggleVariants = cva(
  "relative inline-flex items-center justify-center gap-1.5 min-h-control px-3.5 py-2 border border-transparent rounded-pill bg-transparent text-ink-secondary font-semibold text-caption leading-[1.25] whitespace-nowrap cursor-pointer focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus not-data-pressed:not-data-disabled:hover:bg-inset data-disabled:cursor-not-allowed aria-busy:cursor-progress aria-busy:opacity-70",
  {
    variants: {
      tone: {
        default: "data-pressed:text-ink data-pressed:pressed",
        error: "data-pressed:tone-error data-pressed:border-[color-mix(in_srgb,var(--ds-error-text)_30%,transparent)] data-pressed:shadow-none",
        warning: "data-pressed:tone-warning data-pressed:border-[color-mix(in_srgb,var(--ds-warning-text)_30%,transparent)] data-pressed:shadow-none",
        success: "data-pressed:tone-success data-pressed:border-[color-mix(in_srgb,var(--ds-success-text)_30%,transparent)] data-pressed:shadow-none",
        info: "data-pressed:tone-info data-pressed:border-[color-mix(in_srgb,var(--ds-info-text)_30%,transparent)] data-pressed:shadow-none",
      },
      size: {
        default: "",
        // The ::after keeps the full target as the hit area.
        small:
          "min-h-control-compact px-2.5 py-1 text-[.8125rem] after:absolute after:inset-x-0 after:top-1/2 after:h-[max(100%,var(--ds-control-target))] after:-translate-y-1/2",
      },
    },
    defaultVariants: {
      tone: "default",
      size: "default",
    },
  }
)

function Toggle({ className, tone, size, loading = false, disabled = false, ...props }) {
  return (
    <TogglePrimitive
      {...props}
      data-slot="toggle"
      className={cn(toggleVariants({ tone, size, className }))}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    />
  )
}

export { Toggle, toggleVariants }
