import { Select as SelectPrimitive } from "@base-ui/react/select"
import { cva } from "class-variance-authority"
import { cn } from "@/ui/cn"
import { CheckIcon, ChevronIcon } from "@/ui/icons"
import { menuClasses } from "@/ui/menu-classes"

// From `shadcn add select` (base-nova, 4.23.0), restyled to Felt as /react's Select draws it: one
// felt popup instead of the operating system's sheet. The trigger is a pressed-in well, or
// variant="quiet" for a select that sits in a toolbar; size="small" is shorter over the same
// hit area. Popups sit at z-index 210, above dialogs.

function Select(props) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({ className, ...props }) {
  return <SelectPrimitive.Group data-slot="select-group" className={cn("mt-1.5 pt-1.5 border-t-[1.5px] border-dashed border-stitch", className)} {...props} />
}

function SelectLabel({ className, ...props }) {
  return <SelectPrimitive.GroupLabel data-slot="select-label" className={cn(menuClasses.groupLabel, className)} {...props} />
}

function SelectValue({ className, ...props }) {
  return <SelectPrimitive.Value data-slot="select-value" className={cn("min-w-0 overflow-hidden text-ellipsis whitespace-nowrap", className)} {...props} />
}

const selectTriggerVariants = cva(
  "box-border flex items-center justify-between gap-2.5 w-full min-h-[max(44px,var(--ds-control-height))] py-1.5 pr-3 pl-3.5 border border-line rounded-control text-ink font-normal text-body leading-[1.4] text-left cursor-pointer focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus data-disabled:cursor-not-allowed data-disabled:text-ink-disabled",
  {
    variants: {
      variant: {
        field: "pressed",
        quiet: "w-auto max-w-full gap-1.5 px-2 bg-transparent border-transparent font-medium hover:bg-inset hover:border-line data-popup-open:bg-inset data-popup-open:border-line",
      },
      size: {
        default: "",
        small:
          "relative min-h-control-compact py-1 pr-2.5 pl-3 text-caption leading-[1.4] after:absolute after:inset-x-0 after:top-1/2 after:h-[max(100%,var(--ds-control-target))] after:-translate-y-1/2",
      },
    },
    compoundVariants: [{ variant: "quiet", size: "small", className: "px-2" }],
    defaultVariants: {
      variant: "field",
      size: "default",
    },
  }
)

function SelectTrigger({ className, variant, size, children, ...props }) {
  return (
    <SelectPrimitive.Trigger data-slot="select-trigger" className={cn(selectTriggerVariants({ variant, size }), className)} {...props}>
      {children}
      <ChevronIcon className="flex-none text-ink-secondary" />
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({ className, children, align = "start", sideOffset = 6, ...props }) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner className="z-210" align={align} sideOffset={sideOffset} alignItemWithTrigger={false}>
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(menuClasses.popup, "min-w-(--anchor-width) max-h-[min(360px,var(--available-height))] overflow-y-auto", className)}
          {...props}
        >
          <SelectPrimitive.List>{children}</SelectPrimitive.List>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

function SelectItem({ className, children, ...props }) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(menuClasses.item, "justify-between gap-4 px-3 whitespace-nowrap data-selected:font-bold", className)}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="flex action-link">
        <CheckIcon />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({ className, ...props }) {
  return <SelectPrimitive.Separator data-slot="select-separator" className={cn(menuClasses.separator, className)} {...props} />
}

export { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue, selectTriggerVariants }
