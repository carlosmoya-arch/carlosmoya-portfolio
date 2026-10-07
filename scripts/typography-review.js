// TEMPORARY, local-only typography comparison. Remove this script and its assets after review.
(() => {
  const local = location.protocol === 'file:' || ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname) || location.hostname.endsWith('.localhost');
  if (!local) return;
  const key = 'carlos-moya-type-review', choices = ['current', 'instrument', 'geist'];
  const root = document.documentElement;
  let selected = 'current', revision = 0;
  try { const saved = localStorage.getItem(key); if (choices.includes(saved)) selected = saved; } catch (_) {}
  if (selected !== 'current') root.dataset.typeReview = selected;
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = new URL('../styles/typography-review.css', document.currentScript.src).href;
  document.head.append(stylesheet);
  const cssReady = new Promise(resolve => { stylesheet.onload = resolve; stylesheet.onerror = resolve; });
  document.addEventListener('DOMContentLoaded', async () => {
    const label = document.createElement('label');
    label.className = 'type-review'; label.textContent = 'TEMP TYPE';
    label.title = 'Temporary local typography comparison';
    const selector = document.createElement('select');
    selector.setAttribute('aria-label', 'Temporary typography comparison');
    choices.forEach(value => { const option = document.createElement('option'); option.value = value; option.textContent = value.toUpperCase(); selector.append(option); });
    selector.value = selected; label.append(selector); document.body.append(label);
    // Native selector keys belong to this development control, not the site's shortcuts.
    selector.addEventListener('keydown', event => event.stopPropagation());
    await cssReady;
    const loads = {
      current: Promise.resolve(),
      instrument: document.fonts.load('400 12px "CM Instrument Sans"'),
      geist: document.fonts.load('400 12px "CM Geist"')
    };
    const refresh = () => { if (document.querySelector('.log-viewport')) dispatchEvent(new Event('resize')); };
    selector.addEventListener('change', async () => {
      selected = selector.value; const token = ++revision;
      try { await loads[selected]; } catch (_) { return; }
      if (token !== revision) return;
      if (selected === 'current') delete root.dataset.typeReview;
      else root.dataset.typeReview = selected;
      try { localStorage.setItem(key, selected); } catch (_) {}
      // Use LOG's existing resize restoration to account for changed glyph metrics.
      refresh();
    });
    try { await Promise.all(Object.values(loads)); if (selected !== 'current') refresh(); } catch (_) {}
  }, { once: true });
})();
