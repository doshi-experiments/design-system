import { cn } from "@/ui/cn"

// From `shadcn add label` (base-nova, 4.23.0). Field's labels (FieldLabel) carry Felt's look;
// this is the bare element they build on.
function Label({ className, ...props }) {
  return <label data-slot="label" className={cn(className)} {...props} />
}

export { Label }
