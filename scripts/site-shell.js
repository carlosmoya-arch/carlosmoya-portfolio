(() => {
  const host = document.getElementById('site-header');
  const i = window.SiteI18n;
  const root = location.pathname.replace(/\\/g, '/').includes('/pages/') ? '../' : '';
  host.innerHTML = `<header class="site-header"><a class="brand" href="${root}index.html"><span>CARLOS MOYA</span><span data-profession></span></a><div class="header-tools" id="shared-tools"><div class="language-control" role="group">${['es','de','en'].map(lang => `<button class="language-button" type="button" data-language="${lang}">${lang.toUpperCase()}</button>`).join('')}</div><button class="utility" type="button" data-theme-toggle>M</button><button class="utility" type="button" data-help-open>?</button></div></header><dialog class="overlay" id="help-overlay" aria-labelledby="help-title"><div class="overlay-panel"><div class="overlay-top"><h2 id="help-title"></h2><button class="utility" type="button" data-overlay-close>×</button></div><div class="shortcut-list"></div></div></dialog>`;
  const tools = host.querySelector('.header-tools'), brand = host.querySelector('.brand');
  const dialog = host.querySelector('dialog');
  let timer;
  const update = () => {
    brand.setAttribute('aria-label', i.t('home'));
    brand.querySelector('[data-profession]').textContent = i.t('profession');
    tools.querySelector('.language-control').setAttribute('aria-label', i.t('language'));
    tools.querySelectorAll('[data-language]').forEach(button => {
      const active = button.dataset.language === i.language;
      button.lang = button.dataset.language;
      button.setAttribute('aria-label', { es: 'Español', de: 'Deutsch', en: 'English' }[button.dataset.language]);
      button.setAttribute('aria-pressed', String(active));
      button.classList.toggle('is-active', active);
    });
    tools.querySelector('[data-theme-toggle]').setAttribute('aria-label', i.t('theme'));
    tools.querySelector('[data-help-open]').setAttribute('aria-label', i.t('helpOpen'));
    dialog.querySelector('h2').textContent = i.t('help');
    dialog.querySelector('[data-overlay-close]').setAttribute('aria-label', i.t('close'));
    dialog.querySelector('.shortcut-list').innerHTML = `${window.SiteContent.navigation.map((item,n) => `<kbd>${item.key.toUpperCase()}</kbd><span>${i.t('sections')[n]}</span>`).join('')}<kbd>M</kbd><span>${i.t('theme')}</span><kbd>?</kbd><span>${i.t('helpOpen')}</span><kbd>Esc</kbd><span>${i.t('close')}</span>`;
  };
  tools.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click', () => i.setLanguage(button.dataset.language)));
  tools.querySelector('[data-theme-toggle]').addEventListener('click', window.toggleTheme);
  const openHelp = () => { clearTimeout(timer); if (!dialog.open) dialog.showModal(); requestAnimationFrame(() => dialog.classList.add('is-open')); };
  const close = () => { if (!dialog.open) return; dialog.classList.remove('is-open'); clearTimeout(timer); timer = setTimeout(() => { if (dialog.open) dialog.close(); }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 240); };
  tools.querySelector('[data-help-open]').addEventListener('click', openHelp);
  dialog.querySelector('[data-overlay-close]').addEventListener('click', close);
  dialog.addEventListener('click', e => { if (e.target === dialog) close(); });
  dialog.addEventListener('cancel', e => { e.preventDefault(); close(); });
  window.siteOverlays = { openHelp, close, isOpen: () => dialog.open };
  document.addEventListener('site:language', update);
  update();
})();
