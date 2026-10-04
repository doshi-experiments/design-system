#!/usr/bin/env node
// Prepare reviewable consumer upgrades from one source release. Never publishes.
import {readFile, writeFile, mkdir, mkdtemp, rm, realpath, lstat} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname, resolve, relative, isAbsolute, basename, sep} from 'node:path';
import {pathToFileURL} from 'node:url';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {readRelease, sourceDirectory, writeRelease} from './sync.mjs';

const execute = promisify(execFile);
const exists = async path => {try {await lstat(path); return true;} catch (error) {if (error.code === 'ENOENT') return false; throw error;}};
const readJSON = async path => JSON.parse(await readFile(path, 'utf8'));
const run = async (command, args, cwd) => {
  try {return await execute(command, args, {cwd, maxBuffer: 8 * 1024 * 1024});}
  catch (error) {throw new Error(`${command} ${args.join(' ')} failed in ${cwd}:\n${error.stderr || error.stdout || error.message}`);}
};
const within = (parent, child) => {const rel = relative(parent, child); return rel === '' || (!rel.startsWith(`..${sep}`) && rel !== '..' && !isAbsolute(rel));};

// Reject absolute paths, traversal, and symlinks that could write outside a repo.
export async function localPath(root, value) {
  if (typeof value !== 'string' || isAbsolute(value)) throw new Error(`Expected a relative path: ${value}`);
  const target = resolve(root, value);
  if (!within(root, target)) throw new Error(`Path escapes its checkout: ${value}`);
  let ancestor = target;
  while (!(await exists(ancestor))) ancestor = dirname(ancestor);
  if (!within(await realpath(root), await realpath(ancestor))) throw new Error(`Symlink escapes its checkout: ${value}`);
  return target;
}

export function compareVersions(left, right) {
  const parse = value => {
    if (!/^\d+\.\d+\.\d+$/.test(value)) throw new Error(`Expected a stable x.y.z release version, got ${value}`);
    return value.split('.').map(Number);
  };
  const a = parse(left), b = parse(right);
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return Math.sign(a[i] - b[i]);
  return 0;
}

export function parseArguments(args) {
  const options = {apply: false, allowDirty: false, offline: false};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--apply') options.apply = true;
    else if (arg === '--allow-dirty') options.allowDirty = true;
    else if (arg === '--offline') options.offline = true;
    else if (arg === '--help' || arg === '-h') options.help = true;
    else if (['--workspace', '--manifest', '--only'].includes(arg)) {
      if (!args[i + 1] || args[i + 1].startsWith('--')) throw new Error(`Missing value for ${arg}`);
      options[arg.slice(2)] = args[++i];
    } else throw new Error(`Unknown option: ${arg}`);
  }
  return options;
}

