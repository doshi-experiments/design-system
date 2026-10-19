import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, writeFile, readFile, readdir, rm, symlink, lstat} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve, dirname, relative} from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {createHash} from 'node:crypto';
import {planRollout, applyRollout, parseArguments, localPath, compareVersions} from '../scripts/rollout.mjs';
import {readRelease, writeRelease} from '../scripts/sync.mjs';

const exec = promisify(execFile);
const packageName = '@doshi-experiments/design-system';
const json = async (path, value) => writeFile(path, JSON.stringify(value, null, 2) + '\n');
async function tree(root) {
  const result = {};
  async function visit(directory) {
    for (const item of await readdir(directory, {withFileTypes: true})) {
      if (item.name === '.git') continue;
      const path = resolve(directory, item.name);
      if (item.isDirectory()) await visit(path);
      else result[relative(root, path)] = createHash('sha256').update(await readFile(path)).digest('hex');
    }
  }
  await visit(root);
  return result;
}
async function fixture(t) {
  const root = await mkdtemp(resolve(tmpdir(), 'ds-rollout-test-'));
  t.after(() => rm(root, {recursive: true, force: true}));
  const source = resolve(root, 'source'), workspace = resolve(root, 'workspace');
  await mkdir(resolve(source, 'scripts'), {recursive: true});
  await mkdir(resolve(source, 'dist/fonts'), {recursive: true});
  await mkdir(resolve(source, 'dist/felt'), {recursive: true});
  await writeFile(resolve(source, 'scripts/build.mjs'), '// Fixture build: assets already generated.\n');
  const pkg = {name: packageName, version: '0.1.0', private: true, files: ['dist']};
  await json(resolve(source, 'package.json'), pkg);
  for (const name of ['components.css', 'tokens.css', 'tokens.js', 'tokens.json', 'theme.js', 'legacy.css', 'metadata.js', 'site.js', 'site-contract.js', 'prepaint.js', 'fonts/host-grotesk-latin.woff2', 'fonts/host-grotesk-latin-ext.woff2', 'fonts/host-grotesk-OFL.txt', 'fonts/host-grotesk-source.txt', 'felt/fibre-light.svg', 'felt/fibre-dark.svg']) await writeFile(resolve(source, 'dist', name), `old ${name}`);
  const snapshotRoot = resolve(workspace, 'static-app');
  const appRoot = resolve(workspace, 'react-app');
  const appPackage = resolve(appRoot, 'ingest/frontend');
  await mkdir(snapshotRoot, {recursive: true});
  await mkdir(resolve(appPackage, 'vendor'), {recursive: true});
  await writeRelease(resolve(snapshotRoot, 'public/design-system'), await readRelease(source));
  const snapshotPath = resolve(snapshotRoot, 'public/design-system');
  const previous = JSON.parse(await readFile(resolve(snapshotPath, 'release.json')));
  for (const name of ['fonts/hanken-grotesk.ttf', 'fonts/hanken-grotesk-OFL.txt']) {
    const bytes = Buffer.from(`old managed ${name}`);
    await writeFile(resolve(snapshotPath, name), bytes);
    previous.files[name] = createHash('sha256').update(bytes).digest('hex');
  }
  await json(resolve(snapshotPath, 'release.json'), previous);
  await writeFile(resolve(snapshotPath, 'fonts/consumer-note.txt'), 'Unmanaged consumer content');
  const {stdout} = await exec('npm', ['pack', '--ignore-scripts', '--json', '--pack-destination', resolve(appPackage, 'vendor')], {cwd: source});
  const packed = JSON.parse(stdout)[0];
  const dependency = `file:vendor/${packed.filename}`;
  const app = {name: 'test-consumer', version: '1.0.0', dependencies: {[packageName]: dependency}};
  await json(resolve(appPackage, 'package.json'), app);
  await json(resolve(appPackage, 'package-lock.json'), {name: app.name, version: app.version, lockfileVersion: 3, requires: true, packages: {'': app, [`node_modules/${packageName}`]: {version: pkg.version, resolved: dependency, integrity: packed.integrity}}});
  await writeFile(resolve(appRoot, 'Dockerfile'), `COPY ingest/frontend/vendor/${packed.filename} /app/vendor/\n`);
  for (const cwd of [snapshotRoot, appRoot]) {
    await exec('git', ['init', '--quiet'], {cwd});
    await exec('git', ['add', '.'], {cwd});
    await exec('git', ['-c', 'user.name=Rollout tests', '-c', 'user.email=tests@example.invalid', 'commit', '--quiet', '-m', 'Fixture'], {cwd});
  }
  pkg.version = '0.2.0';
  await json(resolve(source, 'package.json'), pkg);
  await writeFile(resolve(source, 'dist/components.css'), 'new shared component styles');
  const manifest = {schemaVersion: 1, packageName, consumers: [
    {id: 'static-app', directory: 'static-app', snapshot: 'public/design-system'},
    {id: 'react-app', directory: 'react-app', packageDirectory: 'ingest/frontend', tarballDirectory: 'vendor', references: ['Dockerfile']},
  ]};
  await json(resolve(source, 'rollout.json'), manifest);
  return {source, workspace, snapshotRoot, appRoot, appPackage, manifest, options: {source, workspace}};
}

