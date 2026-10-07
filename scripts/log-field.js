(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 699px)');
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const labels = {
    en: { instructions: 'Drag or use the wheel to explore in any direction. Arrow keys pan. Click or press Enter on an image to zoom. Escape closes the zoom, then LOG.', reference: 'Temporary Pexels reference; not a Carlos Moya project.', zoom: 'Zoom image' },
    de: { instructions: 'In alle Richtungen ziehen oder mit dem Mausrad navigieren. Pfeiltasten verschieben. Bild anklicken oder Enter drücken zum Vergrößern. Escape schließt zuerst den Zoom, dann LOG.', reference: 'Temporäre Pexels-Referenz; kein Projekt von Carlos Moya.', zoom: 'Bild vergrößern' },
    es: { instructions: 'Arrastra o usa la rueda en cualquier dirección. Las flechas desplazan. Haz clic o pulsa Enter sobre una imagen para ampliarla. Escape cierra primero el zoom y después LOG.', reference: 'Referencia temporal de Pexels; no es un proyecto de Carlos Moya.', zoom: 'Ampliar imagen' }
  };
  let current, saved, resizeTimer, fieldLanguage;
  const arrived = new Set();

  function mount() {
    if (current) { saved = current.snapshot(); current.destroy(); current = null; }
    const viewport = document.querySelector('.log-viewport');
    if (viewport) {
      if (fieldLanguage && fieldLanguage !== window.SiteI18n.language) { saved = null; arrived.clear(); }
      fieldLanguage = window.SiteI18n.language;
      current = createField(viewport, saved);
    }
  }

  function createField(viewport, previous) {
    const firstMount = !previous && arrived.size === 0;
    const abort = new AbortController();
    const listen = (node, name, handler, options = {}) => node.addEventListener(name, handler, { ...options, signal: abort.signal });
    const field = viewport.querySelector('.log-field'), pan = viewport.querySelector('.log-pan');
    field.replaceChildren();
    const rails = [...viewport.querySelectorAll('.log-rail')];
    const i18n = window.SiteI18n, language = labels[i18n.language];
    const text = value => i18n.text(value) || '';
    const width = viewport.clientWidth, height = viewport.clientHeight;
    const plateWidth = mobile.matches ? 132 : 172, gap = mobile.matches ? 30 : 48, pitch = plateWidth + gap;
    let x = 0, y = 0, tx = 0, ty = 0, vx = 0, vy = 0, frame = 0, lastFrame = 0;
    let pointer, clickCandidate, suppressClick = false, touchClickHandled = false, zoomed = null, railTimer, observer, settleFrame;
    let active = false, fieldWidth = 0, fieldHeight = 0;
    const plates = [];
    viewport.setAttribute('aria-label', 'LOG — ' + language.instructions);
    viewport.querySelector('.log-instructions').textContent = language.instructions;
    const measuringColumn = document.createElement('div');
    measuringColumn.className = 'log-column'; field.append(measuringColumn);

    window.SiteContent.logEntries.forEach((entry, index) => {
      const image = window.SiteContent.images[entry.images?.[0]] || {};
      const source = entry.src || image.src || (image.available && image.base ? image.base + '-800.webp' : '');
      if (!source) return;
      const w = entry.width || image.width, h = entry.height || image.height;
      if (!(w > 0 && h > 0)) return;
      const number = entry.number || String(index + 1).padStart(3, '0');
      const category = i18n.t('logCategories')[window.SiteContent.logCategories.indexOf(entry.category)] || entry.category;
      const sub = [text(entry.location) || '—', entry.date || entry.year || '—', category].join(' · ');
      const figure = document.createElement('figure');
      figure.className = 'log-plate'; figure.dataset.logNumber = number;
      figure.style.setProperty('--arrival-delay', (Math.random() * .45).toFixed(3) + 's');
      const captionId = 'log-caption-' + number;
      const title = text(entry.title), credit = entry.credit || image.credit || '';
      const description = [entry.placeholder || image.placeholder ? language.reference : '', credit ? credit + ' / Pexels' : '', text(entry.text)].filter(Boolean).join(' ');
      const local = path => /^(?:https?:|data:|blob:)/.test(path) ? path : window.SiteImages.root + path;
      figure.innerHTML = `<div class="log-plate-inner"><button class="log-frame" style="aspect-ratio:${w}/${h}" aria-label="${esc(language.zoom + ': ' + number + ' — ' + title)}" aria-describedby="${esc(captionId)}" aria-expanded="false"><img src="${esc(local(source))}" width="${w}" height="${h}" alt="${esc(text(entry.alt || image.alt) || title)}" loading="lazy" decoding="async" fetchpriority="low" draggable="false"></button><figcaption id="${esc(captionId)}" class="log-caption"><span class="log-plate-number">${esc(number)}</span>${esc(title)}<span class="log-caption-sub">${esc(sub)}</span><span class="sr-only">${esc(description)}</span></figcaption></div>`;
      measuringColumn.append(figure);
      const button = figure.querySelector('button');
      plates.push({ figure, button, entry, number, w: plateWidth, h: plateWidth * h / w, largeSource: local(entry.zoomSrc || image.zoomSrc || (image.base && image.available ? image.base + '-1600.webp' : source)) });
      if (arrived.has(number)) figure.classList.add('is-revealed', 'is-immediate');
    });

    // Balance horizontal and vertical travel: N²*pitch - N*k - stack = 0.
    const fieldScale = new DOMMatrix(getComputedStyle(field).transform).a || 1;
    plates.forEach(plate => { plate.height = plate.figure.getBoundingClientRect().height / fieldScale; });
    const stack = plates.reduce((sum, plate) => sum + plate.height + 44, 0);
    const k = width - height + gap + 95;
    const root = (k + Math.sqrt(k * k + 4 * pitch * stack)) / (2 * pitch);
    const maximum = Math.max(1, Math.ceil(plates.length / 3));
    const minimum = Math.min(maximum, Math.floor(width / pitch) + 2);
    const count = clamp(Math.round(root), Math.max(1, minimum), maximum);
    const columns = Array.from({ length: count }, (_, index) => {
      const node = document.createElement('div'), offset = ((index * 137 % 11) / 11) * 190;
      node.className = 'log-column'; node.style.paddingTop = offset + 'px';
      return { node, height: offset, index };
    });
    columns.forEach(column => field.append(column.node));
    plates.forEach(plate => {
      const column = columns.reduce((shortest, item) => item.height < shortest.height ? item : shortest);
      plate.left = column.index * pitch; plate.top = column.height;
      column.node.append(plate.figure); column.height += plate.height + 44;
    });
    measuringColumn.remove();
    fieldWidth = count * pitch - gap;
    const fieldRect = field.getBoundingClientRect();
    fieldHeight = fieldRect.height / fieldScale;
    // Cache actual fractional layout coordinates; rounded offsetHeight accumulates drift.
    plates.forEach(plate => {
      const rect = plate.figure.getBoundingClientRect();
      plate.left = (rect.left - fieldRect.left) / fieldScale;
      plate.top = (rect.top - fieldRect.top) / fieldScale;
    });
    const normalBounds = { minX: Math.min(96, width - fieldWidth - 96), maxX: 96, minY: Math.min(96, height - fieldHeight - 96), maxY: 96 };
    const bounds = { ...normalBounds };
    x = tx = previous ? bounds.maxX - previous.px * (bounds.maxX - bounds.minX) : (width - fieldWidth) / 2;
    y = ty = previous ? bounds.maxY - previous.py * (bounds.maxY - bounds.minY) : (height - fieldHeight) / 2;
    const clipTargets = () => { tx = clamp(tx, bounds.minX, bounds.maxX); ty = clamp(ty, bounds.minY, bounds.maxY); };
    clipTargets(); x = tx; y = ty;

    function paint() {
      pan.style.transform = `translate3d(${x}px,${y}px,0)`;
      const lengths = [width, height];
      [fieldWidth, fieldHeight].forEach((size, index) => {
        const thumb = rails[index].firstElementChild, length = lengths[index];
        const fraction = Math.min(1, (index ? height : width) / Math.max(1, size));
        const thumbSize = Math.min(length, Math.max(24, length * fraction));
        const range = index ? bounds.maxY - bounds.minY : bounds.maxX - bounds.minX;
        const position = range ? ((index ? bounds.maxY - y : bounds.maxX - x) / range) * (length - thumbSize) : 0;
        thumb.style[index ? 'height' : 'width'] = thumbSize + 'px';
        thumb.style.transform = index ? `translateY(${position}px)` : `translateX(${position}px)`;
      });
    }
    function pulseRails() {
      viewport.classList.add('is-moving'); clearTimeout(railTimer);
      railTimer = setTimeout(() => viewport.classList.remove('is-moving'), 1100);
    }
    function reveal(plate, immediate = false) {
      if (plate.figure.classList.contains('is-revealed')) return;
      if (immediate || reduced.matches) plate.figure.classList.add('is-immediate');
      plate.figure.classList.add('is-revealed'); arrived.add(plate.number);
      observer?.unobserve(plate.figure);
    }
    plates.forEach(plate => {
      if (plate.left + x + plate.w > 0 && plate.left + x < width && plate.top + y + plate.height > 0 && plate.top + y < height) reveal(plate, !firstMount);
    });
    observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) reveal(plates.find(plate => plate.figure === entry.target));
    }), { root: viewport, rootMargin: `${height * .45}px ${width * .40}px` });
    plates.filter(plate => !arrived.has(plate.number)).forEach(plate => observer.observe(plate.figure));
    paint();

    function animate(time) {
      frame = 0;
      if (!active || pointer) return;
      const step = lastFrame ? Math.min(2, (time - lastFrame) / (1000 / 60)) : 1;
      lastFrame = time;
      tx += vx * step; ty += vy * step;
      const oldTx = tx, oldTy = ty; clipTargets();
      if (tx !== oldTx) vx = 0; if (ty !== oldTy) vy = 0;
      vx *= Math.pow(.94, step); vy *= Math.pow(.94, step);
      const mix = 1 - Math.pow(.84, step);
      x += (tx - x) * mix; y += (ty - y) * mix;
      paint(); pulseRails();
      if (Math.abs(vx) > .05 || Math.abs(vy) > .05 || Math.abs(tx - x) > .1 || Math.abs(ty - y) > .1) frame = requestAnimationFrame(animate);
      else { vx = vy = 0; x = tx; y = ty; paint(); lastFrame = 0; }
    }
    function moveTo(nextX, nextY) {
      tx = nextX; ty = nextY; clipTargets(); pulseRails();
      if (reduced.matches) { cancelAnimationFrame(frame); frame = 0; x = tx; y = ty; vx = vy = 0; paint(); }
      else if (active && !frame) { lastFrame = 0; frame = requestAnimationFrame(animate); }
    }
    function closeZoom(focus = true) {
      if (!zoomed) return;
      const button = zoomed.button;
      plates.forEach(plate => {
        plate.figure.classList.remove('is-zoomed');
        ['--zoom', '--caption-shift', '--push-x', '--push-y'].forEach(property => plate.figure.style.removeProperty(property));
        plate.button.setAttribute('aria-expanded', 'false');
      });
      zoomed = null;
      Object.assign(bounds, normalBounds);
      moveTo(x, y);
      if (focus && active) button.focus({ preventScroll: true });
    }
    function fitPlate(plate, scale = 1) {
      const growX = (scale - 1) * plate.w / 2, growY = (scale - 1) * plate.h / 2;
      let nextX = x, nextY = y;
      const left = plate.left + x - growX, right = plate.left + x + plate.w + growX;
      const top = plate.top + y - growY, bottom = plate.top + y + plate.height + growY;
      if (left < 32) nextX += 32 - left; else if (right > width - 32) nextX -= right - width + 32;
      if (top < 44) nextY += 44 - top; else if (bottom > height - 44) nextY -= bottom - height + 44;
      moveTo(nextX, nextY);
    }
    function openZoom(plate) {
      if (zoomed === plate) { closeZoom(); return; }
      closeZoom(false); reveal(plate, true); vx = vy = 0;
      zoomed = plate; plate.figure.classList.add('is-zoomed'); plate.button.setAttribute('aria-expanded', 'true');
      const desired = Math.min((mobile.matches ? .78 : .40) * innerWidth / plate.w, (mobile.matches ? .52 : .60) * innerHeight / plate.h);
      const scale = Math.min(clamp(desired, 1.5, 3.4), (width - 64) / plate.w, (height - (plate.height - plate.h) - 88) / plate.h);
      const growX = (scale - 1) * plate.w / 2, growY = (scale - 1) * plate.h / 2;
      // Temporary extra clearance lets even outermost plates fit while enlarged.
      bounds.maxX = Math.max(96, growX + 32); bounds.maxY = Math.max(96, growY + 44);
      bounds.minX = Math.min(normalBounds.minX, width - fieldWidth - growX - 32);
      bounds.minY = Math.min(normalBounds.minY, height - fieldHeight - growY - 44);
      plate.figure.style.setProperty('--zoom', scale);
      plate.figure.style.setProperty('--caption-shift', growY + 'px');
      const centerX = plate.left + plate.w / 2, centerY = plate.top + plate.h / 2;
      plates.forEach(neighbor => {
        if (neighbor === plate) return;
        const ax = neighbor.left + neighbor.w / 2 - centerX, ay = neighbor.top + neighbor.h / 2 - centerY;
        const d = Math.hypot(ax, ay), f = .55 + 560 * 560 / (d * d + 560 * 560);
        neighbor.figure.style.setProperty('--push-x', ax / (d || 1) * growX * f + 'px');
        neighbor.figure.style.setProperty('--push-y', ay / (d || 1) * growY * f + 'px');
      });
      const image = plate.button.querySelector('img');
      const preload = new Image(); preload.decoding = 'async'; preload.src = plate.largeSource;
      preload.onload = () => { if (viewport.isConnected && zoomed === plate) image.src = plate.largeSource; };
      fitPlate(plate, scale);
    }

    listen(viewport, 'pointerdown', event => {
      if (!active || !event.isPrimary || event.button !== 0 || pointer) return;
      cancelAnimationFrame(frame); frame = 0; lastFrame = 0; vx = vy = 0; tx = x; ty = y;
      const figure = event.target.closest('.log-plate');
      clickCandidate = plates.find(plate => plate.figure === figure) || null;
      suppressClick = false; touchClickHandled = false;
      pointer = { id: event.pointerId, startX: event.clientX, startY: event.clientY, x, y, lastX: event.clientX, lastY: event.clientY, time: event.timeStamp, moved: false };
      viewport.setPointerCapture(event.pointerId);
    });
    listen(viewport, 'pointermove', event => {
      if (!pointer || pointer.id !== event.pointerId) return;
      const dx = event.clientX - pointer.startX, dy = event.clientY - pointer.startY;
      if (Math.hypot(dx, dy) > 6) { pointer.moved = true; viewport.classList.add('is-dragging'); }
      const dt = Math.max(1, event.timeStamp - pointer.time);
      vx = .4 * vx + .6 * (event.clientX - pointer.lastX) / dt * (1000 / 60);
      vy = .4 * vy + .6 * (event.clientY - pointer.lastY) / dt * (1000 / 60);
      pointer.lastX = event.clientX; pointer.lastY = event.clientY; pointer.time = event.timeStamp;
      x = tx = clamp(pointer.x + dx, bounds.minX, bounds.maxX);
      y = ty = clamp(pointer.y + dy, bounds.minY, bounds.maxY);
      paint(); pulseRails();
    });
    function release(event, cancelled = false) {
      if (!pointer || pointer.id !== event.pointerId) return;
      const moved = pointer.moved;
      pointer = null; viewport.classList.remove('is-dragging'); suppressClick = moved || cancelled;
      if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
      if (moved && !cancelled && !reduced.matches) { vx *= 12; vy *= 12; moveTo(tx, ty); }
      else { vx = vy = 0; }
      // Mobile browsers may omit the compatibility click after a recent flick.
      // Resolve an unmoved touch at pointerup and ignore any duplicate native click.
      if (event.pointerType === 'touch' && !moved && !cancelled) {
        const plate = clickCandidate; clickCandidate = null; touchClickHandled = true;
        if (plate) openZoom(plate); else closeZoom(false);
      }
    }
    listen(viewport, 'pointerup', event => release(event));
    listen(viewport, 'pointercancel', event => release(event, true));
    listen(viewport, 'lostpointercapture', event => release(event, true));
    listen(viewport, 'click', event => {
      if (!active) return;
      if (event.detail !== 0 && touchClickHandled) { touchClickHandled = false; return; }
      if (event.detail !== 0 && suppressClick) { suppressClick = false; clickCandidate = null; return; }
      const target = event.target.closest('.log-plate');
      const plate = plates.find(item => item.figure === target) || (event.detail ? clickCandidate : null);
      clickCandidate = null;
      if (plate) openZoom(plate); else closeZoom(false);
    });
    listen(viewport, 'wheel', event => {
      if (!active || event.ctrlKey) return;
      event.preventDefault(); vx = vy = 0;
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? height : 1;
      moveTo(tx - event.deltaX * unit * 2, ty - event.deltaY * unit * 2);
    }, { passive: false });
    listen(viewport, 'keydown', event => {
      const deltas = { ArrowLeft: [80, 0], ArrowRight: [-80, 0], ArrowUp: [0, 80], ArrowDown: [0, -80] };
      if (deltas[event.key] && !event.altKey && !event.ctrlKey && !event.metaKey) {
        event.preventDefault(); vx = vy = 0; moveTo(tx + deltas[event.key][0], ty + deltas[event.key][1]);
      }
    });
    listen(viewport, 'focusin', event => {
      const plate = plates.find(item => item.button === event.target);
      if (plate && active && !zoomed) { reveal(plate, true); fitPlate(plate); }
    });
    // Keyboard focus must never turn the clipped field into a native scroller.
    listen(viewport, 'scroll', () => { viewport.scrollLeft = 0; viewport.scrollTop = 0; });
    function updateActive() {
      const next = document.body.dataset.view === 'log' && viewport.closest('.section-view')?.classList.contains('is-visible') && !document.hidden;
      if (next === active) return;
      active = next;
      if (active) {
        settleFrame = requestAnimationFrame(() => field.classList.add('is-settled'));
        if (previous?.zoom) { const plate = plates.find(item => item.number === previous.zoom); if (plate) openZoom(plate); previous.zoom = null; }
      } else {
        cancelAnimationFrame(frame); frame = 0; pointer = null; vx = vy = 0; tx = x; ty = y;
        viewport.classList.remove('is-dragging', 'is-moving'); clearTimeout(railTimer);
      }
    }
    const visibility = new MutationObserver(updateActive);
    visibility.observe(document.body, { attributes: true, attributeFilter: ['data-view'] });
    visibility.observe(viewport.closest('.section-view'), { attributes: true, attributeFilter: ['class'] });
    listen(document, 'visibilitychange', updateActive);
    updateActive();
    return {
      isZoomed: () => active && !!zoomed,
      closeZoom,
      snapshot: () => ({ px: clamp((normalBounds.maxX - x) / Math.max(1, normalBounds.maxX - normalBounds.minX), 0, 1), py: clamp((normalBounds.maxY - y) / Math.max(1, normalBounds.maxY - normalBounds.minY), 0, 1), zoom: zoomed?.number }),
      stopMotion: () => { vx = vy = 0; moveTo(tx, ty); },
      destroy: () => { abort.abort(); visibility.disconnect(); observer.disconnect(); cancelAnimationFrame(frame); cancelAnimationFrame(settleFrame); clearTimeout(railTimer); }
    };
  }
  document.addEventListener('site:content-rendered', mount);
  addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { if (current) mount(); }, 200); });
  reduced.addEventListener('change', () => current?.stopMotion());
  window.SiteLog = { isZoomed: () => current?.isZoomed() || false, closeZoom: () => current?.closeZoom() };
  mount();
})();
