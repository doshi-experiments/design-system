import {fileURLToPath} from 'node:url';
const workspace = process.env.DESIGN_WORKSPACE || fileURLToPath(new URL('../../', import.meta.url)).replace(/\/$/, '');
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir, writeFile} from 'node:fs/promises';
const sites = [
 ['preview',`${workspace}/design-system`,'/preview/'],
 ['portfolio',`${workspace}/design-system-rollout/portfolio-landing`,'/'],
 ['experiments',`${workspace}/design-system-rollout/experiments-landing/public`,'/'],
 ['visualizations',`${workspace}/design-system-rollout/visualizations/public`,'/'],
 ['calculator',`${workspace}/design-system-rollout/rent-vs-buy-calculator/dist`,'/'],
 ['game',`${workspace}/design-system-rollout/mr-shake/dist`,'/'],
];
const servers=sites.map(([,dir],i)=>spawn('python3',['-m','http.server',String(4180+i),'--bind','127.0.0.1','--directory',dir],{stdio:'ignore'}));
const browser = await chromium.launch({headless:true,args:['--no-sandbox']});
const results=[];
await mkdir(`${workspace}/design-system-rollout/screenshots`,{recursive:true});
try {
for (const [i,[name,,path]] of sites.entries()) {
  const page=await browser.newPage({reducedMotion:'reduce'}); const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  for (const width of [320,390,768,1440]) for (const appearance of ['light','dark']) {
    await page.setViewportSize({width,height:900});
    await page.goto(`http://127.0.0.1:${4180+i}${path}`,{waitUntil:'networkidle'});
    const control = page.getByLabel('Appearance', {exact:true});
    if (await control.count()) await control.selectOption(appearance);
    else await page.evaluate(t=>{document.documentElement.dataset.theme=t;},appearance);
    await page.evaluate(async()=>{await document.fonts.load('16px "Host Grotesk"'); await document.fonts.ready;});
    await page.waitForTimeout(100);
    const data=await page.evaluate(()=>({
      overflow:document.documentElement.scrollWidth>innerWidth,
      bg:getComputedStyle(document.documentElement).getPropertyValue('--ds-surface-page').trim(),
      font:document.fonts.check('16px "Host Grotesk"'),
      shortButtons:[...document.querySelectorAll('button')].filter(e=>e.getBoundingClientRect().width>0 && e.getBoundingClientRect().height<59.5).map(e=>({text:e.textContent.slice(0,30),height:e.getBoundingClientRect().height})),
    }));
    results.push({name,width,appearance,...data,errors:[...errors]});
    if(width===390 || width===1440) await page.screenshot({path:`${workspace}/design-system-rollout/screenshots/${name}-${width}-${appearance}.png`,fullPage:true});
  }
  await page.close();
}
await writeFile(`${workspace}/design-system-rollout/browser-checks.json`,JSON.stringify(results,null,2));
for (const r of results) {
 assert.equal(r.overflow, false, `${r.name}/${r.width}: overflow`);
 assert.deepEqual(r.errors, []);
 assert.equal(r.font,true,`${r.name}: Host Grotesk must load`);
 assert.equal(r.bg.toLowerCase(),r.appearance==='dark'?'#33322f':'#e7e4de',`${r.name}: felt page palette`);
 if(r.name === 'game') assert.deepEqual(r.shortButtons, []);
}
console.log(`${results.length} browser layout/appearance checks passed`);
} finally {await browser.close(); servers.forEach(s=>s.kill());}
await import('./check-visualizations.mjs');