test('planning is read-only and supports a selected nested React package', async t => {
  const f = await fixture(t);
  const before = await tree(f.workspace);
  const plan = await planRollout({...f.options, only: 'react-app'});
  assert.equal(plan.plans.length, 1);
  assert.equal(plan.plans[0].packagePath, f.appPackage);
  assert.equal(plan.plans[0].versions[0], '0.1.0');
  assert.deepEqual(await tree(f.workspace), before);
  await assert.rejects(planRollout({...f.options, only: 'typo'}), /Unknown consumer/);
});

test('one rollout synchronizes snapshots, nested package locks, tarballs, and Docker references', async t => {
  const f = await fixture(t);
  await applyRollout(await planRollout(f.options), {offline: true});
  const metadata = JSON.parse(await readFile(resolve(f.snapshotRoot, 'public/design-system/release.json')));
  assert.equal(metadata.version, '0.2.0');
  assert.equal(await readFile(resolve(f.snapshotRoot, 'public/design-system/components.css'), 'utf8'), 'new shared component styles');
  for (const name of ['fonts/hanken-grotesk.ttf', 'fonts/hanken-grotesk-OFL.txt']) await assert.rejects(readFile(resolve(f.snapshotRoot, 'public/design-system', name)), {code: 'ENOENT'});
  assert.equal(await readFile(resolve(f.snapshotRoot, 'public/design-system/fonts/consumer-note.txt'), 'utf8'), 'Unmanaged consumer content');
  const packageJSON = JSON.parse(await readFile(resolve(f.appPackage, 'package.json')));
  const lock = JSON.parse(await readFile(resolve(f.appPackage, 'package-lock.json')));
  const expected = 'file:vendor/doshi-experiments-design-system-0.2.0.tgz';
  assert.equal(packageJSON.dependencies[packageName], expected);
  assert.equal(lock.packages[''].dependencies[packageName], expected);
  assert.equal(lock.packages[`node_modules/${packageName}`].version, '0.2.0');
  assert.match(lock.packages[`node_modules/${packageName}`].integrity, /^sha512-/);
  assert.deepEqual(await readdir(resolve(f.appPackage, 'vendor')), ['doshi-experiments-design-system-0.2.0.tgz']);
  assert.match(await readFile(resolve(f.appRoot, 'Dockerfile'), 'utf8'), /0\.2\.0\.tgz/);
  const before = await tree(f.workspace);
  await applyRollout(await planRollout({...f.options, allowDirty: true}), {offline: true});
  assert.deepEqual(await tree(f.workspace), before, 'same release can be reapplied without changing content');
});

test('preflight rejects dirty checkouts and downgrades before any consumer writes', async t => {
  const f = await fixture(t);
  await writeFile(resolve(f.appRoot, 'notes.txt'), 'existing user work');
  const before = await tree(f.workspace);
  await assert.rejects(planRollout(f.options), /has local changes/);
  const plan = await planRollout({...f.options, allowDirty: true});
  assert.equal(plan.plans[1].dirty, true);
  await json(resolve(f.source, 'package.json'), {name: packageName, version: '0.0.9'});
  await assert.rejects(planRollout({...f.options, allowDirty: true}), /refusing to downgrade/);
  assert.deepEqual(await tree(f.workspace), before);
});

test('a failed npm resolution rolls back every consumer, preserving existing local work', async t => {
  const f = await fixture(t);
  const path = resolve(f.appPackage, 'package.json');
  const pkg = JSON.parse(await readFile(path));
  pkg.dependencies.missing = 'file:missing-package.tgz';
  await json(path, pkg);
  const before = await tree(f.workspace);
  await assert.rejects(applyRollout(await planRollout({...f.options, allowDirty: true}), {offline: true}), /Consumer files were restored/);
  assert.deepEqual(await tree(f.workspace), before);
});

