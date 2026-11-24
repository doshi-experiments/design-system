import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {mkdtemp, readFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {build} from 'esbuild';
import {chromium} from 'playwright';

const root = new URL('../', import.meta.url).pathname;
const fixture = await mkdtemp(join(tmpdir(), 'ds-components-'));
const entry = `
import React from 'react';
import {createRoot} from 'react-dom/client';
import {AppShell,Button,Card,CardTitle,TextField,SelectField,CheckboxField,Alert,FileUpload,WorkflowSteps,Disclosure,Dialog,PageHeader,EmptyState,SiteHeader,Select,DateField,TimeField,MenuButton,ToggleButton,ToastProvider,toast} from './src/react.js';
import {EditableTable} from './src/table.js';
import {createAppearanceController} from './src/theme.js';
const h = React.createElement;
function Pickers(){
 const [colour,setColour]=React.useState('red'); const [size,setSize]=React.useState('m'); const [date,setDate]=React.useState(''); const [time,setTime]=React.useState(''); const [later,setLater]=React.useState(''); const [alarm,setAlarm]=React.useState(false);
 const today=new Date(); const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
 return h(Card,null,h(Select,{label:'Colour',value:colour,onValueChange:setColour,options:[['red','Red'],['blue','Blue']],groups:[['More',[['green','Green']]]],hint:'Pick one.'}),
 h(Select,{label:'Size',layout:'hidden',variant:'quiet',size:'small',value:size,onValueChange:setSize,options:[{value:'s',label:'Small'},{value:'m',label:'Medium'}]}),
 h(DateField,{label:'Due date',value:date,onValueChange:setDate,min:iso(today)}),h(TimeField,{label:'Time',value:time,onValueChange:setTime}),
 h('div',{className:'ds-actions'},h(MenuButton,{label:'Snooze',size:'small',items:[{label:'Tomorrow',onSelect:()=>setLater('tomorrow')},'separator',{label:'Next week',onSelect:()=>setLater('week')}]}),
  h(ToggleButton,{pressed:alarm,onPressedChange:setAlarm,tone:'error',size:'small','aria-label':'Alarm for the sample'},alarm?'Alarm on':'Alarm off'),
  h(Button,{size:'small',onClick:()=>toast('Saved: sample note','It stays in this preview.')},'Save note'),
  h(Button,{size:'small',onClick:()=>toast('Archived: sample note',undefined,{action:{label:'Undo',onAction:()=>setLater('undone')}})},'Archive note')),
 h('p',{id:'pickers',hidden:true},JSON.stringify({colour,size,date,time,later,alarm})));
}
function Example(){
 const [controller]=React.useState(()=>createAppearanceController()); const [appearance,setAppearance]=React.useState(controller.getPreference()); React.useEffect(()=>controller.subscribe(({preference})=>setAppearance(preference)),[controller]);
 const [name,setName]=React.useState('Coffee'); const [category,setCategory]=React.useState('food'); const [ack,setAck]=React.useState(false);
 const [files,setFiles]=React.useState([]); const [step,setStep]=React.useState('edit'); const [open,setOpen]=React.useState(false); const [locked,setLocked]=React.useState(false);
 const [rows,setRows]=React.useState([{id:'first',description:'Market',category:'food',note:'Two cartons of oat milk, a sack of flour, a dozen eggs, butter, three lemons and a jar of honey'},{id:'second',description:'Bus',category:'travel',note:'Day pass'}]);
 const options=[{value:'food',label:'Food'},{value:'travel',label:'Travel'}];
 const columns=React.useMemo(()=>[{accessorKey:'description',header:'Description',meta:{style:{minWidth:'500px'}}}, {accessorKey:'category',header:'Category',cell:({row,getValue,table})=>h(SelectField,{label:'Category for '+row.original.description,hideLabel:true,value:getValue(),options,onValueChange:value=>table.options.meta.update(row.id,value)})}, {accessorKey:'note',header:'Note',meta:{className:'ds-table-wrap',style:{width:'240px'}},cell:({getValue})=>h('span',{className:'ds-line-clamp',title:getValue()},getValue())}, {id:'skip',header:'Skip',cell:({row,table})=>h(CheckboxField,{label:'Skip '+row.original.description,hideLabel:true,checked:!!row.original.skip,onCheckedChange:value=>table.options.meta.skip(row.id,value)})}],[]);
 return h(React.Fragment,null,h(SiteHeader,{project:'finance',appearance,onAppearanceChange:value=>controller.setPreference(value)}),h(AppShell,{brand:h('span',null,'Component lab',h('small',null,'Shared recipes')),navigation:[{id:'imports',label:'Imports',href:'#imports',active:true},{id:'activity',label:'Activity',href:'#activity'}],footer:'Central source'},
 h(PageHeader,{eyebrow:'Components',title:'Review workspace',description:'Keyboard, mobile and appearance checks.'}),
 h(WorkflowSteps,{steps:[{id:'edit',label:'Categorize'},{id:'confirm',label:'Confirm'}],value:step,onValueChange:setStep}),
 h(Card,null,h(TextField,{label:'Description',value:name,onValueChange:setName,hint:'Keep bank details unchanged.'}),h(SelectField,{label:'Default category',value:category,onValueChange:setCategory,options}),h(CheckboxField,{label:'I reviewed the changes',checked:ack,onCheckedChange:setAck}),
 h(FileUpload,{label:'Upload statements',accept:'.csv',multiple:true,onFilesChange:setFiles,hint:'CSV files only.'}),h('p',{id:'state',hidden:true},JSON.stringify({name,category,ack,step,files:files.map(file=>file.name)}))),
 h(Pickers),
 h(Card,{id:'outer-card'},h(CardTitle,null,'Monthly costs'),h(Card,{variant:'flat',id:'flat-card'},h('p',null,'A section inside the card.'))),
 h(Alert,{tone:'warning',title:'Review before saving'},'Confirm uncategorized items explicitly.'),
 h(EditableTable,{data:rows,columns,getRowId:row=>row.id,label:'Review items',caption:'Editable categories',meta:{update:(id,value)=>setRows(current=>current.map(row=>row.id===id?{...row,category:value}:row)),skip:(id,value)=>setRows(current=>current.map(row=>row.id===id?{...row,skip:value}:row))}}),
 h('p',{id:'rows',hidden:true},JSON.stringify(rows)),
 h(Disclosure,{title:'Technical details'},h('p',null,'The source columns are preserved.')),
 h(Button,{variant:'primary',onClick:()=>{setLocked(false);setOpen(true)}},'Open confirmation'),h(Button,{onClick:()=>{setLocked(true);setOpen(true)}},'Open required confirmation'),h(Button,{loading:true},'Saving'),
 h(Dialog,{open,onOpenChange:setOpen,title:'Save these decisions?',description:'Only the explicit save action submits the changes.',dismissible:!locked,actions:h(Button,{variant:'primary',onClick:()=>setOpen(false)},'Save decisions')},h(TextField,{label:'Note',value:name,onValueChange:setName}),h(DateField,{label:'Review on',value:'',onValueChange:()=>{}})),
 h(EmptyState,{title:'All caught up',description:'No other items need review.'})));
}
createRoot(document.getElementById('root')).render(h(ToastProvider,null,h(Example)));
`;
await build({stdin:{contents:entry,resolveDir:root,sourcefile:'component-lab.js',loader:'js'},outfile:join(fixture,'app.js'),bundle:true,format:'esm',define:{'process.env.NODE_ENV':'"development"'}});
const server = createServer(async (req,res) => {
 try {
  if(req.url==='/' || req.url==='/static') {
   res.setHeader('content-type','text/html');
   const body=req.url==='/static'?'<div id="family-header"></div><h1>Static workspace</h1><script type="module">import {mountSiteHeader} from "/site.js"; window.header=mountSiteHeader(document.querySelector("#family-header"),{project:"visualizations"});</script>':'<div id="root"></div><script type="module" src="/app.js"></script>';
   res.end('<!doctype html><html data-project="finance" data-theme="light"><head><meta name="viewport" content="width=device-width,initial-scale=1"><script src="/prepaint.js"></script><link rel="stylesheet" href="/tokens.css"><link rel="stylesheet" href="/components.css"><style>body{margin:0}.ds-app-main{display:grid;gap:24px;align-content:start}.ds-card{display:grid;gap:20px}</style></head><body>'+body+'</body></html>');return;
  }
  const files={'/app.js':[join(fixture,'app.js'),'text/javascript'],'/tokens.css':[join(root,'dist/tokens.css'),'text/css'],'/components.css':[join(root,'dist/components.css'),'text/css'],'/fonts/host-grotesk-latin.woff2':[join(root,'dist/fonts/host-grotesk-latin.woff2'),'font/woff2'],'/fonts/host-grotesk-latin-ext.woff2':[join(root,'dist/fonts/host-grotesk-latin-ext.woff2'),'font/woff2'],'/felt/fibre-light.svg':[join(root,'dist/felt/fibre-light.svg'),'image/svg+xml'],'/felt/fibre-dark.svg':[join(root,'dist/felt/fibre-dark.svg'),'image/svg+xml']};
  for(const name of ['site','site-contract','theme','tokens','prepaint']) files['/'+name+'.js']=[join(root,'dist',name+'.js'),'text/javascript'];
  const file=files[req.url]; if(!file){res.statusCode=404;res.end();return;}res.setHeader('content-type',file[1]);res.end(await readFile(file[0]));
 }catch(error){res.statusCode=500;res.end(String(error));}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;const failures=[];let checks=0;
try {
 browser=await chromium.launch({headless:true});const page=await browser.newPage();
 page.on('pageerror',error=>failures.push(String(error)));
 page.on('console',message=>{if(message.type()==='error') failures.push(message.text());});
 await page.goto('http://127.0.0.1:'+server.address().port);await page.getByRole('heading',{name:'Review workspace'}).waitFor();
 assert.equal(await page.getByRole('navigation',{name:'Global navigation'}).getByRole('link',{name:'Home',exact:true}).getAttribute('href'),'https://rishabhdoshi.com/');assert.equal(await page.getByRole('navigation',{name:'Global navigation'}).getByRole('link',{name:'Experiments',exact:true}).getAttribute('href'),'https://experiments.rishabhdoshi.com/');checks+=2;
 assert.deepEqual(await page.getByLabel('Appearance',{exact:true}).locator('option').allTextContents(),['System','Light','Dark']);checks++;
 await page.getByLabel('Appearance',{exact:true}).selectOption('dark');await page.reload();await page.getByRole('heading',{name:'Review workspace'}).waitFor();assert.equal(await page.getByLabel('Appearance',{exact:true}).inputValue(),'dark');assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),'dark');checks+=2;
 await page.emulateMedia({colorScheme:'dark'});await page.getByLabel('Appearance',{exact:true}).selectOption('system');await page.reload();await page.getByRole('heading',{name:'Review workspace'}).waitFor();assert.equal(await page.getByLabel('Appearance',{exact:true}).inputValue(),'system');assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),'dark');checks+=2;
 await page.emulateMedia({colorScheme:'light'});await page.waitForFunction(()=>document.documentElement.dataset.theme==='light');checks++;
 await page.getByLabel('Appearance',{exact:true}).selectOption('light');await page.emulateMedia({colorScheme:'dark'});assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),'light');checks++;
 for(const theme of ['light','dark']) for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:1000});await page.getByLabel('Appearance',{exact:true}).selectOption(theme);
  await page.evaluate(()=>document.fonts.ready);
  const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,font:document.fonts.check('16px "Host Grotesk"'),small:[...document.querySelectorAll('.ds-site-link,.ds-appearance-select,button,.ds-select-input,.ds-text-input,.ds-checkbox-label,.ds-disclosure-summary,.ds-app-nav-item,.ds-picker,.ds-toggle')].filter(el=>{const after=getComputedStyle(el,'::after');return Math.max(el.getBoundingClientRect().height,after.content==='none'?0:parseFloat(after.height)||0)<44;}).map(el=>el.textContent||el.tagName)}));
  assert.equal(layout.overflow,false,theme+' '+width+' overflow');assert.equal(layout.font,true,'font loaded');assert.deepEqual(layout.small,[],theme+' '+width+' targets');checks+=3;
  const contrast=await page.getByRole('button',{name:'Open confirmation',exact:true}).evaluate(el=>{
   const s=getComputedStyle(el);const lum=color=>{const c=color.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;};const a=lum(s.color),b=lum(s.backgroundColor);return(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
  });assert.ok(contrast>=4.5,theme+' action contrast '+contrast);checks++;
 }
 await page.setViewportSize({width:1440,height:1000});const title=await page.getByRole('heading',{name:'Review workspace'}).boundingBox();await page.mouse.move(title.x+2,title.y+title.height/2);await page.mouse.down();await page.mouse.move(title.x+240,title.y+title.height/2,{steps:15});await page.mouse.up();assert.ok((await page.evaluate(()=>getSelection().toString())).includes('Review'),'real mouse text selection');checks++;
 await page.evaluate(()=>getSelection().removeAllRanges());
 await page.evaluate(()=>history.replaceState(null,'','#/activity'));await page.getByRole('link',{name:'Skip to content'}).focus();await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>location.hash),'#/activity');assert.equal(await page.evaluate(()=>document.activeElement.id),'main-content');checks++;
 await page.getByLabel('Description',{exact:true}).fill('New merchant');await page.getByLabel('Default category').selectOption('travel');await page.getByLabel('I reviewed the changes').check();await page.getByRole('button',{name:'Confirm',exact:true}).click();
 await page.getByLabel('Upload statements').setInputFiles([{name:'statement.csv',mimeType:'text/csv',buffer:Buffer.from('date,amount\n2026-01-01,10') }]);
 const flat=await page.evaluate(()=>{const card=getComputedStyle(document.getElementById('flat-card')),after=getComputedStyle(document.getElementById('flat-card'),'::after'),title=getComputedStyle(document.querySelector('#outer-card .ds-card-title'));return {background:card.backgroundColor,shadow:card.boxShadow,padding:card.padding,radius:card.borderTopLeftRadius,stitch:after.content,size:title.fontSize,weight:title.fontWeight,margin:title.margin};});
 assert.deepEqual(flat,{background:'rgba(0, 0, 0, 0)',shadow:'none',padding:'16px 0px',radius:'0px',stitch:'none',size:'20px',weight:'500',margin:'0px'},'flat card and card title');checks++;
 const state=JSON.parse(await page.locator('#state').textContent());assert.deepEqual(state,{name:'New merchant',category:'travel',ack:true,step:'confirm',files:['statement.csv']});checks++;
 await page.getByLabel('Category for Market').selectOption('travel');const rows=JSON.parse(await page.locator('#rows').textContent());assert.deepEqual(rows.map(row=>row.category),['travel','travel']);checks++;
 await page.getByLabel('Skip Market').check();assert.deepEqual(JSON.parse(await page.locator('#rows').textContent()).map(row=>!!row.skip),[true,false]);
 const skip=await page.locator('[data-row-id="first"] .ds-checkbox-label').boundingBox();assert.ok(skip.width>=44&&skip.width<64&&skip.height>=44,'hidden-label checkbox keeps a 44px target without its text');
 const wrapped=await page.locator('[data-row-id="first"] td.ds-table-wrap').evaluate(cell=>{const text=cell.querySelector('.ds-line-clamp').getBoundingClientRect(),box=cell.getBoundingClientRect();return{inside:text.right<=box.right+1,lines:Math.round(text.height/parseFloat(getComputedStyle(cell).lineHeight))};});
 assert.equal(wrapped.inside,true,'wrapping cell keeps its text inside');assert.equal(wrapped.lines,2,'line clamp stops at two lines');checks+=3;
 const details=page.getByText('Technical details',{exact:true});await details.focus();await page.keyboard.press('Enter');await page.getByText('The source columns are preserved.').waitFor();await page.keyboard.press('Enter');assert.equal(await page.getByText('The source columns are preserved.').isVisible(),false);checks++;
 assert.equal(await page.getByRole('button',{name:'Saving'}).isDisabled(),true);checks++;
 const picked=async()=>JSON.parse(await page.locator('#pickers').textContent());
 const hits=async selector=>page.$$eval(selector,els=>els.map(el=>{const r=el.getBoundingClientRect();const a=getComputedStyle(el,'::after');const on=a.content!=='none';return Math.min(Math.max(r.width,on?parseFloat(a.width)||0:0),Math.max(r.height,on?parseFloat(a.height)||0:0));}));
 await page.getByRole('combobox',{name:'Colour'}).click();const listbox=page.getByRole('listbox');await listbox.waitFor();
 assert.equal(await listbox.getByText('More',{exact:true}).isVisible(),true);assert.ok((await hits('.ds-option')).every(size=>size>=44),'option targets');checks+=2;
 await page.getByRole('option',{name:'Green'}).click();await listbox.waitFor({state:'hidden'});assert.equal((await picked()).colour,'green');assert.equal(await page.getByRole('combobox',{name:'Colour'}).textContent(),'Green');checks+=2;
 await page.getByRole('combobox',{name:'Colour'}).focus();await page.keyboard.press('Enter');await listbox.waitFor();await page.keyboard.press('Escape');await listbox.waitFor({state:'hidden'});assert.equal((await picked()).colour,'green');checks++;
 await page.getByRole('combobox',{name:'Size'}).click();await page.getByRole('option',{name:'Small'}).click();assert.equal((await picked()).size,'s');checks++;
 await page.getByRole('combobox',{name:'Time'}).click();const times=page.getByRole('listbox');await times.waitFor();await page.getByRole('option',{name:'11:30 PM'}).waitFor({state:'attached'});assert.equal(await times.locator('.ds-option').count(),49);await page.getByRole('option',{name:'5:30 PM'}).click();assert.equal((await picked()).time,'17:30');checks+=2;
 const tomorrow=await page.evaluate(()=>{const d=new Date();d.setDate(d.getDate()+1);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');});
 await page.getByRole('button',{name:/^Due date/}).click();const grid=page.getByRole('grid');await grid.waitFor();
 assert.ok((await hits('.ds-day,.ds-date-popup .ds-icon-button,.ds-calendar-foot .ds-button')).every(size=>size>=44),'calendar targets');checks++;
 await page.waitForFunction(()=>document.activeElement?.classList.contains('ds-day')&&document.activeElement.hasAttribute('data-today'));
 await page.keyboard.press('ArrowLeft');assert.equal(await page.evaluate(()=>document.activeElement.hasAttribute('data-today')),true,'focus stays at min');
 await page.keyboard.press('ArrowRight');await page.keyboard.press('Enter');await grid.waitFor({state:'hidden'});assert.equal((await picked()).date,tomorrow);checks+=2;
 await page.getByRole('button',{name:/^Due date/}).click();await grid.waitFor();await page.getByRole('button',{name:'Clear',exact:true}).click();assert.equal((await picked()).date,'');checks++;
 await page.getByRole('button',{name:'Snooze'}).click();await page.getByRole('menu').waitFor();assert.ok((await hits('.ds-menu-item')).every(size=>size>=44),'menu targets');
 await page.getByRole('menuitem',{name:'Next week'}).click();assert.equal((await picked()).later,'week');checks+=2;
 const alarm=page.getByRole('button',{name:'Alarm for the sample'});assert.equal(await alarm.getAttribute('aria-pressed'),'false');await alarm.click();assert.equal(await alarm.getAttribute('aria-pressed'),'true');assert.equal(await alarm.textContent(),'Alarm on');
 assert.equal(await alarm.evaluate(el=>getComputedStyle(el).backgroundColor),await page.evaluate(()=>{const probe=document.createElement('i');probe.style.background='var(--ds-error-bg)';document.body.append(probe);const c=getComputedStyle(probe).backgroundColor;probe.remove();return c;}),'pressed error tone is tinted');assert.equal((await picked()).alarm,true);checks+=3;
 await page.getByRole('button',{name:'Save note'}).click();const note=page.getByText('Saved: sample note',{exact:true});await note.waitFor();assert.ok((await hits('.ds-toast-close')).every(size=>size>=44),'toast close target');
 await page.locator('.ds-toast-close').click();await note.waitFor({state:'hidden'});checks+=2;
 await page.getByRole('button',{name:'Archive note'}).click();const archived=page.getByText('Archived: sample note',{exact:true});await archived.waitFor();assert.ok((await hits('.ds-toast-action')).every(size=>size>=44),'toast action target');
 await page.locator('.ds-toast-action').click();await archived.waitFor({state:'hidden'});assert.equal((await picked()).later,'undone','toast action runs and closes');checks+=3;
 for (const theme of ['light','dark']){
  await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);await page.getByRole('button',{name:'Open confirmation',exact:true}).click();const dialog=page.getByRole('dialog',{name:'Save these decisions?'});await dialog.waitFor();
  assert.equal(await dialog.getByLabel('Note').isVisible(),true);await page.waitForFunction(()=>document.querySelector('[role="dialog"]')?.contains(document.activeElement));checks++;
  for(let index=0;index<6;index++){await page.keyboard.press('Tab');await page.waitForFunction(()=>document.querySelector('[role="dialog"]')?.contains(document.activeElement));}checks++;
  await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});await page.waitForFunction(()=>document.activeElement?.textContent==='Open confirmation');checks++;
 }
 await page.getByRole('button',{name:'Open confirmation',exact:true}).click();await page.getByRole('dialog',{name:'Save these decisions?'}).waitFor();await page.getByRole('button',{name:/^Review on/}).click();await page.getByRole('grid').waitFor();
 assert.equal(await page.evaluate(()=>{const day=document.querySelector('.ds-day[tabindex="0"]');const r=day.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('.ds-day')===day;}),true,'calendar opens above a dialog');checks++;
 await page.keyboard.press('Escape');await page.getByRole('grid').waitFor({state:'hidden'});await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({state:'hidden'});
 await page.getByRole('button',{name:'Open required confirmation'}).click();await page.getByRole('dialog').waitFor();await page.keyboard.press('Escape');assert.equal(await page.getByRole('dialog').isVisible(),true);await page.getByRole('button',{name:'Cancel',exact:true}).click();await page.getByRole('dialog').waitFor({state:'hidden'});checks++;
 await page.goto('http://127.0.0.1:'+server.address().port+'/static');await page.getByLabel('Appearance',{exact:true}).waitFor();assert.equal(await page.getByLabel('Appearance',{exact:true}).inputValue(),'dark');checks++;
 await page.getByLabel('Appearance',{exact:true}).selectOption('system');await page.reload();await page.getByLabel('Appearance',{exact:true}).waitFor();assert.equal(await page.getByLabel('Appearance',{exact:true}).inputValue(),'system');assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),'dark');checks+=2;
 await page.emulateMedia({colorScheme:'light'});await page.waitForFunction(()=>document.documentElement.dataset.theme==='light');checks++;
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:1000});assert.equal(await page.getByRole('link',{name:'Home',exact:true}).isVisible(),true);assert.equal(await page.getByRole('link',{name:'Experiments',exact:true}).isVisible(),true);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);checks+=3;}
 await page.evaluate(()=>window.header.destroy());assert.equal(await page.getByLabel('Appearance',{exact:true}).count(),0);checks++;
 assert.deepEqual(failures,[]);checks++;
 console.log(JSON.stringify({checks,status:'passed',coverage:'8 responsive appearance layouts; equivalent React/static global headers; visible preference persistence and System OS changes; actual mouse text selection; native form values; upload; editable category persistence callback; hidden-label table checkbox and wrapping, clamped cell; disclosure keyboard; loading lock; modal focus, Escape, restoration and dismissal guard; Select groups and keyboard; TimeField slots; DateField keyboard, min and clear; menu button; toggle tone; toast, dismiss and action; small hit areas'},null,2));
} finally {await browser?.close();await new Promise(resolve=>server.close(resolve));await rm(fixture,{recursive:true,force:true});}
