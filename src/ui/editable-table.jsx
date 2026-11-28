import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { cn } from "@/ui/cn"
import { Table, TableBody, TableCaption, TableCell, TableEmpty, TableHead, TableHeader, TableRow } from "@/ui/table"

// /react's EditableTable on /ui's Table: TanStack renders the rows; apps own the column
// definitions, immutable fields, editing controls and persistence, and table.meta reaches every
// cell. It ships as /ui/table because @tanstack/react-table is an optional peer dependency.
function EditableTable({ data, columns, getRowId, caption, label = "Editable table", emptyMessage = "No rows to show.", maxHeight, meta, className = "", onRowClick, rowClassName, busy = false }) {
  const table = useReactTable({ data, columns, getRowId, getCoreRowModel: getCoreRowModel(), meta })
  const rows = table.getRowModel().rows
  return (
    <Table
      label={label}
      maxHeight={maxHeight}
      aria-busy={busy || undefined}
      className={cn("[&_th]:align-middle [&_td]:align-middle [&_[data-slot=field]]:min-w-[170px] [&_[data-slot=field-label]:not(.sr-only)]:m-0", className)}
    >
      {caption && <TableCaption>{caption}</TableCaption>}
      <TableHeader>
        {table.getHeaderGroups().map((group) => (
          <TableRow key={group.id}>
            {group.headers.map((header) => (
              <TableHead key={header.id} colSpan={header.colSpan} scope={header.colSpan > 1 ? "colgroup" : "col"}
                style={header.column.columnDef.meta?.style} className={header.column.columnDef.meta?.className}>
                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {rows.length ? rows.map((row) => (
          <TableRow key={row.id} data-row-id={row.id}
            className={typeof rowClassName === "function" ? rowClassName(row.original) : rowClassName}
            onClick={onRowClick ? (event) => onRowClick(row.original, event) : undefined}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id} className={cell.column.columnDef.meta?.className} style={cell.column.columnDef.meta?.style}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        )) : <TableEmpty colSpan={table.getVisibleLeafColumns().length || 1}>{emptyMessage}</TableEmpty>}
      </TableBody>
    </Table>
  )
}

export { EditableTable }
