// Webfont metrics can arrive after a direct #log mount. Reuse LOG's existing
// resize restoration only after its initial entrance has finished.
(() => {
  const root = document.documentElement;
  const key = 'carlos-moya-font-comparison';
  let selected = 'plex';
  try { const saved = localStorage.getItem(key); if (['original', 'plex', 'inter'].includes(saved)) selected = saved; } catch (_) {}
  root.dataset.fontComparison = selected;
  const label = document.createElement('label');
  label.className = 'font-comparison';
  label.textContent = 'TEMP TYPE';
  label.title = 'Comparación tipográfica temporal';
  const selector = document.createElement('select');
  selector.setAttribute('aria-label', 'Comparación tipográfica temporal');
  [['original', 'ORIGINAL'], ['plex', 'IBM PLEX SANS'], ['inter', 'INTER']].forEach(([value, text]) => {
    const option = document.createElement('option');
    option.value = value; option.textContent = text; selector.append(option);
  });
  selector.value = selected;
  label.append(selector); document.body.append(label);
  // Native select keys should not trigger the site's section/theme shortcuts.
  selector.addEventListener('keydown', event => event.stopPropagation());
  selector.addEventListener('change', () => {
    root.dataset.fontComparison = selector.value;
    try { localStorage.setItem(key, selector.value); } catch (_) {}
    if (document.querySelector('.log-viewport')) dispatchEvent(new Event('resize'));
  });
  document.addEventListener('DOMContentLoaded', () => {
    // Native modal dialogs make outside controls inert. Keep the same selector
    // in the active top layer so it remains usable in help and image overlays.
    const dialogs = [...document.querySelectorAll('dialog')];
    const observer = new MutationObserver(() => {
      const host = dialogs.filter(dialog => dialog.open).at(-1) || document.body;
      if (label.parentElement !== host) host.append(label);
    });
    dialogs.forEach(dialog => observer.observe(dialog, { attributes: true, attributeFilter: ['open'] }));
  }, { once: true });
  Promise.all(['IBM Plex Sans', 'Inter'].flatMap(family => [400, 500].map(weight => document.fonts.load(`${weight} 12px "${family}"`))))
    .then(async () => {
      const viewport = document.querySelector('.log-viewport');
      if (!viewport) return;
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      await Promise.allSettled(viewport.getAnimations({ subtree: true }).map(animation => animation.finished));
      if (viewport.isConnected) dispatchEvent(new Event('resize'));
    }).catch(() => {}); // Original fallback families remain usable if a font fails.
})();
