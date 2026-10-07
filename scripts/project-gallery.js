(() => {
  const dialog = document.createElement('dialog');
  dialog.className = 'lightbox';
  document.body.append(dialog);
  let timer, trigger;
  function close() {
    dialog.classList.remove('is-open'); clearTimeout(timer);
    timer = setTimeout(() => { if (dialog.open) dialog.close(); trigger?.focus(); }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 240);
  }
  function open(button) {
    clearTimeout(timer); trigger = button;
    const i = window.SiteI18n;
    dialog.setAttribute('aria-label', i.t('expandedImage'));
    dialog.innerHTML = `<button class="utility lightbox-close" aria-label="${i.t('close')}">×</button><div class="lightbox-image">${window.SiteImages.markup(button.dataset.imageId,true)}</div>`;
    const image = dialog.querySelector('img');
    if (image) {
      const item = window.SiteContent.images[button.dataset.imageId];
      image.sizes = '100vw';
      image.src = window.SiteImages.root + (item.src || item.base + '-2400.webp');
    }
    dialog.querySelector('button').addEventListener('click', close);
    if (!dialog.open) dialog.showModal();
    requestAnimationFrame(() => dialog.classList.add('is-open'));
  }
  dialog.addEventListener('cancel', e => { e.preventDefault(); close(); });
  dialog.addEventListener('click', e => { if (e.target === dialog || e.target.classList.contains('lightbox-image')) close(); });
  document.addEventListener('click', e => { const button = e.target.closest('[data-image-id]'); if (button) open(button); });
  document.addEventListener('site:language', () => { if (dialog.open) { dialog.close(); dialog.classList.remove('is-open'); clearTimeout(timer); } });
  window.projectLightbox = { close, isOpen: () => dialog.open };
})();
