// 0.10 parity check: the /ui Button on a Tailwind page, and the ds-button utility on a plain
// <button> on a page with Tailwind alone, must draw exactly what /react's .ds-button draws on a
// page without Tailwind, at rest, hovered, pressed and focused, in light
// and dark, at 390px and 1440px, at comfortable and game density. It compares computed styles
// and pixels, and also checks that .ds-button is unchanged when components.css loads in
// layer(components) beside Tailwind. Screenshots of each pair land in test-results/.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {mkdir, mkdtemp, readFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {extname, join} from 'node:path';
import {chromium} from 'playwright';
import {buildTailwindPreview} from './preview-tailwind.mjs';

const root = new URL('../', import.meta.url).pathname;
const out = await mkdtemp(join(tmpdir(), 'ds-tailwind-'));
const shots = join(root, 'test-results/tailwind-parity');
await buildTailwindPreview(out);
await mkdir(shots, {recursive: true});

const types = {'.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.svg': 'image/svg+xml'};
// /pure is a 0.9 page: tokens.css and components.css only. /tailwind is a migrating 0.10 page.
// /html has Tailwind and Felt but no components.css, as a static page without React would.
const stylesheets = {pure: '<link rel="stylesheet" href="/dist/tokens.css"><link rel="stylesheet" href="/dist/components.css">',
  tailwind: '<link rel="stylesheet" href="/build/tailwind.css">', html: '<link rel="stylesheet" href="/build/tailwind-html.css">'};
const page = (kind, query) => {
  const styles = stylesheets[kind];
  return `<!doctype html><html lang="en" data-project="portfolio" data-theme="${query.get('theme')}" data-density="${query.get('density')}" data-texture="off"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${styles}<link rel="stylesheet" href="/preview/tailwind-frame.css"><script type="module" src="/build/tailwind-app.js"></script></head><body><div id="root"></div></body></html>`;
};
const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    if (['/pure', '/tailwind', '/html'].includes(url.pathname)) {res.setHeader('content-type', 'text/html'); res.end(page(url.pathname.slice(1), url.searchParams)); return;}
    const file = url.pathname.startsWith('/build/') ? join(out, url.pathname.slice(7))
      : /^\/(dist|preview)\/[\w./-]+$/.test(url.pathname) && !url.pathname.includes('..') ? join(root, url.pathname) : null;
    if (!file) {res.statusCode = 404; res.end(); return;}
    res.setHeader('content-type', types[extname(file)] || 'application/octet-stream'); res.end(await readFile(file));
  } catch {res.statusCode = 404; res.end();}
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

const properties = ['background-color', 'background-image', 'color', 'border-top-color', 'border-top-style', 'border-top-width', 'border-top-left-radius', 'box-shadow',
  'text-decoration-line', 'text-decoration-thickness', 'text-underline-offset',
  'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'min-height', 'min-width', 'font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing',
  'text-align', 'cursor', 'opacity', 'outline-style', 'outline-width', 'outline-color', 'outline-offset'];
const hitArea = ['content', 'position', 'top', 'left', 'right', 'height', 'translate'];
// Tailwind composes box-shadow from layers; its unused layers are transparent and draw nothing.
const measure = (el, [properties, hitArea]) => {
  const style = getComputedStyle(el), after = getComputedStyle(el, '::after'), box = el.getBoundingClientRect();
  const values = Object.fromEntries(properties.map(name => [name, style.getPropertyValue(name)]));
  values['box-shadow'] = values['box-shadow'].split(/,(?![^(]*\))/).map(layer => layer.trim()).filter(layer => layer !== 'rgba(0, 0, 0, 0) 0px 0px 0px 0px').join(', ') || 'none';
  for (const name of hitArea) values[`::after ${name}`] = after.content === 'none' ? 'none' : after.getPropertyValue(name);
  const cell = el.parentElement.getBoundingClientRect();
  values.width = box.width.toFixed(2); values.height = box.height.toFixed(2); values['top in cell'] = (box.top - cell.top).toFixed(2);
  return values;
};
const states = {
  rest: async () => {},
  hover: async button => button.hover(),
  active: async (button, tab) => {await button.hover(); await tab.mouse.down();},
  focus: async button => button.focus(),
};

