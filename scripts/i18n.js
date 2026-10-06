(() => {
  let language = 'en';
  try { const saved = localStorage.getItem('carlos-moya-language'); if (['en', 'de', 'es'].includes(saved)) language = saved; } catch (_) {}
  const api = {
    get language() { return language; },
    t(key) { return window.SiteContent.ui[language][key]; },
    text(value) { return typeof value === 'object' && value !== null ? value[language] : value; },
    setLanguage(next) {
      if (!['en', 'de', 'es'].includes(next) || next === language) return;
      language = next;
      try { localStorage.setItem('carlos-moya-language', next); } catch (_) {}
      document.documentElement.lang = next;
      document.dispatchEvent(new CustomEvent('site:language'));
    }
  };
  document.documentElement.lang = language;
  window.SiteI18n = api;
})();