export async function planRollout(options = {}) {
  const source = resolve(options.source || sourceDirectory);
  const workspace = resolve(options.workspace || process.env.DESIGN_WORKSPACE || resolve(source, '../design-system-rollout'));
  const manifest = await readJSON(resolve(options.manifest || resolve(source, 'rollout.json')));
  const pkg = await readJSON(resolve(source, 'package.json'));
  if (manifest.schemaVersion !== 1 || manifest.packageName !== pkg.name || !Array.isArray(manifest.consumers)) throw new Error('Invalid rollout manifest or package name mismatch.');
  compareVersions(pkg.version, pkg.version);
  const names = manifest.consumers.map(item => item.id);
  if (new Set(names).size !== names.length) throw new Error('Consumer identifiers must be unique.');
  const only = options.only ? options.only.split(',').map(name => name.trim()) : names;
  if (only.some(name => !names.includes(name))) throw new Error(`Unknown consumer: ${only.filter(name => !names.includes(name)).join(', ')}`);
  const plans = [];
  const locations = new Set();
  for (const consumer of manifest.consumers.filter(item => only.includes(item.id))) {
    const root = await localPath(workspace, consumer.directory);
    const actualRoot = await realpath(root);
    if (locations.has(actualRoot)) throw new Error('Two consumers resolve to the same checkout.');
    locations.add(actualRoot);
    const gitRoot = (await run('git', ['rev-parse', '--show-toplevel'], root)).stdout.trim();
    if (await realpath(gitRoot) !== actualRoot) throw new Error(`${consumer.id} is not a checkout root.`);
    const dirty = (await run('git', ['status', '--porcelain', '--untracked-files=all'], root)).stdout.trim();
    if (dirty && !options.allowDirty) throw new Error(`${consumer.id} has local changes. Commit/stash them or explicitly pass --allow-dirty to preserve and update this working tree.`);
    const plan = {...consumer, root, dirty: Boolean(dirty), versions: []};
    if (consumer.snapshot) {
      plan.snapshotPath = await localPath(root, consumer.snapshot);
      const metadata = await readJSON(resolve(plan.snapshotPath, 'release.json'));
      if (metadata.package !== pkg.name) throw new Error(`${consumer.id} snapshot belongs to a different package.`);
      plan.snapshotMetadata = metadata;
      plan.versions.push(metadata.version);
    }
    if (consumer.packageDirectory !== undefined) {
      plan.packagePath = await localPath(root, consumer.packageDirectory);
      plan.packageFile = await localPath(root, relative(root, resolve(plan.packagePath, 'package.json')));
      plan.lockFile = await localPath(root, relative(root, resolve(plan.packagePath, 'package-lock.json')));
      plan.packageJSON = await readJSON(plan.packageFile);
      plan.lockJSON = await readJSON(plan.lockFile);
      if (plan.lockJSON.lockfileVersion < 2 || !plan.lockJSON.packages) throw new Error(`${consumer.id} needs an npm lockfileVersion 2 or 3 lockfile.`);
      const sections = ['dependencies', 'devDependencies'].filter(key => plan.packageJSON[key]?.[pkg.name]);
      if (sections.length !== 1) throw new Error(`${consumer.id} must already depend on ${pkg.name} in exactly one dependency section.`);
      plan.dependencySection = sections[0];
      const dependency = plan.packageJSON[plan.dependencySection][pkg.name];
      if (!dependency.startsWith('file:') || !dependency.endsWith('.tgz')) throw new Error(`${consumer.id} needs a local release tarball dependency.`);
      plan.oldTarball = await localPath(root, relative(root, resolve(plan.packagePath, dependency.slice(5))));
      if (!(await exists(plan.oldTarball))) throw new Error(`${consumer.id} release tarball is missing.`);
      const locked = plan.lockJSON.packages[`node_modules/${pkg.name}`];
      if (!locked?.version || locked.link) throw new Error(`${consumer.id} has no locked release package.`);
      plan.versions.push(locked.version);
      plan.tarballPath = await localPath(root, relative(root, resolve(plan.packagePath, consumer.tarballDirectory || '.', `${pkg.name.replace('@', '').replace('/', '-')}-${pkg.version}.tgz`)));
      plan.references = [];
      for (const filename of consumer.references || []) {
        const path = await localPath(root, filename);
        const original = await readFile(path, 'utf8');
        if (!original.includes(basename(plan.oldTarball))) throw new Error(`${consumer.id}/${filename} no longer refers to the current tarball; update rollout.json.`);
        plan.references.push({path, original});
      }
    }
    if (!plan.versions.length) throw new Error(`${consumer.id} has no update target.`);
    for (const previous of plan.versions) {
      if (compareVersions(pkg.version, previous) < 0) throw new Error(`${consumer.id} is on ${previous}; refusing to downgrade it to ${pkg.version}.`);
    }
    plans.push(plan);
  }
  return {source, workspace, packageName: pkg.name, version: pkg.version, plans};
}

