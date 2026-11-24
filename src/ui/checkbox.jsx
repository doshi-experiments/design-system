import * as React from "react"
import { cn } from "@/ui/cn"

// shadcn's Checkbox draws its own box on Base UI. Felt's checkbox is the browser's own, 20px,
// in the signal, so this keeps a native input in shadcn's shape. Put it inside
// <FieldLabel variant="choice"> for the 44px row; indeterminate sets the mixed state.
const Checkbox = React.forwardRef(function Checkbox(
  { className, indeterminate = false, onCheckedChange, onChange, ...props },
  forwardedRef
) {
  const ref = React.useRef(null)
  React.useImperativeHandle(forwardedRef, () => ref.current)
  React.useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate
  }, [indeterminate])
  return (
    <input
      {...props}
      ref={ref}
      type="checkbox"
      data-slot="checkbox"
      className={cn("size-5 shrink-0 m-0 accent-signal cursor-[inherit] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus", className)}
      onChange={(event) => {
        onCheckedChange?.(event.target.checked)
        onChange?.(event)
      }}
    />
  )
})

export { Checkbox }
