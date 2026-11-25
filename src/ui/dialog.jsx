import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { cn } from "@/ui/cn"
import { buttonVariants } from "@/ui/button"

// From `shadcn add dialog` (base-nova, 4.23.0), restyled to Felt as /react's Dialog draws it: a
// felt overlay card over a dimmed page. dismissible={false} keeps it open on Escape and outside
// presses, for a decision that must be made. When it closes, focus returns to whatever had it
// when it opened, including an app-driven open with no trigger.

function Dialog({ dismissible = true, onOpenChange, ...props }) {
  return (
    <DialogPrimitive.Root
      data-slot="dialog"
      disablePointerDismissal={!dismissible}
      onOpenChange={(next, details) => {
        if (!dismissible && !next && ["escape-key", "outside-press"].includes(details.reason)) { details.cancel(); return }
        onOpenChange?.(next, details)
      }}
      {...props}
    />
  )
}

function DialogTrigger(props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

// The quiet way out, as a secondary button.
function DialogClose({ className, ...props }) {
  return <DialogPrimitive.Close data-slot="dialog-close" className={cn(buttonVariants({ variant: "secondary" }), className)} {...props} />
}

function DialogContent({ className, children, initialFocus, finalFocus, ...props }) {
  const [origin] = React.useState(() => (typeof document === "undefined" ? null : { current: document.activeElement }))
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop data-slot="dialog-overlay" className="fixed inset-0 z-200 bg-[rgba(38,38,36,.5)]" />
      <DialogPrimitive.Viewport data-slot="dialog-viewport" className="fixed inset-0 z-201 grid place-items-center overflow-auto overscroll-contain box-border p-5 max-[380.98px]:p-3">
        <DialogPrimitive.Popup
          data-slot="dialog-content"
          initialFocus={initialFocus}
          finalFocus={finalFocus ?? origin}
          className={cn(
            "box-border max-w-full w-[36rem] max-h-[calc(100dvh-40px)] overflow-auto p-panel border-0 rounded-dialog bg-overlay text-ink shadow-overlay font-normal text-body max-[380.98px]:max-h-[calc(100dvh-24px)] max-[380.98px]:p-5",
            className
          )}
          {...props}
        >
          {children}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Viewport>
    </DialogPrimitive.Portal>
  )
}

function DialogTitle({ className, ...props }) {
  return <DialogPrimitive.Title data-slot="dialog-title" className={cn("m-0 mb-3 font-medium text-section leading-[1.2] tracking-[-.025em] wrap-anywhere", className)} {...props} />
}

function DialogDescription({ className, ...props }) {
  return <DialogPrimitive.Description data-slot="dialog-description" className={cn("m-0 mb-5 text-ink-secondary", className)} {...props} />
}

function DialogBody({ className, ...props }) {
  return <div data-slot="dialog-body" className={cn("min-w-0 wrap-anywhere", className)} {...props} />
}

// The actions row, right-aligned: the way out first, then the decision.
function DialogFooter({ className, ...props }) {
  return <div data-slot="dialog-footer" className={cn("flex flex-wrap items-center justify-end gap-3 mt-6", className)} {...props} />
}

export { Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger }
