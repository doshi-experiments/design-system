import {createAppearanceController} from './theme.js';
import {siteLinks, projectTitle, appearanceOptions, siteHeaderClasses as classes} from './site-contract.js';
let nextLabel = 0;
// Static sites get the same structure, labels and control as React consumers. Each element
// carries its ds-site-* name for pages without Tailwind and its utilities for pages with it;
// the names go at 1.0.
export function mountSiteHeader(element, {project = element.ownerDocument.documentElement.dataset.project || 'portfolio', controller, showProjectTitle = true} = {}) {
  const doc = element.ownerDocument;
  const ownsController = !controller;
  controller ||= createAppearanceController({root:doc.documentElement, storageKey:doc.documentElement.dataset.appearanceStorage || 'sheet-theme', cookie:doc.documentElement.dataset.appearanceCookie !== 'false'});
  const header = doc.createElement('header'); header.className = `ds-site-header${showProjectTitle ? '' : ' ds-site-header--without-title'} ${classes.header} ${showProjectTitle ? classes.withTitle : classes.withoutTitle}`;
  const nav = doc.createElement('nav'); nav.className = `ds-site-navigation ${classes.navigation}`; nav.setAttribute('aria-label', 'Global navigation');
  for (const [name, link] of Object.entries(siteLinks)) {
    const anchor = doc.createElement('a'); anchor.className = `ds-site-link ${classes.link}`; anchor.href = link.href; anchor.textContent = link.label;
    if ((name === 'home' && project === 'portfolio') || (name === 'experiments' && project === 'experiments')) anchor.setAttribute('aria-current', 'page');
    nav.append(anchor);
  }
  let title;
  if (showProjectTitle) {title = doc.createElement('span'); title.className = `ds-site-project ${classes.project}`; title.textContent = projectTitle(project);}
  const label = doc.createElement('label'); label.className = `ds-appearance ${classes.appearance} ${showProjectTitle ? classes.appearanceWithTitle : classes.appearanceWithoutTitle}`;
  const text = doc.createElement('span'); text.className = `ds-appearance-label ${classes.appearanceLabel}`; text.id = `ds-appearance-label-${++nextLabel}`; text.textContent = 'Appearance';
  const select = doc.createElement('select'); select.className = `ds-appearance-select ${classes.appearanceSelect}`; select.setAttribute('aria-labelledby', text.id);
  for (const [value, caption] of appearanceOptions) {const option = doc.createElement('option'); option.value = value; option.textContent = caption; select.append(option);}
  select.value = controller.getPreference();
  const change = () => controller.setPreference(select.value);
  select.addEventListener('change', change);
  const unsubscribe = controller.subscribe(state => {select.value = state.preference;});
  label.append(text, select); header.append(nav); if (title) header.append(title); header.append(label); element.replaceChildren(header);
  return {controller, destroy() {unsubscribe(); select.removeEventListener('change', change); header.remove(); if (ownsController) controller.destroy();}};
}
