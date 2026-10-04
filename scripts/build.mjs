import {mkdir, writeFile, copyFile} from 'node:fs/promises';
import {resolveTokens, projects, appearances, densities} from '../src/tokens.js';
const out = new URL('../dist/', import.meta.url);
await mkdir(out, {recursive: true});
const declarations = tokens => Object.entries(tokens).map(([key, value]) => `  --ds-${key}: ${value};`).join('\n');
let css = '/* Generated from src/tokens.js. Do not edit. */\n@font-face {font-family:"Hanken Grotesk";src:url("./fonts/hanken-grotesk.ttf") format("truetype");font-weight:100 900;font-display:swap;}\n';
css += `:root {\n${declarations(resolveTokens())}\n}\n`;
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
for (const file of ['react.js','table.js','components.css','metadata.js']) await copyFile(new URL(`../src/${file}`, import.meta.url), new URL(file, out));

await mkdir(new URL('fonts/', out), {recursive:true});
for (const file of ['hanken-grotesk.ttf','hanken-grotesk-OFL.txt']) await copyFile(new URL(`../src/fonts/${file}`, import.meta.url), new URL(`fonts/${file}`, out));
