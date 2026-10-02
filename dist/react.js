import React from 'react';
import {Button as BaseButton} from '@base-ui/react/button';
import {Popover} from '@base-ui/react/popover';
import {Radio} from '@base-ui/react/radio';
import {Slider} from '@base-ui/react/slider';
import {RadioGroup} from '@base-ui/react/radio-group';
// App-owned recipes over the Base UI foundation selected for shadcn components.
export const Button = React.forwardRef(function Button({loading = false, disabled = false, children, className = '', ...props}, ref) {
  return React.createElement(BaseButton, {...props, ref, className: `ds-button ${className}`, disabled: disabled || loading, 'aria-busy': loading || undefined}, children);
});
export function HelpPopover({label = 'More information', title, children}) {
  const [open, setOpen] = React.useState(false);
  const restoringFocus = React.useRef(false);
  return React.createElement(Popover.Root, {open, onOpenChange:next => {restoringFocus.current = !next; setOpen(next);}},
    React.createElement(Popover.Trigger, {className:'ds-help', 'aria-label':label, openOnHover:true, onFocus:event => {if (restoringFocus.current) {restoringFocus.current = false; return;} if (event.target.matches(':focus-visible')) setOpen(true);}}, 'i'),
    React.createElement(Popover.Portal, null,
      React.createElement(Popover.Positioner, {positionMethod:'fixed', sideOffset:8, className:'ds-popover-positioner'},
        React.createElement(Popover.Popup, {className:'ds-popover', 'data-ds-help-popup':''},
          React.createElement(Popover.Title, {className:'ds-popover-title'}, title),
          React.createElement(Popover.Description, {className:'ds-popover-description'}, children),
          React.createElement(Popover.Close, {className:'ds-button'}, 'Close')))));
}
export function SegmentedControl({options, value, onValueChange, label}) {
  return React.createElement(RadioGroup, {
    className:'ds-segmented', 'aria-label':label || `Choose: ${options.map(([,text]) => text).join(', ')}`,
    value:String(options.findIndex(([v]) => v === value)),
    onValueChange:index => {const option = options[Number(index)]; if (option) onValueChange(option[0]);},
  }, options.map(([,text], index) => React.createElement(Radio.Root, {key:index, value:String(index), className:'ds-segment'}, text)));
}