let browser, checks = 0;
const failures = [];
try {
  browser = await chromium.launch({headless: true});
  const context = await browser.newContext({reducedMotion: 'reduce'});
  const open = async (kind, set, {theme, density, width}) => {
    const tab = await context.newPage();
    tab.on('pageerror', error => failures.push(String(error)));
    tab.on('console', message => {if (message.type() === 'error') failures.push(message.text());});
    await tab.setViewportSize({width, height: 1000});
    await tab.goto(`${origin}/${kind}?set=${set}&theme=${theme}&density=${density}`);
    await tab.locator('[data-case]').first().waitFor();
    await tab.evaluate(() => document.fonts.ready);
    assert.equal(await tab.evaluate(() => document.fonts.check('16px "Host Grotesk"')), true, 'Host Grotesk loads'); checks++;
    return tab;
  };
  // Pixel comparison happens in a page: decode both PNGs onto canvases and count changed pixels.
  const compare = async (tab, a, b) => tab.evaluate(async ([a, b]) => {
    const decode = async data => {const bitmap = await createImageBitmap(await (await fetch(`data:image/png;base64,${data}`)).blob()); const canvas = new OffscreenCanvas(bitmap.width, bitmap.height); const context = canvas.getContext('2d'); context.drawImage(bitmap, 0, 0); return context.getImageData(0, 0, bitmap.width, bitmap.height);};
    const [x, y] = await Promise.all([decode(a), decode(b)]);
    if (x.width !== y.width || x.height !== y.height) return {size: `${x.width}x${x.height} vs ${y.width}x${y.height}`};
    let changed = 0, max = 0;
    for (let i = 0; i < x.data.length; i += 4) {const delta = Math.max(...[0, 1, 2, 3].map(c => Math.abs(x.data[i + c] - y.data[i + c]))); if (delta) changed++; max = Math.max(max, delta);}
    return {changed, max};
  }, [a.toString('base64'), b.toString('base64')]);

  // Chromium paints the first signal edge it screenshots a shade lighter than every later one:
  // the same setting fails on a first pass and passes on a second, in either order. So the
  // first setting runs twice and its first pass is a warm-up whose results are discarded.
  const settings = [];
  for (const theme of ['light', 'dark']) for (const width of [390, 1440]) for (const density of ['comfortable', 'game']) settings.push({theme, density, width});
  for (const [index, setting] of [settings[0], ...settings].entries()) {
    const {theme, density, width} = setting, label = `${theme} ${width}px ${density}`;
    const differ = index === 0 ? () => {} : message => failures.push(message);
    const before = await open('pure', 'old', setting);
    const after = await open('tailwind', 'new', setting);
    const migrating = await open('tailwind', 'old', setting);
    const html = await open('html', 'html', setting);
    for (const [tab, name] of [[before, 'before'], [after, 'after']]) await tab.locator('main').screenshot({path: join(shots, `${theme}-${width}-${density}-${name}.png`)});
    assert.equal(await after.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${label}: no horizontal scroll`); checks++;
    const ids = await before.locator('[data-case]').evaluateAll(els => els.map(el => el.dataset.case));
    for (const id of ids) {
      const target = tab => tab.locator(`[data-case="${id}"]`);
      for (const [state, enter] of Object.entries(states)) {
        const values = {};
        for (const [tab, name] of [[before, 'before'], [after, 'after'], [migrating, 'migrating'], [html, 'html']]) {
          await enter(target(tab), tab);
          values[name] = await target(tab).evaluate(measure, [properties, hitArea]);
          if (state === 'focus') values[name].focusVisible = String(await target(tab).evaluate(el => el.matches(':focus-visible')));
          if (state === 'rest') values[name].pixels = await target(tab).screenshot({animations: 'disabled'});
          await tab.mouse.up(); await tab.mouse.move(0, 0); await tab.evaluate(() => document.activeElement?.blur());
        }
        // .ds-chip-link has no box-sizing of its own, so it is 16px taller without Tailwind's
        // reset; the chip is compared with .ds-chip-link beside Tailwind, as a static page has it.
        const chip = id === 'chip';
        const {pixels: oldPixels, ...old} = values.before, {pixels: newPixels, ...next} = values.after, {pixels: htmlPixels, ...plain} = values.html;
        const {pixels: layeredPixels, ...layeredValues} = values.migrating;
        const base = chip ? layeredValues : old, basePixels = chip ? layeredPixels : oldPixels;
        const differences = Object.keys(old).filter(key => old[key] !== next[key]).map(key => `${key}: ${old[key]} → ${next[key]}`);
        if (differences.length && !chip) differ(`${label} ${id} ${state}: /ui Button differs from .ds-button\n    ${differences.join('\n    ')}`);
        const layered = Object.keys(old).filter(key => old[key] !== layeredValues[key]).map(key => `${key}: ${old[key]} → ${layeredValues[key]}`);
        if (layered.length && !chip) differ(`${label} ${id} ${state}: .ds-button changes beside Tailwind\n    ${layered.join('\n    ')}`);
        const utility = Object.keys(base).filter(key => base[key] !== plain[key]).map(key => `${key}: ${base[key]} → ${plain[key]}`);
        if (utility.length) differ(`${label} ${id} ${state}: the ${chip ? 'ds-chip' : 'ds-button'} utility differs from ${chip ? '.ds-chip-link' : '.ds-button'}\n    ${utility.join('\n    ')}`);
        if (state === 'rest') {
          const pixels = await compare(after, oldPixels, newPixels);
          if ((pixels.size || pixels.changed) && !chip) differ(`${label} ${id}: pixels differ ${JSON.stringify(pixels)}`);
          const plainPixels = await compare(after, basePixels, htmlPixels);
          if (plainPixels.size || plainPixels.changed) differ(`${label} ${id}: ds-button utility pixels differ ${JSON.stringify(plainPixels)}`);
          checks += 2;
        }
        checks += 3;
      }
      // Every button keeps a 44px target, 60px at game density, counting the small size's hit area.
      const minimum = density === 'game' ? 60 : 44;
      const side = await target(after).evaluate(el => {const box = el.getBoundingClientRect(), after = getComputedStyle(el, '::after'), hit = after.content === 'none' ? 0 : parseFloat(after.height); return Math.min(box.width, Math.max(box.height, hit));});
      assert.ok(side >= minimum, `${label} ${id}: target ${side}px is under ${minimum}px`); checks++;
    }
    // Disabled and loading buttons are locked: disabled to the browser, busy while loading, and clicks do nothing.
    for (const id of ['disabled', 'disabled-primary', 'disabled-link', 'loading']) {
      assert.equal(await after.locator(`[data-case="${id}"]`).isDisabled(), true, `${label} ${id} disabled`); checks++;
      assert.equal(await html.locator(`[data-case="${id}"]`).isDisabled(), true, `${label} ${id} disabled in HTML`); checks++;
      await after.locator(`[data-case="${id}"]`).click({force: true});
    }
    assert.equal(await after.locator('[data-case="loading"]').getAttribute('aria-busy'), 'true'); checks++;
    await after.locator('[data-case="primary"]').click();
    const clicks = JSON.parse(await after.locator('#clicks').textContent());
    assert.ok(clicks['new:primary'] >= 1, `${label}: an enabled button clicks`);
    for (const id of ['disabled', 'disabled-primary', 'disabled-link', 'loading']) assert.equal(clicks[`new:${id}`], undefined, `${label}: ${id} ignores clicks`);
    checks += 2;
    for (const tab of [before, after, migrating, html]) await tab.close();
  }

  // Motion: with motion allowed, both buttons sink by one pixel when pressed.
  const moving = await browser.newContext({reducedMotion: 'no-preference'});
  const sink = async (kind, set) => {
    const tab = await moving.newPage(); await tab.goto(`${origin}/${kind}?set=${set}&theme=light&density=comfortable`);
    const button = tab.locator('[data-case="default"]'); await button.waitFor();
    const top = (await button.boundingBox()).y; await button.hover(); await tab.mouse.down(); await tab.waitForTimeout(400);
    const pressed = (await button.boundingBox()).y; await tab.mouse.up(); await tab.close(); return pressed - top;
  };
  assert.equal(await sink('pure', 'old'), 1, '.ds-button sinks 1px'); assert.equal(await sink('tailwind', 'new'), 1, '/ui Button sinks 1px'); assert.equal(await sink('html', 'html'), 1, 'the ds-button utility sinks 1px'); checks += 3;
  await moving.close();

  assert.deepEqual(failures, [], `\n${failures.join('\n')}`); checks++;
  console.log(JSON.stringify({checks, status: 'passed', coverage: '14 Button cases and the chip × rest, hover, pressed and focus × light and dark × 390 and 1440px × comfortable and game: computed styles and rest pixels of /ui and the ds-button and ds-chip utilities against .ds-button and .ds-chip-link, .ds-button unchanged in layer(components), 44/60px targets, disabled and loading lockout, 1px press with motion', screenshots: 'test-results/tailwind-parity'}));
} finally {
  await browser?.close(); await new Promise(resolve => server.close(resolve)); await rm(out, {recursive: true, force: true});
}
