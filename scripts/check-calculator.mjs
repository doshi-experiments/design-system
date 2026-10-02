import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const workspace=process.env.DESIGN_WORKSPACE || fileURLToPath(new URL('../../',import.meta.url)).replace(/\/$/,'');
const root=`${workspace}/design-system-rollout/rent-vs-buy-calculator`;
const {routes}=JSON.parse(await readFile(`${root}/src/routes.json`));
const output=`${workspace}/design-system-rollout/calculator-review`;
await mkdir(output,{recursive:true});
const server=spawn('python3',['-m','http.server','4195','--bind','127.0.0.1','--directory',`${root}/dist`],{stdio:'ignore'});
let browser;
const results=[];
try {
 browser=await chromium.launch({args:['--no-sandbox']});
 for(const width of [320,390,1440]) for(const appearance of ['light','dark']) {
  const context=await browser.newContext({viewport:{width,height:1000},colorScheme:appearance,reducedMotion:'reduce',serviceWorkers:'block'});
  for(const route of routes) {
   const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(`http://127.0.0.1:4195${route.path}`,{waitUntil:'networkidle'});
   assert.equal(await page.locator('h1').textContent(),route.h1);
   const data=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,
     cards:document.querySelectorAll('.ds-card').length,fields:document.querySelectorAll('.ds-field').length,
     sliders:document.querySelectorAll('.ds-slider').length,metrics:document.querySelectorAll('.ds-metric').length,
     bg:getComputedStyle(document.documentElement).getPropertyValue('--ds-surface-page').trim()}));
   results.push({route:route.path,appearance,...data,errors});
   if(appearance==='light' && width!==320) await page.screenshot({path:`${output}/${route.id}-${width}.png`});
   await page.close();
  }
  await context.close();
 }
 await writeFile(`${output}/checks.json`,JSON.stringify(results,null,2));
 for(const result of results) {
  assert.deepEqual(result.errors,[],`${result.route}: runtime errors`);
  assert.ok(result.scrollWidth<=result.width,`${result.route}/${result.width}/${result.appearance}: overflow ${result.scrollWidth}`);
  assert.ok(result.cards>0 && result.fields>0,`${result.route}: shared components missing`);
 }
 console.log(`${results.length} calculator route/viewport/appearance checks passed`);
}finally{await browser?.close();server.kill();}
