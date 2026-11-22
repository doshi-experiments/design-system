// The 0.10 comparison: /react's .ds-button and /ui's Button, case by case. Rendered in
// preview/tailwind-frame.html and by scripts/check-tailwind.mjs, which picks one set with ?set=.
import * as React from 'react'
import {createRoot} from 'react-dom/client'
import {Button as OldButton} from '../dist/react.js'
import {Button as NewButton} from '../dist/ui.js'

const cases = [
  {id: 'default', title: 'Default', label: 'Save draft'},
  {id: 'primary', title: 'Primary', label: 'Save changes', variant: 'primary'},
  {id: 'danger', title: 'Danger', label: 'Delete note', variant: 'danger'},
  {id: 'ghost', title: 'Ghost', label: 'Skip for now', variant: 'ghost'},
  {id: 'small', title: 'Small', label: 'Add note', size: 'small'},
  {id: 'small-primary', title: 'Small primary', label: 'Add note', variant: 'primary', size: 'small'},
  {id: 'disabled', title: 'Disabled', label: 'Save draft', disabled: true},
  {id: 'disabled-primary', title: 'Disabled primary', label: 'Save changes', variant: 'primary', disabled: true},
  {id: 'loading', title: 'Loading', label: 'Saving', variant: 'primary', loading: true},
]

function Comparison({set}) {
  const [clicks, setClicks] = React.useState({})
  const press = key => () => setClicks(current => ({...current, [key]: (current[key] || 0) + 1}))
  const sets = [['old', '0.9 .ds-button', OldButton], ['new', '0.10 Button', NewButton]].filter(([key]) => !set || set === key)
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
                <td key={key}><Component {...props} data-case={id} data-set={key} onClick={press(`${key}:${id}`)}>{label}</Component></td>
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
