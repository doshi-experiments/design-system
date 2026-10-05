// Copy immutable release assets into a consumer. Deployments have no runtime
// dependency on another repository or CDN. Rollout uses this same asset contract.
import {readFile, mkdir, writeFile, rm, lstat, realpath} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname, resolve, relative, isAbsolute, sep} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

export const sourceDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const assetNames = ['components.css', 'tokens.css', 'tokens.js', 'tokens.json', 'theme.js', 'legacy.css', 'metadata.js', 'site.js', 'site-contract.js', 'prepaint.js', 'fonts/commissioner-variable.woff2', 'fonts/commissioner-OFL.txt', 'fonts/commissioner-source.txt'];

export async function readRelease(directory = sourceDirectory) {
  const {name, version} = JSON.parse(await readFile(resolve(directory, 'package.json'), 'utf8'));
  const assets = new Map();
  const files = {};
  for (const file of assetNames) {
    const bytes = await readFile(resolve(directory, 'dist', file));
    assets.set(file, bytes);
    files[file] = createHash('sha256').update(bytes).digest('hex');
  }
  return {name, version, assets, metadata: {package: name, version, files}};
}

// Only a prior release manifest can mark a file for removal. Never sweep a
// snapshot directory: consumer-owned files and unregistered assets stay intact.
export async function obsoleteAssetPaths(destination, release, previous) {
  if (previous === undefined) {
    try {previous = JSON.parse(await readFile(resolve(destination, 'release.json'), 'utf8'));}
    catch (error) {if (error.code === 'ENOENT') return []; throw error;}
  }
  if (previous.package !== release.name || !previous.files || typeof previous.files !== 'object' || Array.isArray(previous.files)) throw new Error('Invalid previous snapshot manifest.');
  const root = resolve(destination);
  const within = target => {const path = relative(root, target); return path !== '' && path !== '..' && !path.startsWith(`..${sep}`) && !isAbsolute(path);};
  const result = [];
  for (const name of Object.keys(previous.files).filter(name => !release.assets.has(name))) {
    if (!name || isAbsolute(name)) throw new Error(`Managed asset escapes its snapshot: ${name}`);
    const target = resolve(root, name);
    if (!within(target)) throw new Error(`Managed asset escapes its snapshot: ${name}`);
    let ancestor = target;
    while (true) {
      try {await lstat(ancestor); break;}
      catch (error) {if (error.code !== 'ENOENT') throw error; ancestor = dirname(ancestor);}
    }
    const actualRoot = await realpath(root), actualAncestor = await realpath(ancestor);
    const path = relative(actualRoot, actualAncestor);
    if (path === '..' || path.startsWith(`..${sep}`) || isAbsolute(path)) throw new Error(`Managed asset symlink escapes its snapshot: ${name}`);
    if (ancestor === target && (await lstat(target)).isSymbolicLink()) throw new Error(`Managed asset cannot be a symlink: ${name}`);
    result.push(target);
  }
  return result;
}

export async function writeRelease(destination, release, previous) {
  const obsolete = await obsoleteAssetPaths(destination, release, previous);
  for (const [name, bytes] of release.assets) {
    const target = resolve(destination, name);
    await mkdir(dirname(target), {recursive: true});
    await writeFile(target, bytes);
  }
  for (const target of obsolete) await rm(target, {force: true});
  await writeFile(resolve(destination, 'release.json'), JSON.stringify(release.metadata, null, 2) + '\n');
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const destination = process.argv[2];
  if (!destination) throw new Error('Usage: node scripts/sync.mjs /path/to/consumer/design-system');
  const release = await readRelease();
  await writeRelease(destination, release);
  console.log(`Synced ${release.version} to ${destination}`);
}
