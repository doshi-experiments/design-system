import * as React from "react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"
import { cn } from "@/ui/cn"
import { buttonVariants } from "@/ui/button"

// From `shadcn add popover` (base-nova, 4.23.0), restyled to Felt as /react's HelpPopover draws
// its popup: a felt overlay card, fixed-positioned so it escapes scrolling and clipping parents.

function Popover(props) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger(props) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

function PopoverContent({ className, side, align, sideOffset = 8, children, ...props }) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner positionMethod="fixed" side={side} align={align} sideOffset={sideOffset} className="z-100">
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(
            "max-w-[min(28rem,var(--available-width))] max-h-(--available-height) overflow-auto p-panel border-0 rounded-container bg-overlay text-ink shadow-overlay font-normal text-body leading-[1.5] text-left tracking-normal normal-case whitespace-normal",
            className
          )}
          {...props}
        >
          {children}
        </PopoverPrimitive.Popup>
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}

function PopoverTitle({ className, ...props }) {
  return <PopoverPrimitive.Title data-slot="popover-title" className={cn("m-0 mb-2 text-[1.125rem]", className)} {...props} />
}

function PopoverDescription({ className, ...props }) {
  return <PopoverPrimitive.Description data-slot="popover-description" className={cn("m-0 mb-4", className)} {...props} />
}

function PopoverClose({ className, ...props }) {
  return <PopoverPrimitive.Close data-slot="popover-close" className={cn(buttonVariants(), className)} {...props} />
}

// The "i" beside a label: a raised round key that opens an explanation on hover, tap or keyboard
// focus, and closes on Escape or an outside press. After it closes, focus returns to the key
// without opening it again. Inside FieldHeading it loses its surface.
function HelpPopover({ label = "More information", title, children, className }) {
  const [open, setOpen] = React.useState(false)
  const restoringFocus = React.useRef(false)
  return (
    <Popover open={open} onOpenChange={(next) => { restoringFocus.current = !next; setOpen(next) }}>
      <PopoverTrigger
        data-slot="help-trigger"
        aria-label={label}
        openOnHover
        className={cn(
          "inline-grid place-items-center shrink-0 size-target border-0 rounded-[50%] p-0 font-semibold text-[1rem] leading-[normal] bg-raised text-ink-secondary shadow-raised cursor-help focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus",
          className
        )}
        onFocus={(event) => {
          if (restoringFocus.current) { restoringFocus.current = false; return }
          if (event.target.matches(":focus-visible")) setOpen(true)
        }}
      >
        i
      </PopoverTrigger>
      <PopoverContent data-help-popup="">
        <PopoverTitle>{title}</PopoverTitle>
        <PopoverDescription>{children}</PopoverDescription>
        <PopoverClose>Close</PopoverClose>
      </PopoverContent>
    </Popover>
  )
}

export { Popover, PopoverTrigger, PopoverContent, PopoverTitle, PopoverDescription, PopoverClose, HelpPopover }