const h = React.createElement;
export function Card({as: Tag = 'section', children, className = '', ...props}) {
  return h(Tag, {...props, className:`ds-card ${className}`}, children);
}
export function PageHeader({eyebrow, title, description, actions}) {
  return h('header', {className:'ds-page-header'},
    h('div', null, eyebrow && h('p', {className:'ds-eyebrow'}, eyebrow), h('h1', null, title), description && h('p', {className:'ds-page-description'}, description)),
    actions && h('div', {className:'ds-page-actions'}, actions));
}
export function FieldGroup({title, description, help, children, className = ''}) {
  return h('fieldset', {className:`ds-field-group ${className}`},
    h('legend', null, title),
    (description || help) && h('div', {className:'ds-group-description'}, description && h('p', null, description), help),
    h('div', {className:'ds-field-grid'}, children));
}
export function Metric({label, value, note, help, tone}) {
  return h('div', {className:'ds-metric', style:tone ? {'--ds-metric-accent':tone} : undefined},
    h('div', {className:'ds-metric-label'}, h('span', null, label), help),
    h('div', {className:'ds-metric-value'}, value), note && h('p', {className:'ds-metric-note'}, note));
}
export function DataRow({label, value, help, tone, strong}) {
  return h('div', {className:`ds-data-row${strong ? ' ds-data-row-strong' : ''}`},
    h('div', {className:'ds-data-label'}, h('span', null, label), help),
    h('div', {className:'ds-data-value', style:tone ? {color:tone} : undefined}, value));
}
export function DataTable({children, className = '', maxHeight, ...props}) {
  return h('div', {className:'ds-table-scroll', style:maxHeight ? {maxHeight} : undefined, tabIndex:0, role:'region', 'aria-label':props['aria-label'] || 'Results table'},
    h('table', {...props, className:`ds-table ${className}`}, children));
}
// Parsing remains an application contract. Keep raw text until the caller's
// sanitizer handles it; do not coerce pasted currency through type="number".
export function NumericField({label, value, onValueChange, sanitize = text => text, parse = Number, format = String,
  step = 1, min, max, prefix, suffix, hint, badge, readOnly, help, compact = false}) {
  const id = React.useId();
  const [changed, setChanged] = React.useState(false);
  const numeric = parse(value);
  const outside = String(value).trim() !== '' && (!Number.isFinite(numeric) || (min !== undefined && numeric < min) || (max !== undefined && numeric > max));
  const message = outside ? `Enter a number${min !== undefined ? ` from ${min}` : ''}${max !== undefined ? ` up to ${max}` : ''}.`
    : changed ? 'Numbers only — other characters were ignored.' : hint;
  const bound = number => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, number));
  return h('div', {className:`ds-field${compact ? ' ds-field-compact' : ''}`},
    h('div', {className:'ds-field-heading'}, h('label', {htmlFor:id}, label), help, badge),
    h('div', {className:'ds-input-wrap', 'data-readonly':readOnly || undefined, 'data-invalid':outside || undefined},
      prefix && h('span', {className:'ds-input-affix', 'aria-hidden':true}, prefix),
      h('input', {id, type:'text', inputMode:'decimal', autoComplete:'off', value, readOnly, 'aria-invalid':outside || undefined,
        'aria-describedby':message ? `${id}-hint` : undefined,
        onChange:event => {const raw = event.target.value; const clean = sanitize(raw); if (clean !== raw) event.target.value = clean; setChanged(clean !== raw); onValueChange(clean);},
        onKeyDown:event => {
          if (readOnly || !['ArrowUp','ArrowDown'].includes(event.key)) return;
          event.preventDefault(); setChanged(false);
          const next = (Number.isFinite(numeric) ? numeric : 0) + (event.key === 'ArrowUp' ? 1 : -1) * step * (event.shiftKey ? 10 : 1);
          onValueChange(format(bound(next)));
        }}),
      suffix && h('span', {className:'ds-input-affix', 'aria-hidden':true}, suffix)),
    h('div', {id:`${id}-hint`, className:'ds-field-hint', role:'status', 'data-warning':changed || outside || undefined}, message));
}
export function RangeField({label, value, onValueChange, min = 0, max = 100, step = 1, prefix, suffix, sanitize, parse = Number, format = String}) {
  const id = React.useId();
  const numeric = parse(value);
  const bounded = Math.min(max, Math.max(min, Number.isFinite(numeric) ? numeric : min));
  return h('div', {className:'ds-range-field'},
    h('div', {id, className:'ds-range-label'}, label),
    h(Slider.Root, {className:'ds-slider', min, max, step, value:bounded,
      onValueChange:next => onValueChange(format(Array.isArray(next) ? next[0] : next))},
      h(Slider.Control, {className:'ds-slider-control'},
        h(Slider.Track, {className:'ds-slider-track'}, h(Slider.Indicator, {className:'ds-slider-indicator'}),
          h(Slider.Thumb, {className:'ds-slider-thumb', 'aria-labelledby':id})))),
    h(NumericField, {label:`${label} value`, value, onValueChange, min, max, step, prefix, suffix, sanitize, parse, format, compact:true}));
}

// Bounded counters for touch-first setup screens. Application owns validation.
export function NumberStepper({label, value, min = 0, max = Infinity, step = 1, onValueChange, suffix, decreaseLabel, increaseLabel}) {
  const id = React.useId();
  return h('div', {className:'ds-stepper', role:'group', 'aria-label':label},
    h(Button, {type:'button', 'aria-label':decreaseLabel || `Decrease ${label}`, 'aria-describedby':id,
      disabled:value <= min, onClick:() => onValueChange(Math.max(min, value - step))}, '−'),
    h('span', {id, className:'ds-stepper-value', 'aria-live':'polite', 'aria-atomic':true}, value,
      suffix && h('small', null, suffix)),
    h(Button, {type:'button', 'aria-label':increaseLabel || `Increase ${label}`, 'aria-describedby':id,
      disabled:value >= max, onClick:() => onValueChange(Math.min(max, value + step))}, '+'));
}
