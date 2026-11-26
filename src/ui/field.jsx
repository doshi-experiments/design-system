import { useMemo } from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/ui/cn"
import { Label } from "@/ui/label"

// From `shadcn add field` (base-nova, 4.23.0), restyled to Felt as .ds-field, .ds-field-group and
// .ds-field-grid draw them. FieldSet is a group of fields under a stitched rule; FieldGroup lays
// fields out in two columns whose labels, inputs and hints share rows, so inputs line up
// whatever their labels and hints wrap to.

function FieldSet({ className, ...props }) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn("min-w-0 m-0 mb-7 px-0 pt-6 pb-0 border-0 border-t-[1.5px] border-dashed border-stitch", className)}
      {...props}
    />
  )
}

function FieldLegend({ className, ...props }) {
  return <legend data-slot="field-legend" className={cn("p-0 pr-2 text-ink font-semibold text-body leading-[1.4]", className)} {...props} />
}

function FieldGroup({ className, ...props }) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        "grid grid-cols-2 gap-x-3 gap-y-4 max-[380.98px]:grid-cols-1 *:data-[slot=field]:grid *:data-[slot=field]:grid-rows-subgrid *:data-[slot=field]:row-span-3 *:data-[slot=field]:gap-y-0 [&>[data-slot=field]>[data-slot=field-heading]]:[align-self:end]",
        className
      )}
      {...props}
    />
  )
}

// orientation="choice" is a checkbox field: the label is the row and the hint sits under its text.
const fieldVariants = cva("min-w-0 font-sans", {
  variants: {
    orientation: {
      vertical: "relative",
      choice: "*:data-[slot=field-description]:ml-8 *:data-[slot=field-description]:mt-0 *:data-[slot=field-error]:ml-8 *:data-[slot=field-error]:mt-0",
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
})

function Field({ className, orientation = "vertical", ...props }) {
  return <div data-slot="field" data-orientation={orientation} className={cn(fieldVariants({ orientation }), className)} {...props} />
}

// The row above a numeric field: its label, then any help or badge, aligned to the bottom.
function FieldHeading({ className, ...props }) {
  return (
    <div
      data-slot="field-heading"
      className={cn("flex flex-wrap items-end gap-1 min-h-8 mb-1.5 text-ink-secondary text-[.8125rem] font-semibold *:data-[slot=help-trigger]:size-11 *:data-[slot=help-trigger]:bg-transparent *:data-[slot=help-trigger]:shadow-none *:data-[slot=help-trigger]:-my-1.5", className)}
      {...props}
    />
  )
}

const fieldLabelVariants = cva("", {
  variants: {
    variant: {
      default: "block m-0 mb-1.5 text-ink-secondary font-semibold text-caption",
      // Inside FieldHeading, which sets the type.
      heading: "flex-1 min-w-0",
      // Wraps a Checkbox: the whole 44px row is the target. A label hidden with sr-only keeps
      // the target square.
      choice:
        "relative flex items-center gap-3 min-h-target w-fit max-w-full text-ink font-medium text-[.9375rem] leading-[1.5] cursor-pointer has-disabled:text-ink-disabled has-disabled:cursor-not-allowed has-[>.sr-only]:min-w-target has-[>.sr-only]:justify-center",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

function FieldLabel({ className, variant = "default", ...props }) {
  return <Label data-slot="field-label" className={cn(fieldLabelVariants({ variant }), className)} {...props} />
}

// A field's hint, or, directly inside a FieldSet, the set's description. Empty hints take no space.
function FieldDescription({ className, ...props }) {
  return (
    <p
      data-slot="field-description"
      className={cn(
        "mt-[5px] text-[.75rem] leading-[1.5] text-ink-secondary empty:hidden data-warning:text-[var(--ds-warning-text)]",
        "[[data-slot=field-set]>&]:flex [[data-slot=field-set]>&]:items-center [[data-slot=field-set]>&]:gap-2 [[data-slot=field-set]>&]:mt-0 [[data-slot=field-set]>&]:mb-4 [[data-slot=field-set]>&]:text-caption",
        className
      )}
      {...props}
    />
  )
}

function FieldError({ className, children, errors, ...props }) {
  const content = useMemo(() => {
    if (children) return children
    if (!errors?.length) return null
    const unique = [...new Map(errors.map((error) => [error?.message, error])).values()]
    if (unique.length === 1) return unique[0]?.message
    return (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {unique.map((error, index) => error?.message && <li key={index}>{error.message}</li>)}
      </ul>
    )
  }, [children, errors])
  if (!content) return null
  return (
    <p role="alert" data-slot="field-error" className={cn("mt-[5px] text-[.75rem] leading-[1.5] text-[var(--ds-error-text)]", className)} {...props}>
      {content}
    </p>
  )
}

export { Field, FieldDescription, FieldError, FieldGroup, FieldHeading, FieldLabel, FieldLegend, FieldSet }
