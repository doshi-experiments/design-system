import React from 'react';
import {siteLinks, projectTitle, appearanceOptions} from './site-contract.js';
import {Button as BaseButton} from '@base-ui/react/button';
import {Popover} from '@base-ui/react/popover';
import {Radio} from '@base-ui/react/radio';
import {Slider} from '@base-ui/react/slider';
import {RadioGroup} from '@base-ui/react/radio-group';
import {Dialog as BaseDialog} from '@base-ui/react/dialog';
import {Select as BaseSelect} from '@base-ui/react/select';
import {Menu} from '@base-ui/react/menu';
import {Toast} from '@base-ui/react/toast';
import {Toggle} from '@base-ui/react/toggle';
// App-owned recipes over the Base UI foundation selected for shadcn components.
export const Button = React.forwardRef(function Button({loading = false, disabled = false, variant, size, children, className = '', ...props}, ref) {
  return React.createElement(BaseButton, {...props, ref, className: `ds-button ${className}`, 'data-variant':variant, 'data-size':size, disabled: disabled || loading, 'aria-busy': loading || undefined}, children);
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
export function SegmentedControl({options, value, onValueChange, label, size}) {
  return React.createElement(RadioGroup, {
    className:'ds-segmented', 'data-size':size, 'aria-label':label || `Choose: ${options.map(([,text]) => text).join(', ')}`,
    value:String(options.findIndex(([v]) => v === value)),
    onValueChange:index => {const option = options[Number(index)]; if (option) onValueChange(option[0]);},
  }, options.map(([,text], index) => React.createElement(Radio.Root, {key:index, value:String(index), className:'ds-segment'}, text)));
}

const h = React.createElement;
// variant="flat" is a section inside another card: no surface of its own, just its padding.
export function Card({as: Tag = 'section', variant, children, className = '', ...props}) {
  return h(Tag, {...props, className:`ds-card ${className}`, 'data-variant':variant}, children);
}
// A card's heading: the card step of the type scale (20px) at heading weight.
export function CardTitle({as: Tag = 'h2', children, className = '', ...props}) {
  return h(Tag, {...props, className:`ds-card-title ${className}`}, children);
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
export function CheckboxField({label, checked, onCheckedChange, hint, error, disabled, indeterminate = false, hideLabel = false, className = '', id:providedId, onChange, ...props}) {
  const generatedId = React.useId(); const id = providedId || generatedId; const ref = React.useRef(null);
  React.useEffect(() => {if (ref.current) ref.current.indeterminate = indeterminate;}, [indeterminate]);
  return h('div', {className:`ds-checkbox-field ${className}`},
    h('label', {className:'ds-checkbox-label', htmlFor:id, 'data-disabled':disabled || undefined, 'data-hide-label':hideLabel || undefined},
      h('input', {...props, ref, id, type:'checkbox', checked, disabled, 'aria-invalid':error ? true : props['aria-invalid'],
        'aria-describedby':[props['aria-describedby'], (hint || error) && `${id}-description`].filter(Boolean).join(' ') || undefined,
        onChange:event => {onCheckedChange?.(event.target.checked); onChange?.(event);}}), h('span', {className:hideLabel ? 'ds-visually-hidden' : undefined}, label)), fieldDescription(id, hint, error));
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


// Shared global navigation; local workspace navigation stays app-owned.
export function AppearanceControl({value = 'system', onValueChange, className = ''}) {
  const labelId = React.useId();
  return h('label', {className:`ds-appearance ${className}`},
    h('span', {id:labelId, className:'ds-appearance-label'}, 'Appearance'),
    h('select', {className:'ds-appearance-select', 'aria-labelledby':labelId, value, onChange:event => onValueChange?.(event.target.value)},
      appearanceOptions.map(([option, label]) => h('option', {key:option, value:option}, label))));
}
export function SiteHeader({project = 'portfolio', appearance = 'system', onAppearanceChange, className = ''}) {
  return h('header', {className:`ds-site-header ${className}`},
    h('nav', {className:'ds-site-navigation', 'aria-label':'Global navigation'},
      Object.entries(siteLinks).map(([name, link]) => h('a', {key:name, className:'ds-site-link', href:link.href,
        'aria-current':(name === 'home' && project === 'portfolio') || (name === 'experiments' && project === 'experiments') ? 'page' : undefined}, link.label))),
    h('span', {className:'ds-site-project'}, projectTitle(project)),
    h(AppearanceControl, {value:appearance, onValueChange:onAppearanceChange}));
}

// Pickers, menus, toggles and toasts (0.8.0). Select, DateField and TimeField open one
// felt popup instead of the operating system's sheet; values are strings, like native
// inputs. Every target keeps control-target; size="small" draws shorter over the same hit area.
const stroke = {fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round'};
const icon = (className, size, ...paths) => h('svg', {className, viewBox:'0 0 16 16', width:size, height:size, 'aria-hidden':true}, ...paths);
const chevronIcon = className => icon(className, 14, h('path', {d:'M3.5 6l4.5 4.5L12.5 6', ...stroke}));
const checkIcon = className => icon(className, 14, h('path', {d:'M3 8.5l3.2 3L13 4.5', ...stroke, strokeWidth:2.2}));
const calendarIcon = () => icon('ds-picker-icon', 15, h('rect', {x:2, y:3.5, width:12, height:10.5, rx:2.5, ...stroke, strokeWidth:1.6}),
  h('path', {d:'M2.5 7h11M5.5 2v3M10.5 2v3', ...stroke, strokeWidth:1.6}));
const optionOf = option => Array.isArray(option) ? {value:option[0], label:option[1]} : option;
const groupOf = group => Array.isArray(group) ? {label:group[0], options:group[1].map(optionOf)} : {...group, options:group.options.map(optionOf)};

export const IconButton = React.forwardRef(function IconButton({label, size, className = '', children, ...props}, ref) {
  return h('button', {type:'button', ...props, ref, className:`ds-icon-button ${className}`, 'data-size':size, 'aria-label':label}, children);
});

// Label above (stacked), to the left (inline) or for screen readers only (hidden), and a hint below.
function PickerField({label, id, hint, layout, className, children}) {
  return h('div', {className:`ds-field ds-picker-field ${className}`, 'data-layout':layout},
    h('span', {id:`${id}-label`, className:`ds-field-label${layout === 'hidden' ? ' ds-visually-hidden' : ''}`}, label),
    children, hint && h('p', {id:`${id}-hint`, className:'ds-field-hint'}, hint));
}

export function Select({label, value, onValueChange, options = [], groups = [], hint, disabled, layout = 'stacked',
  variant = 'field', size, className = '', triggerClassName = ''}) {
  const id = React.useId();
  const flat = options.map(optionOf), sets = groups.map(groupOf);
  const all = [...flat, ...sets.flatMap(group => group.options)];
  const labelOf = current => all.find(option => String(option.value) === String(current))?.label ?? '';
  const item = option => h(BaseSelect.Item, {key:String(option.value), value:String(option.value), disabled:option.disabled, className:'ds-option'},
    h(BaseSelect.ItemText, null, option.label), h(BaseSelect.ItemIndicator, {className:'ds-option-check'}, checkIcon()));
  return h(PickerField, {label, id, hint, layout, className},
    h(BaseSelect.Root, {value:String(value ?? ''), onValueChange:next => onValueChange?.(next), disabled},
      h(BaseSelect.Trigger, {className:`ds-picker ${triggerClassName}`, 'data-variant':variant, 'data-size':size,
        'aria-labelledby':`${id}-label`, 'aria-describedby':hint ? `${id}-hint` : undefined},
        h(BaseSelect.Value, {className:'ds-picker-value'}, current => labelOf(current)), chevronIcon('ds-picker-icon')),
      h(BaseSelect.Portal, null,
        h(BaseSelect.Positioner, {className:'ds-menu-positioner', sideOffset:6, align:'start', alignItemWithTrigger:false},
          h(BaseSelect.Popup, {className:'ds-menu ds-select-popup'},
            h(BaseSelect.List, null, ...flat.map(item), ...sets.map(group => h(BaseSelect.Group, {key:group.label, className:'ds-option-group'},
              h(BaseSelect.GroupLabel, {className:'ds-option-group-label'}, group.label), ...group.options.map(item)))))))));
}

const pad2 = number => String(number).padStart(2, '0');
const clockTime = hhmm => {const [hour, minute] = hhmm.split(':').map(Number); return `${((hour + 11) % 12) + 1}:${pad2(minute)} ${hour < 12 ? 'AM' : 'PM'}`;};
// Times of day in `step`-minute slots (plus the current value if it is off the grid); '' is no time.
export function TimeField({value, step = 30, allowEmpty = true, emptyLabel = 'No time', format = clockTime, ...props}) {
  const slots = Array.from({length:Math.ceil(1440 / step)}, (_, index) => `${pad2(Math.floor(index * step / 60))}:${pad2(index * step % 60)}`);
  if (value && !slots.includes(value)) {slots.push(value); slots.sort();}
  return h(Select, {...props, value:value || '', options:[...(allowEmpty ? [{value:'', label:emptyLabel}] : []), ...slots.map(slot => ({value:slot, label:format(slot)}))]});
}

const isoOf = date => `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
const dateOf = iso => new Date(`${iso}T12:00:00`);
const addDays = (iso, days) => {const date = dateOf(iso); date.setDate(date.getDate() + days); return isoOf(date);};
const addMonths = (iso, months) => {const date = dateOf(iso); const day = date.getDate(); date.setDate(1); date.setMonth(date.getMonth() + months);
  date.setDate(Math.min(day, new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate())); return isoOf(date);};
const todayIso = () => isoOf(new Date());
const weekdayIndex = iso => (dateOf(iso).getDay() + 6) % 7;   // Monday-first
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
// "Wed 21 Oct 2026"
export const formatDate = iso => {const date = dateOf(iso);
  return `${date.toLocaleDateString('en', {weekday:'short'})} ${date.getDate()} ${date.toLocaleDateString('en', {month:'short'})} ${date.getFullYear()}`;};

// A month grid. Arrow keys move a day or a week, Page Up/Down a month, Home/End the week; Enter picks.
// Focus stays inside min..max, so it never lands on a disabled day.
function Calendar({value, min, max, format, onPick}) {
  const today = todayIso();
  const clamp = iso => (min && iso < min ? min : max && iso > max ? max : iso);
  const [focus, setFocus] = React.useState(() => clamp(value || today));
  const grid = React.useRef(null);
  const first = dateOf(focus.slice(0, 8) + '01');
  const cells = Array.from({length:42}, (_, index) => addDays(isoOf(first), index - weekdayIndex(isoOf(first))));
  React.useEffect(() => {grid.current?.querySelector(`[data-date="${focus}"]`)?.focus();}, [focus]);
  const go = next => setFocus(clamp(next));
  const onKeyDown = event => {
    const step = {ArrowLeft:-1, ArrowRight:1, ArrowUp:-7, ArrowDown:7}[event.key];
    if (step) go(addDays(focus, step));
    else if (event.key === 'PageUp') go(addMonths(focus, -1));
    else if (event.key === 'PageDown') go(addMonths(focus, 1));
    else if (event.key === 'Home') go(addDays(focus, -weekdayIndex(focus)));
    else if (event.key === 'End') go(addDays(focus, 6 - weekdayIndex(focus)));
    else return;
    event.preventDefault();
  };
  return h('div', {className:'ds-calendar'},
    h('div', {className:'ds-calendar-head'},
      h(IconButton, {label:'Previous month', size:'small', onClick:() => go(addMonths(focus, -1))}, icon(undefined, 14, h('path', {d:'M10 3.5 5.5 8l4.5 4.5', ...stroke}))),
      h('span', {className:'ds-calendar-title', 'aria-live':'polite'}, first.toLocaleDateString(undefined, {month:'long', year:'numeric'})),
      h(IconButton, {label:'Next month', size:'small', onClick:() => go(addMonths(focus, 1))}, icon(undefined, 14, h('path', {d:'M6 3.5 10.5 8 6 12.5', ...stroke})))),
    h('table', {ref:grid, className:'ds-calendar-grid', role:'grid', onKeyDown},
      h('thead', null, h('tr', null, WEEKDAYS.map(day => h('th', {key:day, scope:'col', abbr:day}, day.slice(0, 2))))),
      h('tbody', null, Array.from({length:6}, (_, week) => h('tr', {key:week}, cells.slice(week * 7, week * 7 + 7).map(iso =>
        h('td', {key:iso, role:'gridcell', 'aria-selected':iso === value},
          h('button', {type:'button', className:'ds-day', 'data-date':iso, tabIndex:iso === focus ? 0 : -1,
            disabled:(min && iso < min) || (max && iso > max) || undefined,
            'data-outside':dateOf(iso).getMonth() !== first.getMonth() || undefined, 'data-today':iso === today || undefined, 'data-selected':iso === value || undefined,
            'aria-label':format(iso), 'aria-current':iso === today ? 'date' : undefined, onClick:() => onPick(iso)}, dateOf(iso).getDate()))))))));
}

// A date field that opens the calendar. value: YYYY-MM-DD or ''.
export function DateField({label, value, onValueChange, hint, min, max, placeholder = 'No date', clearable = true, layout = 'stacked',
  size, format = formatDate, todayLabel = 'Today', clearLabel = 'Clear', className = '', triggerClassName = ''}) {
  const id = React.useId();
  const [open, setOpen] = React.useState(false);
  const pick = iso => {onValueChange?.(iso); setOpen(false);};
  const today = todayIso();
  return h(PickerField, {label, id, hint, layout, className},
    h(Popover.Root, {open, onOpenChange:setOpen},
      h(Popover.Trigger, {className:`ds-picker ${triggerClassName}`, 'data-variant':'field', 'data-size':size,
        'aria-labelledby':`${id}-label ${id}-value`, 'aria-describedby':hint ? `${id}-hint` : undefined},
        h('span', {id:`${id}-value`, className:'ds-picker-value', 'data-empty':!value || undefined}, value ? format(value) : placeholder), calendarIcon()),
      h(Popover.Portal, null,
        h(Popover.Positioner, {className:'ds-menu-positioner', sideOffset:6, align:'start'},
          h(Popover.Popup, {className:'ds-menu ds-date-popup', 'aria-label':typeof label === 'string' ? `Choose ${label.toLowerCase()}` : undefined},
            h(Calendar, {value, min, max, format, onPick:pick}),
            h('div', {className:'ds-calendar-foot'},
              (!min || today >= min) && (!max || today <= max) && h(Button, {type:'button', variant:'ghost', size:'small', onClick:() => pick(today)}, todayLabel),
              clearable && value && h(Button, {type:'button', variant:'ghost', size:'small', onClick:() => pick('')}, clearLabel)))))));
}

// A button that opens a menu of actions. items: {label, onSelect, disabled} or 'separator'.
export function MenuButton({label, items = [], variant, size, align = 'end', disabled = false, loading = false, className = ''}) {
  return h(Menu.Root, null,
    h(Menu.Trigger, {className:`ds-button ds-menu-trigger ${className}`, 'data-variant':variant, 'data-size':size,
      disabled:disabled || loading, 'aria-busy':loading || undefined}, label, chevronIcon()),
    h(Menu.Portal, null,
      h(Menu.Positioner, {className:'ds-menu-positioner', sideOffset:6, align},
        h(Menu.Popup, {className:'ds-menu'}, items.map((item, index) => item === 'separator'
          ? h(Menu.Separator, {key:`separator-${index}`, className:'ds-menu-separator'})
          : h(Menu.Item, {key:item.key ?? index, className:'ds-menu-item', disabled:item.disabled, onClick:item.onSelect}, item.label))))));
}

// A pressed/unpressed status, such as "Alarm on" / "Alarm off". Off is quiet; on carries
// its tone's tinted background. Always pass words: a tone is never shown as bare colour.
export const ToggleButton = React.forwardRef(function ToggleButton({pressed, onPressedChange, tone, size, loading = false, disabled = false, className = '', children, ...props}, ref) {
  return h(Toggle, {...props, ref, pressed, onPressedChange:next => onPressedChange?.(next), className:`ds-toggle ${className}`,
    'data-tone':tone, 'data-size':size, disabled:disabled || loading, 'aria-busy':loading || undefined}, children);
});

// Toasts: confirmations that outlive the page that raised them. Mount ToastProvider once,
// then call toast(title, description?, {tone, timeout, action}) from anywhere. It returns the
// toast's id for toast.close(id). action: {label, onAction} adds one small button, such as
// Undo, that closes the toast and runs onAction; a toast with one stays up 8 s instead of 4.
const toastManager = Toast.createToastManager();
let toastCount = 0;
export const toast = (title, description, {tone = 'success', timeout, action} = {}) => {
  const id = `ds-toast-${++toastCount}`;
  return toastManager.add({id, title, description, timeout:timeout ?? (action ? 8000 : 4000), type:tone, priority:tone === 'error' ? 'high' : 'low',
    actionProps:action && {children:action.label, onClick:event => {toastManager.close(id); action.onAction?.(event);}}});
};
toast.close = id => toastManager.close(id);
const toneIcon = tone => tone === 'success'
  ? checkIcon('ds-toast-icon')
  : icon('ds-toast-icon', 16, h('circle', {cx:8, cy:8, r:6.25, ...stroke, strokeWidth:1.5}),
    h('path', {d:tone === 'info' ? 'M8 7.4v3.8' : 'M8 4.8v3.8', ...stroke, strokeWidth:1.6}), h('circle', {cx:8, cy:tone === 'info' ? 4.9 : 11.2, r:0.95, fill:'currentColor'}));
function ToastList() {
  const {toasts} = Toast.useToastManager();
  return toasts.map(item => h(Toast.Root, {key:item.id, toast:item, className:'ds-toast', 'data-tone':item.type || 'success'},
    toneIcon(item.type || 'success'),
    h('div', {className:'ds-toast-text'}, h(Toast.Title, {className:'ds-toast-title'}), item.description && h(Toast.Description, {className:'ds-toast-description'})),
    item.actionProps && h(Toast.Action, {className:'ds-button ds-toast-action', 'data-size':'small'}),
    h(Toast.Close, {className:'ds-icon-button ds-toast-close', 'data-size':'small', 'aria-label':'Dismiss'},
      icon(undefined, 14, h('path', {d:'M4 4l8 8M12 4l-8 8', ...stroke})))));
}
export function ToastProvider({children, limit = 3}) {
  return h(Toast.Provider, {toastManager, limit}, children,
    h(Toast.Portal, null, h(Toast.Viewport, {className:'ds-toast-viewport'}, h(ToastList))));
}
