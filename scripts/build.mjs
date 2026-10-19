import {mkdir, writeFile, copyFile, rm} from 'node:fs/promises';
import {resolveTokens, projects, appearances, densities} from '../src/tokens.js';
const out = new URL('../dist/', import.meta.url);
await mkdir(out, {recursive: true});
const declarations = tokens => Object.entries(tokens).map(([key, value]) => `  --ds-${key}: ${value};`).join('\n');
const latin = 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';
const latinExt = 'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF';
const face = (file, range) => `@font-face {font-family:"Host Grotesk";src:url("./fonts/${file}") format("woff2");font-style:normal;font-weight:300 800;font-display:swap;unicode-range:${range};}\n`;
let css = '/* Generated from src/tokens.js. Do not edit. */\n' + face('host-grotesk-latin-ext.woff2', latinExt) + face('host-grotesk-latin.woff2', latin);
css += `:root {\n${declarations(resolveTokens())}\n  font-family:var(--ds-font-body);\n  font-variation-settings:var(--ds-font-body-variation);\n  line-height:var(--ds-line-body);\n}\n`;
// Each combination is explicit so consumers and canvas charts use identical values.
for (const project of Object.keys(projects)) {
  for (const appearance of Object.keys(appearances)) {
    const selector = `:root[data-project="${project}"][data-theme="${appearance}"]`;
    css += `${selector} {\n  color-scheme: ${appearance};\n${declarations(resolveTokens({project, appearance}))}\n}\n`;
    if (appearance === 'light') css += `:root[data-project="${project}"]:not([data-theme]) {\n${declarations(resolveTokens({project}))}\n}\n`;
    else css += `@media (prefers-color-scheme: dark) {\n:root[data-project="${project}"]:not([data-theme]) {\n  color-scheme: dark;\n${declarations(resolveTokens({project, appearance}))}\n}\n}\n`;
  }
}
for (const [density, tokens] of Object.entries(densities)) css += `:root[data-project][data-density="${density}"] {\n${declarations(tokens)}\n}\n`;
css += `@media (prefers-reduced-motion: reduce) { :root { --ds-duration-fast: 0ms; --ds-duration-base: 0ms; --ds-duration-slow: 0ms; } }\n`;
await writeFile(new URL('tokens.css', out), css);
await copyFile(new URL('../src/tokens.js', import.meta.url), new URL('tokens.js', out));
await copyFile(new URL('../src/theme.js', import.meta.url), new URL('theme.js', out));
const themes = {};
for (const project of Object.keys(projects)) for (const appearance of Object.keys(appearances)) themes[`${project}.${appearance}`] = resolveTokens({project, appearance});
await writeFile(new URL('tokens.json', out), JSON.stringify(themes, null, 2) + '\n');
console.log('Built CSS, JavaScript, JSON, and appearance adapter.');
await copyFile(new URL('../src/legacy.css', import.meta.url), new URL('legacy.css', out));
for (const file of ['react.js','table.js','components.css','metadata.js','site.js','site-contract.js','prepaint.js']) await copyFile(new URL(`../src/${file}`, import.meta.url), new URL(file, out));

await mkdir(new URL('fonts/', out), {recursive:true});
for (const file of ['host-grotesk-latin.woff2','host-grotesk-latin-ext.woff2','host-grotesk-OFL.txt','host-grotesk-source.txt']) await copyFile(new URL(`../src/fonts/${file}`, import.meta.url), new URL(`fonts/${file}`, out));
// Earlier releases' fonts never ship again.
for (const file of ['commissioner-variable.woff2','commissioner-OFL.txt','commissioner-source.txt','hanken-grotesk.ttf','hanken-grotesk-OFL.txt']) await rm(new URL(`fonts/${file}`,out),{force:true});
// The felt texture: one small tile, multiplied (light) or overlaid (dark) behind every page.
await mkdir(new URL('felt/', out), {recursive:true});
for (const file of ['fibre-light.svg','fibre-dark.svg']) await copyFile(new URL(`../src/felt/${file}`, import.meta.url), new URL(`felt/${file}`, out));
