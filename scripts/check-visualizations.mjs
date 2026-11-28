import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {mkdir, readFile} from 'node:fs/promises';
import {resolve, extname, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const workspace=process.env.DESIGN_WORKSPACE || fileURLToPath(new URL('../../',import.meta.url)).replace(/\/$/,'');
const root=resolve(workspace,'design-system-rollout/visualizations/dist');
const output=resolve(workspace,'design-system-rollout/screenshots/visualizations');
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.woff2':'font/woff2'};
const server=createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const content=await readFile(file);res.writeHead(200,{'content-type':types[extname(file)]||'application/octet-stream'});res.end(content);
 }catch{res.writeHead(404);res.end();}
});
await new Promise(ready=>server.listen(0,'127.0.0.1',ready));
const url=`http://127.0.0.1:${server.address().port}/`;
let browser;
const results=[];
// The custom properties the exhibits' canvases read: Felt's tokens, plus the exhibit's own cage and line-2.
const inkNames=['--ds-action-primary','cage','--ds-success-text','--ds-text-secondary','line-2','--ds-surface-page','--ds-error-text','--ds-crane'];

async function sharedPaper(page){
 const pixels=await page.evaluate(()=>{
  const reference=document.createElement('canvas');reference.width=reference.height=1;
  const g=reference.getContext('2d');g.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--ds-surface-page').trim();g.fillRect(0,0,1,1);
  const target=[...g.getImageData(0,0,1,1).data];
  const canvases=[...document.querySelectorAll('#stage canvas')];
  const samples=canvases.map(canvas=>{const context=canvas.getContext('2d');return context?[1,28,140].map(x=>[...context.getImageData(x,250,1,1).data]):null;});
  return {target,samples};
 });
 assert.ok(pixels.samples.some(samples=>samples&&samples.every(pixel=>pixel.every((value,i)=>value===pixels.target[i]))),'The opaque drawing surface uses shared paper without a decorative grid');
}
async function waitStats(page,pattern){
 await page.waitForFunction(({source,flags})=>new RegExp(source,flags).test(document.getElementById('tbRows').innerText),{source:pattern.source,flags:pattern.flags},{timeout:10000});
}
try{
 browser=await chromium.launch({args:['--no-sandbox','--enable-unsafe-swiftshader']});
 await mkdir(output,{recursive:true});
 for(const width of[320,390,768,1440])for(const appearance of['light','dark']){
  const page=await browser.newPage({viewport:{width,height:900},colorScheme:appearance,reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(url,{waitUntil:'networkidle'});
  await page.getByLabel('Appearance',{exact:true}).selectOption(appearance);
  const inks=await page.evaluate(names=>{const css=getComputedStyle(document.documentElement);return names.map(name=>({name,value:css.getPropertyValue(name.startsWith('--')?name:'--'+name).trim()}));},inkNames);
  for(const token of inks)assert.ok(token.value&&await page.evaluate(value=>CSS.supports('color',value),token.value),`Valid ${token.name} ink in ${appearance} mode`);
  for(const name of['Growth Cage','Silk','Divergence','Harmonograph']){
   await page.getByRole('tab',{name,exact:true}).click();await page.waitForTimeout(150);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow');
   assert.equal(await page.getByRole('tab',{name,exact:true}).getAttribute('aria-selected'),'true');
   const overlap=await page.evaluate(()=>{const top=document.querySelector('.exhibit-bar').getBoundingClientRect().bottom;return ['panel','titleblock'].some(id=>document.getElementById(id).getBoundingClientRect().top<top);});
   assert.equal(overlap,false,'Local navigation stays above the controls and statistics');
   if(name==='Silk')await sharedPaper(page);
   if(name==='Growth Cage'||name==='Silk')await page.screenshot({path:`${output}/${name.replaceAll(' ','')}-${width}-${appearance}.png`});
   assert.deepEqual(errors,[]);results.push({width,appearance,name});
  }
  await page.close();
 }
 for(const appearance of['light','dark']){
  const page=await browser.newPage({viewport:{width:1100,height:720},colorScheme:appearance,reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(url+'?debug',{waitUntil:'networkidle'});await page.getByLabel('Appearance',{exact:true}).selectOption(appearance);
  await page.getByRole('tab',{name:'Silk',exact:true}).click();await page.waitForTimeout(150);
  const safe=await page.evaluate(async()=>{return window.__e03.safeRect(innerWidth,innerHeight);});
  const x=safe.x+safe.w*.2,y=safe.y+safe.h*.45;
  await page.mouse.move(x,y);await page.mouse.down();
  for(let i=1;i<=25;i++)await page.mouse.move(x+i*7,y+Math.sin(i*.2)*40);
  await page.mouse.up();await waitStats(page,/Strokes\s+1/);await sharedPaper(page);
  await page.screenshot({path:`${output}/Silk-drawn-${appearance}.png`});
  await page.getByLabel('Appearance',{exact:true}).selectOption(appearance==='light'?'dark':'light');
  await waitStats(page,/Strokes\s+1/);await sharedPaper(page);
  await page.getByLabel('Appearance',{exact:true}).selectOption(appearance);
  await page.getByRole('tab',{name:'Growth Cage',exact:true}).click();await page.waitForTimeout(150);
  await page.getByLabel('Render',{exact:true}).selectOption('metaball');
  const cage=await page.evaluate(async()=>{return window.__e03.safeRect(innerWidth,innerHeight);});
  await page.mouse.click(cage.x+cage.w/2,cage.y+cage.h/2);await waitStats(page,/Balls\s+[1-9]/);
  await page.screenshot({path:`${output}/GrowthCage-metaball-${appearance}.png`});
  await page.getByLabel('Render',{exact:true}).selectOption('glow');await page.waitForTimeout(250);
  await page.screenshot({path:`${output}/GrowthCage-glow-${appearance}.png`});
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log(`${results.length} visualization checks passed: responsive routes, valid canvas inks, plain shared paper, real drawing, preserved strokes and renderer styles`);
}finally{
 if(browser)await browser.close();
 await new Promise(done=>server.close(done));
}
