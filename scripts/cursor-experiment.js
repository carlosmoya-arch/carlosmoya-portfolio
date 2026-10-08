// Temporary cursor experiment: no interception of clicks, focus or shortcuts.
(() => {
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const root = document.documentElement;
  const cursor = document.createElement('div');
  cursor.className = 'experiment-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  document.body.append(cursor);
  // A project row or a focusable pan viewport is not itself a click target.
  // The brand link is explicitly prevented from navigating by view-controller.js.
  const interactive = 'a[href]:not(.brand), button, input:not([type="hidden"]), select, textarea, summary';
  let position = null;
  const hide = () => {
    position = null;
    cursor.classList.remove('is-interactive');
    root.classList.remove('has-experiment-cursor');
  };
  const refresh = () => {
    if (!position || !finePointer.matches) return;
    // Keep the circle visible in native modal dialogs' top layer as well.
    const host = [...document.querySelectorAll('dialog[open]')].at(-1) || document.body;
    if (cursor.parentElement !== host) host.append(cursor);
    // Hit testing avoids stale event targets during pointer capture and DOM changes.
    const hit = document.elementFromPoint(position.x, position.y);
    const control = hit?.closest(interactive);
    let clickable = !!control && !control.matches(':disabled') && !control.closest('[inert], [aria-disabled="true"]');
    if (clickable) {
      for (let node = control; node; node = node.parentElement) {
        const style = getComputedStyle(node);
        if (style.visibility !== 'visible' || style.display === 'none' || Number(style.opacity) === 0) { clickable = false; break; }
      }
    }
    cursor.classList.toggle('is-interactive', clickable);
  };
  const move = event => {
    if (!finePointer.matches || event.pointerType !== 'mouse') { hide(); return; }
    // Update real pointer coordinates directly. Only the circle's dimensions animate.
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
    position = { x: event.clientX, y: event.clientY };
    refresh();
    root.classList.add('has-experiment-cursor');
  };
  document.addEventListener('pointermove', move, { passive: true });
  document.addEventListener('pointerover', move, { passive: true });
  document.addEventListener('pointerout', refresh, { passive: true });
  document.addEventListener('pointerdown', event => { if (event.pointerType !== 'mouse') hide(); }, { passive: true });
  document.documentElement.addEventListener('pointerleave', hide);
  window.addEventListener('blur', hide);
  document.addEventListener('visibilitychange', () => { if (document.hidden) hide(); });
  document.addEventListener('keydown', event => { if (event.key === 'Tab') hide(); });
  finePointer.addEventListener('change', hide);
  document.addEventListener('site:view-change', refresh);
  document.addEventListener('transitionend', refresh, true);
  document.addEventListener('scroll', refresh, { capture: true, passive: true });
  window.addEventListener('resize', refresh);
  new MutationObserver(records => {
    if (records.some(record => record.target !== cursor &&
      !(record.target === root && record.attributeName === 'class') &&
      !(record.type === 'childList' && [...record.addedNodes, ...record.removedNodes].every(node => node === cursor)))) refresh();
  }).observe(document.body, { subtree: true, childList: true, attributes: true,
    attributeFilter: ['class', 'style', 'open', 'hidden', 'inert', 'disabled', 'aria-disabled'] });
})();
