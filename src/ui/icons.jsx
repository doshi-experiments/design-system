// The two small icons the pickers and menus draw, as /react draws them (16px grid, 14px).
const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }

function ChevronIcon(props) {
  return <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" {...props}><path d="M3.5 6l4.5 4.5L12.5 6" {...stroke} /></svg>
}

function CheckIcon(props) {
  return <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" {...props}><path d="M3 8.5l3.2 3L13 4.5" {...stroke} strokeWidth={2.2} /></svg>
}

export { ChevronIcon, CheckIcon }
