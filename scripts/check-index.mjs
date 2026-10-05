import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
const workspace = process.env.DESIGN_WORKSPACE || fileURLToPath(new URL('../../', import.meta.url)).replace(/\/$/, '');
const server=spawn('python3',['-m','http.server','4196','--bind','127.0.0.1','--directory',`${workspace}/design-system-rollout/experiments-landing/public`],{stdio:'ignore'});
const browser=await chromium.launch({args:['--no-sandbox']});
await mkdir(`${workspace}/design-system-rollout/screenshots`,{recursive:true});
try {
 const page=await browser.newPage({reducedMotion:'reduce'});
 for(const width of [320,390,768,1440]) for(const appearance of ['light','dark']) {
  await page.setViewportSize({width,height:900});
  await page.goto('http://127.0.0.1:4196/#E-04',{waitUntil:'networkidle'});
  await page.getByLabel('Appearance',{exact:true}).selectOption(appearance);
  assert.equal(await page.locator('.project').count(),3);
  assert.ok(await page.locator('#mr-shake').isVisible());
  const gamePosition=await page.locator('#mr-shake').boundingBox();
  assert.ok(gamePosition.y<900 && gamePosition.y+gamePosition.height>0,'Previously shared game anchor remains reachable');
  for(const details of await page.locator('.project-parts').all()) {
   const summary=details.locator('summary');
   if(await details.evaluate(e=>e.open)) await summary.click();
   assert.equal(await details.locator('a').first().isVisible(),false,'Closed subpages are hidden');
   await summary.focus();
   await page.keyboard.press('Enter');
   assert.equal(await details.evaluate(e=>e.open),true);
   assert.equal(await details.locator('a').first().isVisible(),true);
   await page.keyboard.press('Tab');
   assert.equal(await details.locator('a').first().evaluate(e=>e===document.activeElement),true);
   await summary.focus(); await page.keyboard.press('Enter');
   assert.equal(await details.evaluate(e=>e.open),false);
  }
  assert.equal(await page.locator('a a').count(),0);
  for(const project of await page.locator('.project').all()) {
   const overlaps=await project.evaluate(e=>{
    const a=e.querySelector('.project-main').getBoundingClientRect();
    const b=e.querySelector('.project-action').getBoundingClientRect();
    return a.left<b.right && a.right>b.left && a.top<b.bottom && a.bottom>b.top;
   });
   assert.equal(overlaps,false,'Project descriptions and actions must not overlap');
  }
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:`${workspace}/design-system-rollout/screenshots/experiments-${width}-${appearance}.png`,fullPage:true});
 }
 const noScript=await browser.newPage({javaScriptEnabled:false});
 await noScript.goto('http://127.0.0.1:4196/');
 assert.equal(await noScript.locator('.project-action').count(),3,'All projects remain accessible without JavaScript');
 await noScript.close();
 console.log('8 index checks passed: direct projects, legacy anchors, native keyboard disclosures, layout and overflow');
} finally {await browser.close();server.kill();}
