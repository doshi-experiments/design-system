import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {setTimeout} from 'node:timers/promises';
import {chromium} from 'playwright';

const workspace = process.env.DESIGN_WORKSPACE || fileURLToPath(new URL('../../', import.meta.url)).replace(/\/$/, '');
const url = process.env.GAME_PREVIEW_URL || 'http://127.0.0.1:4220/';
const server = process.env.GAME_PREVIEW_URL ? null : spawn('python3', [
  '-m', 'http.server', '4220', '--bind', '127.0.0.1', '--directory',
  `${workspace}/design-system-rollout/mr-shake/dist`,
], {stdio:'ignore'});
let browser;
let checks = 0;
const verify = (condition, message) => {assert.ok(condition, message); checks++;};

try {
  let ready = false;
  for (let attempt = 0; attempt < 50; attempt++) {
    try {ready = (await fetch(url)).ok;} catch {}
    if (ready) break;
    await setTimeout(100);
  }
  assert.ok(ready, `Game preview did not start: ${url}`);
  browser = await chromium.launch({args:['--no-sandbox']});
  const context = await browser.newContext({viewport:{width:390, height:900}, reducedMotion:'reduce', serviceWorkers:'block'});
  // Keep the navigation real while making this regression independent of the
  // production portfolio. Leaving the document exercises pagehide and storage.
  await context.route('https://rishabhdoshi.com/**', route => route.fulfill({
    status:200, contentType:'text/html', body:'<!doctype html><title>Home</title><h1>Home</h1>',
  }));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(url);
  await page.getByRole('button', {name:'Deal the words', exact:true}).click();
  const saved = () => page.evaluate(() => JSON.parse(sessionStorage.getItem('mr-shake:game')));
  const hand = await saved();
  const privateCard = () => page.locator('.word-card--word,.word-card--shake');
  const reveal = async () => {
    const state = await saved();
    await page.getByRole('button', {name:`I'm ${state.players[state.revealIndex].name}`, exact:true}).click();
    await page.getByRole('button', {name:'Tap to see your word Keep it to yourself'}).click();
    await privateCard().waitFor();
  };
  const concealed = async message => {
    await privateCard().waitFor({state:'hidden'});
    const state = await saved();
    verify(state.revealStage === 'pass', message);
    verify(JSON.stringify(state.players) === JSON.stringify(hand.players), 'Players, roles, and words survive concealment');
    verify(state.revealIndex === 0, 'The same player resumes at the handover gate');
  };
  const leaveAndReturn = async () => {
    await page.getByRole('navigation', {name:'Global navigation'}).getByRole('link', {name:'Home', exact:true}).click();
    await page.waitForURL('https://rishabhdoshi.com/');
    await page.goBack();
  };

  await reveal();
  verify(await privateCard().evaluate(element => getComputedStyle(element).userSelect) === 'none', 'The private reveal cannot be selected');
  await page.reload();
  await concealed('Reload conceals the private word');
  await reveal();
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await concealed('The blur handler conceals the private word');
  await reveal();
  await leaveAndReturn();
  await concealed('Actual Home navigation and Back conceal the private word');

  for (let index = 0; index < hand.players.length; index++) {
    await reveal();
    await page.getByRole('button', {
      name:index + 1 === hand.players.length ? 'Hide and start' : 'Hide and pass on', exact:true,
    }).click();
  }
  await page.getByRole('heading', {name:'Describe your word, one at a time'}).waitFor();
  const describe = await saved();
  const reminder = async () => {
    await page.getByRole('button', {name:/Show .* their word again/}).first().click();
    await page.getByRole('button', {name:/^I'm /}).click();
    await page.getByRole('button', {name:'Tap to see your word again Keep it to yourself'}).click();
    await privateCard().waitFor();
  };
  await reminder();
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await privateCard().waitFor({state:'hidden'});
  verify(await page.getByText('Pass the phone back to', {exact:true}).isVisible(), 'Blur conceals a private reminder');
  await page.getByRole('button', {name:'Never mind', exact:true}).click();
  await reminder();
  await leaveAndReturn();
  await page.getByRole('heading', {name:'Describe your word, one at a time'}).waitFor();
  verify(await privateCard().count() === 0, 'Actual navigation dismisses a private reminder');
  verify(JSON.stringify(await saved()) === JSON.stringify(describe), 'The round and dealt game survive reminder navigation');
  verify(errors.length === 0, `No browser errors: ${errors.join(', ')}`);
  await context.close();
  console.log(`${checks} game privacy checks passed: conceal, reload, Home/Back, private reminders, and session preservation.`);
} finally {
  await browser?.close();
  server?.kill();
}
