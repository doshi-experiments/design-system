// Copy immutable release assets into a consumer. Run from the shared source;
// deployments have no runtime dependency on another repository or CDN.
import {readFile, mkdir, copyFile, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
const destination = process.argv[2];
if (!destination) throw new Error('Usage: node scripts/sync.mjs /path/to/consumer/design-system');
await mkdir(destination, {recursive:true});
const {version} = JSON.parse(await readFile(new URL('../package.json', import.meta.url)));
await mkdir(resolve(destination, 'fonts'), {recursive:true});
const files = {};
for (const file of ['components.css','tokens.css','tokens.js','tokens.json','theme.js','legacy.css','metadata.js','fonts/hanken-grotesk.ttf','fonts/hanken-grotesk-OFL.txt']) {
  const src = new URL(`../dist/${file}`, import.meta.url);
  const bytes = await readFile(src);
  await copyFile(src, resolve(destination, file));
  files[file] = createHash('sha256').update(bytes).digest('hex');
}
await writeFile(resolve(destination, 'release.json'), JSON.stringify({package:'@doshi-experiments/design-system',version,files}, null, 2)+'\n');
console.log(`Synced ${version} to ${destination}`);
