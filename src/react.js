import React from 'react';
import {Button as BaseButton} from '@base-ui/react/button';
import {Popover} from '@base-ui/react/popover';
import {Radio} from '@base-ui/react/radio';
import {Slider} from '@base-ui/react/slider';
import {RadioGroup} from '@base-ui/react/radio-group';
import {Dialog as BaseDialog} from '@base-ui/react/dialog';
// App-owned recipes over the Base UI foundation selected for shadcn components.
export const Button = React.forwardRef(function Button({loading = false, disabled = false, variant, children, className = '', ...props}, ref) {
  return React.createElement(BaseButton, {...props, ref, className: `ds-button ${className}`, 'data-variant':variant, disabled: disabled || loading, 'aria-busy': loading || undefined}, children);
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

// These field recipes keep native form controls, labels and browser input behavior.
// Business parsing, persistence and validation stay in the consuming application.
function fieldDescription(id, hint, error) {
  return (error || hint) && h('p', {id:`${id}-description`, className:'ds-field-hint', 'data-error':!!error || undefined, role:error ? 'alert' : undefined}, error || hint);
}
export const TextField = React.forwardRef(function TextField({label, value, onValueChange, hint, error, className = '', hideLabel = false, id:providedId, onChange, ...props}, ref) {
  const generatedId = React.useId(); const id = providedId || generatedId;
  return h('div', {className:`ds-field ${className}`},
    h('label', {className:`ds-field-label${hideLabel ? ' ds-visually-hidden' : ''}`, htmlFor:id}, label),
    h('input', {...props, ref, id, value, className:'ds-text-input', 'aria-invalid':error ? true : props['aria-invalid'],
      'aria-describedby':[props['aria-describedby'], (hint || error) && `${id}-description`].filter(Boolean).join(' ') || undefined,
      onChange:event => {onValueChange?.(event.target.value); onChange?.(event);}}), fieldDescription(id, hint, error));
});
export const SelectField = React.forwardRef(function SelectField({label, value, onValueChange, options = [], hint, error, className = '', hideLabel = false, id:providedId, onChange, children, ...props}, ref) {
  const generatedId = React.useId(); const id = providedId || generatedId;
  return h('div', {className:`ds-field ${className}`},
    h('label', {className:`ds-field-label${hideLabel ? ' ds-visually-hidden' : ''}`, htmlFor:id}, label),
    h('select', {...props, ref, id, value, className:'ds-select-input', 'aria-invalid':error ? true : props['aria-invalid'],
      'aria-describedby':[props['aria-describedby'], (hint || error) && `${id}-description`].filter(Boolean).join(' ') || undefined,
      onChange:event => {onValueChange?.(event.target.value); onChange?.(event);}},
      children || options.map(option => h('option', {key:option.value, value:option.value, disabled:option.disabled}, option.label))), fieldDescription(id, hint, error));
});
export function CheckboxField({label, checked, onCheckedChange, hint, error, disabled, indeterminate = false, className = '', id:providedId, onChange, ...props}) {
  const generatedId = React.useId(); const id = providedId || generatedId; const ref = React.useRef(null);
  React.useEffect(() => {if (ref.current) ref.current.indeterminate = indeterminate;}, [indeterminate]);
  return h('div', {className:`ds-checkbox-field ${className}`},
    h('label', {className:'ds-checkbox-label', htmlFor:id, 'data-disabled':disabled || undefined},
      h('input', {...props, ref, id, type:'checkbox', checked, disabled, 'aria-invalid':error ? true : props['aria-invalid'],
        'aria-describedby':[props['aria-describedby'], (hint || error) && `${id}-description`].filter(Boolean).join(' ') || undefined,
        onChange:event => {onCheckedChange?.(event.target.checked); onChange?.(event);}}), h('span', null, label)), fieldDescription(id, hint, error));
}
export function Alert({tone = 'info', title, children, actions, className = '', role, ...props}) {
  return h('div', {...props, className:`ds-alert ${className}`, 'data-tone':tone, role:role || (tone === 'error' ? 'alert' : 'status')},
    title && h('div', {className:'ds-alert-title'}, title), children && h('div', {className:'ds-alert-content'}, children), actions && h('div', {className:'ds-actions'}, actions));
}
export function Badge({tone, children, className = '', ...props}) {
  return h('span', {...props, className:`ds-badge ${className}`, 'data-tone':tone}, children);
}
export function EmptyState({title, description, actions, children, className = ''}) {
  return h('div', {className:`ds-empty-state ${className}`}, h('h2', null, title), description && h('p', null, description), children,
    actions && h('div', {className:'ds-actions'}, actions));
}
export function WorkflowSteps({steps, value, onValueChange, label = 'Progress'}) {
  const current = steps.findIndex(step => step.id === value);
  return h('nav', {'aria-label':label, className:'ds-workflow'}, h('ol', null, steps.map((step, index) => h('li', {key:step.id, 'data-current':step.id === value || undefined, 'data-complete':index < current || undefined},
    h(onValueChange ? 'button' : 'div', {className:'ds-workflow-step', ...(onValueChange ? {type:'button', disabled:step.disabled, onClick:() => onValueChange(step.id)} : {}), 'aria-current':step.id === value ? 'step' : undefined},
      h('span', {className:'ds-workflow-number', 'aria-hidden':true}, index + 1),
      h('span', {className:'ds-workflow-label'}, h('span', null, step.label), step.description && h('small', null, step.description)))))));
}
export function FileUpload({label = 'Choose files', onFilesChange, accept, multiple = false, hint, disabled = false, error, className = '', id:providedId, onChange, ...props}) {
  const generatedId = React.useId(); const id = providedId || generatedId;
  return h('div', {className:`ds-file-upload ${className}`, 'data-disabled':disabled || undefined},
    h('label', {className:'ds-field-label', htmlFor:id}, label),
    h('input', {...props, id, type:'file', accept, multiple, disabled, 'aria-invalid':!!error || undefined,
      'aria-describedby':[props['aria-describedby'], (hint || error) && `${id}-description`].filter(Boolean).join(' ') || undefined,
      onChange:event => {onFilesChange?.(Array.from(event.target.files || [])); onChange?.(event);}}), fieldDescription(id, hint, error));
}
export function Disclosure({title, children, open, defaultOpen = false, onToggle, className = '', ...props}) {
  // Native details already provides keyboard activation and collapsed-content semantics.
  // Only pass a controlled `open` property when supplied by the caller.
  return h('details', {...props, className:`ds-disclosure ${className}`, ...(open === undefined ? {open:defaultOpen || undefined} : {open}), onToggle},
    h('summary', {className:'ds-disclosure-summary'}, title), h('div', {className:'ds-disclosure-content'}, children));
}
export function Dialog({open, onOpenChange, title, description, children, actions, closeLabel = 'Cancel', finalFocus, initialFocus, className = '', dismissible = true}) {
  const lastFocus = React.useRef(null);
  // Controlled dialogs can be launched by a table row action, outside Dialog.Trigger.
  // Preserve that origin for Escape, the close button, or application-driven close.
  const wasOpen = React.useRef(false);
  if (open && !wasOpen.current && typeof document !== 'undefined') lastFocus.current = document.activeElement;
  wasOpen.current = open;
  return h(BaseDialog.Root, {open, onOpenChange:(next, details) => {
    if (!dismissible && !next && ['escape-key', 'outside-press'].includes(details.reason)) {details.cancel(); return;}
    onOpenChange?.(next, details);
  }, disablePointerDismissal:!dismissible},
    h(BaseDialog.Portal, null, h(BaseDialog.Backdrop, {className:'ds-dialog-backdrop'}),
      h(BaseDialog.Viewport, {className:'ds-dialog-viewport'},
        h(BaseDialog.Popup, {className:`ds-dialog ${className}`, initialFocus, finalFocus:finalFocus ?? lastFocus},
          h(BaseDialog.Title, {className:'ds-dialog-title'}, title), description && h(BaseDialog.Description, {className:'ds-dialog-description'}, description),
          h('div', {className:'ds-dialog-content'}, children),
          h('div', {className:'ds-dialog-actions'}, h(BaseDialog.Close, {className:'ds-button', 'data-variant':'secondary'}, closeLabel), actions)))));
}
export function AppShell({brand, navigation = [], children, footer, actions, navigationLabel = 'Main navigation', mainId = 'main-content', className = ''}) {
  return h('div', {className:`ds-app-shell ${className}`},
    h('a', {className:'ds-skip-link', href:`#${mainId}`, onClick:event => {event.preventDefault(); document.getElementById(mainId)?.focus();}}, 'Skip to content'),
    h('aside', {className:'ds-app-sidebar'}, h('div', {className:'ds-app-brand'}, brand),
      h('nav', {'aria-label':navigationLabel, className:'ds-app-navigation'}, navigation.map(item => h(item.href ? 'a' : 'button', {
        key:item.id, href:item.href, type:item.href ? undefined : 'button', className:'ds-app-nav-item', 'aria-current':item.active ? 'page' : undefined,
        onClick:item.onClick, disabled:item.href ? undefined : item.disabled}, item.icon && h('span', {'aria-hidden':true}, item.icon), item.label))),
      (actions || footer) && h('div', {className:'ds-app-sidebar-bottom'}, actions && h('div', {className:'ds-app-actions'}, actions), footer && h('div', {className:'ds-app-footer'}, footer))),
    h('main', {id:mainId, className:'ds-app-main', tabIndex:-1}, children));
}
