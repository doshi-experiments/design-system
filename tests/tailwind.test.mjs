import test from 'node:test';
import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {mkdtemp, readFile, readdir, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {promisify} from 'node:util';
import {resolveTokens, densities} from '../src/tokens.js';
import {themeTokens, typeScale, breakpoints, durations, tones} from '../src/tailwind-theme.js';
import {tailwindCss} from '../scripts/tailwind.mjs';
import {cn} from '../src/ui/cn.js';

const root = new URL('../', import.meta.url).pathname;
const css = await readFile(join(root, 'dist/tailwind.css'), 'utf8');
const tokenNames = new Set(Object.keys({...resolveTokens(), ...densities.game}));

// Compiles candidates the way a consumer's build would, through Tailwind's CLI and dist/tailwind.css.
async function compile(classes) {
  const dir = await mkdtemp(join(tmpdir(), 'ds-tailwind-unit-'));
  try {
    await writeFile(join(dir, 'input.css'), `@import "${join(root, 'node_modules/tailwindcss/index.css')}" source(none);\n@import "${join(root, 'dist/tailwind.css')}" source(none);\n@source inline("${classes.join(' ')}");\n`);
    await promisify(execFile)(join(root, 'node_modules/.bin/tailwindcss'), ['-i', join(dir, 'input.css'), '-o', join(dir, 'out.css')]);
    return await readFile(join(dir, 'out.css'), 'utf8');
  } finally {await rm(dir, {recursive: true, force: true});}
}
const generates = (output, utility) => output.includes(`.${utility.replace(/[^\w-]/g, ch => `\\${ch}`)}`);

test('dist/tailwind.css is the generated file', () => {
  assert.equal(css, tailwindCss());
});

test('every theme variable reads a token that exists', () => {
  const referenced = [...css.matchAll(/var\(--ds-([\w-]+)\)/g)].map(match => match[1]);
  assert.ok(referenced.length > 50);
  for (const name of referenced) assert.ok(tokenNames.has(name), `--ds-${name} is not a token`);
  for (const entries of Object.values(themeTokens)) for (const token of Object.values(entries)) assert.ok(tokenNames.has(token), token);
  for (const {size} of Object.values(typeScale)) assert.ok(tokenNames.has(size), size);
  for (const token of Object.values(durations)) assert.ok(tokenNames.has(token), token);
  for (const tone of tones) for (const part of ['bg', 'text']) assert.ok(tokenNames.has(`${tone}-${part}`), tone);
});

test('Tailwind defaults are cleared and the signal is never a colour', () => {
  for (const namespace of ['color', 'font', 'text', 'radius', 'shadow']) assert.match(css, new RegExp(`--${namespace}-\\*: initial;`));
  assert.doesNotMatch(css, /--color-[\w-]*(signal|action|primary|error|success|warning|info)/, 'no signal or status colours');
});

test('the theme generates Felt utilities and nothing from Tailwind or shadcn defaults', async () => {
  const felt = ['bg-page', 'bg-raised', 'text-ink', 'text-ink-secondary', 'border-line', 'text-link', 'outline-focus', 'fill-chart-2', 'text-amount-out',
    'font-sans', 'text-caption', 'text-display', 'rounded-pill', 'rounded-control', 'shadow-raised', 'shadow-signal', 'min-h-target', 'h-control', 'p-panel',
    'max-w-measure', 'max-w-page', 'ease-spring', 'duration-fast', 'raised', 'pressed', 'stitched', 'stitch-rule', 'signal', 'signal-hover', 'signal-pressed',
    'signal-solid', 'accent-signal', 'action-link', 'tone-error', 'fibre', 'dark:raised', 'game:text-hero', 'compact:p-cell', 'p-6', 'gap-3'];
  const foreign = ['bg-primary', 'text-primary-foreground', 'ring-ring', 'bg-muted', 'border-input', 'bg-background', 'text-foreground', 'bg-destructive',
    'text-sm', 'rounded-md', 'shadow-sm', 'bg-neutral-900', 'text-white', 'font-serif', 'ease-in-out',
    'text-signal', 'bg-signal', 'text-action-primary', 'text-error', 'bg-error'];
  const output = await compile([...felt, ...foreign]);
  for (const utility of felt) assert.ok(generates(output, utility), `${utility} generates CSS`);
  for (const utility of foreign) assert.ok(!generates(output, utility), `${utility} generates nothing`);
  // A root without data-theme follows the system; density variants read the root's attribute.
  assert.match(output, /@media \(prefers-color-scheme: dark\)[\s\S]*:root:not\(\[data-theme\]\)/);
  assert.match(output, /\[data-density="game"\]/);
});

test('every class the components use generates CSS', async () => {
  const {buttonVariants, toggleVariants, badgeVariants, alertVariants, cardVariants, selectTriggerVariants} = await import('../dist/ui.js');
  const classes = new Set();
  const add = list => list.split(/\s+/).forEach(name => name && classes.add(name));
  for (const variant of ['default', 'secondary', 'primary', 'danger', 'ghost', 'link']) for (const size of ['default', 'small', 'icon']) add(buttonVariants({variant, size}));
  for (const tone of ['default', ...tones]) {add(toggleVariants({tone, size: 'small'})); add(badgeVariants({tone}));}
  for (const tone of tones) add(alertVariants({tone}));
  for (const variant of ['default', 'flat']) add(cardVariants({variant}));
  for (const variant of ['field', 'quiet']) for (const size of ['default', 'small']) add(selectTriggerVariants({variant, size}));
  const output = await compile([...classes]);
  const missing = [...classes].filter(name => !generates(output, name));
  assert.deepEqual(missing, [], 'unstyled classes');
});

test('src/ui uses no shadcn colour names and no signal text', async () => {
  const shadcn = /\b(?:bg|text|border|ring|outline|fill|stroke|from|via|to|divide|placeholder|caret|accent|decoration)-(?:primary|secondary|muted|accent|destructive|background|foreground|card|popover|input|ring|border|sidebar|chart)(?:-foreground)?\b/;
  const signalText = /\btext-(?:signal|action|\[[^\]]*(?:signal|action-primary|action-gradient)[^\]]*\])/;
  for (const file of await readdir(join(root, 'src/ui'))) {
    // text-card is Felt's 20px type step; with Tailwind's colours cleared it can't be a colour.
    const source = (await readFile(join(root, 'src/ui', file), 'utf8')).replace(/\btext-card\b/g, '');
    assert.doesNotMatch(source, shadcn, `${file} uses a shadcn colour`);
    assert.doesNotMatch(source, signalText, `${file} colours text with the signal`);
  }
});

