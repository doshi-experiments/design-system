import test from 'node:test';
import assert from 'node:assert/strict';
import {foundation, projects, appearances, densities, resolveTokens} from '../src/tokens.js';
import {installTheme} from '../src/theme.js';
function luminance(hex) {
  const rgb = hex.slice(1).match(/../g).map(v => parseInt(v, 16) / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
  return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
}
function contrast(a, b) {const x = luminance(a), y = luminance(b); return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
for (const project of Object.keys(projects)) for (const appearance of Object.keys(appearances)) {
  test(`${project}/${appearance}: semantic text and controls meet contrast targets`, () => {
    const t = resolveTokens({project, appearance});
    for (const surface of ['surface-page', 'surface-raised', 'surface-overlay']) {
      for (const text of ['text', 'text-secondary']) assert.ok(contrast(t[text], t[surface]) >= 4.5, `${text}/${surface}`);
      assert.ok(contrast(t.focus, t[surface]) >= 3, `focus/${surface}`);
      assert.ok(contrast(t.border, t[surface]) >= 3, `border/${surface}`);
    }
    for (const action of ['action-primary', 'action-hover', 'action-pressed']) assert.ok(contrast(t['action-text'], t[action]) >= 4.5, action);
    for (const status of ['success', 'warning', 'error', 'info']) assert.ok(contrast(t[`${status}-text`], t[`${status}-bg`]) >= 4.5, status);
    // Open disclosures, hovered table rows and hovered chip links paint text on the selection token.
    for (const text of ['text', 'text-secondary', 'action-primary']) assert.ok(contrast(t[text], t.selection) >= 4.5, `${text}/selection`);
  });
}
test('density never shrinks the interactive target below the required minimum', () => {
  for (const [name,t] of Object.entries(densities)) assert.ok(parseInt(t['control-target']) >= (name === 'game' ? 60 : 44));
});
test('invalid dimensions fail explicitly', () => {
  for (const key of ['project', 'appearance', 'density']) assert.throws(() => resolveTokens({[key]: '__proto__'}), RangeError);
});
function environment(stamp) {
  const meta = {}; const callbacks = new Set();
  const root = {dataset: {project: 'finance', ...(stamp ? {theme: stamp} : {})}, style: {}, ownerDocument: {querySelector: () => ({setAttribute: (key,value) => {meta[key] = value;}})}};
  const media = {matches: true, addEventListener: (_,fn) => callbacks.add(fn), removeEventListener: (_,fn) => callbacks.delete(fn)};
  return {root, media, meta, callbacks};
}
test('existing pre-paint appearance wins; explicit choices persist and stop system changes', () => {
  const e = environment('light'); const writes = [], changes = [];
  const theme = installTheme({...e, preference: 'dark', persist: value => writes.push(value), onChange: value => changes.push(value)});
  assert.equal(e.root.dataset.theme, 'light');
  theme.setAppearance('dark');
  assert.deepEqual(writes, ['dark']);
  assert.equal(e.meta.content, resolveTokens({appearance: 'dark'})['surface-page']);
  const count = changes.length; e.callbacks.forEach(fn => fn()); assert.equal(changes.length, count);
  theme.setAppearance('system'); e.media.matches = false; e.callbacks.forEach(fn => fn());
  assert.equal(e.root.dataset.theme, 'light');
  e.root.dataset.project = 'game'; theme.refresh(); assert.equal(changes.at(-1).tokens['action-primary'], projects.game.light);
  theme.destroy(); assert.equal(e.callbacks.size, 0);
});

test('all projects share one palette and shape language while densities stay independent', () => {
  for (const appearance of Object.keys(appearances)) {
    const baseline = resolveTokens({project:'portfolio',appearance});
    for (const project of Object.keys(projects)) assert.deepEqual(resolveTokens({project,appearance}),baseline);
  }
  assert.equal(foundation['radius-control'],'8px');assert.equal(foundation['radius-container'],'16px');assert.equal(foundation['radius-dialog'],'20px');
  assert.equal(foundation['shadow-raised'],'none');assert.match(foundation['font-body'],/Commissioner/);
  assert.equal(resolveTokens({project:'game',density:'game'})['control-target'],'60px');
});
