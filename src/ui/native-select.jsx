import { cn } from "@/ui/cn"
import { inputClasses } from "@/ui/input"

// From `shadcn add native-select` (base-nova, 4.23.0), restyled to Felt as .ds-select-input draws
// it: the text field's well around the browser's own select, which keeps its own arrow, so
// there is no wrapper or icon.
function NativeSelect({ className, ...props }) {
  return (
    <select
      data-slot="native-select"
      className={cn(inputClasses, "cursor-pointer pr-2 [&_option]:text-ink [&_option]:bg-overlay", className)}
      {...props}
    />
  )
}

function NativeSelectOption(props) {
  return <option data-slot="native-select-option" {...props} />
}

function NativeSelectOptGroup(props) {
  return <optgroup data-slot="native-select-optgroup" {...props} />
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption }
