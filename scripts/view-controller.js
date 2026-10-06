(() => {
  const main = document.querySelector('main');
  const initialPage = main.classList.contains('home-main') ? 'home' : document.body.dataset.page;
  const initialProject = document.body.dataset.project || new URLSearchParams(location.search).get('id');
  const header = document.querySelector('.site-header');
  const brand = header.querySelector('.brand');
  const tools = header.querySelector('.header-tools');
  const i18n = window.SiteI18n;
  main.className = 'home-main';
  main.innerHTML = window.SiteRenderer.homeMarkup();
  const footer = document.createElement('footer');
  footer.className = 'home-footer';
  footer.innerHTML = '<span>Independent Practice · Valencia · Munich</span><span class="home-copyright">© 2026 Carlos Moya</span>';
  document.body.append(footer);
  const view = document.createElement('section');
  view.className = 'section-view';
  view.setAttribute('role', 'dialog');
  view.setAttribute('aria-modal', 'true');
  view.setAttribute('aria-labelledby', 'view-title');
  view.setAttribute('aria-hidden', 'true');
  view.tabIndex = -1;
  view.inert = true;
  view.innerHTML = '<header class="section-identifier"><h1 id="view-title"><button type="button" data-close-section><span class="view-number"></span><span class="view-name"></span></button></h1></header><div class="view-scroll site-main"></div><button type="button" class="view-close" data-close-section></button>';
  document.body.append(view);
  const scroll = view.querySelector('.view-scroll');
  scroll.tabIndex = 0;
  const closeButton = view.querySelector('.view-close');
  const titleButton = view.querySelector('[data-close-section]');
  const state = { view: null, projectId: null, phase: 'closed', opener: null, openerView: null, token: 0 };
  const scrollPositions = new Map();
  let renderedKey = '', transitionTimer;
  document.body.dataset.view = 'home';
  const duration = () => matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 500;
  const key = (name, id) => name + (id ? '/' + id : '');
  const isOpen = () => state.phase !== 'closed';
  function writeURL(name, id) {
    const hash = '#' + (name ? key(name,id) : 'home');
    if (location.hash !== hash) history.pushState({ view: name, projectId: id }, '', hash);
  }
  function updateTitle() {
    const section = state.view === 'project' ? 'projects' : state.view;
    const n = window.SiteContent.navigation.findIndex(item => item.id === section);
    if (n < 0) return;
    view.querySelector('.view-number').textContent = window.SiteContent.navigation[n].number;
    view.querySelector('.view-name').textContent = i18n.t('sections')[n];
    scroll.setAttribute('aria-label', i18n.t('sections')[n]);
    titleButton.setAttribute('aria-label', i18n.t('close') + ' — ' + i18n.t('sections')[n]);
    closeButton.textContent = i18n.t('close');
    document.title = state.view === 'project'
      ? window.SiteContent.projects.find(item => item.id === state.projectId).name + ' — Carlos Moya'
      : i18n.t('sections')[n] + ' — Carlos Moya';
  }
  function prepareStagger() {
    // Text items only; architectural photographs and drawings remain still.
    scroll.querySelectorAll('.project-index > li, .timeline > li, .profile-list > div, .tool-section, .intro, .log-entry > header').forEach((item,n) => {
      item.classList.add('stagger-item');
      item.style.setProperty('--item-delay', (n * 50) + 'ms');
    });
  }
  function renderView() {
    scroll.innerHTML = window.SiteRenderer.sectionMarkup(state.view, state.projectId);
    renderedKey = key(state.view,state.projectId);
    prepareStagger();
    document.dispatchEvent(new CustomEvent('site:content-rendered'));
  }
  function openSection(name, projectId = null, updateURL = true) {
    if (!window.SiteContent.navigation.some(item => item.id === name) && name !== 'project') return;
    if (name === 'project' && !window.SiteContent.projects.some(item => item.id === projectId)) return;
    const nextKey = key(name,projectId);
    if (state.view === name && state.projectId === projectId && state.phase !== 'closing') return;
    if (state.view) scrollPositions.set(key(state.view,state.projectId), scroll.scrollTop);
    if (state.phase === 'closed') {
      state.opener = document.activeElement;
      state.openerView = state.opener?.closest('[data-open-view]')?.dataset.openView || (name === 'project' ? 'projects' : name);
    }
    clearTimeout(transitionTimer);
    const token = ++state.token;
    const switchingSection = Boolean(state.view);
    if (switchingSection) {
      state.phase = 'opening';
      view.classList.remove('is-visible');
    }
    const showSection = () => {
      if (token !== state.token) return;
      state.view = name; state.projectId = projectId; state.phase = 'opening';
      main.inert = true; brand.inert = true;
      if (renderedKey !== nextKey) renderView();
      updateTitle();
      scroll.scrollTop = scrollPositions.get(nextKey) || 0;
      view.classList.remove('is-closing');
      view.classList.remove('is-visible');
      document.body.classList.add('is-switching');
      if (updateURL) writeURL(name,projectId);
      document.dispatchEvent(new CustomEvent('site:view-change'));
      // Commit the hidden state first so reopening replays the stagger.
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (token !== state.token) return;
        view.append(tools);
        view.inert = false;
        view.setAttribute('aria-hidden', 'false');
        document.body.dataset.view = name;
        view.classList.add('is-visible');
        if (!window.siteOverlays?.isOpen() && !window.projectLightbox?.isOpen()) view.focus({preventScroll:true});
        transitionTimer = setTimeout(() => {
          if (token !== state.token) return;
          state.phase = 'open'; document.body.classList.remove('is-switching');
        }, duration());
      }));
    };
    if (switchingSection) transitionTimer = setTimeout(showSection, duration());
    else showSection();
  }
  function closeSection(updateURL = true) {
    if (!state.view || state.phase === 'closing') return;
    scrollPositions.set(key(state.view,state.projectId), scroll.scrollTop);
    clearTimeout(transitionTimer);
    const token = ++state.token;
    state.phase = 'closing';
    // Shared utilities stay available and in the same visual position.
    header.append(tools);
    if (view.contains(document.activeElement)) document.activeElement.blur();
    view.inert = true;
    view.setAttribute('aria-hidden', 'true');
    view.classList.add('is-closing');
    view.classList.remove('is-visible');
    document.body.dataset.view = 'home';
    document.body.classList.add('is-switching');
    document.title = 'Carlos Moya — ' + i18n.t('profession');
    if (updateURL) writeURL(null,null);
    document.dispatchEvent(new CustomEvent('site:view-change'));
    transitionTimer = setTimeout(() => {
      if (token !== state.token) return;
      main.inert = false; brand.inert = false;
      state.phase = 'closed'; state.view = null; state.projectId = null;
      view.classList.remove('is-closing');
      document.body.classList.remove('is-switching');
      const opener = state.opener?.isConnected && state.opener !== document.body
        ? state.opener : main.querySelector(`[data-open-view="${state.openerView}"]`);
      opener?.focus({preventScroll:true});
    }, duration());
  }
  document.addEventListener('click', event => {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
    if (event.target.closest('[data-close-section]')) { event.preventDefault(); closeSection(); return; }
    const link = event.target.closest('a');
    if (!link) return;
    if (link.dataset.openView) { event.preventDefault(); openSection(link.dataset.openView); return; }
    if (link === brand) { event.preventDefault(); return; }
    const url = new URL(link.href,location.href);
    if (url.origin !== location.origin) return;
    const project = window.SiteContent.projects.find(item => item.url && url.pathname.endsWith('/' + item.url));
    if (project || url.pathname.endsWith('/pages/project.html')) {
      const id = project?.id || url.searchParams.get('id');
      if (window.SiteContent.projects.some(item => item.id === id)) { event.preventDefault(); openSection('project',id); }
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Tab' || state.phase === 'closed' || state.phase === 'closing' || window.siteOverlays?.isOpen() || window.projectLightbox?.isOpen()) return;
    const focusable = [...view.querySelectorAll('a[href],button,input,textarea,select,[tabindex="0"]')].filter(node => !node.disabled && !node.closest('[inert]') && getComputedStyle(node).visibility !== 'hidden');
    if (!focusable.length) { event.preventDefault(); view.focus(); return; }
    const first = focusable[0], last = focusable[focusable.length-1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === view)) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && (document.activeElement === last || document.activeElement === view)) { event.preventDefault(); first.focus(); }
  });
  document.addEventListener('site:language', () => {
    main.innerHTML = window.SiteRenderer.homeMarkup();
    if (state.view && state.phase !== 'closing') {
      const position = scroll.scrollTop;
      const active = document.activeElement;
      const focusWasInContent = scroll.contains(active);
      renderView(); scroll.scrollTop = position; updateTitle();
      if (focusWasInContent) view.focus({preventScroll:true});
    } else document.title = 'Carlos Moya — ' + i18n.t('profession');
  });
  const readRoute = () => {
    const hash = location.hash.slice(1);
    if (hash === 'home') return {name:'home'};
    if (hash.startsWith('project/')) return {name:'project',id:decodeURIComponent(hash.slice(8))};
    if (window.SiteContent.navigation.some(item => item.id === hash)) return {name:hash};
    return {name:initialPage,id:initialProject};
  };
  const syncRoute = () => { const route = readRoute(); if (route.name === 'home') closeSection(false); else openSection(route.name,route.id || null,false); };
  addEventListener('popstate', syncRoute);
  addEventListener('hashchange', syncRoute);
  window.SiteViews = { openSection, closeSection, isOpen, get currentView() { return state.view; } };
  syncRoute();
  if (!state.view) document.title = 'Carlos Moya — ' + i18n.t('profession');
  setTimeout(() => document.body.classList.add('is-ready'), matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 100);
})();
