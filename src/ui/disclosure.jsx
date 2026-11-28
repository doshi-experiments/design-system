import { cn } from "@/ui/cn"

// Felt's disclosure, as /react's Disclosure draws it: a native <details> on a raised panel, so the
// browser keeps keyboard activation and collapsed-content semantics. Pass open only to control it.

function Disclosure({ className, open, defaultOpen = false, ...props }) {
  return (
    <details
      data-slot="disclosure"
      className={cn("overflow-hidden border-0 rounded-container bg-raised shadow-raised", className)}
      {...(open === undefined ? { open: defaultOpen || undefined } : { open })}
      {...props}
    />
  )
}

function DisclosureSummary({ className, ...props }) {
  return (
    <summary
      data-slot="disclosure-summary"
      className={cn("box-border min-h-target px-5 py-4 cursor-pointer text-ink font-semibold text-[.9375rem] leading-[1.5] wrap-anywhere hover:bg-selection focus-visible:outline-3 focus-visible:-outline-offset-4 focus-visible:outline-focus", className)}
      {...props}
    />
  )
}

function DisclosureContent({ className, ...props }) {
  return <div data-slot="disclosure-content" className={cn("px-5 pb-5 min-w-0 text-ink font-normal text-[.9375rem] leading-[1.6]", className)} {...props} />
}

export { Disclosure, DisclosureContent, DisclosureSummary }
