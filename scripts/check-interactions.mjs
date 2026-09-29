import {fileURLToPath} from 'node:url';
const workspace = process.env.DESIGN_WORKSPACE || fileURLToPath(new URL('../../', import.meta.url)).replace(/\/$/, '');
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
const sites=[['game','mr-shake'],['calculator','rent-vs-buy-calculator']];
const servers=sites.map(([,repo],i)=>spawn('python3',['-m','http.server',String(4190+i),'--bind','127.0.0.1','--directory',`${workspace}/design-system-rollout/${repo}/dist`],{stdio:'ignore'}));
const browser=await chromium.launch({args:['--no-sandbox']});
try {
 for(const [i,[name]] of sites.entries()) {
  const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await page.goto(`http://127.0.0.1:${4190+i}`,{waitUntil:'networkidle'});
  const before=await page.locator('html').getAttribute('data-theme');
  await page.getByRole('switch').click();
  const after=await page.locator('html').getAttribute('data-theme');assert.notEqual(before,after);
  await page.reload({waitUntil:'networkidle'});assert.equal(await page.locator('html').getAttribute('data-theme'),after);
  const meta=await page.locator('meta[name="theme-color"]').getAttribute('content');assert.equal(meta,after==='dark'?'#131521':'#f6f7fb');
  if(name==='game') {
   await page.getByLabel('Name of player 1',{exact:true}).fill('Alex');
   await page.getByRole('button',{name:'Deal the words',exact:true}).click();
   await page.waitForTimeout(600);
   assert.equal(await page.getByRole('button',{name:'Deal the words',exact:true}).count(),0);
   assert.ok((await page.locator('body').innerText()).includes('Alex'));
  } else {
   const help = page.locator('.ds-help').first();
   await help.focus();
   await page.locator('.ds-popover').waitFor({state:'visible'});
   await page.keyboard.press('Escape');
   await page.locator('.ds-popover').waitFor({state:'hidden'});
   await help.click();
   await page.locator('.ds-popover').waitFor({state:'visible'});
   const rect = await page.locator('.ds-popover').boundingBox();
   assert.ok(rect.x >= 0 && rect.x + rect.width <= 391, 'Help stays in viewport');
   await page.getByRole('button',{name:'Close',exact:true}).click();
   await page.locator('.ds-popover').waitFor({state:'hidden'});
   const numeric = page.locator('input[id][inputmode="decimal"]:visible').first();
   await numeric.fill('$1,450,000'); assert.equal(await numeric.inputValue(),'1450000');
   assert.ok((await page.getByRole('status').allTextContents()).some(t=>t.includes('ignored')));
   await page.getByRole('radio',{name:'Canada',exact:true}).focus();
   await page.keyboard.press('ArrowRight');
   assert.equal(await page.getByRole('radio',{name:'United States',exact:true}).getAttribute('aria-checked'),'true');
   await page.getByRole('link',{name:'Prepayment',exact:true}).first().click();
   assert.ok(page.url().includes('/prepayment'));
   assert.ok(await page.locator('input').count()>0);
  }
  console.log(`${name}: theme toggle, persistence, metadata, and primary navigation passed`);
  await page.close();
 }
}finally{await browser.close();servers.forEach(s=>s.kill());}
