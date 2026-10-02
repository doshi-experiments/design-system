import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
const workspace = process.env.DESIGN_WORKSPACE || fileURLToPath(new URL('../../', import.meta.url)).replace(/\/$/, '');
const server=spawn('python3',['-m','http.server','4196','--bind','127.0.0.1','--directory',`${workspace}/design-system-rollout/experiments-landing/public`],{stdio:'ignore'});
const browser=await chromium.launch({args:['--no-sandbox']});
try {
 const page=await browser.newPage({reducedMotion:'reduce'});
 for(const width of [320,390,640,1280]) for(const appearance of ['light','dark']) {
  await page.setViewportSize({width,height:900});
  await page.goto('http://127.0.0.1:4196/#E-04',{waitUntil:'networkidle'});
  await page.evaluate(t=>document.documentElement.dataset.theme=t,appearance);
  assert.equal(await page.locator('#E-04 .ds-disclosure-trigger').getAttribute('aria-expanded'),'true');
  for(const trigger of await page.locator('.ds-disclosure-trigger').all()) {
   await trigger.focus();
   if(await trigger.getAttribute('aria-expanded')==='true') await page.keyboard.press('Enter');
   const id=await trigger.getAttribute('aria-controls');
   assert.equal(await page.locator(`[id="${id}"]`).evaluate(e=>e.inert),true);
   await page.keyboard.press('Enter');
   assert.equal(await trigger.getAttribute('aria-expanded'),'true');
   assert.equal(await page.locator(`[id="${id}"]`).evaluate(e=>e.inert),false);
   const overlap=await trigger.evaluate(e=>{
    const name=e.querySelector('.s-name').getBoundingClientRect();
    const meta=e.querySelector('.s-meta').getBoundingClientRect();
    return name.left<meta.right && name.right>meta.left && name.top<meta.bottom && name.bottom>meta.top;
   });
   assert.equal(overlap,false,'Section name and count must not overlap');
  }
  assert.equal(await page.locator('a a').count(),0);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:`${workspace}/design-system-rollout/screenshots/experiments-${width}-${appearance}.png`,fullPage:true});
 }
 console.log('8 index checks passed: hash, keyboard disclosure, inert content, heading layout and overflow');
} finally {await browser.close();server.kill();}
