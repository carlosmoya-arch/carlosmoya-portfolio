(() => {
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      if (window.projectLightbox?.isOpen()) { window.projectLightbox.close(); return; }
      if (window.siteOverlays?.isOpen()) { window.siteOverlays.close(); return; }
      window.SiteViews.closeSection(); return;
    }
    if (event.target?.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"])') || event.target?.isContentEditable || event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
    const key = event.key.toLowerCase();
    const destination = window.SiteContent.navigation.find(item => item.key === key);
    if (destination) {
      if ((/^\d$/.test(key) && window.SiteViews.isOpen()) || window.siteOverlays?.isOpen() || window.projectLightbox?.isOpen()) return;
      event.preventDefault(); window.SiteViews.openSection(destination.id);
    } else if (key === 'm') { event.preventDefault(); window.toggleTheme(); }
    else if (key === '?') { event.preventDefault(); window.siteOverlays.openHelp(); }
  });
})();
