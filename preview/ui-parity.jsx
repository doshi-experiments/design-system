// The 0.11 comparison: each /react component beside the /ui composition that replaces it.
// scripts/check-ui.mjs renders one set per page (?set=old on a page with components.css,
// ?set=new on a page with Tailwind alone) and compares the parts each case names.
import * as React from 'react'
import {createRoot} from 'react-dom/client'
import * as Old from '../dist/react.js'
import * as New from '../dist/ui.js'
import {EditableTable as OldEditableTable} from '../dist/table.js'
import {EditableTable as NewEditableTable} from '../dist/ui-table.js'
import {mountSiteHeader} from '../dist/site.js'

const plain = () => {}
const options = [{value: 'monthly', label: 'Monthly'}, {value: 'yearly', label: 'Yearly'}]

// Each case: an old element, a new element, and the parts to compare as [old, new] selectors
// relative to the case. The first part is the case's root; target is what hover and focus act on.
const cases = [
  {id: 'toggle-off', target: 'root', parts: {root: ['.ds-toggle', '[data-slot=toggle]']},
    old: <Old.ToggleButton pressed={false} onPressedChange={plain}>Alarm off</Old.ToggleButton>,
    new: <New.Toggle pressed={false} onPressedChange={plain}>Alarm off</New.Toggle>},
  {id: 'toggle-on', target: 'root', parts: {root: ['.ds-toggle', '[data-slot=toggle]']},
    old: <Old.ToggleButton pressed onPressedChange={plain}>Alarm on</Old.ToggleButton>,
    new: <New.Toggle pressed onPressedChange={plain}>Alarm on</New.Toggle>},
  {id: 'toggle-error', target: 'root', parts: {root: ['.ds-toggle', '[data-slot=toggle]']},
    old: <Old.ToggleButton pressed tone="error" onPressedChange={plain}>Alarm on</Old.ToggleButton>,
    new: <New.Toggle pressed tone="error" onPressedChange={plain}>Alarm on</New.Toggle>},
  {id: 'toggle-small', target: 'root', parts: {root: ['.ds-toggle', '[data-slot=toggle]']},
    old: <Old.ToggleButton size="small" pressed={false} onPressedChange={plain}>Muted</Old.ToggleButton>,
    new: <New.Toggle size="small" pressed={false} onPressedChange={plain}>Muted</New.Toggle>},
  {id: 'toggle-disabled', target: 'root', parts: {root: ['.ds-toggle', '[data-slot=toggle]']},
    old: <Old.ToggleButton disabled pressed onPressedChange={plain}>Alarm on</Old.ToggleButton>,
    new: <New.Toggle disabled pressed onPressedChange={plain}>Alarm on</New.Toggle>},
  {id: 'badge', parts: {root: ['.ds-badge', '[data-slot=badge]']},
    old: <Old.Badge>Draft</Old.Badge>, new: <New.Badge>Draft</New.Badge>},
  {id: 'badge-success', parts: {root: ['.ds-badge', '[data-slot=badge]']},
    old: <Old.Badge tone="success">Saved</Old.Badge>, new: <New.Badge tone="success">Saved</New.Badge>},
  {id: 'badge-error', parts: {root: ['.ds-badge', '[data-slot=badge]']},
    old: <Old.Badge tone="error">Failed</Old.Badge>, new: <New.Badge tone="error">Failed</New.Badge>},
  ...['info', 'warning', 'error'].map(tone => ({id: `alert-${tone}`,
    parts: {root: ['.ds-alert', '[data-slot=alert]'], title: ['.ds-alert-title', '[data-slot=alert-title]'], content: ['.ds-alert-content', '[data-slot=alert-description]'],
      paragraph: ['.ds-alert-content p', '[data-slot=alert-description] p'], actions: ['.ds-actions', '[data-slot=alert-action]']},
    old: <Old.Alert tone={tone} title="Review before saving" actions={<Old.Button size="small">Review</Old.Button>}><p>Two items still need a category.</p></Old.Alert>,
    new: <New.Alert tone={tone}><New.AlertTitle>Review before saving</New.AlertTitle><New.AlertDescription><p>Two items still need a category.</p></New.AlertDescription>
      <New.AlertAction><New.Button size="small">Review</New.Button></New.AlertAction></New.Alert>})),
  {id: 'card', parts: {root: ['.ds-card', '[data-slot=card]'], title: ['.ds-card-title', '[data-slot=card-title]'], text: ['p', 'p']},
    old: <Old.Card><Old.CardTitle>Monthly costs</Old.CardTitle><p>Everything you pay each month.</p></Old.Card>,
    new: <New.Card><New.CardTitle>Monthly costs</New.CardTitle><p>Everything you pay each month.</p></New.Card>},
  {id: 'card-nested', parts: {root: ['.ds-card', '[data-slot=card]'], inner: ['.ds-card .ds-card', '[data-slot=card] [data-slot=card]']},
    old: <Old.Card><Old.Card><p>A card inside a card.</p></Old.Card></Old.Card>,
    new: <New.Card><New.Card><p>A card inside a card.</p></New.Card></New.Card>},
  {id: 'card-flat', parts: {root: ['.ds-card', '[data-slot=card]'], inner: ['.ds-card .ds-card', '[data-slot=card] [data-slot=card]']},
    old: <Old.Card><Old.Card variant="flat"><p>A section of the card.</p></Old.Card></Old.Card>,
    new: <New.Card><New.Card variant="flat"><p>A section of the card.</p></New.Card></New.Card>},
  {id: 'text-field', target: 'input', parts: {root: ['.ds-field', '[data-slot=field]'], label: ['label', 'label'], input: ['input', 'input'], hint: ['.ds-field-hint', '[data-slot=field-description]']},
    old: <Old.TextField label="Description" value="Coffee" onValueChange={plain} hint="Shown on the statement." />,
    new: <New.Field><New.FieldLabel htmlFor="n-text">Description</New.FieldLabel><New.Input id="n-text" value="Coffee" onChange={plain} />
      <New.FieldDescription>Shown on the statement.</New.FieldDescription></New.Field>},
  {id: 'text-field-placeholder', target: 'input', parts: {input: ['input', 'input']},
    old: <Old.TextField label="Note" value="" placeholder="Optional" onValueChange={plain} />,
    new: <New.Field><New.FieldLabel htmlFor="n-note">Note</New.FieldLabel><New.Input id="n-note" value="" placeholder="Optional" onChange={plain} /></New.Field>},
  {id: 'text-field-error', target: 'input', parts: {root: ['.ds-field', '[data-slot=field]'], input: ['input', 'input'], hint: ['.ds-field-hint', '[data-slot=field-error]']},
    old: <Old.TextField label="Amount" value="12x" onValueChange={plain} error="Enter a number." />,
    new: <New.Field><New.FieldLabel htmlFor="n-amount">Amount</New.FieldLabel><New.Input id="n-amount" value="12x" aria-invalid onChange={plain} />
      <New.FieldError>Enter a number.</New.FieldError></New.Field>},
  {id: 'text-field-disabled', parts: {input: ['input', 'input']},
    old: <Old.TextField label="Account" value="Chequing" disabled onValueChange={plain} />,
    new: <New.Field><New.FieldLabel htmlFor="n-account">Account</New.FieldLabel><New.Input id="n-account" value="Chequing" disabled onChange={plain} /></New.Field>},
  {id: 'select-field', target: 'select', parts: {root: ['.ds-field', '[data-slot=field]'], label: ['label', 'label'], select: ['select', 'select']},
    old: <Old.SelectField label="Frequency" value="monthly" options={options} onValueChange={plain} />,
    new: <New.Field><New.FieldLabel htmlFor="n-frequency">Frequency</New.FieldLabel>
      <New.NativeSelect id="n-frequency" value="monthly" onChange={plain}>{options.map(o => <New.NativeSelectOption key={o.value} value={o.value}>{o.label}</New.NativeSelectOption>)}</New.NativeSelect></New.Field>},
  {id: 'checkbox-field', target: 'input', parts: {root: ['.ds-checkbox-field', '[data-slot=field]'], label: ['label', 'label'], input: ['input', 'input'], text: ['label span', 'label span'], hint: ['.ds-field-hint', '[data-slot=field-description]']},
    old: <Old.CheckboxField label="I reviewed the changes" checked onCheckedChange={plain} hint="Required before saving." />,
    new: <New.Field orientation="choice"><New.FieldLabel variant="choice"><New.Checkbox checked onCheckedChange={plain} /><span>I reviewed the changes</span></New.FieldLabel>
      <New.FieldDescription>Required before saving.</New.FieldDescription></New.Field>},
  {id: 'checkbox-disabled', parts: {label: ['label', 'label'], input: ['input', 'input']},
    old: <Old.CheckboxField label="Locked" checked={false} disabled onCheckedChange={plain} />,
    new: <New.Field orientation="choice"><New.FieldLabel variant="choice"><New.Checkbox checked={false} disabled onCheckedChange={plain} /><span>Locked</span></New.FieldLabel></New.Field>},
  {id: 'checkbox-hidden', parts: {label: ['label', 'label'], text: ['label span', 'label span']},
    old: <Old.CheckboxField label="Skip this row" hideLabel checked={false} onCheckedChange={plain} />,
    new: <New.Field orientation="choice"><New.FieldLabel variant="choice"><New.Checkbox checked={false} onCheckedChange={plain} /><span className="sr-only">Skip this row</span></New.FieldLabel></New.Field>},
  {id: 'field-group', target: 'input',
    parts: {root: ['fieldset', 'fieldset'], legend: ['legend', 'legend'], description: ['.ds-group-description', '[data-slot=field-set] > [data-slot=field-description]'],
      grid: ['.ds-field-grid', '[data-slot=field-group]'], field: ['.ds-field', '[data-slot=field]'], heading: ['.ds-field-heading', '[data-slot=field-heading]'],
      label: ['.ds-field-heading label', '[data-slot=field-heading] label'], wrap: ['.ds-input-wrap', '[data-slot=input-group]'], affix: ['.ds-input-affix', '[data-slot=input-group-addon]'],
      input: ['.ds-input-wrap input', '[data-slot=input-group] input'], hint: ['.ds-field-hint', '[data-slot=field] [data-slot=field-description]'],
      second: ['.ds-field + .ds-field .ds-input-wrap', '[data-slot=field] + [data-slot=field] [data-slot=input-group]']},
    old: <Old.FieldGroup title="The home" description="Everything updates as you type.">
      <Old.NumericField label="Purchase price" value="650000" onValueChange={plain} prefix="$" hint="Before closing costs." />
      <Old.NumericField label="Down payment, as a share of the price" value="20" onValueChange={plain} suffix="%" />
    </Old.FieldGroup>,
    new: <New.FieldSet><New.FieldLegend>The home</New.FieldLegend><New.FieldDescription>Everything updates as you type.</New.FieldDescription>
      <New.FieldGroup>
        <New.Field><New.FieldHeading><New.FieldLabel variant="heading" htmlFor="n-price">Purchase price</New.FieldLabel></New.FieldHeading>
          <New.InputGroup><New.InputGroupAddon>$</New.InputGroupAddon><New.InputGroupInput id="n-price" inputMode="decimal" autoComplete="off" value="650000" onChange={plain} /></New.InputGroup>
          <New.FieldDescription role="status">Before closing costs.</New.FieldDescription></New.Field>
        <New.Field><New.FieldHeading><New.FieldLabel variant="heading" htmlFor="n-down">Down payment, as a share of the price</New.FieldLabel></New.FieldHeading>
          <New.InputGroup><New.InputGroupInput id="n-down" inputMode="decimal" autoComplete="off" value="20" onChange={plain} /><New.InputGroupAddon>%</New.InputGroupAddon></New.InputGroup>
          <New.FieldDescription role="status" /></New.Field>
      </New.FieldGroup></New.FieldSet>},
  {id: 'numeric-readonly', parts: {wrap: ['.ds-input-wrap', '[data-slot=input-group]'], input: ['.ds-input-wrap input', '[data-slot=input-group] input']},
    old: <Old.NumericField label="Mortgage" value="520000" readOnly onValueChange={plain} prefix="$" />,
    new: <New.Field><New.FieldHeading><New.FieldLabel variant="heading" htmlFor="n-mortgage">Mortgage</New.FieldLabel></New.FieldHeading>
      <New.InputGroup><New.InputGroupAddon>$</New.InputGroupAddon><New.InputGroupInput id="n-mortgage" value="520000" readOnly /></New.InputGroup></New.Field>},
  {id: 'numeric-invalid', parts: {wrap: ['.ds-input-wrap', '[data-slot=input-group]'], hint: ['.ds-field-hint', '[data-slot=field-description]']},
    old: <Old.NumericField label="Rate" value="140" max={100} onValueChange={plain} suffix="%" />,
    new: <New.Field><New.FieldHeading><New.FieldLabel variant="heading" htmlFor="n-rate">Rate</New.FieldLabel></New.FieldHeading>
      <New.InputGroup><New.InputGroupInput id="n-rate" value="140" aria-invalid onChange={plain} /><New.InputGroupAddon>%</New.InputGroupAddon></New.InputGroup>
      <New.FieldDescription role="status" data-warning="">Enter a number up to 100.</New.FieldDescription></New.Field>},
]

