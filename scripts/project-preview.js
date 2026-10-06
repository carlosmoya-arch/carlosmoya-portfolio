(() => {
  const preview = document.createElement('div');
  preview.className = 'project-preview'; preview.setAttribute('aria-hidden', 'true');
  document.body.append(preview);
  const canHover = matchMedia('(hover: hover) and (pointer: fine)');
  const hide = () => preview.classList.remove('is-visible');
  function show(link) {
    if (!canHover.matches) return;
    const project = window.SiteContent.projects.find(item => item.id === link.dataset.projectPreview);
    if (!project) return;
    preview.innerHTML = window.SiteImages.markup(project.previewImage,false,true);
    const rect = link.getBoundingClientRect();
    const width = Math.min(360,innerWidth-32), height = Math.min(280,innerHeight-32);
    preview.style.width = width + 'px'; preview.style.height = height + 'px';
    const right = rect.right + 40;
    preview.style.left = Math.max(16,Math.min(right,innerWidth-width-16)) + 'px';
    preview.style.top = Math.max(16,Math.min(rect.top,innerHeight-height-16)) + 'px';
    preview.classList.add('is-visible');
  }
  document.addEventListener('pointerover', e => { const link = e.target.closest('[data-project-preview]'); if (link && !link.contains(e.relatedTarget)) show(link); });
  document.addEventListener('pointerout', e => { const link = e.target.closest('[data-project-preview]'); if (link && !link.contains(e.relatedTarget)) hide(); });
  document.addEventListener('site:language', hide);
  document.addEventListener('site:view-change', hide);
  document.addEventListener('scroll', hide, {capture:true,passive:true}); addEventListener('resize', hide);
  canHover.addEventListener('change', hide);
})();