test('cn() resolves conflicts within Felt names and keeps different kinds apart', () => {
  assert.equal(cn('text-caption', 'text-ink'), 'text-caption text-ink');
  assert.equal(cn('text-caption', 'text-section'), 'text-section');
  assert.equal(cn('text-ink', 'text-ink-secondary'), 'text-ink-secondary');
  assert.equal(cn('bg-raised', 'bg-inset'), 'bg-inset');
  assert.equal(cn('rounded-pill', 'rounded-control'), 'rounded-control');
  assert.equal(cn('shadow-raised', 'shadow-pressed'), 'shadow-pressed');
  assert.equal(cn('min-h-target', 'min-h-control'), 'min-h-control');
  assert.equal(cn('px-5', 'px-panel'), 'px-panel');
  assert.equal(cn('max-w-measure', 'max-w-page'), 'max-w-page');
  assert.equal(cn('ease-felt', 'ease-spring'), 'ease-spring');
  assert.equal(cn('duration-fast', 'duration-slow'), 'duration-slow');
  assert.equal(cn('raised', 'pressed'), 'pressed');
  assert.equal(cn('signal', 'tone-error'), 'tone-error');
  assert.equal(cn('font-sans', 'font-semibold'), 'font-sans font-semibold');
  assert.equal(cn('px-5', false, null, {'py-2': true, hidden: false}), 'px-5 py-2');
});

test('breakpoints are Felt\'s, and Tailwind\'s are gone', async () => {
  const out = await compile(['xs:flex', 'sm:flex', 'md:flex', 'lg:flex', 'xl:flex', '2xl:flex']);
  for (const [name, value] of Object.entries(breakpoints)) assert.match(css, new RegExp(`--breakpoint-${name}: ${value.replace('.', '\\.')};`));
  for (const value of Object.values(breakpoints)) assert.match(out, new RegExp(`@media \\(width >= ${value.replace('.', '\\.')}\\)`));
  assert.doesNotMatch(out, /96rem/, '2xl generates nothing');
});

test('ds-button and ds-chip compile for plain markup, with the disabled look last', async () => {
  const out = await compile(['ds-button', 'ds-chip']);
  const button = out.slice(out.indexOf('.ds-button {'), out.indexOf('.ds-chip {'));
  for (const selector of ['&[data-variant="primary"]', '&[data-variant="link"]', '&[data-size="icon"]', '&:disabled']) assert.ok(button.includes(selector), selector);
  assert.ok(button.lastIndexOf('&:disabled') > button.lastIndexOf('&[data-variant='), 'disabled follows the variants');
  assert.doesNotMatch(button, /data-disabled/, 'plain buttons use :disabled');
  assert.match(out, /\.ds-chip \{[\s\S]*aria-pressed="true"/);
});
