// The 0.10 comparison: /react's .ds-button, /ui's Button and the ds-button utility on a plain
// <button>, case by case. Rendered in preview/tailwind-frame.html and by
// scripts/check-tailwind.mjs, which picks one set with ?set=.
import * as React from 'react'
import {createRoot} from 'react-dom/client'
import {Button as OldButton} from '../dist/react.js'
import {Button as NewButton} from '../dist/ui.js'

const cases = [
  {id: 'default', title: 'Default', label: 'Save draft'},
  {id: 'primary', title: 'Primary', label: 'Save changes', variant: 'primary'},
  {id: 'danger', title: 'Danger', label: 'Delete note', variant: 'danger'},
  {id: 'ghost', title: 'Ghost', label: 'Skip for now', variant: 'ghost'},
  {id: 'secondary', title: 'Secondary', label: 'Cancel', variant: 'secondary'},
  {id: 'link', title: 'Link', label: 'See the details', variant: 'link'},
  {id: 'icon', title: 'Icon', label: <PlusIcon />, size: 'icon', 'aria-label': 'Add note'},
  {id: 'icon-primary', title: 'Icon primary', label: <PlusIcon />, variant: 'primary', size: 'icon', 'aria-label': 'Add note'},
  {id: 'small', title: 'Small', label: 'Add note', size: 'small'},
  {id: 'small-primary', title: 'Small primary', label: 'Add note', variant: 'primary', size: 'small'},
  {id: 'disabled', title: 'Disabled', label: 'Save draft', disabled: true},
  {id: 'disabled-primary', title: 'Disabled primary', label: 'Save changes', variant: 'primary', disabled: true},
  {id: 'disabled-link', title: 'Disabled link', label: 'See the details', variant: 'link', disabled: true},
  {id: 'loading', title: 'Loading', label: 'Saving', variant: 'primary', loading: true},
  {id: 'chip', title: 'Chip', label: 'Visualizations', chip: true},
]

// Chips: components.css's .ds-chip-link on the 0.9 and 0.10 pages, the ds-chip utility on HTML.
const Chip = className => function Chip({chip, ...props}) {
  return <a {...props} className={className} href="#chips" />
}
const chips = {old: Chip('ds-chip-link'), new: Chip('ds-chip-link'), html: Chip('ds-chip')}

function PlusIcon() {
  return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M10 4v12M4 10h12" /></svg>
}

// What a page without React writes: the attributes /react's Button sets, on a plain <button>.
const HtmlButton = React.forwardRef(function HtmlButton({variant, size, loading = false, disabled = false, ...props}, ref) {
  return <button {...props} ref={ref} type="button" className="ds-button" data-variant={variant} data-size={size} disabled={disabled || loading} aria-busy={loading || undefined} />
})

function Comparison({set}) {
  const [clicks, setClicks] = React.useState({})
  const press = key => () => setClicks(current => ({...current, [key]: (current[key] || 0) + 1}))
  const sets = [['old', '0.9 .ds-button', OldButton], ['new', '0.10 Button', NewButton], ['html', 'ds-button utility', HtmlButton]].filter(([key]) => !set || set === key)
  return (
    <main className="comparison">
      <table>
        <thead>
          <tr><th scope="col">Case</th>{sets.map(([key, heading]) => <th scope="col" key={key}>{heading}</th>)}</tr>
        </thead>
        <tbody>
          {cases.map(({id, title, label, ...props}) => (
            <tr key={id}>
              <th scope="row">{title}</th>
              {sets.map(([key, , Component]) => (
                <td key={key}>{React.createElement(props.chip ? chips[key] : Component, {...props, 'data-case': id, 'data-set': key, onClick: press(`${key}:${id}`)}, label)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p id="clicks" hidden>{JSON.stringify(clicks)}</p>
    </main>
  )
}

const params = new URLSearchParams(location.search)
createRoot(document.getElementById('root')).render(<Comparison set={params.get('set')} />)
