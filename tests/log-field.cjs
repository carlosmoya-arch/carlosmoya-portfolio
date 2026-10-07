// Run with Playwright available through NODE_PATH; uses the installed Edge browser.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const url = pathToFileURL(path.join(root, 'index.html')).href + '#log';
const screenshots = process.env.LOG_SCREENSHOTS;
let browser;
const position = page => page.locator('.log-pan').evaluate(node => {
  const matrix = new DOMMatrix(getComputedStyle(node).transform); return { x: matrix.m41, y: matrix.m42 };
});
const progress = page => page.locator('.log-viewport').evaluate(view => {
  const matrix = new DOMMatrix(getComputedStyle(view.querySelector('.log-pan')).transform), field = view.querySelector('.log-field');
  return { x: (96-matrix.m41)/(field.offsetWidth-view.clientWidth+192), y:(96-matrix.m42)/(field.offsetHeight-view.clientHeight+192) };
});
const near = (actual, expected, tolerance = 1) => assert(Math.abs(actual - expected) <= tolerance, `${actual} differs from ${expected}`);
async function ready(page) {
  await page.goto(url); await page.waitForSelector('.section-view.is-visible .log-plate'); await page.waitForTimeout(1200);
}
async function visiblePlate(page, edge = false) {
  const number = await page.locator('.log-frame').evaluateAll((buttons, edge) => {
    const viewport = document.querySelector('.log-viewport').getBoundingClientRect();
    const candidates = buttons.map(button => ({ button, rect: button.getBoundingClientRect() })).filter(({rect}) => rect.left >= 16 && rect.right <= viewport.right - 16 && rect.top >= viewport.top + 16 && rect.bottom <= viewport.bottom - 16);
    candidates.sort((a,b) => edge ? a.rect.left - b.rect.left : Math.hypot(a.rect.x + a.rect.width / 2 - viewport.width / 2, a.rect.y + a.rect.height / 2 - (viewport.top + viewport.height / 2)) - Math.hypot(b.rect.x + b.rect.width / 2 - viewport.width / 2, b.rect.y + b.rect.height / 2 - (viewport.top + viewport.height / 2)));
    return candidates[0]?.button.closest('figure').dataset.logNumber;
  }, edge);
  assert(number, 'At least one complete plate is visible');
  return page.locator(`[data-log-number="${number}"] .log-frame`);
}
async function zoomChecks(page) {
  const button = await visiblePlate(page, true);
  const fine = await page.evaluate(()=>matchMedia('(hover: hover) and (pointer: fine)').matches);
  if(!fine)await page.evaluate(()=>{window.logTestInput=[];for(const type of ['pointerdown','pointerup','pointercancel','click','focusin'])document.addEventListener(type,e=>window.logTestInput.push({type,target:e.target.className,detail:e.detail,x:e.clientX,y:e.clientY}),{capture:true})});
  if(fine){ await button.hover();await page.waitForTimeout(600);near(await button.locator('img').evaluate(i=>new DOMMatrix(getComputedStyle(i).transform).a),1.04,.001); }
  const selected = await button.evaluate(b=>b.closest('figure').dataset.logNumber);
  const bases = await page.locator('.log-plate').evaluateAll(plates=>plates.map(p=>{
    const r=p.querySelector('button').getBoundingClientRect();return {number:p.dataset.logNumber,x:r.left+r.width/2,y:r.top+r.height/2,w:r.width,h:r.height};
  }));
  if(fine)await button.click();else await button.tap();
  await page.waitForTimeout(1200);
  assert.equal(await page.locator('.log-plate.is-zoomed').count(), 1, !fine ? JSON.stringify(await page.evaluate(()=>window.logTestInput)) : undefined);
  assert.equal(await page.locator('.lightbox[open]').count(), 0);
  near(await page.locator('.log-plate.is-zoomed img').evaluate(i=>new DOMMatrix(getComputedStyle(i).transform).a),1,.001);
  const geometry = await page.locator('.log-plate.is-zoomed').evaluate(plate => {
    const box = node => { const r=node.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom} };
    return { frame:box(plate.querySelector('button')),caption:box(plate.querySelector('figcaption')),viewport:box(plate.closest('.log-viewport')),scale:new DOMMatrix(getComputedStyle(plate.querySelector('button')).transform).a,
      pushes:[...document.querySelectorAll('.log-plate:not(.is-zoomed)')].map(p=>({number:p.dataset.logNumber,x:new DOMMatrix(getComputedStyle(p).transform).m41,y:new DOMMatrix(getComputedStyle(p).transform).m42})) };
  });
  assert(geometry.scale>=1.5&&geometry.scale<=3.4);
  assert(geometry.frame.left>=31&&geometry.frame.right<=geometry.viewport.right-31);
  assert(geometry.frame.top>=geometry.viewport.top+43&&geometry.caption.bottom<=geometry.viewport.bottom-43,JSON.stringify({frame:geometry.frame,caption:geometry.caption,viewport:geometry.viewport,scale:geometry.scale}));
  assert(geometry.caption.top>=geometry.frame.bottom-1);
  const origin=bases.find(p=>p.number===selected), growX=(geometry.scale-1)*origin.w/2, growY=(geometry.scale-1)*origin.h/2;
  const reactions=geometry.pushes.map(push=>{
    const base=bases.find(p=>p.number===push.number),ax=base.x-origin.x,ay=base.y-origin.y,d=Math.hypot(ax,ay),f=.55+560*560/(d*d+560*560);
    // Frame bounds and cached layout measurements can differ by subpixel rounding.
    near(push.x,ax/d*growX*f,.5);near(push.y,ay/d*growY*f,.5);
    assert(Math.hypot(push.x,push.y)>0,'Every other plate reacts, including distant plates');
    return {d,f};
  });
  assert.equal(reactions.length,50);assert(reactions.some(r=>r.d>1000));
  reactions.sort((a,b)=>a.d-b.d);assert(reactions[0].f>reactions.at(-1).f&&reactions.at(-1).f>.55);
  await page.keyboard.press('Escape'); await page.waitForTimeout(600);
  assert.equal(await page.locator('.log-plate.is-zoomed').count(),0);assert.equal(await page.evaluate(()=>window.SiteViews.currentView),'log');
  assert(await page.locator('.log-plate').evaluateAll(ps=>ps.every(p=>!p.style.getPropertyValue('--push-x')&&!p.style.getPropertyValue('--push-y'))));
  return button;
}
(async()=>{
  browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1280,height:720}});
  const errors=[],remote=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))remote.push(r.url())});
  const entrance=await browser.newPage({viewport:{width:1280,height:720}});
  await entrance.addInitScript(()=>{
    let random=0;Math.random=()=>.45+((++random*37)%500)/1000;
    document.addEventListener('site:content-rendered',()=>{
      if(window.firstLogSamples||!document.querySelector('.log-viewport'))return;
      window.firstLogSamples=[];const start=performance.now();
      const sample=()=>{const view=document.querySelector('.log-viewport');if(!view)return;const v=view.getBoundingClientRect();
        window.firstLogSamples.push([...view.querySelectorAll('.log-plate.is-revealed')].filter(p=>{const r=p.getBoundingClientRect();return r.right>v.left&&r.left<v.right&&r.bottom>v.top&&r.top<v.bottom}).map(p=>{const s=getComputedStyle(p.querySelector('.log-plate-inner'));return {immediate:p.classList.contains('is-immediate'),opacity:Number(s.opacity),delay:s.transitionDelay}}));
        if(performance.now()-start<1100)requestAnimationFrame(sample);
      };requestAnimationFrame(sample);
    });
  });
  await ready(entrance);
  const samples=await entrance.evaluate(()=>window.firstLogSamples);
  assert(samples[0].length>0&&samples[0].every(p=>!p.immediate));
  assert(new Set(samples[0].map(p=>p.delay)).size>1);
  assert(samples.some(ps=>ps.some(p=>p.opacity>0&&p.opacity<1)),'First-screen plates actually animate over time');
  const restored=()=>entrance.locator('.log-viewport').evaluate(v=>{const r=v.getBoundingClientRect();return [...v.querySelectorAll('.log-plate')].filter(p=>{const b=p.getBoundingClientRect();return b.right>r.left&&b.left<r.right&&b.bottom>r.top&&b.top<r.bottom}).every(p=>p.classList.contains('is-immediate')&&getComputedStyle(p.querySelector('.log-plate-inner')).opacity==='1')});
  const oldDelays=await entrance.locator('.log-plate').evaluateAll(ps=>ps.map(p=>p.style.getPropertyValue('--arrival-delay')));
  await entrance.evaluate(()=>{window.oldLogField=document.querySelector('.log-field');window.SiteI18n.setLanguage('es')});
  assert(await entrance.evaluate(()=>window.oldLogField!==document.querySelector('.log-field')));
  assert(await entrance.locator('.log-plate').evaluateAll(ps=>ps.every(p=>!p.classList.contains('is-immediate'))));
  assert.notDeepEqual(await entrance.locator('.log-plate').evaluateAll(ps=>ps.map(p=>p.style.getPropertyValue('--arrival-delay'))),oldDelays);
  await entrance.waitForTimeout(350);
  assert(await entrance.locator('.log-plate.is-revealed .log-plate-inner').evaluateAll(ps=>ps.some(p=>{const o=Number(getComputedStyle(p).opacity);return o>0&&o<1})));
  await entrance.waitForTimeout(850);
  await entrance.setViewportSize({width:1100,height:720});await entrance.waitForTimeout(250);assert(await restored());
  await entrance.evaluate(()=>window.SiteViews.closeSection());await entrance.waitForTimeout(550);await entrance.evaluate(()=>window.SiteViews.openSection('log'));await entrance.waitForSelector('.section-view.is-visible');assert(await restored());
  await entrance.evaluate(()=>window.SiteViews.openSection('work'));await entrance.waitForTimeout(1100);await entrance.evaluate(()=>window.SiteViews.openSection('log'));await entrance.waitForSelector('.section-view.is-visible');assert(await restored());
  await entrance.close();
  console.log('PASS F2 first entrance preserved; F7 language rebuild uses fresh stagger; resize/reopen restore immediately');
  await ready(page);
  assert.equal(await page.locator('.log-plate').count(),51);
  const dimensions=await page.locator('.log-viewport').evaluate(view=>({width:view.clientWidth,height:view.clientHeight,top:view.getBoundingClientRect().top,fieldWidth:view.querySelector('.log-field').offsetWidth,fieldHeight:view.querySelector('.log-field').offsetHeight,column:view.querySelector('.log-column').offsetWidth,gap:getComputedStyle(view.querySelector('.log-field')).columnGap,overflow:getComputedStyle(view.parentElement).overflow}));
  assert.equal(dimensions.top,72);assert.equal(dimensions.height,608);assert.equal(dimensions.column,172);assert.equal(dimensions.gap,'48px');assert.equal(dimensions.overflow,'hidden');assert(dimensions.fieldWidth>1280&&dimensions.fieldHeight>608);
  const initial=await position(page);near(initial.x,(1280-dimensions.fieldWidth)/2);near(initial.y,(608-dimensions.fieldHeight)/2);
  const equation=await page.locator('.log-viewport').evaluate(v=>{
    const stack=[...v.querySelectorAll('.log-plate')].reduce((sum,p)=>sum+p.getBoundingClientRect().height+44,0),height=v.clientHeight,gap=48,pitch=220,maximum=Math.ceil(51/3);
    const count=(width,extra)=>{const k=width-height+gap+95-extra;return Math.max(Math.min(maximum,Math.floor(width/pitch)+2),Math.min(maximum,Math.round((k+Math.sqrt(k*k+4*pitch*stack))/(2*pitch))))};
    const boundary=Array.from({length:1001},(_,i)=>700+i).find(w=>count(w,0)!==count(w,44));
    return {expected:count(v.clientWidth,0),actual:v.querySelectorAll('.log-column').length,boundary,boundaryExpected:count(boundary,0)};
  });
  assert.equal(equation.actual,equation.expected);assert(equation.boundary);
  await page.setViewportSize({width:equation.boundary,height:720});await page.waitForTimeout(300);assert.equal(await page.locator('.log-column').count(),equation.boundaryExpected);
  await page.setViewportSize({width:1280,height:720});await page.waitForTimeout(300);
  console.log(`PASS F4 quadratic without -44, including column-count rounding boundary at ${equation.boundary}px`);
  const visibleImages=await page.locator('.log-frame img').evaluateAll(images=>images.filter(i=>{const r=i.getBoundingClientRect();return r.left<1280&&r.right>0&&r.top<680&&r.bottom>72}).every(i=>i.complete&&i.naturalWidth>0));assert(visibleImages);
  await page.mouse.move(640,360);await page.mouse.down();await page.mouse.move(730,415,{steps:6});
  const dragged=await position(page);near(dragged.x-initial.x,90);near(dragged.y-initial.y,55);assert(await page.locator('.log-viewport').evaluate(v=>v.classList.contains('is-dragging')));
  await page.mouse.up();await page.waitForTimeout(200);const flicked=await position(page);assert(flicked.x>dragged.x+5||flicked.y>dragged.y+5);assert.equal(await page.locator('.log-plate.is-zoomed').count(),0);
  console.log('PASS desktop drag 1:1, capture, inertia, drag does not click');
  await page.reload();await ready(page);await page.mouse.move(640,360);await page.mouse.down();await page.mouse.move(690,390,{steps:4});await page.waitForTimeout(250);await page.mouse.up();const held=await position(page);await page.waitForTimeout(250);const thrown=await position(page);assert(thrown.x>held.x+5||thrown.y>held.y+5);
  const beforeSource=execFileSync('git',['show','HEAD:scripts/log-field.js'],{cwd:root,encoding:'utf8'}),afterSource=fs.readFileSync(path.join(root,'scripts/log-field.js'),'utf8');
  for(const [start,end] of [["    function animate(time)","    function moveTo"],["    listen(viewport, 'pointermove'","    function release"],["      const centerX = plate.left","      const image = plate.button"],["    const k = width","    const root ="],["    const firstMount =","    const abort ="]])assert.equal(afterSource.slice(afterSource.indexOf(start),afterSource.indexOf(end)),beforeSource.slice(beforeSource.indexOf(start),beforeSource.indexOf(end)));
  console.log('PASS F3 release after hold flings; rate-normalized velocity and F1/F2/F4 preserved');
  const rails=await page.locator('.log-viewport').evaluate(v=>{const r=v.getBoundingClientRect();return [...v.querySelectorAll('.log-rail')].map(n=>{const b=n.getBoundingClientRect();return {left:b.left-r.left,top:b.top-r.top,right:r.right-b.right,bottom:r.bottom-b.bottom,width:b.width,height:b.height}})});
  assert.deepEqual(rails,[{left:0,top:607,right:0,bottom:0,width:1280,height:1},{left:1279,top:0,right:0,bottom:0,width:1,height:608}]);
  const dense=await browser.newPage({viewport:{width:160,height:844}});
  await dense.addInitScript(()=>document.addEventListener('site:content-rendered',()=>{if(window.denseLog)return;window.denseLog=true;const entries=window.SiteContent.logEntries;window.SiteContent.logEntries=Array.from({length:10},(_,n)=>entries.map((e,i)=>({...e,number:String(n*entries.length+i+1).padStart(3,'0')}))).flat()}, {once:true}));
  await ready(dense);await dense.evaluate(()=>{window.SiteViews.openSection('work')});await dense.waitForTimeout(1100);await dense.evaluate(()=>window.SiteViews.openSection('log'));await dense.waitForTimeout(1200);
  const thumbs=await dense.locator('.log-rail span').evaluateAll(ns=>ns.map((n,i)=>{const r=n.getBoundingClientRect();return i?r.height:r.width}));
  near(thumbs[0],24,.01);assert(thumbs[1]>=24);await dense.close();
  console.log('PASS F5 flush full-length rails and 24px minimum thumb with a dense field');
  await ready(page);const beforeWheel=await position(page);await page.mouse.move(640,360);await page.mouse.wheel(40,60);await page.waitForTimeout(1300);const wheel=await position(page);near(wheel.x,beforeWheel.x-80);near(wheel.y,beforeWheel.y-120);
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('.log-rail')).opacity==='0');
  assert.equal(await page.locator('.view-scroll').evaluate(v=>v.scrollTop),0);
  await page.mouse.wheel(100000,100000);await page.waitForTimeout(1500);const bounded=await position(page);near(bounded.x,1280-dimensions.fieldWidth-96);near(bounded.y,608-dimensions.fieldHeight-96);
  console.log('PASS wheel/trackpad both axes, multiplier, rails hide, 96px bounds');
  await ready(page);await zoomChecks(page);
  let button=await visiblePlate(page);await button.click();await page.waitForTimeout(700);await page.locator('.log-plate.is-zoomed .log-frame').click();await page.waitForTimeout(600);assert.equal(await page.locator('.log-plate.is-zoomed').count(),0);
  button=await visiblePlate(page);await button.focus();await page.keyboard.press('Enter');await page.waitForTimeout(700);assert.equal(await page.locator('.log-plate.is-zoomed').count(),1);
  const empty=await page.locator('.log-viewport').evaluate(v=>{const r=v.getBoundingClientRect();for(let y=r.top+16;y<r.bottom-16;y+=30)for(let x=16;x<r.right-16;x+=30){const e=document.elementFromPoint(x,y);if(v.contains(e)&&!e.closest('.log-plate'))return{x,y}}});assert(empty);await page.mouse.click(empty.x,empty.y);await page.waitForTimeout(600);assert.equal(await page.locator('.log-plate.is-zoomed').count(),0);
  await page.locator('.log-viewport').focus();const arrowBefore=await position(page);await page.keyboard.press('ArrowLeft');await page.waitForTimeout(1000);assert((await position(page)).x>arrowBefore.x);
  console.log('PASS zoom scaling, caption clearance, radial neighbor displacement, edge fitting, same/blank/keyboard/Escape close');
  const outer=page.locator('[data-log-number="001"] .log-frame');await outer.evaluate(b=>b.focus({preventScroll:true}));await page.waitForTimeout(1200);await outer.click();await page.waitForTimeout(1200);
  const outerRect=await outer.boundingBox();assert(outerRect.x>=31&&outerRect.y>=115);await page.keyboard.press('Escape');await page.waitForTimeout(800);assert((await position(page)).x<=96.1);
  await page.evaluate(()=>window.SiteI18n.setLanguage('es'));await page.waitForTimeout(1200);assert.equal(await page.locator('.log-plate').count(),51);const translated=await progress(page);near(translated.x,.5,.005);near(translated.y,.5,.005);assert((await page.locator('.log-caption').first().textContent()).includes('Provisional'));assert.equal(await page.evaluate(()=>window.SiteViews.currentView),'log');
  await page.evaluate(()=>document.documentElement.dataset.theme='dark');assert.equal(await page.locator('.log-frame').first().evaluate(b=>getComputedStyle(b).backgroundColor),'rgb(34, 34, 33)');
  if(screenshots)await page.screenshot({path:path.join(screenshots,'log-field-dark.png')});
  await page.evaluate(()=>{document.documentElement.dataset.theme='light';window.SiteI18n.setLanguage('en')});await page.waitForTimeout(200);
  if(screenshots)await page.screenshot({path:path.join(screenshots,'log-field-desktop.png')});
  await page.setViewportSize({width:1000,height:700});await page.waitForTimeout(500);assert.equal(await page.locator('.log-plate').count(),51);
  await page.evaluate(()=>window.SiteI18n.setLanguage('de'));await page.waitForTimeout(1200);assert((await page.locator('.log-caption').first().textContent()).includes('Temporär'));assert.equal(await page.locator('.log-plate').count(),51);
  const helpButton=await visiblePlate(page);await helpButton.click();await page.waitForTimeout(700);await page.keyboard.press('?');await page.waitForTimeout(300);assert(await page.evaluate(()=>window.siteOverlays.isOpen()));await page.keyboard.press('Escape');await page.waitForTimeout(300);assert(await page.evaluate(()=>window.SiteLog.isZoomed()));await page.keyboard.press('Escape');await page.waitForTimeout(600);assert(!await page.evaluate(()=>window.SiteLog.isZoomed()));
  console.log('PASS F7 language rebuild recenters; theme tokens and resize without duplicate plates');
  await page.keyboard.press('Escape');await page.waitForTimeout(600);assert.equal(await page.evaluate(()=>window.SiteViews.isOpen()),false);
  await page.evaluate(()=>window.SiteViews.openSection('work'));await page.waitForTimeout(600);assert.equal(await page.locator('.log-viewport').count(),0);assert.equal(await page.locator('.view-scroll').evaluate(v=>getComputedStyle(v).overflowY),'auto');
  await page.evaluate(()=>window.SiteViews.openSection('log'));await page.waitForTimeout(1200);assert.equal(await page.locator('.log-plate').count(),51);
  await page.locator('.view-close').click();await page.waitForTimeout(600);assert.equal(await page.evaluate(()=>window.SiteViews.isOpen()),false);
  const baseline=execFileSync('git',['show','HEAD:scripts/content.js'],{cwd:root,encoding:'utf8'});
  const comparisons=await page.evaluate(code=>{const current=window.SiteRenderer;eval(code);const old=window.SiteRenderer;const sections=['home','work','projects','about','current','tools','contact'];const equal=sections.every(s=>(s==='home'?current.homeMarkup():current.sectionMarkup(s))===(s==='home'?old.homeMarkup():old.sectionMarkup(s)));window.SiteRenderer=current;return equal},baseline);assert(comparisons);
  assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);
  console.log('PASS fixed Close, Escape section close, 500ms system preserved, other section markup identical, no external requests/errors');
  const touch=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await ready(touch);
  const mobileDimensions=await touch.locator('.log-viewport').evaluate(v=>({top:v.getBoundingClientRect().top,height:v.clientHeight,column:v.querySelector('.log-column').offsetWidth,gap:getComputedStyle(v.querySelector('.log-field')).columnGap,touch:getComputedStyle(v).touchAction}));assert.deepEqual(mobileDimensions,{top:66,height:744,column:132,gap:'30px',touch:'none'});
  const cdp=await touch.context().newCDPSession(touch);const touchBefore=await position(touch);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:180,y:420}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:245,y:485}]});const touchDrag=await position(touch);near(touchDrag.x-touchBefore.x,65);near(touchDrag.y-touchBefore.y,65);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await touch.waitForTimeout(300);
  assert.equal(await touch.locator('.log-plate.is-zoomed').count(),0);assert(await touch.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&scrollY===0));
  await ready(touch);await zoomChecks(touch);if(screenshots)await touch.screenshot({path:path.join(screenshots,'log-field-touch.png')});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:180,y:420}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:190,y:430}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});const cancelled=await position(touch);await touch.waitForTimeout(200);assert.deepEqual(await position(touch),cancelled);assert(!await touch.locator('.log-viewport').evaluate(v=>v.classList.contains('is-dragging')));
  console.log('PASS real touch events: 2D drag/inertia, no page scroll, mobile sizes/zoom/Escape');
  const reduce=await browser.newPage({viewport:{width:1280,height:720},reducedMotion:'reduce'});await ready(reduce);
  assert.equal(await reduce.locator('.log-field').evaluate(f=>getComputedStyle(f).transform),'none');assert.equal(await reduce.locator('.log-frame').first().evaluate(f=>getComputedStyle(f).transitionDuration),'0s');
  const reduceBefore=await position(reduce);await reduce.mouse.move(640,360);await reduce.mouse.wheel(40,60);const reduceWheel=await position(reduce);near(reduceWheel.x,reduceBefore.x-80);near(reduceWheel.y,reduceBefore.y-120);
  await reduce.mouse.move(640,360);await reduce.mouse.down();await reduce.mouse.move(700,400,{steps:4});await reduce.mouse.up();const stop=await position(reduce);await reduce.waitForTimeout(300);assert.deepEqual(await position(reduce),stop);
  const reduceButton=await visiblePlate(reduce);await reduceButton.hover();assert.equal(await reduceButton.locator('img').evaluate(i=>getComputedStyle(i).transform),'none');await reduceButton.click();assert.equal(await reduce.locator('.log-plate.is-zoomed').count(),1);await reduce.keyboard.press('Escape');assert.equal(await reduce.locator('.log-plate.is-zoomed').count(),0);
  console.log('PASS reduced motion: no settle/entry/hover transitions, no inertia, immediate wheel and usable zoom');
  await browser.close();
})().catch(async error=>{console.error(error);if(browser)await browser.close();process.exitCode=1});
