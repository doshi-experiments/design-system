// The 0.11 comparison: each /react component beside the /ui composition that replaces it.
// scripts/check-ui.mjs renders one set per page (?set=old on a page with components.css,
// ?set=new on a page with Tailwind alone) and compares the parts each case names.
import * as React from 'react'
import {createRoot} from 'react-dom/client'
import * as Old from '../dist/react.js'
import * as New from '../dist/ui.js'

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
  // Last of the compared cases: the old RangeField also draws its number field, so the cases' heights
  // differ, and anything after would sit at a different sub-pixel offset.
  // Widths follow the layout around the slider; the range's share of the track is compared by its
  // width relative to the track instead.
  {id: 'slider', target: 'thumb', pixels: false, ignore: {control: ['width'], track: ['width'], range: ['width']},
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
