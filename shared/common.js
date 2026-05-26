function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m]));
}

function revealInit() {
  const revealItems = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('is-visible'));
  }
}

document.addEventListener('DOMContentLoaded', revealInit);

function initLoopCarousel(options = {}) {
  const grid =
    typeof options.grid === 'string'
      ? document.querySelector(options.grid)
      : options.grid;

  const prev =
    typeof options.prev === 'string'
      ? document.querySelector(options.prev)
      : options.prev;

  const next =
    typeof options.next === 'string'
      ? document.querySelector(options.next)
      : options.next;

  const dotsWrap =
    typeof options.dots === 'string'
      ? document.querySelector(options.dots)
      : options.dots;

  const itemSelector = options.itemSelector || '.route-card, .speaker-slide, button';

  if (!grid || !prev || !next) return null;

  if (grid.dataset.carouselBound === 'true') {
    return null;
  }

  grid.dataset.carouselBound = 'true';

  let items = [];
  let dots = [];
  let scrollTimer = null;

  function collectItems() {
    items = Array.from(grid.querySelectorAll(itemSelector))
      .filter(item => !item.classList.contains('empty-state'));

    prev.classList.toggle('is-hidden', items.length <= 1);
    next.classList.toggle('is-hidden', items.length <= 1);

    if (dotsWrap) {
      dotsWrap.innerHTML = items.map((_, index) =>
        `<button class="mobile-carousel-dot${index === 0 ? ' is-active' : ''}" type="button" aria-label="Ir para o item ${index + 1}" data-index="${index}"></button>`
      ).join('');

      dots = Array.from(dotsWrap.querySelectorAll('.mobile-carousel-dot'));

      dots.forEach(dot => {
        dot.addEventListener('click', () => goToIndex(Number(dot.dataset.index)));
      });
    }

    updateState();
  }

  function normalizeIndex(index) {
    if (!items.length) return 0;
    return ((index % items.length) + items.length) % items.length;
  }

  function getCenteredIndex() {
    if (!items.length) return 0;

    const gridRect = grid.getBoundingClientRect();
    const center = gridRect.left + gridRect.width / 2;

    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    items.forEach((item, index) => {
      const rect = item.getBoundingClientRect();
      const itemCenter = rect.left + rect.width / 2;
      const distance = Math.abs(center - itemCenter);

      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });

    return bestIndex;
  }

  function updateState() {
    if (!items.length) return;

    const currentIndex = getCenteredIndex();

    items.forEach((item, index) => {
      item.classList.toggle('is-centered', index === currentIndex);
    });

    dots.forEach((dot, index) => {
      dot.classList.toggle('is-active', index === currentIndex);
    });
  }

  function goToIndex(index) {
    if (!items.length) return;

    const item = items[normalizeIndex(index)];

    if (!item) return;

    item.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest'
    });

    window.setTimeout(updateState, 180);
    window.setTimeout(updateState, 380);
  }

  prev.addEventListener('click', event => {
    event.preventDefault();
    goToIndex(getCenteredIndex() - 1);
  });

  next.addEventListener('click', event => {
    event.preventDefault();
    goToIndex(getCenteredIndex() + 1);
  });

  grid.addEventListener('scroll', () => {
    window.clearTimeout(scrollTimer);
    scrollTimer = window.setTimeout(updateState, 80);
  }, { passive: true });

  window.addEventListener('resize', () => {
    window.setTimeout(updateState, 120);
  });

  collectItems();

  return {
    refresh: collectItems,
    goToIndex
  };
}

window.initLoopCarousel = initLoopCarousel;
