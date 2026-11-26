import { cn } from "@/ui/cn"

// From `shadcn add empty` (base-nova, 4.23.0), restyled to Felt as /react's EmptyState draws it:
// a heading, a line of explanation in a readable measure, and what to do next, aligned left.

function Empty({ className, ...props }) {
  return <div data-slot="empty" className={cn("px-5 py-8 text-left text-ink font-sans", className)} {...props} />
}

function EmptyTitle({ className, ...props }) {
  return <h2 data-slot="empty-title" className={cn("m-0 mb-3 text-[1.25rem]", className)} {...props} />
}

function EmptyDescription({ className, ...props }) {
  return <p data-slot="empty-description" className={cn("max-w-measure m-0 mb-5 text-ink-secondary leading-[1.6]", className)} {...props} />
}

function EmptyContent({ className, ...props }) {
  return <div data-slot="empty-content" className={cn("flex flex-wrap items-center justify-start gap-3", className)} {...props} />
}

export { Empty, EmptyTitle, EmptyDescription, EmptyContent }
