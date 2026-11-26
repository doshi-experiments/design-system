import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox"
import { cn } from "@/ui/cn"
import { inputClasses } from "@/ui/input"
import { menuClasses } from "@/ui/menu-classes"

// From `shadcn add combobox` (base-nova, 4.23.0), restyled to Felt: a searchable select. The input
// is the text field's well; the list is the felt popup Select uses. New to the shared system; it
// replaces Finance's local category picker.

function Combobox(props) {
  return <ComboboxPrimitive.Root data-slot="combobox" {...props} />
}

function ComboboxInput({ className, ...props }) {
  return <ComboboxPrimitive.Input data-slot="combobox-input" className={cn(inputClasses, "placeholder:text-ink-secondary placeholder:opacity-100", className)} {...props} />
}

function ComboboxContent({ className, children, align = "start", sideOffset = 4, ...props }) {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner className="z-210" align={align} sideOffset={sideOffset}>
        <ComboboxPrimitive.Popup
          data-slot="combobox-content"
          className={cn(menuClasses.popup, "min-w-(--anchor-width) max-w-(--available-width) max-h-[min(360px,var(--available-height))] overflow-y-auto", className)}
          {...props}
        >
          {children}
        </ComboboxPrimitive.Popup>
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  )
}

function ComboboxList(props) {
  return <ComboboxPrimitive.List data-slot="combobox-list" {...props} />
}

function ComboboxItem({ className, ...props }) {
  return <ComboboxPrimitive.Item data-slot="combobox-item" className={cn(menuClasses.item, "px-3 data-selected:font-bold", className)} {...props} />
}

function ComboboxEmpty({ className, ...props }) {
  return <ComboboxPrimitive.Empty data-slot="combobox-empty" className={cn("px-3 py-2.5 text-ink-secondary empty:hidden", className)} {...props} />
}

export { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList }
