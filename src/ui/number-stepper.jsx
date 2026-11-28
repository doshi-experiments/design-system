import * as React from "react"
import { cn } from "@/ui/cn"
import { Button } from "@/ui/button"

// A bounded counter for touch-first setup screens, as /react's NumberStepper draws it: round
// − and + keys either side of a large live value. The app owns validation.
function NumberStepper({ label, value, min = 0, max = Infinity, step = 1, onValueChange, suffix, decreaseLabel, increaseLabel, className }) {
  const id = React.useId()
  const key = "w-target min-w-target min-h-target p-2 text-[1.5rem]"
  return (
    <div data-slot="number-stepper" role="group" aria-label={label} className={cn("flex items-center gap-2 shrink-0", className)}>
      <Button type="button" className={key} aria-label={decreaseLabel || `Decrease ${label}`} aria-describedby={id}
        disabled={value <= min} onClick={() => onValueChange(Math.max(min, value - step))}>−</Button>
      <span id={id} data-slot="number-stepper-value" aria-live="polite" aria-atomic="true"
        className="min-w-[2ch] text-center text-ink font-sans font-medium text-[1.625rem] leading-[1.2] tabular-nums">
        {value}
        {suffix && <small className="block mt-1 text-ink-secondary font-normal text-[.75rem] leading-[1.4] normal-nums">{suffix}</small>}
      </span>
      <Button type="button" className={key} aria-label={increaseLabel || `Increase ${label}`} aria-describedby={id}
        disabled={value >= max} onClick={() => onValueChange(Math.min(max, value + step))}>+</Button>
    </div>
  )
}

export { NumberStepper }
