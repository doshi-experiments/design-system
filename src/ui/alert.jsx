import { cva } from "class-variance-authority"
import { cn } from "@/ui/cn"

// From `shadcn add alert` (base-nova, 4.23.0), restyled to Felt as .ds-alert draws it: a tinted
// panel in its tone's colours, info by default. An error announces itself (role="alert");
// the other tones are polite (role="status").
const alertVariants = cva(
  "px-5 py-4 border rounded-control font-normal text-[.9375rem] leading-[1.5] wrap-anywhere",
  {
    variants: {
      tone: {
        info: "tone-info border-[color-mix(in_srgb,var(--ds-info-icon)_35%,transparent)]",
        success: "tone-success border-[var(--ds-success-icon)]",
        warning: "tone-warning border-[var(--ds-warning-icon)]",
        error: "tone-error border-[var(--ds-error-icon)]",
      },
    },
    defaultVariants: {
      tone: "info",
    },
  }
)

function Alert({ className, tone = "info", role, ...props }) {
  return (
    <div
      {...props}
      data-slot="alert"
      data-tone={tone}
      role={role || (tone === "error" ? "alert" : "status")}
      className={cn(alertVariants({ tone }), className)}
    />
  )
}

function AlertTitle({ className, ...props }) {
  return <div data-slot="alert-title" className={cn("mb-1 font-semibold", className)} {...props} />
}

function AlertDescription({ className, ...props }) {
  return <div data-slot="alert-description" className={cn("*:first:mt-0 *:last:mb-0", className)} {...props} />
}

// Buttons that act on the alert, in a wrapping row under its text.
function AlertAction({ className, ...props }) {
  return <div data-slot="alert-action" className={cn("flex flex-wrap items-center gap-3 mt-3", className)} {...props} />
}

export { Alert, AlertTitle, AlertDescription, AlertAction, alertVariants }
