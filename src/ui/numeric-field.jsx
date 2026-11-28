import * as React from "react"
import { cn } from "@/ui/cn"
import { Field, FieldDescription, FieldHeading, FieldLabel } from "@/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/ui/input-group"
import { Slider } from "@/ui/slider"

// Felt's number fields, as /react's NumericField and RangeField draw and behave. The text stays
// the app's: sanitize cleans what is typed or pasted (and the hint says when characters were
// dropped), parse and format convert, arrow keys step (Shift for ten), and a value outside min
// and max turns the well red and says the range. Business parsing stays in the app; this never
// coerces pasted currency through type="number".

function NumericField({ label, value, onValueChange, sanitize = (text) => text, parse = Number, format = String,
  step = 1, min, max, prefix, suffix, hint, badge, readOnly, help, compact = false, className }) {
  const id = React.useId()
  const [changed, setChanged] = React.useState(false)
  const numeric = parse(value)
  const outside = String(value).trim() !== "" && (!Number.isFinite(numeric) || (min !== undefined && numeric < min) || (max !== undefined && numeric > max))
  const message = outside ? `Enter a number${min !== undefined ? ` from ${min}` : ""}${max !== undefined ? ` up to ${max}` : ""}.`
    : changed ? "Numbers only — other characters were ignored." : hint
  const bound = (number) => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, number))
  return (
    <Field data-compact={compact || undefined} className={className}>
      <FieldHeading className={compact ? "absolute size-px overflow-hidden [clip-path:inset(50%)] m-0" : undefined}>
        <FieldLabel variant="heading" htmlFor={id}>{label}</FieldLabel>{help}{badge}
      </FieldHeading>
      <InputGroup>
        {prefix && <InputGroupAddon>{prefix}</InputGroupAddon>}
        <InputGroupInput id={id} type="text" inputMode="decimal" autoComplete="off" value={value} readOnly={readOnly}
          aria-invalid={outside || undefined} aria-describedby={message ? `${id}-hint` : undefined}
          onChange={(event) => { const raw = event.target.value; const clean = sanitize(raw); if (clean !== raw) event.target.value = clean; setChanged(clean !== raw); onValueChange(clean) }}
          onKeyDown={(event) => {
            if (readOnly || !["ArrowUp", "ArrowDown"].includes(event.key)) return
            event.preventDefault(); setChanged(false)
            const next = (Number.isFinite(numeric) ? numeric : 0) + (event.key === "ArrowUp" ? 1 : -1) * step * (event.shiftKey ? 10 : 1)
            onValueChange(format(bound(next)))
          }} />
        {suffix && <InputGroupAddon>{suffix}</InputGroupAddon>}
      </InputGroup>
      <FieldDescription id={`${id}-hint`} role="status" data-warning={changed || outside || undefined}>{message}</FieldDescription>
    </Field>
  )
}

// A slider and its number field side by side: the label over the slider, the field to the right.
function RangeField({ label, value, onValueChange, min = 0, max = 100, step = 1, prefix, suffix, sanitize, parse = Number, format = String, className }) {
  const id = React.useId()
  const numeric = parse(value)
  const bounded = Math.min(max, Math.max(min, Number.isFinite(numeric) ? numeric : min))
  return (
    <div data-slot="range-field" className={cn("grid grid-cols-[minmax(0,1fr)_minmax(100px,140px)] gap-x-5 gap-y-1 items-center py-2 min-w-0", className)}>
      <div id={id} className="font-sans font-semibold text-caption leading-[1.5] text-ink-secondary">{label}</div>
      <Slider className="col-start-1" min={min} max={max} step={step} value={bounded}
        onValueChange={(next) => onValueChange(format(Array.isArray(next) ? next[0] : next))} thumbProps={{ "aria-labelledby": id }} />
      <NumericField className="col-start-2 row-start-1 row-end-3" label={`${label} value`} value={value} onValueChange={onValueChange}
        min={min} max={max} step={step} prefix={prefix} suffix={suffix} sanitize={sanitize} parse={parse} format={format} compact />
    </div>
  )
}

export { NumericField, RangeField }
