// Local HTTP and direct-file regression checks; Playwright + installed Edge.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), http = require('node:http');
const { pathToFileURL } = require('node:url');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const expected = ['powerco-sagunto','wolf-mainburg','wolf-haidhof','gelber-block','tulbeckstrasse','starnberg','steinerstrasse','residenzstrasse','bikini-berlin','huckelriede'];
let browser, server;
const wait = page => page.waitForTimeout(600);
async function open(page, name) { await page.evaluate(name => window.SiteViews.openSection(name), name); await wait(page); }
async function close(page) { await page.keyboard.press('Escape'); await wait(page); assert.equal(await page.evaluate(()=>window.SiteViews.isOpen()),false); }
async function compactMetadata(page, language='en') {
  const vocabulary={en:['Type','Office','Role','LPH','Area','Year'],de:['Typ','Büro','Rolle','LPH','Fläche','Jahr'],es:['Tipo','Estudio','Rol','LPH','Superficie','Año']}[language];
  const lists=await page.locator('.project-facts').evaluateAll(lists=>lists.map(list=>[...list.children].map(row=>({label:row.querySelector('dt').textContent,value:row.querySelector('dd').textContent}))));
  assert(lists.length>0);
  for(const rows of lists){assert(rows.length<=6);const order=rows.map(r=>vocabulary.indexOf(r.label));assert(order.every((n,i)=>n>=0&&(i===0||n>order[i-1])));assert(rows.every(r=>r.value.trim()));}
}
(async()=>{
  server = http.createServer((req,res)=>{
    const target=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://local').pathname));
    if(target!==root&&!target.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
    const file=target===root?path.join(root,'index.html'):target;
    fs.readFile(file,(err,bytes)=>{if(err){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp'})[path.extname(file)]||'application/octet-stream');res.end(bytes);});
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const url='http://127.0.0.1:'+server.address().port+'/index.html#home';
  browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1280,height:720}}), errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
  await page.goto(url);await wait(page);
  const data=await page.evaluate(()=>window.SiteContent);
  assert.equal(data.projects.length,18);assert.deepEqual(data.projects.filter(p=>p.selected).map(p=>p.id),expected);
  assert.equal(data.projects.filter(p=>!p.selected).length,8);
  const p=id=>data.projects.find(p=>p.id===id);
  assert.equal(p('wolf-mainburg').projectData.areas[0].value,4500);assert.equal(p('wolf-mainburg').projectData.areas[0].term,'BGF');assert.equal(p('wolf-mainburg').projectData.value,24500000);
  assert.equal(p('powerco-sagunto').projectData.areas[0].value,257000);assert.equal(p('powerco-sagunto').projectData.units[0].value,5);assert(!p('powerco-sagunto').scope.area);
  assert.deepEqual(p('starnberg').projectData.areas.map(a=>[a.value,a.term]),[[3100,'BGF'],[2000,'WF'],[420,null]]);
  assert.equal(p('steinerstrasse').scope.area.value,21050);assert.equal(p('steinerstrasse').scope.lph,'1–3');assert.equal(p('steinerstrasse').projectData.units[0].value,288);
  assert.equal(p('tulbeckstrasse').projectData.units[0].value,65);assert.equal(p('gelber-block').projectData.units[0].value,214);
  assert(data.projects.every(p=>p.period===null));assert(data.projects.every(p=>p.assets.every(a=>!a.src||a.credit&&a.source&&a.placeholder)));
  assert.equal(data.logEntries.filter(e=>e.published).length,51);const reserved=data.logEntries.find(e=>e.title==='Umspannwerk Schwabing');assert(!reserved.published&&!reserved.src&&reserved.images.length===0);assert.equal(reserved.credit,'Carlos Moya');
  console.log('PASS editorial data: 10 selected + 8 archive, approved scope/building figures, per-asset credits, reserved LOG entry');
  for(const [key,name] of [['1','current'],['2','work'],['3','projects'],['4','about'],['5','log'],['6','tools'],['c','contact']]){
    await page.keyboard.press(key);await page.waitForSelector('.section-view.is-visible .view-close');await wait(page);assert.equal(await page.evaluate(()=>window.SiteViews.currentView),name);assert(await page.locator('.view-close').isVisible());
    if(name==='projects')assert.equal(await page.locator('.project-row').count(),10);
    if(name==='log')assert.equal(await page.locator('.log-plate').count(),51);
    await close(page);
  }
  await open(page,'projects');
  assert.deepEqual(await page.locator('[data-project-preview]').evaluateAll(ns=>ns.map(n=>n.dataset.projectPreview)),expected);
  await compactMetadata(page);
  const rows=await page.locator('.project-row').evaluateAll(ns=>Object.fromEntries(ns.map(n=>[n.querySelector('[data-project-preview]').dataset.projectPreview,[...n.querySelectorAll('.project-facts > div')].map(r=>[r.querySelector('dt').textContent,r.querySelector('dd').textContent])])));
  assert.deepEqual(rows['gelber-block'],[['Type','Housing / Refurbishment / Extension'],['Office','zillerplus'],['Role','Project team'],['LPH','1–5, partially 6–8'],['Area','15,900 m² GF']]);
  assert.deepEqual(rows.starnberg,[['Type','Housing'],['Office','zillerplus'],['Role','Project team'],['LPH','1–5'],['Area','3,100 m² BGF']]);
  assert.deepEqual(rows['wolf-haidhof'],[['Type','Workplace / Refurbishment'],['Office','Märzo'],['Role','Planning team'],['LPH','3–5, 7'],['Year','2022']]);
  assert.equal(Object.fromEntries(rows['wolf-mainburg']).Area,'4,500 m²');assert.equal(Object.fromEntries(rows['wolf-mainburg']).Office,'Märzo → Independent Practice');assert(!Object.fromEntries(rows['wolf-mainburg']).Year);
  assert.equal(Object.fromEntries(rows.steinerstrasse).LPH,'1–3');assert(!Object.fromEntries(rows.steinerstrasse).Year);
  console.log('PASS compact public metadata: exact vocabulary/order, single principal area, concise roles, verified years and Carlos LPH precedence; internal data retained');
  for(const id of expected){await page.locator('[data-project-preview="'+id+'"]').hover();await page.waitForTimeout(300);const img=page.locator('.project-preview img');assert(await img.evaluate(n=>n.complete&&n.naturalWidth>0));assert(await page.locator('.placeholder-preview-note').isVisible());}
  await page.locator('[data-project-preview="wolf-mainburg"]').click();await wait(page);assert.equal(await page.locator('.project-heading h1').textContent(),'Wolf Besucherzentrum');const wolf=await page.locator('.project-facts').textContent();assert(wolf.includes('4,500')&&!wolf.includes('4,800'));
  await close(page);
  await open(page,'projects');await page.locator('[data-project-preview="steinerstrasse"]').click();await wait(page);
  await compactMetadata(page);assert.equal(await page.locator('.project-facts dt').filter({hasText:/^Role$/}).count(),1);assert(!(await page.locator('.project-facts').textContent()).includes('Carlos’s scope'));assert(!(await page.locator('.project-facts').textContent()).includes('Earlier project phase'));
  await close(page);
  await page.evaluate(()=>{window.SiteContent.projects.find(p=>!p.selected).selected=true});await open(page,'projects');assert.equal(await page.locator('.project-row').count(),11);await close(page);await page.reload();await wait(page);
  console.log('PASS shortcuts, section overlays/Escape, selected-only listing and promotion, hover covers and compact project pages');
  await open(page,'work');const work=await page.locator('.timeline').textContent();assert(work.indexOf('Independent Practice')<work.indexOf('Telluride'));assert(work.includes('Collaboration')&&work.includes('09/2026'));await close(page);
  await open(page,'about');for(const name of data.about.collaborators)assert((await page.locator('.profile-list').textContent()).includes(name));await close(page);
  for(const language of ['es','de','en']){await open(page,'projects');await page.locator('[data-language="'+language+'"]').click();await wait(page);assert.equal(await page.locator('.project-row').count(),10);assert.equal(await page.locator('html').getAttribute('lang'),language);await compactMetadata(page,language);await close(page);assert.equal(await page.locator('.home-footer span').first().textContent(),'Independent Practice · Valencia · Munich');}
  const theme=await page.locator('html').getAttribute('data-theme');await page.keyboard.press('m');assert.notEqual(await page.locator('html').getAttribute('data-theme'),theme);
  await page.keyboard.press('?');await page.waitForTimeout(300);assert(await page.evaluate(()=>window.siteOverlays.isOpen()));await page.keyboard.press('Escape');await page.waitForTimeout(300);assert(!await page.evaluate(()=>window.siteOverlays.isOpen()));
  await open(page,'about');await page.locator('#view-title button').click();await wait(page);assert(!await page.evaluate(()=>window.SiteViews.isOpen()));
  await open(page,'work');await page.locator('.view-close').click();await wait(page);assert(!await page.evaluate(()=>window.SiteViews.isOpen()));
  console.log('PASS WORK, collaborators, ES/DE/EN, fixed footer, theme and all section-close paths');
  const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});mobile.on('pageerror',e=>errors.push(e.message));await mobile.goto(url);await wait(mobile);
  for(const section of ['current','work','projects','about','log','tools','contact']){await open(mobile,section);assert(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));if(section==='projects')assert.equal(await mobile.locator('.project-row').count(),10);if(section==='log')assert.equal(await mobile.locator('.log-plate').count(),51);await close(mobile);}
  assert(await mobile.locator('.home-footer').isVisible());await mobile.close();
  const entries=['index.html',...fs.readdirSync(path.join(root,'pages')).filter(p=>p.endsWith('.html')).map(p=>'pages/'+p)];
  const direct=await browser.newPage({reducedMotion:'reduce'});direct.on('pageerror',e=>errors.push(e.message));
  for(const entry of entries){await direct.goto(pathToFileURL(path.join(root,entry)).href);await direct.waitForFunction(()=>window.SiteViews&&window.SiteContent.projects.length===18);await direct.evaluate(()=>window.SiteViews.openSection('projects'));assert.equal(await direct.locator('.project-row').count(),10);}
  await direct.goto(pathToFileURL(path.join(root,'index.html')).href+'#log');await direct.waitForSelector('.log-plate');assert.equal(await direct.locator('.log-plate').count(),51);assert((await direct.locator('.log-caption-sub').first().textContent()).includes(' / '));
  assert.deepEqual(errors,[]);
  const before=execFileSync('git',['show','HEAD:scripts/log-field.js'],{cwd:root,encoding:'utf8'}).replace(/\r\n/g,'\n');
  const after=fs.readFileSync(path.join(root,'scripts/log-field.js'),'utf8').replace(/\r\n/g,'\n');
  const normalize=s=>s.replace('      if (entry.published === false) return;\n','').replace(/      const sub = .*\n/,'').replace(/      const description = .*\n/,'');
  assert.equal(normalize(after),normalize(before),'LOG interaction code stays byte-identical apart from publication/metadata');
  console.log('PASS mobile sections, all 10 direct-file entry points, LOG metadata and unchanged LOG interaction source; no console/network errors');
  await browser.close();await new Promise(resolve=>server.close(resolve));
})().catch(async error=>{console.error(error);if(browser)await browser.close();if(server)server.close();process.exitCode=1});
