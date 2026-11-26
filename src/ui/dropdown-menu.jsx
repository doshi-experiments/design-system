import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import { cn } from "@/ui/cn"
import { buttonVariants } from "@/ui/button"
import { ChevronIcon } from "@/ui/icons"
import { menuClasses } from "@/ui/menu-classes"

// From `shadcn add dropdown-menu` (base-nova, 4.23.0), restyled to Felt as /react's MenuButton
// draws it: a button with a chevron that stays pressed in while its felt menu is open.

function DropdownMenu(props) {
  return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuTrigger({ className, variant, size, loading = false, disabled = false, children, ...props }) {
  return (
    <MenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      className={cn(buttonVariants({ variant, size }), "gap-1.5 pl-4 pr-3 data-popup-open:bg-inset data-popup-open:bg-none data-popup-open:shadow-pressed", className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {children}
      <ChevronIcon />
    </MenuPrimitive.Trigger>
  )
}

function DropdownMenuContent({ className, align = "end", sideOffset = 6, children, ...props }) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner className="z-210" align={align} sideOffset={sideOffset}>
        <MenuPrimitive.Popup data-slot="dropdown-menu-content" className={cn(menuClasses.popup, "min-w-[180px]", className)} {...props}>
          {children}
        </MenuPrimitive.Popup>
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}

function DropdownMenuGroup(props) {
  return <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
}

function DropdownMenuLabel({ className, ...props }) {
  return <MenuPrimitive.GroupLabel data-slot="dropdown-menu-label" className={cn(menuClasses.groupLabel, className)} {...props} />
}

function DropdownMenuItem({ className, ...props }) {
  return <MenuPrimitive.Item data-slot="dropdown-menu-item" className={cn(menuClasses.item, "px-3.5", className)} {...props} />
}

function DropdownMenuSeparator({ className, ...props }) {
  return <MenuPrimitive.Separator data-slot="dropdown-menu-separator" className={cn(menuClasses.separator, className)} {...props} />
}

export { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger }
