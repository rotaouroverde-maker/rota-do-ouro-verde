async function getSiteData() {
  const response = await fetch('data/percursos.json');
  if (!response.ok) throw new Error('Falha ao carregar dados do site');
  return response.json();
}

async function getEventsData() {
  const response = await fetch('data/eventos.json');
  if (!response.ok) throw new Error('Falha ao carregar eventos');
  return response.json();
}

function routeLink(route) {
  return route.status === 'published'
    ? `percursos/percurso.html?id=${encodeURIComponent(route.id)}`
    : '#planejamento';
}

function eventLink(event) {
  if (event.status === 'hidden') return '#';

  if (event.id === 'trajano-in-the-mountain') {
    return 'eventos/trajanointhemontain.html';
  }

  if (event.id === 'evento-generico') {
    return 'eventos/evento-generico.html';
  }

  return '#';
}

function routeCard(route) {
  const published = route.status === 'published';

  return `
    <article class="card route-card ${!published ? 'coming-soon' : ''}">
      <div class="route-media" style="background-image:url('${escapeHtml(route.cover || 'assets/hero.jpg')}')">
        <span class="route-badge">${escapeHtml(route.badge || (published ? 'Disponível' : 'Em breve'))}</span>
      </div>

      <div class="route-content">
        <div>
          <h3>${escapeHtml(route.title || '')}</h3>
          <p>${escapeHtml(route.subtitle || '')}</p>
        </div>

        <div class="route-meta">
          ${route.duration ? `<span class="meta-chip">${escapeHtml(route.duration)}</span>` : ''}
          ${route.distance ? `<span class="meta-chip">${escapeHtml(route.distance)}</span>` : ''}
          ${route.difficulty ? `<span class="meta-chip">${escapeHtml(route.difficulty)}</span>` : ''}
        </div>

        <p>${escapeHtml(route.description || '')}</p>

        <div class="route-actions">
          <a class="btn ${published ? 'btn-primary' : 'btn-dark btn-disabled'}" href="${routeLink(route)}">
            ${published ? 'Ver detalhes' : 'Em planejamento'}
          </a>
        </div>
      </div>
    </article>
  `;
}

function eventCard(event) {
  const archived = event.status === 'archived';
  const published = event.status === 'published';
  const draft = event.status === 'draft';
  const href = eventLink(event);

  const badgeText = archived
    ? 'Evento realizado'
    : event.badge || 'Evento';

  const buttonText = archived
    ? 'Ver fotos do evento'
    : draft
      ? 'Em breve'
      : 'Ver detalhes e inscrição';

  const buttonClass = draft
    ? 'btn-dark btn-disabled'
    : 'btn-primary';

  return `
    <article class="card route-card event-card ${draft ? 'coming-soon' : ''}">
      <div class="route-media" style="background-image:url('${escapeHtml(event.cover || 'assets/hero.jpg')}')">
        <span class="route-badge">${escapeHtml(badgeText)}</span>
      </div>

      <div class="route-content">
        <div>
          <p class="section-tag event-card-date">${escapeHtml(event.date || '')}</p>
          <h3>${escapeHtml(event.title || '')}</h3>
          <p>${escapeHtml(event.subtitle || '')}</p>
        </div>

        <div class="route-meta">
          <span class="meta-chip">${escapeHtml(event.location || '-')}</span>
          <span class="meta-chip">${escapeHtml(event.category || '-')}</span>
        </div>

        <p>${escapeHtml(event.description || '')}</p>

        <div class="route-actions">
          <a class="btn ${buttonClass}" href="${href}">
            ${buttonText}
          </a>
        </div>
      </div>
    </article>
  `;
}

function fillHome(data) {
  const wrap = document.getElementById('route-grid');
  if (!wrap) return;

  const routes = (data.routes || [])
    .filter(route => route.status !== 'hidden');

  wrap.innerHTML = routes.length
    ? routes.map(routeCard).join('')
    : '<div class="empty-state">Nenhum percurso disponível no momento.</div>';

  const footerBrand = document.querySelector('[data-brand-name]');
  if (footerBrand) footerBrand.textContent = data.brand?.name || 'Rota do Ouro Verde';

  const whatsLinks = document.querySelectorAll('[data-brand-whatsapp]');
  whatsLinks.forEach(link => {
    link.href = data.brand?.whatsapp || '#';
  });
}

function fillHomeEvents(data) {
  const wrap = document.getElementById('home-event-grid');
  if (!wrap) return;

  const events = (data.events || [])
    .filter(event => event.status !== 'hidden');

  wrap.innerHTML = events.length
    ? events.slice(0, 3).map(eventCard).join('')
    : '<div class="empty-state">Nenhum evento cadastrado no momento.</div>';
}

function bindSmartForm() {
  const smartForm = document.querySelector('.js-smart-form');
  const formFeedback = document.querySelector('.form-feedback');

  if (!smartForm || !formFeedback || smartForm.dataset.bound === 'true') return;

  smartForm.dataset.bound = 'true';

  smartForm.addEventListener('submit', async event => {
    event.preventDefault();

    const action = smartForm.dataset.formAction || smartForm.action || '';

    if (!action || action.includes('SEU_ID_AQUI')) {
      formFeedback.textContent = 'Formulário pronto. Configure o endpoint de envio.';
      formFeedback.className = 'form-feedback is-error';
      return;
    }

    try {
      const formData = new FormData(smartForm);
      const response = await fetch(action, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' }
      });

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

function initMobileRouteCarousel() {
  const grid = document.getElementById('route-grid');
  const prev = document.getElementById('routes-prev');
  const next = document.getElementById('routes-next');
  const dotsWrap = document.getElementById('routes-dots');

  if (!grid || !prev || !next || !dotsWrap) return null;

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

    prev.disabled = !isMobile() || currentIndex <= 0;
    next.disabled = !isMobile() || currentIndex >= maxIndex();
  }

  function goToIndex(index) {
    if (!cards.length) return;

    const safeIndex = Math.max(0, Math.min(index, maxIndex()));
    const card = cards[safeIndex];

    if (!card) return;

    card.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest'
    });

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

bindSmartForm();

getSiteData()
  .then(data => {
    fillHome(data);

    const carousel = initMobileRouteCarousel();
    if (carousel && typeof carousel.refresh === 'function') carousel.refresh();

    revealInit();
  })
  .catch(error => {
    const wrap = document.getElementById('route-grid');
    if (wrap) {
      wrap.innerHTML = `<div class="empty-state">Não foi possível carregar os percursos agora. ${escapeHtml(error.message)}</div>`;
    }
  });

getEventsData()
  .then(data => {
    fillHomeEvents(data);
    revealInit();
  })
  .catch(error => {
    const wrap = document.getElementById('home-event-grid');
    if (wrap) {
      wrap.innerHTML = `<div class="empty-state">Não foi possível carregar os eventos agora. ${escapeHtml(error.message)}</div>`;
    }
  });
