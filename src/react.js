import React from 'react';
import {Button as BaseButton} from '@base-ui/react/button';
import {Popover} from '@base-ui/react/popover';
import {Radio} from '@base-ui/react/radio';
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
