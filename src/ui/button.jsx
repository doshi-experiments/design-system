import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva } from "class-variance-authority"
import { cn } from "@/ui/cn"
import { buttonClasses } from "@/ui/button-classes"

// From `shadcn add button` (base-nova, 4.23.0), restyled to Felt. It draws exactly what
// .ds-button draws: a raised felt pill that presses in, the signal for primary, and a 44px
// target (60px at game density). Variant and size names are the ones /react's Button takes.
// The classes live in button-classes.js, which also builds the ds-button utility.
const buttonVariants = cva(buttonClasses.base, {
  variants: { variant: buttonClasses.variant, size: buttonClasses.size },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

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
