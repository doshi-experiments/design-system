import { cn } from "@/ui/cn"

// From `shadcn add table` (base-nova, 4.23.0), restyled to Felt as /react's DataTable draws it: a
// raised panel that scrolls (a focusable, labelled region) around a native table, so it keeps
// table semantics rather than an ARIA grid. Headers stick to the top; cells stay on one line,
// and a column of long text opts into wrapping with whitespace-normal wrap-break-word.

function Table({ className, label = "Results table", maxHeight, containerClassName, ...props }) {
  return (
    <div
      data-slot="table-container"
      tabIndex={0}
      role="region"
      aria-label={props["aria-label"] || label}
      style={maxHeight ? { maxHeight } : undefined}
      className={cn(
        "max-w-full overflow-auto border-0 rounded-container bg-raised shadow-raised in-data-[slot=card]:rounded-control focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus",
        containerClassName
      )}
    >
      <table data-slot="table" className={cn("w-full border-collapse font-normal text-caption leading-[1.5] tabular-nums", className)} {...props} />
    </div>
  )
}

function TableHeader(props) {
  return <thead data-slot="table-header" {...props} />
}

function TableBody({ className, ...props }) {
  return <tbody data-slot="table-body" className={cn("[&>tr:hover]:bg-selection", className)} {...props} />
}

function TableFooter(props) {
  return <tfoot data-slot="table-footer" {...props} />
}

function TableRow(props) {
  return <tr data-slot="table-row" {...props} />
}

const cellClasses = "px-4 py-3 border-b-[1.5px] border-dashed border-stitch whitespace-nowrap"

function TableHead({ className, ...props }) {
  return <th data-slot="table-head" className={cn(cellClasses, "sticky top-0 bg-raised font-semibold text-ink-secondary text-left", className)} {...props} />
}

function TableCell({ className, ...props }) {
  return <td data-slot="table-cell" className={cn(cellClasses, className)} {...props} />
}

function TableCaption({ className, ...props }) {
  return <caption data-slot="table-caption" className={cn("p-4 text-left text-ink-secondary", className)} {...props} />
}

// The one row a table shows when it has none: centred, wrapping, quiet.
function TableEmpty({ className, colSpan = 1, children = "No rows to show.", ...props }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className={cn("whitespace-normal text-center px-5 py-8 text-ink-secondary", className)} {...props}>{children}</TableCell>
    </TableRow>
  )
}

export { Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption, TableEmpty }
