import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, readFile, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {prepaint} from '../dist/vite.js';
import {usage} from '../scripts/ds-usage.mjs';

const script = `<script>${(await readFile(new URL('../dist/prepaint.js', import.meta.url), 'utf8')).trim()}</script>`;
const transform = html => prepaint().transformIndexHtml(html);

test('the Vite plugin inlines prepaint.js after <meta charset>, before any stylesheet', () => {
  const html = transform('<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="./site.css"></head><body></body></html>');
  assert.equal(html, `<!doctype html><html><head><meta charset="utf-8">${script}<link rel="stylesheet" href="./site.css"></head><body></body></html>`);
  assert.ok(html.indexOf(script) < html.indexOf('stylesheet'));
});

test('the Vite plugin honours the marker and a page without <meta charset>', () => {
  assert.equal(transform('<head><!-- Shared appearance prepaint --><style></style></head>'), `<head>${script}<style></style></head>`);
  assert.equal(transform('<html lang="en"><head data-x="1"><title>t</title></head>'), `<html lang="en"><head data-x="1">${script}<title>t</title></head>`);
});

test('the Vite plugin refuses pages where styles would paint first or there is no <head>', () => {
  assert.throws(() => transform('<head><link rel="stylesheet" href="a.css"><meta charset="utf-8"></head>'), /stylesheet comes before/);
  assert.throws(() => transform('<body></body>'), /no <head>/);
});

test('ds-usage counts ds-* classes and /react imports, skipping snapshots and custom properties', async () => {
  const root = await mkdtemp(join(tmpdir(), 'ds-usage-'));
  try {
    await mkdir(join(root, 'src/design-system'), {recursive: true});
    await mkdir(join(root, 'node_modules/x'), {recursive: true});
    await writeFile(join(root, 'index.html'), '<a class="ds-button ds-chip-link" style="color:var(--ds-text)" data-ds-x>Go</a><a class="ds-button">Go</a>');
    await writeFile(join(root, 'src/app.jsx'), "import {Button} from '@doshi-experiments/design-system/react';\nconst c = 'ds-card';");
    await writeFile(join(root, 'src/design-system/components.css'), '.ds-button{}');
    await writeFile(join(root, 'node_modules/x/a.js'), "'ds-card'");
    assert.deepEqual(await usage(root), {classes: {'ds-button': 2, 'ds-chip-link': 1, 'ds-card': 1}, total: 4, reactImports: ['src/app.jsx']});
  } finally {await rm(root, {recursive: true, force: true});}
});
