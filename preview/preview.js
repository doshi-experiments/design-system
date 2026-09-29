import {installTheme} from '../dist/theme.js';
const root = document.documentElement;
let preference = 'system';
try {const stored = localStorage.getItem('doshi-preview-appearance'); if (['light','dark','system'].includes(stored)) preference = stored;} catch {}
document.querySelector('#appearance').value = preference;
const theme = installTheme({preference, persist: value => {try {localStorage.setItem('doshi-preview-appearance', value);} catch {}}, onChange: ({appearance, tokens}) => {
  for (const [id,prefix,count] of [['swatches','chart',4], ['ramp','ramp',5]]) {
    document.getElementById(id).replaceChildren(...Array.from({length:count}, (_,i) => {
      const item = document.createElement('div'); const swatch = document.createElement('span');
      swatch.style.backgroundColor = tokens[`${prefix}-${i+1}`];
      const label = document.createElement('small'); label.textContent = `${i+1} · ${tokens[`${prefix}-${i+1}`]}`;
      item.append(swatch,label); return item;
    }));
  }
  document.querySelector('#status').textContent = `${root.dataset.project} · ${appearance} · ${root.dataset.density}`;
}});
document.querySelector('#appearance').addEventListener('change', e => theme.setAppearance(e.target.value));
for (const dimension of ['project','density']) document.getElementById(dimension).addEventListener('change', e => {root.dataset[dimension] = e.target.value; theme.refresh();});