test('existing release versions cannot silently acquire changed artifacts', async t => {
  const f = await fixture(t);
  await applyRollout(await planRollout(f.options), {offline: true});
  const before = await tree(f.workspace);
  await writeFile(resolve(f.source, 'dist/components.css'), 'changed without a version bump');
  await assert.rejects(applyRollout(await planRollout({...f.options, allowDirty: true}), {offline: true}), /Bump the shared package version/);
  assert.deepEqual(await tree(f.workspace), before);
  await assert.rejects(applyRollout(await planRollout({...f.options, allowDirty: true, only: 'react-app'}), {offline: true}), /different tarball/);
  assert.deepEqual(await tree(f.workspace), before);
  await writeFile(resolve(f.source, 'dist/components.css'), 'new shared component styles');
  const metadataPath = resolve(f.snapshotRoot, 'public/design-system/release.json');
  const metadata = JSON.parse(await readFile(metadataPath));
  const obsoleteName = 'fonts/retired-at-same-version.txt';
  await writeFile(resolve(f.snapshotRoot, 'public/design-system', obsoleteName), 'same-version artifact');
  metadata.files[obsoleteName] = createHash('sha256').update('same-version artifact').digest('hex');
  await json(metadataPath, metadata);
  const withObsoleteAsset = await tree(f.workspace);
  await assert.rejects(applyRollout(await planRollout({...f.options, allowDirty: true}), {offline: true}), /different snapshot manifest.*Bump the shared package version/);
  assert.deepEqual(await tree(f.workspace), withObsoleteAsset);
});

test('manifest paths reject traversal and escaping symlinks', async t => {
  const f = await fixture(t);
  await assert.rejects(localPath(f.workspace, '../outside'), /escapes/);
  await assert.rejects(localPath(f.workspace, '/tmp'), /relative path/);
  await symlink(f.source, resolve(f.snapshotRoot, 'escape'));
  await assert.rejects(localPath(f.snapshotRoot, 'escape/dist/tokens.css'), /Symlink escapes/);
  f.manifest.consumers[0].directory = '../source';
  await json(resolve(f.source, 'rollout.json'), f.manifest);
  await assert.rejects(planRollout(f.options), /escapes/);
});

test('obsolete snapshot assets reject traversal and symlinks before consumer writes', async t => {
  const f = await fixture(t);
  const metadataPath = resolve(f.snapshotRoot, 'public/design-system/release.json');
  const metadata = JSON.parse(await readFile(metadataPath));
  metadata.files['../outside.txt'] = 'untrusted path';
  await json(metadataPath, metadata);
  let before = await tree(f.workspace);
  await assert.rejects(applyRollout(await planRollout({...f.options, allowDirty: true}), {offline: true}), /escapes its snapshot/);
  assert.deepEqual(await tree(f.workspace), before);
  delete metadata.files['../outside.txt'];
  await symlink(f.source, resolve(f.snapshotRoot, 'public/design-system/escape'));
  metadata.files['escape/package.json'] = 'untrusted symlink';
  await json(metadataPath, metadata);
  // tree() does not follow directory symlinks; capture only the manifest and
  // an application-owned file to confirm validation cannot remove the target.
  const sourceBefore = await readFile(resolve(f.source, 'package.json'));
  const manifestBefore = await readFile(metadataPath);
  await assert.rejects(applyRollout(await planRollout({...f.options, allowDirty: true}), {offline: true}), /symlink escapes its snapshot/);
  assert.deepEqual(await readFile(resolve(f.source, 'package.json')), sourceBefore);
  assert.deepEqual(await readFile(metadataPath), manifestBefore);
  delete metadata.files['escape/package.json'];
  const linkedAsset = resolve(f.snapshotRoot, 'public/design-system/fonts/retired-link.txt');
  await symlink('consumer-note.txt', linkedAsset);
  metadata.files['fonts/retired-link.txt'] = 'internal symlink';
  await json(metadataPath, metadata);
  await assert.rejects(applyRollout(await planRollout({...f.options, allowDirty: true}), {offline: true}), /cannot be a symlink/);
  assert.equal((await lstat(linkedAsset)).isSymbolicLink(), true);
  assert.equal(await readFile(resolve(f.snapshotRoot, 'public/design-system/fonts/consumer-note.txt'), 'utf8'), 'Unmanaged consumer content');
});

test('CLI arguments and version ordering fail clearly', () => {
  assert.deepEqual(parseArguments([]), {apply: false, allowDirty: false, offline: false});
  assert.equal(parseArguments(['--apply', '--allow-dirty', '--offline', '--only', 'finance']).only, 'finance');
  assert.throws(() => parseArguments(['--workspace']), /Missing value/);
  assert.throws(() => parseArguments(['--publish']), /Unknown option/);
  assert.equal(compareVersions('0.10.0', '0.9.0'), 1);
  assert.equal(compareVersions('1.0.0', '1.0.0'), 0);
  assert.throws(() => compareVersions('1.0.0-beta', '1.0.0'), /stable/);
});
