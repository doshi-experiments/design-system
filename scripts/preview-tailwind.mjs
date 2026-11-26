// Builds the 0.10 comparison preview into a folder: the Tailwind CSS a consumer would compile
// from dist/tailwind.css (with components.css in a layer, as during the migration) and the
// React bundle for preview/tailwind-app.jsx. `npm run preview` writes preview/build/;
// scripts/check-tailwind.mjs writes to a temporary folder.
import {execFile} from 'node:child_process';
import {cp, mkdir, realpath, writeFile} from 'node:fs/promises';
import {join, relative} from 'node:path';
import {promisify} from 'node:util';
import {build} from 'esbuild';

const root = new URL('../', import.meta.url).pathname;
const dist = join(root, 'dist');

export async function buildTailwindPreview(folder) {
  await mkdir(folder, {recursive: true});
  // Tailwind resolves @source from the stylesheet's real path, and macOS's temporary folder sits
  // behind a symlink (/var is /private/var), so paths are made relative to the real folder.
  const out = await realpath(folder);
  // source(none): the only classes are the ones dist/tailwind.css's @source finds in ui.js,
  // which is what proves a consumer needs no config for the shared components.
  const input = join(out, 'input.css');
  await writeFile(input, `@import "${relative(out, join(root, 'node_modules/tailwindcss/index.css'))}" source(none);
@import "${relative(out, join(dist, 'tailwind.css'))}";
@import "${relative(out, join(dist, 'components.css'))}" layer(components);
`);
  await promisify(execFile)(join(root, 'node_modules/.bin/tailwindcss'), ['-i', input, '-o', join(out, 'tailwind.css')]);
  // A page without React or components.css: Tailwind and Felt only, with the ds-button utility its
  // markup names. In tailwind.css above, components.css styles that column instead.
  const html = join(out, 'html-input.css');
  await writeFile(html, `@import "${relative(out, join(root, 'node_modules/tailwindcss/index.css'))}" source(none);
@import "${relative(out, join(dist, 'tailwind.css'))}";
@source inline("ds-button ds-chip");
`);
  await promisify(execFile)(join(root, 'node_modules/.bin/tailwindcss'), ['-i', html, '-o', join(out, 'tailwind-html.css')]);
  // The /ui page for scripts/check-ui.mjs: Tailwind and Felt only, plus the classes its cases write.
  const ui = join(out, 'ui-input.css');
  await writeFile(ui, `@import "${relative(out, join(root, 'node_modules/tailwindcss/index.css'))}" source(none);
@import "${relative(out, join(dist, 'tailwind.css'))}";
@source "${relative(out, join(root, 'preview/ui-parity.jsx'))}";
`);
  await promisify(execFile)(join(root, 'node_modules/.bin/tailwindcss'), ['-i', ui, '-o', join(out, 'ui-html.css')]);
  // The Tailwind CLI keeps url()s as written, so the fonts and the fibre sit beside the CSS.
  for (const folder of ['fonts', 'felt']) await cp(join(dist, folder), join(out, folder), {recursive: true});
  await build({absWorkingDir: root, entryPoints: [join(root, 'preview/tailwind-app.jsx')], outfile: join(out, 'tailwind-app.js'),
    bundle: true, minify: true, format: 'esm', jsx: 'automatic', define: {'process.env.NODE_ENV': '"production"'}, logLevel: 'warning'});
  // The 0.11 components beside the /react ones they replace, for scripts/check-ui.mjs.
  await build({absWorkingDir: root, entryPoints: [join(root, 'preview/ui-parity.jsx')], outfile: join(out, 'ui-parity.js'),
    bundle: true, minify: true, format: 'esm', jsx: 'automatic', define: {'process.env.NODE_ENV': '"production"'}, logLevel: 'warning'});
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await buildTailwindPreview(join(root, 'preview/build'));
  console.log('Built preview/build for preview/tailwind.html.');
}
