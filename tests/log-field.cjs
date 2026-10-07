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
  if(fine)await button.click();else await button.tap();
  await page.waitForTimeout(1200);
  assert.equal(await page.locator('.log-plate.is-zoomed').count(), 1, !fine ? JSON.stringify(await page.evaluate(()=>window.logTestInput)) : undefined);
  assert.equal(await page.locator('.lightbox[open]').count(), 0);
  near(await page.locator('.log-plate.is-zoomed img').evaluate(i=>new DOMMatrix(getComputedStyle(i).transform).a),1,.001);
  const geometry = await page.locator('.log-plate.is-zoomed').evaluate(plate => {
    const box = node => { const r=node.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom} };
    return { frame:box(plate.querySelector('button')),caption:box(plate.querySelector('figcaption')),viewport:box(plate.closest('.log-viewport')),scale:new DOMMatrix(getComputedStyle(plate.querySelector('button')).transform).a,
      neighbors:[...document.querySelectorAll('.log-plate:not(.is-zoomed)')].map(box),pushes:[...document.querySelectorAll('.log-plate:not(.is-zoomed)')].map(p=>new DOMMatrix(getComputedStyle(p).transform).m41) };
  });
  assert(geometry.scale>=1.5&&geometry.scale<=3.4);
  assert(geometry.frame.left>=15&&geometry.frame.right<=geometry.viewport.right-15);
  assert(geometry.frame.top>=geometry.viewport.top+15&&geometry.caption.bottom<=geometry.viewport.bottom-15,JSON.stringify({frame:geometry.frame,caption:geometry.caption,viewport:geometry.viewport,scale:geometry.scale}));
  assert(geometry.caption.top>=geometry.frame.bottom-1);
  assert(geometry.pushes.some(value=>Math.abs(value)>1));
  for(const n of geometry.neighbors)assert(!(n.left<geometry.frame.right&&n.right>geometry.frame.left&&n.top<geometry.caption.bottom&&n.bottom>geometry.frame.top),'Neighbors clear the enlarged plate and caption');
  await page.keyboard.press('Escape'); await page.waitForTimeout(600);
  assert.equal(await page.locator('.log-plate.is-zoomed').count(),0);assert.equal(await page.evaluate(()=>window.SiteViews.currentView),'log');
  return button;
}
(async()=>{
  browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1280,height:720}});
  const errors=[],remote=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))remote.push(r.url())});
  await ready(page);
  assert.equal(await page.locator('.log-plate').count(),51);
  const dimensions=await page.locator('.log-viewport').evaluate(view=>({width:view.clientWidth,height:view.clientHeight,top:view.getBoundingClientRect().top,fieldWidth:view.querySelector('.log-field').offsetWidth,fieldHeight:view.querySelector('.log-field').offsetHeight,column:view.querySelector('.log-column').offsetWidth,gap:getComputedStyle(view.querySelector('.log-field')).columnGap,overflow:getComputedStyle(view.parentElement).overflow}));
  assert.equal(dimensions.top,72);assert.equal(dimensions.height,608);assert.equal(dimensions.column,172);assert.equal(dimensions.gap,'48px');assert.equal(dimensions.overflow,'hidden');assert(dimensions.fieldWidth>1280&&dimensions.fieldHeight>608);
  const initial=await position(page);near(initial.x,(1280-dimensions.fieldWidth)/2);near(initial.y,(608-dimensions.fieldHeight)/2);
  const visibleImages=await page.locator('.log-frame img').evaluateAll(images=>images.filter(i=>{const r=i.getBoundingClientRect();return r.left<1280&&r.right>0&&r.top<680&&r.bottom>72}).every(i=>i.complete&&i.naturalWidth>0));assert(visibleImages);
  await page.mouse.move(640,360);await page.mouse.down();await page.mouse.move(730,415,{steps:6});
  const dragged=await position(page);near(dragged.x-initial.x,90);near(dragged.y-initial.y,55);assert(await page.locator('.log-viewport').evaluate(v=>v.classList.contains('is-dragging')));
  await page.mouse.up();await page.waitForTimeout(200);const flicked=await position(page);assert(flicked.x>dragged.x+5||flicked.y>dragged.y+5);assert.equal(await page.locator('.log-plate.is-zoomed').count(),0);
  console.log('PASS desktop drag 1:1, capture, inertia, drag does not click');
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
  const outerRect=await outer.boundingBox();assert(outerRect.x>=15&&outerRect.y>=87);await page.keyboard.press('Escape');await page.waitForTimeout(800);assert((await position(page)).x<=96.1);
  const oldPosition=await progress(page);await page.evaluate(()=>window.SiteI18n.setLanguage('es'));await page.waitForTimeout(200);assert.equal(await page.locator('.log-plate').count(),51);const translated=await progress(page);near(translated.x,oldPosition.x,.005);near(translated.y,oldPosition.y,.005);assert((await page.locator('.log-caption').first().textContent()).includes('Provisional'));assert.equal(await page.evaluate(()=>window.SiteViews.currentView),'log');
  await page.evaluate(()=>document.documentElement.dataset.theme='dark');assert.equal(await page.locator('.log-frame').first().evaluate(b=>getComputedStyle(b).backgroundColor),'rgb(34, 34, 33)');
  if(screenshots)await page.screenshot({path:path.join(screenshots,'log-field-dark.png')});
  await page.evaluate(()=>{document.documentElement.dataset.theme='light';window.SiteI18n.setLanguage('en')});await page.waitForTimeout(200);
  if(screenshots)await page.screenshot({path:path.join(screenshots,'log-field-desktop.png')});
  await page.setViewportSize({width:1000,height:700});await page.waitForTimeout(500);assert.equal(await page.locator('.log-plate').count(),51);
  await page.evaluate(()=>window.SiteI18n.setLanguage('de'));await page.waitForTimeout(200);assert((await page.locator('.log-caption').first().textContent()).includes('Temporär'));assert.equal(await page.locator('.log-plate').count(),51);
  const helpButton=await visiblePlate(page);await helpButton.click();await page.waitForTimeout(700);await page.keyboard.press('?');await page.waitForTimeout(300);assert(await page.evaluate(()=>window.siteOverlays.isOpen()));await page.keyboard.press('Escape');await page.waitForTimeout(300);assert(await page.evaluate(()=>window.SiteLog.isZoomed()));await page.keyboard.press('Escape');await page.waitForTimeout(600);assert(!await page.evaluate(()=>window.SiteLog.isZoomed()));
  console.log('PASS language rebuild retains location, theme tokens, resize rebuild without duplicate plates');
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
