import { cn } from "@/ui/cn"

// From `shadcn add input-group` (base-nova, 4.23.0), restyled to Felt as .ds-input-wrap draws it:
// one pressed-in well holding an input and its prefix or suffix ($, %, /mo). The well draws the
// focus ring; a read-only input dashes its border, an invalid one turns it error red.
function InputGroup({ className, ...props }) {
  return (
    <div
      data-slot="input-group"
      className={cn(
        "flex items-center gap-1.5 min-h-12 px-3.5 border border-line rounded-control pressed transition-[border-color,box-shadow] focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-focus has-[input[readonly]]:border-dashed has-[input[readonly]]:bg-transparent has-[input[aria-invalid=true]]:border-[var(--ds-error-text)]",
        className
      )}
      {...props}
    />
  )
}

function InputGroupInput({ className, ...props }) {
  return (
    <input
      data-slot="input-group-control"
      className={cn(
        "block w-full min-w-0 min-h-[46px] px-0 py-2 border-0 [outline:0] bg-transparent text-ink font-normal text-body tabular-nums focus-visible:[outline:0] read-only:text-ink-secondary",
        className
      )}
      {...props}
    />
  )
}

// A prefix or suffix. It is read with the label, so it is hidden from assistive technology.
function InputGroupAddon({ className, ...props }) {
  return <span data-slot="input-group-addon" aria-hidden="true" className={cn("shrink-0 text-ink-secondary text-[.8125rem]", className)} {...props} />
}

export { InputGroup, InputGroupInput, InputGroupAddon }
