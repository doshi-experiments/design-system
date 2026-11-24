import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva } from "class-variance-authority"
import { cn } from "@/ui/cn"

// From `shadcn add badge` (base-nova, 4.23.0), restyled to Felt as .ds-badge draws it: a small
// inset pill, or a status tint with its own text colour.
const badgeVariants = cva(
  "inline-flex items-center w-fit px-[9px] py-[3px] border-0 rounded-pill font-semibold text-[.6875rem] leading-[1.5]",
  {
    variants: {
      tone: {
        default: "text-ink-secondary bg-inset",
        success: "tone-success",
        warning: "tone-warning",
        error: "tone-error",
        info: "tone-info",
      },
    },
    defaultVariants: {
      tone: "default",
    },
  }
)

function Badge({ className, tone, render, ...props }) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps({ className: cn(badgeVariants({ tone }), className) }, props),
    render,
    state: { slot: "badge", tone },
  })
}

export { Badge, badgeVariants }
