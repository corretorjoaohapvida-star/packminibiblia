(() => {
  'use strict';
  const dialog = document.querySelector('.lightbox');
  const image = document.getElementById('lightbox-image');
  const caption = document.getElementById('lightbox-caption');
  let origin;

  document.querySelectorAll('.zoom').forEach(button => {
    button.addEventListener('click', () => {
      origin = button;
      image.src = button.dataset.image;
      image.alt = button.dataset.caption;
      caption.textContent = button.dataset.caption;
      if (typeof dialog.showModal === 'function') dialog.showModal();
    });
  });

  document.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => { if (origin) origin.focus(); });

  document.querySelectorAll('.purchase-cta').forEach(button => {
    const plan = window.LINA_OFFER?.[button.dataset.plan];
    if (!plan?.checkoutUrl) return;
    let url;
    try { url = new URL(plan.checkoutUrl); } catch { return; }
    if (url.protocol !== 'https:') return;
    const link = button.tagName === 'A' ? button : document.createElement('a');
    link.href = url.href;
    if (link !== button) {
      link.className = button.className;
      link.dataset.plan = button.dataset.plan;
      link.innerHTML = button.innerHTML;
      button.replaceWith(link);
    }
    const status = document.querySelector(`[data-status="${link.dataset.plan}"]`);
    status.textContent = plan.checkoutNote;
  });

  document.querySelectorAll('[data-strip]').forEach(button => {
    button.addEventListener('click', () => {
      const strip = document.getElementById(button.dataset.strip);
      const card = strip?.querySelector('.strip-item');
      if (!strip || !card) return;
      const direction = button.dataset.direction === 'previous' ? -1 : 1;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const gap = parseFloat(getComputedStyle(strip).columnGap) || 0;
      strip.scrollBy({ left: direction * (card.getBoundingClientRect().width + gap), behavior: reduced ? 'auto' : 'smooth' });
    });
  });

  const cycleHours = Number(window.LINA_PROMOTION?.visualCycleHours);
  const timer = document.getElementById('promotion-timer');
  const deadline = document.querySelector('.promotion-deadline');
  if (timer && deadline && Number.isFinite(cycleHours) && cycleHours > 0) {
    const duration = cycleHours * 3600 * 1000;
    const storageKey = 'lina-mini-biblias-visual-cycle-v2';
    let cycleStart = Date.now();
    try {
      const stored = Number(localStorage.getItem(storageKey));
      if (Number.isFinite(stored) && stored > 0 && stored <= Date.now()) cycleStart = stored;
      else localStorage.setItem(storageKey, String(cycleStart));
    } catch { /* A contagem visual funciona mesmo quando o navegador bloqueia armazenamento. */ }
    deadline.hidden = false;
    const updateTimer = () => {
      const elapsed = Math.max(0, Date.now() - cycleStart);
      const seconds = Math.ceil((duration - (elapsed % duration)) / 1000);
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainder = seconds % 60;
      timer.textContent = [hours, minutes, remainder].map(value => String(value).padStart(2, '0')).join(':');
    };
    setInterval(updateTimer, 1000);
    updateTimer();
  }
})();
