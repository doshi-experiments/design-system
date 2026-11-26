// 0.11 parity check: each /ui composition on a page with Tailwind alone must draw what the /react
// component it replaces draws on a page with Tailwind and components.css in a layer, as the apps
// run them today. For every case in preview/ui-parity.jsx it compares the computed styles of each
// named part, at rest and (for controls) hovered and focused, and the case's pixels at rest, in
// light and dark, at 390px and 1440px, at comfortable and game density.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {mkdir, mkdtemp, readFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {extname, join} from 'node:path';
import {chromium} from 'playwright';
import {buildTailwindPreview} from './preview-tailwind.mjs';

const root = new URL('../', import.meta.url).pathname;
const out = await mkdtemp(join(tmpdir(), 'ds-ui-'));
const shots = join(root, 'test-results/ui-parity');
await buildTailwindPreview(out);
await mkdir(shots, {recursive: true});

const types = {'.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.svg': 'image/svg+xml'};
// Popups are positioned by Base UI from where their trigger is, so their left and top are not compared.
const page = query => {
  const css = query.get('set') === 'new' ? 'tailwind-html.css' : 'tailwind.css';
  return `<!doctype html><html lang="en" data-project="finance" data-theme="${query.get('theme')}" data-density="${query.get('density')}" data-texture="off"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/build/${css}"><style>body{margin:0;color:var(--ds-text);background:var(--ds-surface-page)}.parity{display:grid;gap:24px;padding:24px;max-width:640px}.parity-case h2{font-size:12px;margin:0 0 8px}</style><script type="module" src="/build/ui-parity.js"></script></head><body><div id="root"></div></body></html>`;
};
const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    if (url.pathname === '/') {res.setHeader('content-type', 'text/html'); res.end(page(url.searchParams)); return;}
    if (!url.pathname.startsWith('/build/') || url.pathname.includes('..')) {res.statusCode = 404; res.end(); return;}
    const file = join(out, url.pathname.slice(7));
    res.setHeader('content-type', types[extname(file)] || 'application/octet-stream'); res.end(await readFile(file));
  } catch {res.statusCode = 404; res.end();}
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

const properties = ['display', 'position', 'box-sizing', 'background-color', 'background-image', 'color', 'border-top-color', 'border-top-style', 'border-top-width',
  'border-left-color', 'border-left-width', 'border-top-left-radius', 'box-shadow', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'min-height', 'min-width', 'font-family', 'font-size', 'font-weight', 'line-height',
  'letter-spacing', 'text-align', 'cursor', 'opacity', 'gap', 'align-items', 'justify-content', 'align-self', 'grid-template-columns', 'flex-wrap',
  'accent-color', 'outline-style', 'outline-width', 'outline-color', 'outline-offset', 'white-space', 'overflow-wrap', 'font-variant-numeric', 'text-decoration-line'];
const measure = (el, properties) => {
  const style = getComputedStyle(el), after = getComputedStyle(el, '::after'), box = el.getBoundingClientRect();
  const values = Object.fromEntries(properties.map(name => [name, style.getPropertyValue(name)]));
  values['box-shadow'] = values['box-shadow'].split(/,(?![^(]*\))/).map(layer => layer.trim()).filter(layer => layer !== 'rgba(0, 0, 0, 0) 0px 0px 0px 0px').join(', ') || 'none';
  values['::after'] = after.content === 'none' ? 'none' : ['content', 'position', 'top', 'left', 'height', 'border-top-style', 'border-top-color', 'border-top-left-radius'].map(name => after.getPropertyValue(name)).join(' ');
  values['::placeholder'] = el.matches('input') ? getComputedStyle(el, '::placeholder').color : '';
  // A 0px border draws nothing whatever its style: Tailwind's reset says solid where border:0 says none.
  for (const side of ['top', 'left']) if (values[`border-${side}-width`] === '0px') {values[`border-${side}-style`] = 'none'; values[`border-${side}-color`] = '';}
  values.width = box.width.toFixed(1); values.height = box.height.toFixed(1);
  return values;
};

