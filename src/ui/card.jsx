import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva } from "class-variance-authority"
import { cn } from "@/ui/cn"

// From `shadcn add card` (base-nova, 4.23.0), restyled to Felt as .ds-card draws it: a raised,
// stitched panel. A card inside a card takes the control radius; variant="flat" is a section
// inside another card, with no surface or stitch of its own.
const cardVariants = cva("relative min-w-0 border-0", {
  variants: {
    variant: {
      default:
        "p-panel rounded-container raised stitched in-data-[slot=card]:rounded-control max-[380.98px]:p-[18px]",
      flat: "px-0 py-4 rounded-none bg-transparent",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

function Card({ className, variant = "default", render, ...props }) {
  return useRender({
    defaultTagName: "div",
    props: mergeProps({ className: cn(cardVariants({ variant }), className) }, props),
    render,
    state: { slot: "card", variant },
  })
}

function CardHeader({ className, ...props }) {
  return <div data-slot="card-header" className={cn("grid gap-1 pb-5", className)} {...props} />
}

// A card's heading: the card step of the type scale (20px) at heading weight.
function CardTitle({ className, render, ...props }) {
  return useRender({
    defaultTagName: "h2",
    props: mergeProps({ className: cn("m-0 text-ink font-medium text-card", className) }, props),
    render,
    state: { slot: "card-title" },
  })
}

function CardDescription({ className, ...props }) {
  return <p data-slot="card-description" className={cn("m-0 text-ink-secondary text-caption", className)} {...props} />
}

function CardAction({ className, ...props }) {
  return <div data-slot="card-action" className={cn("flex flex-wrap items-center gap-3", className)} {...props} />
}

function CardContent({ className, ...props }) {
  return <div data-slot="card-content" className={cn("min-w-0", className)} {...props} />
}

function CardFooter({ className, ...props }) {
  return <div data-slot="card-footer" className={cn("flex flex-wrap items-center gap-3 pt-5", className)} {...props} />
}

export { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter, cardVariants }