export async function applyRollout(plan, options = {}) {
  const staging = await mkdtemp(resolve(tmpdir(), 'design-system-release-'));
  const backups = new Map();
  const capture = async path => {if (!backups.has(path)) backups.set(path, await exists(path) ? await readFile(path) : null);};
  try {
    await run(process.execPath, ['scripts/build.mjs'], plan.source);
    const release = await readRelease(plan.source);
    const {stdout} = await run('npm', ['pack', '--ignore-scripts', '--json', '--pack-destination', staging], plan.source);
    const packed = JSON.parse(stdout);
    if (packed.length !== 1 || basename(packed[0].filename) !== packed[0].filename || packed[0].version !== plan.version) throw new Error('Unexpected npm pack output.');
    const tarball = await readFile(resolve(staging, packed[0].filename));

    // Validate every consumer and capture exact originals before the first write.
    for (const consumer of plan.plans) {
      if (consumer.snapshotPath) {
        for (const [name, bytes] of release.assets) {
          const target = await localPath(consumer.root, relative(consumer.root, resolve(consumer.snapshotPath, name)));
          if (consumer.snapshotMetadata.version === plan.version && (!(await exists(target)) || !(await readFile(target)).equals(bytes))) {
            throw new Error(`${consumer.id}: version ${plan.version} already exists with different snapshot assets. Bump the shared package version first.`);
          }
          await capture(target);
        }
        await capture(await localPath(consumer.root, relative(consumer.root, resolve(consumer.snapshotPath, 'release.json'))));
      }
      if (consumer.packagePath) {
        if ((await exists(consumer.tarballPath)) && !(await readFile(consumer.tarballPath)).equals(tarball)) throw new Error(`${consumer.id}: version ${plan.version} already exists with a different tarball. Bump the shared package version first.`);
        for (const path of [consumer.packageFile, consumer.lockFile, consumer.oldTarball, consumer.tarballPath, ...consumer.references.map(item => item.path)]) await capture(path);
      }
    }

    for (const consumer of plan.plans) {
      if (consumer.snapshotPath) await writeRelease(consumer.snapshotPath, release);
      if (consumer.packagePath) {
        await mkdir(dirname(consumer.tarballPath), {recursive: true});
        await writeFile(consumer.tarballPath, tarball);
        const pkg = structuredClone(consumer.packageJSON);
        pkg[consumer.dependencySection][plan.packageName] = `file:${relative(consumer.packagePath, consumer.tarballPath).split(sep).join('/')}`;
        await writeFile(consumer.packageFile, JSON.stringify(pkg, null, 2) + '\n');
        await run('npm', ['install', '--package-lock-only', '--ignore-scripts', '--no-audit', '--no-fund', ...(options.offline ? ['--offline'] : [])], consumer.packagePath);
        const lock = await readJSON(consumer.lockFile);
        if (lock.packages?.[`node_modules/${plan.packageName}`]?.version !== plan.version) throw new Error(`${consumer.id}: npm did not lock the requested release.`);
        for (const item of consumer.references) await writeFile(item.path, item.original.replaceAll(basename(consumer.oldTarball), basename(consumer.tarballPath)));
        if (consumer.oldTarball !== consumer.tarballPath) await rm(consumer.oldTarball);
      }
    }
  } catch (error) {
    const failures = [];
    for (const [path, original] of backups) {
      try {
        if (original === null) await rm(path, {force: true});
        else {await mkdir(dirname(path), {recursive: true}); await writeFile(path, original);}
      } catch (restoreError) {failures.push(`${path}: ${restoreError.message}`);}
    }
    if (failures.length) error.message += `\nCould not restore these files; inspect before proceeding:\n${failures.join('\n')}`;
    else if (backups.size) error.message += '\nConsumer files were restored to their original contents.';
    throw error;
  } finally {
    await rm(staging, {recursive: true, force: true});
  }
}

const help = `Usage: npm run rollout -- [--workspace PATH] [--only NAME,NAME] [--apply]

Without --apply, inspect all selected checkouts and print the update plan only.
  --workspace PATH   Parent directory of consumer checkouts (or DESIGN_WORKSPACE).
  --only NAME,NAME   Select consumer identifiers from rollout.json.
  --apply            Build/pack once; sync assets and update dependencies/locks.
  --allow-dirty      Explicitly allow existing consumer working-tree changes.
  --offline          Require cached npm metadata when updating lockfiles.
  --manifest PATH    Use a different rollout manifest.
No commits, pushes, PRs, merges, or deployments are performed.\n`;

export async function main(args = process.argv.slice(2)) {
  const options = parseArguments(args);
  if (options.help) {console.log(help); return;}
  const plan = await planRollout(options);
  console.log(`${options.apply ? 'Preparing' : 'Plan only:'} ${plan.packageName}@${plan.version}`);
  for (const consumer of plan.plans) {
    console.log(`  ${consumer.id}: ${[...new Set(consumer.versions)].join(' / ')} → ${plan.version}${consumer.dirty ? ' (existing local changes)' : ''}`);
    if (consumer.snapshot) console.log(`    snapshot: ${consumer.snapshot}`);
    if (consumer.packagePath) console.log(`    package and lock: ${consumer.packageDirectory}; tarball: ${relative(consumer.root, consumer.tarballPath)}`);
  }
  if (!options.apply) {console.log('No files changed. Add --apply to prepare these upgrades.'); return;}
  await applyRollout(plan, options);
  console.log('Consumer updates prepared. Dependencies in node_modules and deployed apps are unchanged.');
  for (const consumer of plan.plans) console.log(`  ${consumer.id}: review git diff; ${consumer.validation || 'run its normal build and checks before opening a PR.'}`);
  console.log('Commit each complete update (including tarball/deletions), open its PR, and deploy through its normal release process.');
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  main().catch(error => {console.error(error.message); process.exitCode = 1;});
}
