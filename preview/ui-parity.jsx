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

function Parity({set}) {
  return (
    <main className="parity">
      {cases.map(item => (
        <section key={item.id} className="parity-case">
          <h2>{item.id}</h2>
          <div data-case={item.id}>{item[set]}</div>
        </section>
      ))}
    </main>
  )
}

const set = new URLSearchParams(location.search).get('set') === 'new' ? 'new' : 'old'
window.__cases = cases.map(({id, parts, target}) => ({id, parts, target}))
createRoot(document.getElementById('root')).render(<Parity set={set} />)
