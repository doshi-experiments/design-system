#!/usr/bin/env node
// Counts what each consumer still uses from the pre-Tailwind system: ds-* classes and
// imports of /react. Every migration PR reports its counts, and 1.0.0 removes the old
// classes only once every consumer reads zero (--fail-on-any).
//   node scripts/ds-usage.mjs [--workspace DIR] [--only a,b] [--fail-on-any] [--json] [checkout ...]
// Given checkouts, it scans those; otherwise it scans rollout.json's consumers in the workspace.
import {readFile, readdir} from 'node:fs/promises';
import {join, relative, resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {sourceDirectory} from './sync.mjs';

// Snapshots, archives, vendored and built files are not the app's own source.
const skipped = new Set(['.git', 'node_modules', 'dist', 'vendor', 'versions', 'design-system', 'test-results', '.wrangler', 'build']);
const extensions = /\.(?:html|jsx?|mjs|css|tsx?)$/;
const classPattern = /(?<![\w-])ds-[a-z][\w-]*/g;
const reactPattern = /design-system\/react(?:\.js)?['"]/g;

async function* files(directory) {
  for (const entry of await readdir(directory, {withFileTypes: true})) {
    if (entry.isDirectory()) {if (!skipped.has(entry.name) && !entry.name.startsWith('.')) yield* files(join(directory, entry.name));}
    else if (extensions.test(entry.name)) yield join(directory, entry.name);
  }
}

export async function usage(root) {
  const classes = {}, imports = [];
  for await (const file of files(root)) {
    const source = await readFile(file, 'utf8');
    for (const [name] of source.matchAll(classPattern)) classes[name] = (classes[name] || 0) + 1;
    if (source.match(reactPattern)) imports.push(relative(root, file));
  }
  const total = Object.values(classes).reduce((sum, count) => sum + count, 0);
  return {classes: Object.fromEntries(Object.entries(classes).sort(([, a], [, b]) => b - a)), total, reactImports: imports.sort()};
}

export async function main(args = process.argv.slice(2)) {
  const options = {failOnAny: false, json: false, paths: []};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--fail-on-any') options.failOnAny = true;
    else if (args[i] === '--json') options.json = true;
    else if (args[i] === '--workspace' || args[i] === '--only') options[args[i].slice(2)] = args[++i];
    else options.paths.push(args[i]);
  }
  let targets = options.paths.map(path => ({id: path, root: resolve(path)}));
  if (!targets.length) {
    const workspace = resolve(options.workspace || process.env.DESIGN_WORKSPACE || resolve(sourceDirectory, '../design-system-rollout'));
    const {consumers} = JSON.parse(await readFile(resolve(sourceDirectory, 'rollout.json'), 'utf8'));
    const only = options.only?.split(',');
    targets = consumers.filter(item => !only || only.includes(item.id)).map(item => ({id: item.id, root: resolve(workspace, item.directory)}));
  }
  const report = {};
  for (const {id, root} of targets) report[id] = await usage(root);
  if (options.json) console.log(JSON.stringify(report, null, 2));
  else for (const [id, {classes, total, reactImports}] of Object.entries(report)) {
    console.log(`${id}: ${total} ds-* class uses (${Object.keys(classes).length} distinct), ${reactImports.length} files import /react`);
    for (const [name, count] of Object.entries(classes)) console.log(`  ${name} ${count}`);
    for (const file of reactImports) console.log(`  /react: ${file}`);
  }
  if (options.failOnAny && Object.values(report).some(item => item.total || item.reactImports.length)) process.exitCode = 1;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  main().catch(error => {console.error(error.message); process.exitCode = 1;});
}
