import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "@/ui/cn"

// From `shadcn add input` (base-nova, 4.23.0), restyled to Felt as /react's TextField draws its input: a
// pressed-in well with a hairline border, 44px tall (60px at game density).
const inputClasses =
  "box-border w-full max-w-full min-w-0 min-h-[max(44px,var(--ds-control-height))] px-3.5 py-2.5 border border-line rounded-control text-ink pressed font-normal text-body leading-[1.4] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus aria-invalid:border-[var(--ds-error-text)] disabled:cursor-not-allowed disabled:text-ink-disabled"

function Input({ className, type, ...props }) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(inputClasses, "placeholder:text-ink-secondary placeholder:opacity-100", className)}
      {...props}
    />
  )
}

export { Input, inputClasses }