const rows = [{id: 'first', description: 'Market', category: 'food'}, {id: 'second', description: 'Bus', category: 'travel'}]
const oldColumns = [{accessorKey: 'description', header: 'Description'}, {accessorKey: 'category', header: 'Category',
  cell: ({row, getValue}) => <Old.SelectField label={`Category for ${row.original.description}`} hideLabel value={getValue()} options={options} onValueChange={plain} />}]
const newColumns = [{accessorKey: 'description', header: 'Description'}, {accessorKey: 'category', header: 'Category',
  cell: ({row, getValue}) => <New.Field><New.FieldLabel htmlFor={`n-cat-${row.id}`} className="sr-only">{`Category for ${row.original.description}`}</New.FieldLabel>
    <New.NativeSelect id={`n-cat-${row.id}`} value={getValue()} onChange={plain}>{options.map(o => <New.NativeSelectOption key={o.value} value={o.value}>{o.label}</New.NativeSelectOption>)}</New.NativeSelect></New.Field>}]

// 0.14: Felt's own components. The static header gets a stub controller so it can't change
// the page's appearance.
const stubController = {getPreference: () => 'system', setPreference() {}, subscribe: () => () => {}, destroy() {}}
function StaticHeader({project, showProjectTitle = true}) {
  const ref = React.useRef(null)
  React.useEffect(() => {const header = mountSiteHeader(ref.current, {project, controller: stubController, showProjectTitle}); return () => header.destroy()}, [project, showProjectTitle])
  return <div ref={ref} />
}
const headerParts = {header: ['header', 'header'], nav: ['nav', 'nav'], link: ['nav a:not([aria-current])', 'nav a:not([aria-current])'], current: ['nav a[aria-current]', 'nav a[aria-current]'],
  appearance: ['label', 'label'], appearanceLabel: ['label span', 'label span'], select: ['select', 'select']}
