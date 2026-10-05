import {createAppearanceController} from '../dist/theme.js';
import {mountSiteHeader} from '../dist/site.js';
const root = document.documentElement;
const theme = createAppearanceController({storageKey:'doshi-preview-appearance',cookie:false,onChange: ({appearance, tokens}) => {
  for (const [id,prefix,count] of [['swatches','chart',4], ['ramp','ramp',5]]) {
    document.getElementById(id).replaceChildren(...Array.from({length:count}, (_,i) => {
      const item = document.createElement('div'); const swatch = document.createElement('span');
      swatch.style.backgroundColor = tokens[`${prefix}-${i+1}`];
      const label = document.createElement('small'); label.textContent = tokens[`${prefix}-${i+1}`];
      item.append(swatch,label); return item;
    }));
  }
  document.querySelector('#status').textContent = `Project: ${root.dataset.project}. Appearance: ${appearance}. Density: ${root.dataset.density}.`;
}});
mountSiteHeader(document.querySelector('#family-header'),{project:'portfolio',controller:theme});
for (const dimension of ['project','density']) document.getElementById(dimension).addEventListener('change', e => {root.dataset[dimension] = e.target.value; theme.refresh();});