let browser, cases = [], checks = 0;
const failures = [];
try {
  browser = await chromium.launch({headless: true});
  const context = await browser.newContext({reducedMotion: 'reduce'});
  const open = async (set, {theme, density, width}) => {
    const tab = await context.newPage();
    tab.on('pageerror', error => failures.push(`${set}: ${error}`));
    tab.on('console', message => {if (message.type() === 'error') failures.push(`${set}: ${message.text()}`);});
    await tab.setViewportSize({width, height: 1000});
    await tab.goto(`${origin}/?set=${set}&theme=${theme}&density=${density}`);
    await tab.locator('[data-case]').first().waitFor();
    await tab.evaluate(() => document.fonts.ready);
    return tab;
  };
  const compare = async (tab, a, b) => tab.evaluate(async ([a, b]) => {
    const decode = async data => {const bitmap = await createImageBitmap(await (await fetch(`data:image/png;base64,${data}`)).blob()); const canvas = new OffscreenCanvas(bitmap.width, bitmap.height); const context = canvas.getContext('2d'); context.drawImage(bitmap, 0, 0); return context.getImageData(0, 0, bitmap.width, bitmap.height);};
    const [x, y] = await Promise.all([decode(a), decode(b)]);
    if (x.width !== y.width || x.height !== y.height) return {size: `${x.width}x${x.height} vs ${y.width}x${y.height}`};
    let changed = 0; for (let i = 0; i < x.data.length; i += 4) if ([0, 1, 2, 3].some(c => x.data[i + c] !== y.data[i + c])) changed++;
    return {changed};
  }, [a.toString('base64'), b.toString('base64')]);

  const settings = [];
  for (const theme of ['light', 'dark']) for (const width of [390, 1440]) for (const density of ['comfortable', 'game']) settings.push({theme, density, width});
  for (const setting of settings) {
    const label = `${setting.theme} ${setting.width}px ${setting.density}`;
    const old = await open('old', setting), next = await open('new', setting);
    cases = await old.evaluate(() => window.__cases);
    for (const item of cases) {
      const scope = tab => tab.locator(`[data-case="${item.id}"]`);
      // A selector starting with @ is a popup part, found in the whole page and measured open.
      const find = (tab, selector) => selector.startsWith('@') ? tab.locator(selector.slice(1)) : scope(tab).locator(selector);
      const inline = Object.entries(item.parts).filter(([, [selector]]) => !selector.startsWith('@'));
      const popup = Object.entries(item.parts).filter(([, [selector]]) => selector.startsWith('@'));
      const states = [...(inline.length ? item.target ? ['rest', 'hover', 'focus'] : ['rest'] : []), ...(item.open ? ['open'] : [])];
      for (const state of states) {
        const values = {};
        const parts = state === 'open' ? [...inline, ...popup] : inline;
        for (const [tab, set, index] of [[old, 'old', 0], [next, 'new', 1]]) {
          if (state === 'open') {
            await scope(tab).locator(item.open[index]).first().click();
            await find(tab, popup[0][1][index]).first().waitFor();
            await tab.mouse.move(0, 0); await tab.waitForTimeout(150);
          } else if (state !== 'rest') {
            const target = scope(tab).locator(item.parts[item.target]?.[index] ?? item.parts.root[index]).first();
            if (state === 'hover') await target.hover(); else await target.focus();
          }
          values[set] = {};
          for (const [part, selectors] of parts) {
            const element = find(tab, selectors[index]).first();
            if (!await element.count()) {failures.push(`${label} ${item.id}: ${set} has no ${part} (${selectors[index]})`); continue;}
            values[set][part] = await element.evaluate(measure, properties);
          }
          if (state === 'open') {
            await tab.keyboard.press('Escape');
            await find(tab, popup[0][1][index]).first().waitFor({state: 'hidden'}).catch(() => failures.push(`${label} ${item.id}: ${set} did not close on Escape`));
          }
          await tab.mouse.move(0, 0); await tab.evaluate(() => document.activeElement?.blur());
          // Hovering a help key opens its popup; let it close before the next measurement.
          await tab.waitForTimeout(state === 'hover' ? 400 : 0);
        }
        if (values.old.range && values.old.track) for (const set of ['old', 'new']) values[set].range.share = (values[set].range.width / values[set].track.width).toFixed(3);
        for (const [part] of parts) {
          const a = values.old[part], b = values.new[part];
          if (!a || !b) continue;
          const ignored = item.ignore?.[part] ?? [];
          const differences = Object.keys(a).filter(key => a[key] !== b[key] && !ignored.includes(key)).map(key => `${key}: ${a[key]} → ${b[key]}`);
          if (differences.length) failures.push(`${label} ${item.id} ${part} ${state}\n    ${differences.join('\n    ')}`);
          checks++;
        }
      }
      if (item.pixels === false) continue;
      const [a, b] = [await scope(old).screenshot({animations: 'disabled'}), await scope(next).screenshot({animations: 'disabled'})];
      const pixels = await compare(next, a, b);
      if (pixels.size || pixels.changed) failures.push(`${label} ${item.id}: pixels differ ${JSON.stringify(pixels)}`);
      checks++;
    }
    // Combobox: typing filters, Enter takes the highlighted match, and no match says so.
    const combo = next.getByLabel('Category', {exact: true});
    await combo.fill('fu');
    const shown = await next.locator('[data-slot=combobox-item]').allTextContents();
    if (JSON.stringify(shown) !== '["Fuel"]') failures.push(`${label} combobox: "fu" shows ${JSON.stringify(shown)}`);
    const look = await next.locator('[data-slot=combobox-content]').evaluate(el => {const s = getComputedStyle(el); return [s.backgroundColor, s.boxShadow !== 'none', s.borderTopLeftRadius].join(' ');});
    const menu = await next.evaluate(() => {const probe = Object.assign(document.createElement('div'), {className: 'bg-overlay rounded-control'}); document.body.append(probe); const s = getComputedStyle(probe); const out = [s.backgroundColor, true, s.borderTopLeftRadius].join(' '); probe.remove(); return out;});
    if (look !== menu) failures.push(`${label} combobox: popup draws ${look}, not the felt menu ${menu}`);
    await next.keyboard.press('Enter');
    if (await next.locator('#combobox-value').textContent() !== 'fuel') failures.push(`${label} combobox: Enter did not choose Fuel`);
    await combo.fill('zz');
    if (!await next.getByText('No matches.').isVisible()) failures.push(`${label} combobox: no empty message`);
    await next.keyboard.press('Escape'); await combo.blur();
    checks += 4;
    await old.screenshot({path: join(shots, `${setting.theme}-${setting.width}-${setting.density}-old.png`), fullPage: true});
    await next.screenshot({path: join(shots, `${setting.theme}-${setting.width}-${setting.density}-new.png`), fullPage: true});
    await old.close(); await next.close();
  }
  assert.deepEqual(failures, [], `\n${failures.join('\n')}`); checks++;
  console.log(JSON.stringify({checks, status: 'passed', coverage: `${cases.length} cases: /ui against /react by computed style of every named part (rest, plus hover and focus for controls) and by pixel, in light and dark, at 390 and 1440px, at comfortable and game density`, screenshots: 'test-results/ui-parity'}));
} finally {
  await browser?.close(); await new Promise(resolve => server.close(resolve)); await rm(out, {recursive: true, force: true});
}
