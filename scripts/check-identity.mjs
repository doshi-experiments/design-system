import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const workspace=process.env.DESIGN_WORKSPACE || fileURLToPath(new URL('../../',import.meta.url)).replace(/\/$/,'');
const sites=[
 ['portfolio','portfolio-landing',''],
 ['experiments','experiments-landing','dist'],
 ['visualizations','visualizations','dist'],
 ['calculator','rent-vs-buy-calculator','dist'],
 ['game','mr-shake','dist'],
];
const servers=sites.map(([,repo,dir],i)=>spawn('python3',['-m','http.server',String(4210+i),'--bind','127.0.0.1','--directory',`${workspace}/design-system-rollout/${repo}/${dir}`],{stdio:'ignore'}));
// The portfolio's home and case studies are hand-built and carry no shared header; the
// version timeline is the portfolio page that loads the design system.
const targets=sites.map(([name],i)=>[name,`http://127.0.0.1:${4210+i}/${name==='portfolio'?'versions/':''}`]);
targets.push(['finance',process.env.FINANCE_PREVIEW_URL || 'http://127.0.0.1:8513/']);
const output=`${workspace}/design-system-rollout/identity-review`;
await mkdir(output,{recursive:true});
const browser=await chromium.launch({args:['--no-sandbox']});
const results=[];
try {
 for(const [name,url] of targets) {
  const context=await browser.newContext({viewport:{width:1440,height:1000},colorScheme:'light',reducedMotion:'reduce',serviceWorkers:'block'});
  const page=await context.newPage();const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(url,{waitUntil:'networkidle'});
  if(name==='finance')await page.getByText('Synthetic preview',{exact:true}).waitFor();
  const appearance=page.getByLabel('Appearance',{exact:true});await appearance.waitFor();
  assert.equal(await appearance.evaluate(e=>e.tagName),'SELECT','Appearance uses a labeled, ordinary choice');
  assert.deepEqual(await appearance.locator('option').allTextContents(),['System','Light','Dark']);
  const nav=page.getByRole('navigation',{name:'Global navigation',exact:true});
  for(const [label,href] of [['Home','https://rishabhdoshi.com/'],['Experiments','https://experiments.rishabhdoshi.com/']]) {
   const link=nav.getByRole('link',{name:label,exact:true});
   assert.equal(await link.getAttribute('href'),href);
   assert.equal(await link.isVisible(),true);
   await link.focus();assert.equal(await link.evaluate(e=>e===document.activeElement),true);
  }
  await appearance.selectOption('system');
  await page.emulateMedia({colorScheme:'dark'});
  await page.waitForFunction(()=>document.documentElement.dataset.theme==='dark');
  assert.equal(await appearance.inputValue(),'system');
  await page.reload({waitUntil:'networkidle'});
  assert.equal(await appearance.inputValue(),'system');
  assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
  await appearance.selectOption('light');
  await page.emulateMedia({colorScheme:'light'});await page.emulateMedia({colorScheme:'dark'});
  assert.equal(await page.locator('html').getAttribute('data-theme'),'light','Explicit choice survives operating-system changes');
  await page.reload({waitUntil:'networkidle'});
  assert.equal(await appearance.inputValue(),'light');
  assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
  for(const width of [320,390,768,1440])for(const mode of ['light','dark']) {
   await page.setViewportSize({width,height:1000});await appearance.selectOption(mode);
   await page.evaluate(async()=>{await document.fonts.load('16px "Host Grotesk"');await document.fonts.ready;window.scrollTo(0,0);getSelection().removeAllRanges();});
   const heading=page.locator('h1').first();await heading.scrollIntoViewIfNeeded();
   const rect=await heading.evaluate(element=>{
    const walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT);
    let node;while((node=walker.nextNode())&&!node.textContent.trim()){}
    const range=document.createRange();range.setStart(node,0);range.setEnd(node,Math.min(7,node.length));
    const r=range.getBoundingClientRect();return {x:r.left+1,y:r.top+r.height/2,end:r.right-1};
   });
   await page.mouse.move(rect.x,rect.y);await page.mouse.down();await page.mouse.move(rect.end,rect.y,{steps:12});await page.mouse.up();
   assert.ok((await page.evaluate(()=>getSelection().toString())).trim().length>2,`${name}/${width}/${mode}: genuine drag selects text`);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${name}/${width}/${mode}: horizontal overflow`);
   assert.equal(await nav.getByRole('link',{name:'Home',exact:true}).isVisible(),true);
   assert.equal(await appearance.isVisible(),true);
   const headerOverlap=await nav.evaluate(element=>{
    const a=element.getBoundingClientRect(),b=element.closest('.ds-site-header').querySelector('.ds-appearance').getBoundingClientRect();
    return a.left<b.right && a.right>b.left && a.top<b.bottom && a.bottom>b.top;
   });
   assert.equal(headerOverlap,false,`${name}/${width}/${mode}: navigation must not overlap appearance`);
   if(width===390 || width===1440)await page.screenshot({path:`${output}/${name}-${width}-${mode}.png`,fullPage:true});
   results.push({name,width,appearance:mode,selection:true,navigation:true});
  }
  assert.deepEqual(errors,[],`${name}: browser errors`);
  await context.close();
 }
 await writeFile(`${output}/checks.json`,JSON.stringify(results,null,2));
 console.log(`${results.length} identity checks passed: visible navigation, labeled appearance, System behavior, persistence and mouse-drag selection`);
}finally{await browser.close();servers.forEach(server=>server.kill());}
