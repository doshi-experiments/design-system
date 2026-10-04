import React from 'react';
import {flexRender, getCoreRowModel, useReactTable} from '@tanstack/react-table';
const h = React.createElement;

// An actual shared TanStack renderer. Apps own column definitions, immutable
// fields, editing controls and persistence; table.meta is passed to every cell.
// Native table semantics intentionally remain intact: this is not an ARIA grid.
export function EditableTable({data, columns, getRowId, caption, label = 'Editable table', emptyMessage = 'No rows to show.', maxHeight, meta, className = '', onRowClick, rowClassName, busy = false}) {
  const table = useReactTable({data, columns, getRowId, getCoreRowModel:getCoreRowModel(), meta});
  return h('div', {className:'ds-table-scroll', tabIndex:0, role:'region', 'aria-label':label, 'aria-busy':busy || undefined, style:maxHeight ? {maxHeight} : undefined},
    h('table', {className:`ds-table ds-editable-table ${className}`}, caption && h('caption', null, caption),
      h('thead', null, table.getHeaderGroups().map(group => h('tr', {key:group.id}, group.headers.map(header => h('th', {
        key:header.id, colSpan:header.colSpan, scope:header.colSpan > 1 ? 'colgroup' : 'col',
        style:header.column.columnDef.meta?.style, className:header.column.columnDef.meta?.className},
        header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())))))),
      h('tbody', null, table.getRowModel().rows.length ? table.getRowModel().rows.map(row => h('tr', {key:row.id, 'data-row-id':row.id,
        className:typeof rowClassName === 'function' ? rowClassName(row.original) : rowClassName, onClick:onRowClick ? event => onRowClick(row.original, event) : undefined},
        row.getVisibleCells().map(cell => h('td', {key:cell.id, className:cell.column.columnDef.meta?.className, style:cell.column.columnDef.meta?.style}, flexRender(cell.column.columnDef.cell, cell.getContext())))))
        : h('tr', null, h('td', {colSpan:table.getVisibleLeafColumns().length || 1, className:'ds-table-empty'}, emptyMessage)))));
}