const segmentOptions = [['buy', 'Buy'], ['rent', 'Rent'], ['both', 'Both']]
const range = {label: 'How long you stay', value: '10', min: 1, max: 30, onValueChange: plain, suffix: 'yr'}

// 0.12: popups. open names the trigger to click; parts starting with @ are found in the
// whole document, because popups render in a portal.
const groups = [{label: 'More', options: [{value: 'weekly', label: 'Weekly'}]}]
function OldDialogCase({dismissible = true}) {
  const [open, setOpen] = React.useState(false)
  return <>
    <Old.Button onClick={() => setOpen(true)}>Open</Old.Button>
    <Old.Dialog open={open} onOpenChange={setOpen} dismissible={dismissible} title="Save these decisions?" description="Only the explicit save action submits the changes."
      actions={<Old.Button variant="primary" onClick={() => setOpen(false)}>Save decisions</Old.Button>}><p>Two items change category.</p></Old.Dialog>
  </>
}
function NewDialogCase({dismissible = true}) {
  const [open, setOpen] = React.useState(false)
  return <New.Dialog open={open} onOpenChange={setOpen} dismissible={dismissible}>
    <New.DialogTrigger render={<New.Button />}>Open</New.DialogTrigger>
    <New.DialogContent>
      <New.DialogTitle>Save these decisions?</New.DialogTitle>
      <New.DialogDescription>Only the explicit save action submits the changes.</New.DialogDescription>
      <New.DialogBody><p>Two items change category.</p></New.DialogBody>
      <New.DialogFooter><New.DialogClose>Cancel</New.DialogClose><New.Button variant="primary" onClick={() => setOpen(false)}>Save decisions</New.Button></New.DialogFooter>
    </New.DialogContent>
  </New.Dialog>
}
const newSelect = ({variant, size, label = 'Frequency', hidden = false} = {}) => {
  const items = [...options, ...groups[0].options]
  return <New.Field>
    <New.FieldLabel htmlFor={`n-select-${variant}-${size}`} className={hidden ? 'sr-only' : undefined}>{label}</New.FieldLabel>
    <New.Select items={items} value="monthly" onValueChange={plain}>
      <New.SelectTrigger id={`n-select-${variant}-${size}`} variant={variant} size={size}><New.SelectValue /></New.SelectTrigger>
      <New.SelectContent>
        {options.map(o => <New.SelectItem key={o.value} value={o.value}>{o.label}</New.SelectItem>)}
        {groups.map(g => <New.SelectGroup key={g.label}><New.SelectLabel>{g.label}</New.SelectLabel>
          {g.options.map(o => <New.SelectItem key={o.value} value={o.value}>{o.label}</New.SelectItem>)}</New.SelectGroup>)}
      </New.SelectContent>
    </New.Select>
  </New.Field>
}
const menuItems = [{label: 'Tomorrow', onSelect: plain}, 'separator', {label: 'Next week', onSelect: plain}, {label: 'Never', disabled: true}]
cases.push(
  // .ds-button is inline-block and /ui's Button an inline-flex that centres; for text they draw alike.
  {id: 'help', target: 'root', open: ['.ds-help', '[data-slot=help-trigger]'], ignore: {close: ['display', 'gap', 'align-items', 'justify-content']},
    parts: {root: ['.ds-help', '[data-slot=help-trigger]'], popup: ['@[data-ds-help-popup]', '@[data-help-popup]'], title: ['@.ds-popover-title', '@[data-slot=popover-title]'],
      description: ['@.ds-popover-description', '@[data-slot=popover-description]'], close: ['@.ds-popover .ds-button', '@[data-slot=popover-close]']},
    old: <Old.HelpPopover title="Down payment">At least 5% of the price, more above $500,000.</Old.HelpPopover>,
    new: <New.HelpPopover title="Down payment">At least 5% of the price, more above $500,000.</New.HelpPopover>},
  {id: 'help-in-heading', parts: {heading: ['.ds-field-heading', '[data-slot=field-heading]'], help: ['.ds-help', '[data-slot=help-trigger]']},
    old: <Old.NumericField label="Rate" value="4.5" onValueChange={plain} suffix="%" help={<Old.HelpPopover title="Rate">The posted rate.</Old.HelpPopover>} />,
    new: <New.Field><New.FieldHeading><New.FieldLabel variant="heading" htmlFor="n-help-rate">Rate</New.FieldLabel><New.HelpPopover title="Rate">The posted rate.</New.HelpPopover></New.FieldHeading>
      <New.InputGroup><New.InputGroupInput id="n-help-rate" value="4.5" onChange={plain} /><New.InputGroupAddon>%</New.InputGroupAddon></New.InputGroup></New.Field>},
  // RangeField also draws its number field, so the case is compared by part, not by pixel.
  // The old label is a span; FieldLabel is a real label, so clicking it opens the select.
  {id: 'select', target: 'trigger', open: ['.ds-picker', '[data-slot=select-trigger]'], ignore: {label: ['cursor']},
    parts: {label: ['.ds-field-label', '[data-slot=field-label]'], trigger: ['.ds-picker', '[data-slot=select-trigger]'], value: ['.ds-picker-value', '[data-slot=select-value]'],
      icon: ['.ds-picker-icon', '[data-slot=select-trigger] svg'], popup: ['@.ds-select-popup', '@[data-slot=select-content]'],
      option: ['@.ds-option:not([data-selected])', '@[data-slot=select-item]:not([data-selected])'], selected: ['@.ds-option[data-selected]', '@[data-slot=select-item][data-selected]'],
      check: ['@.ds-option-check', '@[data-slot=select-item][data-selected] > span:last-child'],
      group: ['@.ds-option-group', '@[data-slot=select-group]'], groupLabel: ['@.ds-option-group-label', '@[data-slot=select-label]']},
    old: <Old.Select label="Frequency" value="monthly" options={options} groups={groups.map(g => [g.label, g.options.map(o => [o.value, o.label])])} onValueChange={plain} />,
    new: newSelect()},
  {id: 'select-quiet-small', target: 'trigger', parts: {trigger: ['.ds-picker', '[data-slot=select-trigger]']},
    old: <Old.Select label="Size" layout="hidden" variant="quiet" size="small" value="monthly" options={options} onValueChange={plain} />,
    new: newSelect({variant: 'quiet', size: 'small', label: 'Size', hidden: true})},
  {id: 'select-small', target: 'trigger', parts: {trigger: ['.ds-picker', '[data-slot=select-trigger]']},
    old: <Old.Select label="Size" size="small" value="monthly" options={options} onValueChange={plain} />,
    new: newSelect({size: 'small', label: 'Size'})},
  {id: 'menu', target: 'trigger', open: ['.ds-menu-trigger', '[data-slot=dropdown-menu-trigger]'],
    parts: {trigger: ['.ds-menu-trigger', '[data-slot=dropdown-menu-trigger]'], chevron: ['.ds-menu-trigger svg', '[data-slot=dropdown-menu-trigger] svg'],
      popup: ['@.ds-menu:not(.ds-select-popup)', '@[data-slot=dropdown-menu-content]'], item: ['@.ds-menu-item', '@[data-slot=dropdown-menu-item]'],
      disabled: ['@.ds-menu-item[data-disabled]', '@[data-slot=dropdown-menu-item][data-disabled]'], separator: ['@.ds-menu-separator', '@[data-slot=dropdown-menu-separator]']},
    old: <Old.MenuButton label="Snooze" items={menuItems} />,
    new: <New.DropdownMenu><New.DropdownMenuTrigger>Snooze</New.DropdownMenuTrigger><New.DropdownMenuContent>
      <New.DropdownMenuItem onClick={plain}>Tomorrow</New.DropdownMenuItem><New.DropdownMenuSeparator />
      <New.DropdownMenuItem onClick={plain}>Next week</New.DropdownMenuItem><New.DropdownMenuItem disabled>Never</New.DropdownMenuItem></New.DropdownMenuContent></New.DropdownMenu>},
  {id: 'dialog', open: ['button', 'button'], ignore: {cancel: ['display', 'gap', 'align-items', 'justify-content']},
    parts: {backdrop: ['@.ds-dialog-backdrop', '@[data-slot=dialog-overlay]'], viewport: ['@.ds-dialog-viewport', '@[data-slot=dialog-viewport]'], popup: ['@.ds-dialog', '@[data-slot=dialog-content]'],
      title: ['@.ds-dialog-title', '@[data-slot=dialog-title]'], description: ['@.ds-dialog-description', '@[data-slot=dialog-description]'], body: ['@.ds-dialog-content', '@[data-slot=dialog-body]'],
      footer: ['@.ds-dialog-actions', '@[data-slot=dialog-footer]'], cancel: ['@.ds-dialog-actions > .ds-button:first-child', '@[data-slot=dialog-close]']},
    old: <OldDialogCase />, new: <NewDialogCase />},
  // 0.13: tables and the empty state.
  {id: 'table', target: 'row',
    parts: {scroll: ['.ds-table-scroll', '[data-slot=table-container]'], table: ['table', 'table'], head: ['th', 'th'], cell: ['td', 'td'],
      wrap: ['td.ds-table-wrap', 'td.whitespace-normal'], row: ['tbody tr', 'tbody tr']},
    old: <Old.DataTable aria-label="Imports"><thead><tr><th>Date</th><th>Description</th><th>Amount</th></tr></thead>
      <tbody><tr><td>2026-01-04</td><td className="ds-table-wrap">A long description that wraps onto a second line when the column is narrow</td><td>$12.40</td></tr>
        <tr><td>2026-01-05</td><td className="ds-table-wrap">Short</td><td>$3.10</td></tr></tbody></Old.DataTable>,
    new: <New.Table aria-label="Imports"><New.TableHeader><New.TableRow><New.TableHead>Date</New.TableHead><New.TableHead>Description</New.TableHead><New.TableHead>Amount</New.TableHead></New.TableRow></New.TableHeader>
      <New.TableBody><New.TableRow><New.TableCell>2026-01-04</New.TableCell><New.TableCell className="whitespace-normal wrap-break-word">A long description that wraps onto a second line when the column is narrow</New.TableCell><New.TableCell>$12.40</New.TableCell></New.TableRow>
        <New.TableRow><New.TableCell>2026-01-05</New.TableCell><New.TableCell className="whitespace-normal wrap-break-word">Short</New.TableCell><New.TableCell>$3.10</New.TableCell></New.TableRow></New.TableBody></New.Table>},
  {id: 'table-in-card', parts: {scroll: ['.ds-table-scroll', '[data-slot=table-container]']},
    old: <Old.Card><Old.DataTable aria-label="Totals"><tbody><tr><td>Total</td><td>$15.50</td></tr></tbody></Old.DataTable></Old.Card>,
    new: <New.Card><New.Table aria-label="Totals"><New.TableBody><New.TableRow><New.TableCell>Total</New.TableCell><New.TableCell>$15.50</New.TableCell></New.TableRow></New.TableBody></New.Table></New.Card>},
  {id: 'editable-table', target: 'row',
    parts: {scroll: ['.ds-table-scroll', '[data-slot=table-container]'], table: ['table', 'table'], caption: ['caption', 'caption'], head: ['th', 'th'], cell: ['td', 'td'],
      field: ['.ds-field', '[data-slot=field]'], label: ['.ds-field-label', '[data-slot=field-label]'], row: ['tbody tr', 'tbody tr']},
    old: <OldEditableTable data={rows} columns={oldColumns} getRowId={row => row.id} caption="Editable categories" label="Review items" />,
    new: <NewEditableTable data={rows} columns={newColumns} getRowId={row => row.id} caption="Editable categories" label="Review items" />},
  {id: 'editable-table-empty', parts: {empty: ['td', 'td']},
    old: <OldEditableTable data={[]} columns={oldColumns} label="Review items" emptyMessage="Nothing to review." />,
    new: <NewEditableTable data={[]} columns={newColumns} label="Review items" emptyMessage="Nothing to review." />},
  {id: 'empty', parts: {root: ['.ds-empty-state', '[data-slot=empty]'], title: ['h2', 'h2'], description: ['p', 'p'], actions: ['.ds-actions', '[data-slot=empty-content]']},
    old: <Old.EmptyState title="All caught up" description="No other items need review." actions={<Old.Button>Import more</Old.Button>} />,
    new: <New.Empty><New.EmptyTitle>All caught up</New.EmptyTitle><New.EmptyDescription>No other items need review.</New.EmptyDescription>
      <New.EmptyContent><New.Button>Import more</New.Button></New.EmptyContent></New.Empty>},
  {id: 'site-header', target: 'link', parts: {...headerParts, project: ['header > span', 'header > span']},
    old: <Old.SiteHeader project="experiments" />, new: <New.SiteHeader project="experiments" />},
  // Every part's computed style matches, but Chromium draws the static header's <select> text a
  // pixel lower than the React one, with identical styles, so this case is compared by part only.
  {id: 'site-header-static', target: 'link', pixels: false, parts: {...headerParts, project: ['header > span', 'header > span']},
    old: <Old.SiteHeader project="experiments" />, new: <StaticHeader project="experiments" />},
  {id: 'site-header-static-untitled', parts: {header: ['header', 'header'], appearance: ['label', 'label']},
    old: <div ref={el => el && mountSiteHeader(el, {project: 'experiments', controller: stubController, showProjectTitle: false})} />,
    new: <StaticHeader project="experiments" showProjectTitle={false} />},
  {id: 'disclosure', target: 'summary', parts: {root: ['details', 'details'], summary: ['summary', 'summary']},
    old: <Old.Disclosure title="Technical details"><p>The source columns are preserved.</p></Old.Disclosure>,
    new: <New.Disclosure><New.DisclosureSummary>Technical details</New.DisclosureSummary><New.DisclosureContent><p>The source columns are preserved.</p></New.DisclosureContent></New.Disclosure>},
  {id: 'disclosure-open', parts: {root: ['details', 'details'], summary: ['summary', 'summary'], content: ['.ds-disclosure-content', '[data-slot=disclosure-content]'], paragraph: ['details p', 'details p']},
    old: <Old.Disclosure title="How this comparison works" defaultOpen><p>Both lines are after selling costs and tax.</p></Old.Disclosure>,
    new: <New.Disclosure defaultOpen><New.DisclosureSummary>How this comparison works</New.DisclosureSummary><New.DisclosureContent><p>Both lines are after selling costs and tax.</p></New.DisclosureContent></New.Disclosure>},
  {id: 'number-stepper', target: 'increase', ignore: {decrease: ['display', 'gap', 'align-items', 'justify-content'], increase: ['display', 'gap', 'align-items', 'justify-content']},
    parts: {group: ['[role=group]', '[role=group]'], decrease: ['button:first-child', 'button:first-child'], value: ['.ds-stepper-value', '[data-slot=number-stepper-value]'],
      suffix: ['.ds-stepper-value small', '[data-slot=number-stepper-value] small'], increase: ['button:last-child', 'button:last-child']},
    old: <Old.NumberStepper label="Players" value={3} min={3} max={20} suffix="players" onValueChange={plain} />,
    new: <New.NumberStepper label="Players" value={3} min={3} max={20} suffix="players" onValueChange={plain} />},
  {id: 'segmented', target: 'segment', parts: {group: ['[role=radiogroup]', '[role=radiogroup]'], checked: ['[data-checked]', '[data-checked]'], segment: ['[role=radio]:not([data-checked])', '[role=radio]:not([data-checked])']},
    old: <Old.SegmentedControl options={segmentOptions} value="rent" onValueChange={plain} label="Compare" />,
    new: <New.SegmentedControl options={segmentOptions} value="rent" onValueChange={plain} label="Compare" />},
  {id: 'segmented-small', target: 'segment', parts: {group: ['[role=radiogroup]', '[role=radiogroup]'], checked: ['[data-checked]', '[data-checked]'], segment: ['[role=radio]:not([data-checked])', '[role=radio]:not([data-checked])']},
    old: <Old.SegmentedControl size="small" options={segmentOptions} value="buy" onValueChange={plain} label="Compare" />,
    new: <New.SegmentedControl size="small" options={segmentOptions} value="buy" onValueChange={plain} label="Compare" />},
  {id: 'metric', parts: {root: ['.ds-metric', '[data-slot=metric]'], label: ['.ds-metric-label', '[data-slot=metric-label]'], help: ['.ds-help', '[data-slot=help-trigger]'],
      value: ['.ds-metric-value', '[data-slot=metric-value]'], note: ['.ds-metric-note', '[data-slot=metric-note]']},
    old: <Old.Metric label="Owner at year 10" value="$1,081,182" note="Home equity plus savings" tone="var(--ds-action-link)" help={<Old.HelpPopover title="Owner">After selling costs.</Old.HelpPopover>} />,
    new: <New.Metric label="Owner at year 10" value="$1,081,182" note="Home equity plus savings" tone="var(--ds-action-link)" help={<New.HelpPopover title="Owner">After selling costs.</New.HelpPopover>} />},
  {id: 'data-row', parts: {root: ['.ds-data-row', '[data-slot=data-row]'], label: ['.ds-data-label', '[data-slot=data-label]'], help: ['.ds-help', '[data-slot=help-trigger]'], value: ['.ds-data-value', '[data-slot=data-value]']},
    old: <Old.DataRow label="Property transfer tax" value="$27,000" help={<Old.HelpPopover title="Tax">Provincial.</Old.HelpPopover>} />,
    new: <New.DataRow label="Property transfer tax" value="$27,000" help={<New.HelpPopover title="Tax">Provincial.</New.HelpPopover>} />},
  {id: 'data-row-strong', parts: {root: ['.ds-data-row', '[data-slot=data-row]'], value: ['.ds-data-value', '[data-slot=data-value]']},
    old: <Old.DataRow strong label="Total" value="$31,450" tone="var(--ds-action-link)" />, new: <New.DataRow strong label="Total" value="$31,450" tone="var(--ds-action-link)" />},
  {id: 'page-header', parts: {root: ['header', 'header'], intro: ['header > div:first-child', 'header > div:first-child'], eyebrow: ['.ds-eyebrow', '[data-slot=page-eyebrow]'],
      title: ['h1', 'h1'], description: ['.ds-page-description', '[data-slot=page-description]']},
    old: <Old.PageHeader eyebrow="Components" title="Review workspace" description="Keyboard, mobile and appearance checks." actions={<Old.Button>Export</Old.Button>} />,
    new: <New.PageHeader eyebrow="Components" title="Review workspace" description="Keyboard, mobile and appearance checks." actions={<New.Button>Export</New.Button>} />},
  {id: 'numeric-field', target: 'input', parts: {field: ['.ds-field', '[data-slot=field]'], heading: ['.ds-field-heading', '[data-slot=field-heading]'], wrap: ['.ds-input-wrap', '[data-slot=input-group]'],
      input: ['input', 'input'], affix: ['.ds-input-affix', '[data-slot=input-group-addon]'], hint: ['.ds-field-hint', '[data-slot=field-description]']},
    old: <Old.NumericField label="Purchase price" value="650000" prefix="$" hint="Before closing costs." onValueChange={plain} />,
    new: <New.NumericField label="Purchase price" value="650000" prefix="$" hint="Before closing costs." onValueChange={plain} />},
  {id: 'range-field', target: 'thumb', parts: {root: ['.ds-range-field', '[data-slot=range-field]'], label: ['.ds-range-label', '[data-slot=range-field] > div:first-child'],
      thumb: ['.ds-slider-thumb', '[data-slot=slider-thumb]'], range: ['.ds-slider-indicator', '[data-slot=slider-range]'], field: ['.ds-field', '[data-slot=field]'], wrap: ['.ds-input-wrap', '[data-slot=input-group]'],
      heading: ['.ds-field-heading', '[data-slot=field-heading]']},
    old: <Old.RangeField {...range} />, new: <New.RangeField {...range} />},
  // Last of the compared cases: the old RangeField also draws its number field, so the cases' heights
  // differ, and anything after would sit at a different sub-pixel offset.
  {id: 'slider', target: 'thumb', pixels: false,
    parts: {control: ['.ds-slider-control', '[data-slot=slider-control]'], track: ['.ds-slider-track', '[data-slot=slider-track]'],
      range: ['.ds-slider-indicator', '[data-slot=slider-range]'], thumb: ['.ds-slider-thumb', '[data-slot=slider-thumb]']},
    old: <Old.RangeField label="How long you stay" value="10" min={1} max={30} onValueChange={plain} suffix="yr" />,
    new: <div className="grid grid-cols-[minmax(0,1fr)_minmax(100px,140px)] gap-x-5 gap-y-1 items-center py-2 min-w-0">
      <div className="text-caption font-semibold text-ink-secondary">How long you stay</div>
      <New.Slider className="col-start-1" value={10} min={1} max={30} onValueChange={plain} thumbProps={{'aria-label': 'How long you stay'}} />
      <div className="col-start-2 row-span-2 row-start-1" /></div>},
)

