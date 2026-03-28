const toggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
if (toggle && navLinks) {
  toggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
  navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }));
 navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      });
  }); 
}

const smartForm = document.querySelector('.js-smart-form');
const formFeedback = document.querySelector('.form-feedback');
if (smartForm) {
  smartForm.addEventListener('submit', async event => {
    event.preventDefault();
    const action = smartForm.dataset.formAction || '';
    if (!action || action.includes('SEU_ID_AQUI')) {
      formFeedback.textContent = 'Formulário pronto. Para ativar no Cloudflare Free, substitua SEU_ID_AQUI pelo endpoint do Formspree.';
      formFeedback.className = 'form-feedback is-error';
      return;
    }
    try {
      const formData = new FormData(smartForm);
      const response = await fetch(action, { method: 'POST', body: formData, headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('Falha no envio');
      smartForm.reset();
      formFeedback.textContent = 'Mensagem enviada com sucesso.';
      formFeedback.className = 'form-feedback is-success';
    } catch {
      formFeedback.textContent = 'Não foi possível enviar agora. Tente novamente ou use o WhatsApp.';
      formFeedback.className = 'form-feedback is-error';
    }
  });
}

async function getSiteData() {
  const response = await fetch('data/percursos.json');
  if (!response.ok) throw new Error('Falha ao carregar dados do site');
  return response.json();
}

function routeLink(route) {
  return route.status === 'published' ? `percurso.html?id=${encodeURIComponent(route.id)}` : '#planejamento';
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


function initMobileRouteCarousel() {
  const grid = document.getElementById('route-grid');
  const prev = document.getElementById('routes-prev');
  const next = document.getElementById('routes-next');
  const dotsWrap = document.getElementById('routes-dots');
  if (!grid || !prev || !next || !dotsWrap) return;

  const isMobile = () => window.innerWidth <= 820;
  let currentIndex = 0;
  let cards = [];
  let dots = [];

  function refreshCards() {
    cards = Array.from(grid.querySelectorAll('.route-card'));
    dotsWrap.innerHTML = cards.map((_, index) =>
      `<button class="mobile-carousel-dot${index === 0 ? ' is-active' : ''}" type="button" aria-label="Ir para o percurso ${index + 1}" data-index="${index}"></button>`
    ).join('');
    dots = Array.from(dotsWrap.querySelectorAll('.mobile-carousel-dot'));
    dots.forEach(dot => {
      dot.addEventListener('click', () => goToIndex(Number(dot.dataset.index)));
    });
    updateState();
  }

  function maxIndex() {
    return Math.max(0, cards.length - 1);
  }

  function getCenteredIndex() {
    if (!cards.length) return 0;
    const gridRect = grid.getBoundingClientRect();
    const center = gridRect.left + gridRect.width / 2;
    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;
    cards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const distance = Math.abs(center - cardCenter);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });
    return bestIndex;
  }

  function updateState() {
    if (!cards.length) return;
    currentIndex = isMobile() ? getCenteredIndex() : 0;

    cards.forEach((card, index) => {
      card.classList.toggle('is-centered', isMobile() && index === currentIndex);
    });

    dots.forEach((dot, index) => {
      dot.classList.toggle('is-active', isMobile() && index === currentIndex);
    });

    if (!isMobile()) {
      prev.disabled = true;
      next.disabled = true;
      return;
    }

    prev.disabled = currentIndex <= 0;
    next.disabled = currentIndex >= maxIndex();
  }

  function goToIndex(index) {
    if (!cards.length) return;
    const safeIndex = Math.max(0, Math.min(index, maxIndex()));
    const card = cards[safeIndex];
    if (!card) return;
    card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    currentIndex = safeIndex;
    window.setTimeout(updateState, 180);
    window.setTimeout(updateState, 360);
  }

  prev.addEventListener('click', () => goToIndex(currentIndex - 1));
  next.addEventListener('click', () => goToIndex(currentIndex + 1));

  let scrollTimer;
  grid.addEventListener('scroll', () => {
    window.clearTimeout(scrollTimer);
    scrollTimer = window.setTimeout(updateState, 70);
  }, { passive: true });

  window.addEventListener('resize', () => window.setTimeout(updateState, 80));

  refreshCards();

  return { refresh: refreshCards };
}

function fillHome(data) {
  const wrap = document.getElementById('route-grid');
  if (!wrap) return;
  wrap.innerHTML = data.routes.map(route => `
    <article class="card route-card ${route.status !== 'published' ? 'coming-soon' : ''}">
      <div class="route-media" style="background-image:url('${route.cover}')">
        <span class="route-badge">${route.badge || (route.status === 'published' ? 'Disponível' : 'Em breve')}</span>
      </div>
      <div class="route-content">
        <div>
          <h3>${route.title}</h3>
          <p>${route.subtitle}</p>
        </div>
        <div class="route-meta">
          <span class="meta-chip">${route.duration}</span>
          <span class="meta-chip">${route.distance}</span>
          <span class="meta-chip">${route.difficulty}</span>
        </div>
        <p>${route.description}</p>
        <div class="route-actions">
          <a class="btn ${route.status === 'published' ? 'btn-primary' : 'btn-dark btn-disabled'}" href="${routeLink(route)}">${route.status === 'published' ? 'Ver detalhes' : 'Em planejamento'}</a>
        </div>
      </div>
    </article>
  `).join('');

  const footerBrand = document.querySelector('[data-brand-name]');
  if (footerBrand) footerBrand.textContent = data.brand.name;
  const whatsLinks = document.querySelectorAll('[data-brand-whatsapp]');
  whatsLinks.forEach(link => link.href = data.brand.whatsapp);
}

getSiteData().then(data => {
  fillHome(data);
  const carousel = initMobileRouteCarousel();
  if (carousel && typeof carousel.refresh === 'function') carousel.refresh();
  revealInit();
}).catch(error => {
  const wrap = document.getElementById('route-grid');
  if (wrap) wrap.innerHTML = `<div class="empty-state">Não foi possível carregar os percursos agora. ${error.message}</div>`;
});
let lastScroll = 0;
const nav = document.querySelector('.nav-shell');

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;

  // não faz nada no topo
  if (currentScroll <= 0) {
    nav.classList.remove('hide');
    return;
  }

  // descendo → esconde
  if (currentScroll > lastScroll) {
    nav.classList.add('hide');
  }
  // subindo → mostra
  else {
    nav.classList.remove('hide');
  }

  lastScroll = currentScroll;
});
