(() => {
  const root = document.documentElement;
  root.classList.add('js');
  try { const saved = localStorage.getItem('carlos-moya-theme'); if (saved === 'light' || saved === 'dark') root.dataset.theme = saved; } catch (_) {}
  window.toggleTheme = () => {
    const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    try { localStorage.setItem('carlos-moya-theme', root.dataset.theme); } catch (_) {}
  };
})();

