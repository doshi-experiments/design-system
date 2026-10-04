// Copy immutable release assets into a consumer. Deployments have no runtime
// dependency on another repository or CDN. Rollout uses this same asset contract.
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname, resolve} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

export const sourceDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const assetNames = ['components.css', 'tokens.css', 'tokens.js', 'tokens.json', 'theme.js', 'legacy.css', 'metadata.js', 'fonts/hanken-grotesk.ttf', 'fonts/hanken-grotesk-OFL.txt'];

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

export async function writeRelease(destination, release) {
  for (const [name, bytes] of release.assets) {
    const target = resolve(destination, name);
    await mkdir(dirname(target), {recursive: true});
    await writeFile(target, bytes);
  }
  await writeFile(resolve(destination, 'release.json'), JSON.stringify(release.metadata, null, 2) + '\n');
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const destination = process.argv[2];
  if (!destination) throw new Error('Usage: node scripts/sync.mjs /path/to/consumer/design-system');
  const release = await readRelease();
  await writeRelease(destination, release);
  console.log(`Synced ${release.version} to ${destination}`);
}