// Combobox is new, so it has no /react counterpart; check-ui.mjs drives it instead.
const categories = [{value: 'food', label: 'Food'}, {value: 'fuel', label: 'Fuel'}, {value: 'travel', label: 'Travel'}]
function ComboboxCase() {
  const [value, setValue] = React.useState('')
  const selected = categories.find(c => c.value === value) || null
  return <New.Field>
    <New.FieldLabel htmlFor="n-category">Category</New.FieldLabel>
    <New.Combobox items={categories} value={selected} autoHighlight itemToStringLabel={c => c.label} isItemEqualToValue={(a, b) => a.value === b.value}
      onValueChange={item => item && setValue(item.value)}>
      <New.ComboboxInput id="n-category" placeholder="Type to search" />
      <New.ComboboxContent>
        <New.ComboboxEmpty>No matches.</New.ComboboxEmpty>
        <New.ComboboxList>{item => <New.ComboboxItem key={item.value} value={item}>{item.label}</New.ComboboxItem>}</New.ComboboxList>
      </New.ComboboxContent>
    </New.Combobox>
    <p id="combobox-value" hidden>{value}</p>
  </New.Field>
}

function Parity({set}) {
  return (
    <main className="parity">
      {cases.map(item => (
        <section key={item.id} className="parity-case">
          <h2>{item.id}</h2>
          <div data-case={item.id}>{item[set]}</div>
        </section>
      ))}
      {/* Last, so it shifts no compared case on the new page. */}
      {set === 'new' && <section className="parity-case"><h2>combobox</h2><ComboboxCase /></section>}
    </main>
  )
}

const set = new URLSearchParams(location.search).get('set') === 'new' ? 'new' : 'old'
window.__cases = cases.map(({id, parts, target, open, ignore, pixels}) => ({id, parts, target, open, ignore, pixels}))
createRoot(document.getElementById('root')).render(<Parity set={set} />)
