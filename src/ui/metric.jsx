import { cn } from "@/ui/cn"

// Results, as /react's Metric and DataRow draw them. A metric is a large figure under a
// stitched rule with its label and a note; a data row is a label and a right-aligned value.
// tone is a colour for the figure (a --ds-* value). Help keys lose their surface here.

function Metric({ label, value, note, help, tone, className }) {
  return (
    <div data-slot="metric" style={tone ? { "--ds-metric-accent": tone } : undefined}
      className={cn("min-w-0 border-0 border-t-[1.5px] border-dashed border-stitch rounded-none px-0 pt-4 pb-1 bg-transparent", className)}>
      <div data-slot="metric-label" className="flex gap-2 items-center justify-between min-h-8 font-sans font-semibold text-[.8125rem] leading-[1.4] text-ink-secondary *:data-[slot=help-trigger]:bg-transparent *:data-[slot=help-trigger]:shadow-none *:data-[slot=help-trigger]:-m-2">
        <span>{label}</span>{help}
      </div>
      <div data-slot="metric-value" className="mt-2 font-sans font-medium text-[clamp(1.5rem,2.5vw,2.25rem)] leading-[1.2] tracking-[-.03em] tabular-nums text-[var(--ds-metric-accent,var(--ds-text))] wrap-anywhere">{value}</div>
      {note && <p data-slot="metric-note" className="mt-2 mb-0 font-sans font-normal text-[.8125rem] leading-[1.5] text-ink-secondary">{note}</p>}
    </div>
  )
}

function DataRow({ label, value, help, tone, strong = false, className }) {
  return (
    <div data-slot="data-row" className={cn("flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3 border-b-[1.5px] border-dashed border-stitch font-sans font-normal text-caption leading-[1.5]", strong && "font-semibold", className)}>
      <div data-slot="data-label" className="flex items-center gap-1.5 text-ink-secondary min-w-0 flex-1 *:data-[slot=help-trigger]:bg-transparent *:data-[slot=help-trigger]:shadow-none *:data-[slot=help-trigger]:-my-2.5">
        <span>{label}</span>{help}
      </div>
      <div data-slot="data-value" className="font-sans tabular-nums text-right wrap-anywhere" style={tone ? { color: tone } : undefined}>{value}</div>
    </div>
  )
}

export { DataRow, Metric }
