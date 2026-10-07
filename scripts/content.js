(() => {
  const data = window.SiteContent, i18n = window.SiteI18n;
  const root = location.pathname.replace(/\\/g, '/').includes('/pages/') ? '../' : '';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const t = key => esc(i18n.t(key)), text = value => esc(i18n.text(value));
  const href = project => root + (project.url || 'pages/project.html?id=' + encodeURIComponent(project.id));
  const formatArea = value => new Intl.NumberFormat(i18n.language).format(value) + ' m²';
  function imageMarkup(id, hero = false, preview = false, sizes = '') {
    const item = data.images[id];
    if (!item || !item.available) return `<div class="image-placeholder" style="aspect-ratio:${item ? item.width + '/' + item.height : '3/2'}"><span>[${t(preview ? 'preview' : 'image')}]</span></div>`;
    // Temporary references use one bounded local WebP, including in the lightbox.
    if (item.src) return `<img src="${esc(root + item.src)}" width="${item.width}" height="${item.height}" alt="${text(item.alt)}" loading="${hero || preview ? 'eager' : 'lazy'}" decoding="async">${preview && item.placeholder ? `<span class="placeholder-preview-note">${text(item.previewLabel)}</span>` : ''}`;
    const base = root + item.base;
    return `<img src="${esc(base)}-1600.webp" srcset="${esc(base)}-800.webp 800w, ${esc(base)}-1600.webp 1600w, ${esc(base)}-2400.webp 2400w" sizes="${esc(sizes || (preview ? '360px' : '(max-width: 760px) calc(100vw - 2.3rem), (max-width: 1440px) calc(100vw - 4rem), 1376px'))}" width="${item.width}" height="${item.height}" alt="${text(item.alt)}" loading="${hero || preview ? 'eager' : 'lazy'}" decoding="async" ${hero ? 'fetchpriority="high"' : ''}>`;
  }
  window.SiteImages = { markup: imageMarkup, root };
  function facts(project) {
    const fields = [
      ['type', i18n.text(project.type)], ['role', i18n.text(project.role)], ['lph', project.lph],
      [project.areaKey || 'area', project.area ? formatArea(project.area) : null],
      [project.valueKey || 'value', project.value ? `${project.valueGreaterThan ? '> ' : ''}${new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(project.value)}` : null], ['status', project.statusKey ? i18n.t(project.statusKey) : null]
    ];
    return fields.filter(([,value]) => value).map(([key,value]) => `<div><dt>${t(key)}</dt><dd>${esc(value)}</dd></div>`).join('');
  }
  function homeMarkup() {
    return `<nav class="home-index" aria-label="${t('navigation')}">${data.navigation.map((item,n) => `<a href="${root}pages/${item.id}.html" data-open-view="${item.id}"><span>${item.number}</span><span>${esc(i18n.t('sections')[n])}</span><span class="index-note">${esc(i18n.t('descriptors')[n])}</span></a>`).join('')}</nav>`;
  }
  function sectionMarkup(page, projectId) {
      let body = '';
      if (page === 'projects') {
        body = `<ol class="project-index">${data.projects.map(project => `<li class="project-row"><span class="project-period">${esc(project.period || '—')}</span><div><h2><a href="${esc(href(project))}" data-project-preview="${esc(project.id)}">${esc(project.name)}</a></h2><p class="project-location">${text(project.location)}</p><dl class="project-facts">${facts(project)}</dl></div></li>`).join('')}</ol>`;
      } else if (page === 'work') {
        body = `<ol class="timeline">${data.work.map(job => `<li><span class="period">${esc(job.from)}–${job.to ? esc(job.to) : t('present')}</span><div><h2>${text(job.name)}</h2>${job.role || job.roleKey ? `<p>${job.roleKey ? t(job.roleKey) : text(job.role)}</p>` : ''}<p class="secondary">${text(job.location)}</p></div></li>`).join('')}</ol>`;
      } else if (page === 'about') {
        body = `<div class="page-body"><p class="intro">${t('aboutIntro')}</p><dl class="profile-list"><div><dt>${t('location')}</dt><dd>Valencia · Munich</dd></div><div><dt>${t('languages')}</dt><dd>${i18n.t('languageNames').map((name,n) => `${esc(name)} — ${n === 0 ? t('native') : n === 1 ? 'C2' : 'C1'}`).join('<br>')}</dd></div><div><dt>${t('education')}</dt><dd>${data.education.map(item => `<p><span class="secondary">${esc(item.period)}</span><br>${t(item.key)}<br>${esc(item.institution)}</p>`).join('')}</dd></div><div><dt>${t('experience')}</dt><dd>${t('experienceSummary')}<br><a class="text-link" href="${root}pages/work.html" data-open-view="work">${esc(i18n.t('sections')[1])} →</a></dd></div></dl></div>`;
      } else if (page === 'tools') {
        body = `<div class="page-body">${data.tools.map(group => `<section class="tool-section"><p class="eyebrow">${t(group.group === 'use' ? 'toolsUse' : 'toolsExplore')}</p><h2>${esc(i18n.t('toolCategories')[group.category])}</h2>${group.group === 'explore' ? `<p class="secondary">${t('toolsExploreIntro')}</p>` : ''}<ul class="tool-list">${group.names.map(name => `<li>${esc(name)}</li>`).join('')}</ul>${group.training ? `<h3>${t('training')}</h3><p class="secondary">${group.training.map(esc).join(' · ')}</p>` : ''}</section>`).join('')}</div>`;
      } else if (page === 'current') {
        body = `<dl class="profile-list page-body">${data.current.map(item => `<div><dt>${t(item.label)}</dt><dd>${text(item.value)}</dd></div>`).join('')}</dl>`;
      } else if (page === 'log') {
        body = `<div class="log-archive page-body">${data.logEntries.length ? data.logEntries.map((entry,n) => `<article class="log-entry"><header><h2><span class="log-number">${esc(entry.number || String(n+1).padStart(3,'0'))}</span>${text(entry.title)}</h2><p class="secondary">${[i18n.text(entry.location), entry.date, i18n.t('logCategories')[data.logCategories.indexOf(entry.category)]].filter(Boolean).map(esc).join(' · ')}</p></header>${(entry.images || []).map(id => `<figure><button class="image-trigger" data-image-id="${esc(id)}" aria-label="${t('openImage')}: ${text(data.images[id].alt)}">${imageMarkup(id,false,false,'(max-width: 760px) calc(100vw - 4.6rem), 576px')}</button></figure>`).join('')}${entry.text ? `<p class="log-text">${text(entry.text)}</p>` : ''}</article>`).join('') : `<p class="secondary">${t('logEmpty')}</p><p class="log-categories secondary">${i18n.t('logCategories').map(esc).join(' · ')}</p>`}</div>`;
      } else if (page === 'contact') {
        body = `<div class="archive-empty"><p>${t('contactPending')}</p></div>`;
      } else {
        const id = projectId;
        const project = data.projects.find(item => item.id === id);
        if (project) {
          document.title = `${project.name} — Carlos Moya`;
          const projectSection = esc(i18n.t('sections')[2]);
          const images = project.images || [];
          const image = (imageId,n) => `<figure class="project-image ${n === 0 ? 'project-hero' : ''}"><button class="image-trigger" data-image-id="${esc(imageId)}" aria-label="${t('openImage')}: ${text(data.images[imageId].alt)}">${imageMarkup(imageId,n === 0)}</button><figcaption>${String(n+1).padStart(2,'0')}</figcaption></figure>`;
          body = `<header class="project-heading"><h1>${esc(project.name)}</h1><p>${text(project.location)}${project.period ? `<br>${esc(project.period)}` : ''}</p></header>${images.length ? image(images[0],0) : ''}<div class="project-information"><dl class="project-facts">${facts(project)}</dl><div>${project.descriptionKey ? `<section data-content-status="${project.descriptionProvisional ? 'provisional' : 'final'}"><h2>${t('project')}</h2><p>${t(project.descriptionKey)}</p></section>` : ''}<section><h2>${t('role')}</h2><p>${text(project.role)}</p></section></div></div>${images.length > 1 ? `<section class="project-gallery" aria-label="${t('gallery')}">${images.slice(1).map((id,n) => image(id,n+1)).join('')}</section>` : ''}<nav class="project-pagination" aria-label="${t('navigation')}"><a href="${root}pages/projects.html" data-open-view="projects">${projectSection}</a>${(() => {const next = data.projects[data.projects.indexOf(project)+1];return next ? `<a href="${esc(href(next))}">${t('next')} →</a>` : `<span class="secondary">${t('next')} →</span>`;})()}</nav>`;
        } else body = `<p>${t('projectPending')}</p><a href="${root}pages/projects.html" data-open-view="projects">${esc(i18n.t('sections')[2])}</a>`;
      }
    return body;
  }
  window.SiteRenderer = { homeMarkup, sectionMarkup };
})();
