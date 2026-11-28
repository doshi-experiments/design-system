// src/ui/editable-table.jsx
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { cn } from "./ui.js";
import { Table, TableBody, TableCaption, TableCell, TableEmpty, TableHead, TableHeader, TableRow } from "./ui.js";
import { jsx, jsxs } from "react/jsx-runtime";
function EditableTable({ data, columns, getRowId, caption, label = "Editable table", emptyMessage = "No rows to show.", maxHeight, meta, className = "", onRowClick, rowClassName, busy = false }) {
  const table = useReactTable({ data, columns, getRowId, getCoreRowModel: getCoreRowModel(), meta });
  const rows = table.getRowModel().rows;
  return /* @__PURE__ */ jsxs(
    Table,
    {
      label,
      maxHeight,
      "aria-busy": busy || void 0,
      className: cn("[&_th]:align-middle [&_td]:align-middle [&_[data-slot=field]]:min-w-[170px] [&_[data-slot=field-label]:not(.sr-only)]:m-0", className),
      children: [
        caption && /* @__PURE__ */ jsx(TableCaption, { children: caption }),
        /* @__PURE__ */ jsx(TableHeader, { children: table.getHeaderGroups().map((group) => /* @__PURE__ */ jsx(TableRow, { children: group.headers.map((header) => /* @__PURE__ */ jsx(
          TableHead,
          {
            colSpan: header.colSpan,
            scope: header.colSpan > 1 ? "colgroup" : "col",
            style: header.column.columnDef.meta?.style,
            className: header.column.columnDef.meta?.className,
            children: header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())
          },
          header.id
        )) }, group.id)) }),
        /* @__PURE__ */ jsx(TableBody, { children: rows.length ? rows.map((row) => /* @__PURE__ */ jsx(
          TableRow,
          {
            "data-row-id": row.id,
            className: typeof rowClassName === "function" ? rowClassName(row.original) : rowClassName,
            onClick: onRowClick ? (event) => onRowClick(row.original, event) : void 0,
            children: row.getVisibleCells().map((cell) => /* @__PURE__ */ jsx(TableCell, { className: cell.column.columnDef.meta?.className, style: cell.column.columnDef.meta?.style, children: flexRender(cell.column.columnDef.cell, cell.getContext()) }, cell.id))
          },
          row.id
        )) : /* @__PURE__ */ jsx(TableEmpty, { colSpan: table.getVisibleLeafColumns().length || 1, children: emptyMessage }) })
      ]
    }
  );
}
export {
  EditableTable
};
