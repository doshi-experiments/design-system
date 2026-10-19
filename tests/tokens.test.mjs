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
    // Coral is a fill under ink; text in the signal colour uses the deeper action-link.
    for (const surface of ['surface-page', 'surface-raised', 'surface-overlay']) assert.ok(contrast(t['action-link'], t[surface]) >= 4.5, `action-link/${surface}`);
    for (const surface of ['surface-page', 'surface-raised', 'surface-inset']) for (const n of [1, 2, 3, 4]) assert.ok(contrast(t[`chart-${n}`], t[surface]) >= 3, `chart-${n}/${surface}`);
    for (const text of ['text', 'text-secondary']) assert.ok(contrast(t[text], t['surface-inset']) >= 4.5, `${text}/inset`);
    for (const status of ['success', 'warning', 'error', 'info']) assert.ok(contrast(t[`${status}-text`], t[`${status}-bg`]) >= 4.5, status);
    // Open disclosures, hovered table rows and hovered chip links paint text on the selection token.
    for (const text of ['text', 'text-secondary', 'action-link']) assert.ok(contrast(t[text], t.selection) >= 4.5, `${text}/selection`);
  });
}
test('density never shrinks the interactive target below the required minimum', () => {
  for (const [name,t] of Object.entries(densities)) assert.ok(parseInt(t['control-target']) >= (name === 'game' ? 60 : 44));
  // small controls look shorter but never at game density, and never below 32px to the eye
  for (const [name,t] of Object.entries(densities)) {
    const compact = parseInt(t['control-compact-height']);
    assert.ok(compact >= 32 && compact <= parseInt(t['control-height']), name);
    if (name === 'game') assert.equal(t['control-compact-height'], t['control-height']);
  }
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

test('one look for everything: every project resolves to the same felt palette and shape', () => {
  for (const appearance of Object.keys(appearances)) {
    const baseline = resolveTokens({project:'experiments',appearance});
    for (const project of Object.keys(projects)) assert.deepEqual(resolveTokens({project,appearance}),baseline,project);
  }
  assert.equal(foundation['radius-pill'],'999px');assert.equal(foundation['radius-control'],'14px');
  assert.equal(foundation['radius-container'],'24px');assert.equal(foundation['radius-dialog'],'30px');
  assert.match(foundation['font-body'],/Host Grotesk/);
  assert.equal(resolveTokens({appearance:'light'})['surface-page'],'#E7E4DE');
  assert.equal(resolveTokens({appearance:'dark'})['surface-page'],'#33322F');
  for (const appearance of Object.keys(appearances)) {
    const t = resolveTokens({appearance});
    assert.equal(t['action-primary'],'#CD354D');assert.equal(t['action-text'],'#FFFFFF');assert.equal(t.focus,t['action-link']);
    assert.notEqual(t['error-text'],t['action-primary'],'error never reads as the brand signal');
  }
  assert.equal(resolveTokens({project:'game',density:'game'})['control-target'],'60px');
});

test('0.7 signal: every stop of every gradient state keeps white text at 4.5:1', () => {
  const t = resolveTokens();
  for (const key of ['action-gradient', 'action-gradient-hover', 'action-gradient-pressed']) {
    const stops = t[key].match(/#[0-9A-F]{6}/gi);
    assert.equal(stops.length, 2, key);
    for (const stop of stops) assert.ok(contrast(t['action-text'], stop) >= 4.5, `${key} ${stop}`);
  }
  // The solid midpoint stands in for the gradient on dots, accent-color and chart fills.
  for (const appearance of Object.keys(appearances)) assert.ok(contrast(resolveTokens({appearance})['action-primary'], resolveTokens({appearance})['surface-page']) >= (appearance === 'light' ? 3 : 2.5), appearance);
});

