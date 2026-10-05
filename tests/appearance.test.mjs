import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import {createAppearanceController} from '../src/theme.js';
function environment({storage = {}, cookie = '', dark = true, stamp = 'light', preferenceStamp, hostname = 'experiments.rishabhdoshi.com', blocked = false} = {}) {
  const mediaListeners = new Set(), storageListeners = new Set(), writes = [];
  const media = {matches:dark, addEventListener:(_,fn)=>mediaListeners.add(fn), removeEventListener:(_,fn)=>mediaListeners.delete(fn)};
  const win = {location:{hostname,protocol:'https:'}, matchMedia:()=>media,
    localStorage:{getItem:key=>{if(blocked)throw Error('blocked');return storage[key]??null},setItem:(key,value)=>{if(blocked)throw Error('blocked');storage[key]=value;}},
    addEventListener:(_,fn)=>storageListeners.add(fn),removeEventListener:(_,fn)=>storageListeners.delete(fn)};
  const doc = {defaultView:win,querySelector:()=>null};
  Object.defineProperty(doc,'cookie',{get:()=>cookie,set:value=>{writes.push(value);cookie=value.split(';')[0];}});
  const root = {dataset:{project:'finance',theme:stamp,...(preferenceStamp?{appearancePreference:preferenceStamp}:{})},style:{},ownerDocument:doc};
  return {root, media, mediaListeners, storageListeners, storage, writes, win};
}
test('resolved prepaint appearance never replaces a saved System preference', () => {
  const e=environment({storage:{'sheet-theme':'system'},stamp:'light'}),events=[];
  const c=createAppearanceController({root:e.root,onChange:value=>events.push(value)});
  assert.equal(c.getPreference(),'system');assert.equal(c.getAppearance(),'dark');
  e.media.matches=false;e.mediaListeners.forEach(fn=>fn());assert.equal(c.getAppearance(),'light');
  assert.equal(events.at(-1).preference,'system');assert.equal(events.at(-1).tokens['surface-page'],'#F1F5F7');
  c.setPreference('dark');const count=events.length;e.mediaListeners.forEach(fn=>fn());assert.equal(events.length,count);
  assert.equal(e.storage['sheet-theme'],'dark');assert.match(e.writes[0],/Domain=\.rishabhdoshi\.com/);
  c.destroy();assert.equal(e.mediaListeners.size,0);assert.equal(e.storageListeners.size,0);
});
test('public cookie wins over stale local storage; unrelated hosts keep a local cookie', () => {
  const e=environment({cookie:'sheet-theme=light',storage:{'sheet-theme':'dark'},hostname:'localhost'});
  const c=createAppearanceController({root:e.root});assert.equal(c.getPreference(),'light');c.setPreference('system');
  assert.doesNotMatch(e.writes[0],/Domain=/);assert.throws(()=>c.setPreference('night'),RangeError);c.destroy();
});
test('private appearance has its own storage and never reads or writes the public cookie', () => {
  const e=environment({cookie:'sheet-theme=light; finance-appearance=light',storage:{'finance-appearance':'dark'}});
  const c=createAppearanceController({root:e.root,storageKey:'finance-appearance',cookie:false});
  assert.equal(c.getPreference(),'dark');c.setPreference('system');assert.equal(e.writes.length,0);assert.equal(e.storage['finance-appearance'],'system');c.destroy();
});
test('subscriptions and cross-tab preferences update with fresh resolved tokens', () => {
  const e=environment(),c=createAppearanceController({root:e.root}),events=[];
  const stop=c.subscribe(value=>events.push(value));e.storageListeners.forEach(fn=>fn({key:'sheet-theme',newValue:'light'}));
  assert.equal(c.getPreference(),'light');assert.equal(events.at(-1).appearance,'light');
  stop();c.setPreference('dark');assert.equal(events.length,1);c.destroy();
});
test('blocked storage still allows a usable and changeable controller', () => {
  const e=environment({blocked:true}),c=createAppearanceController({root:e.root,cookie:false});
  assert.equal(c.getPreference(),'system');c.setPreference('light');assert.equal(c.getAppearance(),'light');c.destroy();
});
const prepaint=await readFile(new URL('../src/prepaint.js',import.meta.url),'utf8');
for(const scenario of [
 {name:'explicit public cookie',cookie:'sheet-theme=light',storage:{'sheet-theme':'dark'},pref:'light',resolved:'light'},
 {name:'saved system',cookie:'',storage:{'sheet-theme':'system'},pref:'system',resolved:'dark'},
 {name:'private preference',cookie:'sheet-theme=light',storage:{'finance-appearance':'dark'},key:'finance-appearance',noCookie:true,pref:'dark',resolved:'dark'},
 {name:'invalid saved preference',cookie:'sheet-theme=night',storage:{'sheet-theme':'wrong'},pref:'system',resolved:'dark'},
 {name:'blocked persistence',cookie:'',storage:{},blocked:true,pref:'system',resolved:'dark'},
])test(`prepaint: ${scenario.name}`,()=>{
 const root={dataset:{theme:'light',...(scenario.key?{appearanceStorage:scenario.key}:{}),...(scenario.noCookie?{appearanceCookie:'false'}:{})},style:{}};
 runInNewContext(prepaint,{document:{documentElement:root,cookie:scenario.cookie},localStorage:{getItem:key=>{if(scenario.blocked)throw Error('blocked');return scenario.storage[key]??null}},matchMedia:()=>({matches:true})});
 assert.equal(root.dataset.theme,scenario.resolved);assert.equal(root.dataset.appearancePreference,scenario.pref);assert.equal(root.style.colorScheme,scenario.resolved);
});
