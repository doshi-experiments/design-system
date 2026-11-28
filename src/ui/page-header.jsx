import { cn } from "@/ui/cn"

// The top of an app page, as /react's PageHeader draws it: an eyebrow in the signal-text
// colour, the display-size title, a description in a readable measure, and actions beside them.
function PageHeader({ eyebrow, title, description, actions, className }) {
  return (
    <header data-slot="page-header" className={cn("flex flex-wrap items-center justify-between gap-6 pt-8 pb-10", className)}>
      <div className="min-w-0 max-w-[850px]">
        {eyebrow && <p data-slot="page-eyebrow" className="m-0 action-link font-sans font-semibold text-caption leading-[1.55] tracking-normal normal-case">{eyebrow}</p>}
        <h1 data-slot="page-title" className="mt-2 mb-4 text-ink font-sans font-medium text-display leading-[1.05] tracking-[-.04em] text-balance">{title}</h1>
        {description && <p data-slot="page-description" className="m-0 max-w-measure text-ink-secondary font-sans font-normal text-body leading-[1.55]">{description}</p>}
      </div>
      {actions && <div data-slot="page-actions">{actions}</div>}
    </header>
  )
}

export { PageHeader }
