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
import {AppShell,Button,Card,TextField,SelectField,CheckboxField,Alert,FileUpload,WorkflowSteps,Disclosure,Dialog,PageHeader,EmptyState,SiteHeader} from './src/react.js';
import {EditableTable} from './src/table.js';
import {createAppearanceController} from './src/theme.js';
const h = React.createElement;
function Example(){
 const [controller]=React.useState(()=>createAppearanceController()); const [appearance,setAppearance]=React.useState(controller.getPreference()); React.useEffect(()=>controller.subscribe(({preference})=>setAppearance(preference)),[controller]);
 const [name,setName]=React.useState('Coffee'); const [category,setCategory]=React.useState('food'); const [ack,setAck]=React.useState(false);
 const [files,setFiles]=React.useState([]); const [step,setStep]=React.useState('edit'); const [open,setOpen]=React.useState(false); const [locked,setLocked]=React.useState(false);
 const [rows,setRows]=React.useState([{id:'first',description:'Market',category:'food'},{id:'second',description:'Bus',category:'travel'}]);
 const options=[{value:'food',label:'Food'},{value:'travel',label:'Travel'}];
 const columns=React.useMemo(()=>[{accessorKey:'description',header:'Description',meta:{style:{minWidth:'500px'}}}, {accessorKey:'category',header:'Category',cell:({row,getValue,table})=>h(SelectField,{label:'Category for '+row.original.description,hideLabel:true,value:getValue(),options,onValueChange:value=>table.options.meta.update(row.id,value)})}],[]);
 return h(React.Fragment,null,h(SiteHeader,{project:'finance',appearance,onAppearanceChange:value=>controller.setPreference(value)}),h(AppShell,{brand:h('span',null,'Component lab',h('small',null,'Shared recipes')),navigation:[{id:'imports',label:'Imports',href:'#imports',active:true},{id:'activity',label:'Activity',href:'#activity'}],footer:'Central source'},
 h(PageHeader,{eyebrow:'Components',title:'Review workspace',description:'Keyboard, mobile and appearance checks.'}),
 h(WorkflowSteps,{steps:[{id:'edit',label:'Categorize'},{id:'confirm',label:'Confirm'}],value:step,onValueChange:setStep}),
 h(Card,null,h(TextField,{label:'Description',value:name,onValueChange:setName,hint:'Keep bank details unchanged.'}),h(SelectField,{label:'Default category',value:category,onValueChange:setCategory,options}),h(CheckboxField,{label:'I reviewed the changes',checked:ack,onCheckedChange:setAck}),
 h(FileUpload,{label:'Upload statements',accept:'.csv',multiple:true,onFilesChange:setFiles,hint:'CSV files only.'}),h('p',{id:'state',hidden:true},JSON.stringify({name,category,ack,step,files:files.map(file=>file.name)}))),
 h(Alert,{tone:'warning',title:'Review before saving'},'Confirm uncategorized items explicitly.'),
 h(EditableTable,{data:rows,columns,getRowId:row=>row.id,label:'Review items',caption:'Editable categories',meta:{update:(id,value)=>setRows(current=>current.map(row=>row.id===id?{...row,category:value}:row))}}),
 h('p',{id:'rows',hidden:true},JSON.stringify(rows)),
 h(Disclosure,{title:'Technical details'},h('p',null,'The source columns are preserved.')),
 h(Button,{variant:'primary',onClick:()=>{setLocked(false);setOpen(true)}},'Open confirmation'),h(Button,{onClick:()=>{setLocked(true);setOpen(true)}},'Open required confirmation'),h(Button,{loading:true},'Saving'),
 h(Dialog,{open,onOpenChange:setOpen,title:'Save these decisions?',description:'Only the explicit save action submits the changes.',dismissible:!locked,actions:h(Button,{variant:'primary',onClick:()=>setOpen(false)},'Save decisions')},h(TextField,{label:'Note',value:name,onValueChange:setName})),
 h(EmptyState,{title:'All caught up',description:'No other items need review.'})));
}
createRoot(document.getElementById('root')).render(h(Example));
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
  const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,font:document.fonts.check('16px "Host Grotesk"'),small:[...document.querySelectorAll('.ds-site-link,.ds-appearance-select,button,.ds-select-input,.ds-text-input,.ds-checkbox-label,.ds-disclosure-summary,.ds-app-nav-item')].filter(el=>el.getBoundingClientRect().height<44).map(el=>el.textContent||el.tagName)}));
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
 const state=JSON.parse(await page.locator('#state').textContent());assert.deepEqual(state,{name:'New merchant',category:'travel',ack:true,step:'confirm',files:['statement.csv']});checks++;
 await page.getByLabel('Category for Market').selectOption('travel');const rows=JSON.parse(await page.locator('#rows').textContent());assert.deepEqual(rows.map(row=>row.category),['travel','travel']);checks++;
 const details=page.getByText('Technical details',{exact:true});await details.focus();await page.keyboard.press('Enter');await page.getByText('The source columns are preserved.').waitFor();await page.keyboard.press('Enter');assert.equal(await page.getByText('The source columns are preserved.').isVisible(),false);checks++;
 assert.equal(await page.getByRole('button',{name:'Saving'}).isDisabled(),true);checks++;
 for (const theme of ['light','dark']){
  await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);await page.getByRole('button',{name:'Open confirmation',exact:true}).click();const dialog=page.getByRole('dialog',{name:'Save these decisions?'});await dialog.waitFor();
  assert.equal(await dialog.getByLabel('Note').isVisible(),true);await page.waitForFunction(()=>document.querySelector('[role="dialog"]')?.contains(document.activeElement));checks++;
  for(let index=0;index<6;index++){await page.keyboard.press('Tab');await page.waitForFunction(()=>document.querySelector('[role="dialog"]')?.contains(document.activeElement));}checks++;
  await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});await page.waitForFunction(()=>document.activeElement?.textContent==='Open confirmation');checks++;
 }
 await page.getByRole('button',{name:'Open required confirmation'}).click();await page.getByRole('dialog').waitFor();await page.keyboard.press('Escape');assert.equal(await page.getByRole('dialog').isVisible(),true);await page.getByRole('button',{name:'Cancel',exact:true}).click();await page.getByRole('dialog').waitFor({state:'hidden'});checks++;
 await page.goto('http://127.0.0.1:'+server.address().port+'/static');await page.getByLabel('Appearance',{exact:true}).waitFor();assert.equal(await page.getByLabel('Appearance',{exact:true}).inputValue(),'dark');checks++;
 await page.getByLabel('Appearance',{exact:true}).selectOption('system');await page.reload();await page.getByLabel('Appearance',{exact:true}).waitFor();assert.equal(await page.getByLabel('Appearance',{exact:true}).inputValue(),'system');assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),'dark');checks+=2;
 await page.emulateMedia({colorScheme:'light'});await page.waitForFunction(()=>document.documentElement.dataset.theme==='light');checks++;
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:1000});assert.equal(await page.getByRole('link',{name:'Home',exact:true}).isVisible(),true);assert.equal(await page.getByRole('link',{name:'Experiments',exact:true}).isVisible(),true);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);checks+=3;}
 await page.evaluate(()=>window.header.destroy());assert.equal(await page.getByLabel('Appearance',{exact:true}).count(),0);checks++;
 assert.deepEqual(failures,[]);checks++;
 console.log(JSON.stringify({checks,status:'passed',coverage:'8 responsive appearance layouts; equivalent React/static global headers; visible preference persistence and System OS changes; actual mouse text selection; native form values; upload; editable category persistence callback; disclosure keyboard; loading lock; modal focus, Escape, restoration and dismissal guard'},null,2));
} finally {await browser?.close();await new Promise(resolve=>server.close(resolve));await rm(fixture,{recursive:true,force:true});}
