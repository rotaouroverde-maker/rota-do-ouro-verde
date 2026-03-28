const toggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (toggle && navLinks) {
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = navLinks.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  document.addEventListener('click', (e) => {
    const clicouNoBotao = toggle.contains(e.target);
    const clicouNoMenu = navLinks.contains(e.target);

    if (!clicouNoBotao && !clicouNoMenu) {
      navLinks.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

async function getSiteData() {
  const response = await fetch('data/percursos.json');
  if (!response.ok) throw new Error('Falha ao carregar os percursos');
  return response.json();
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

function getParamId() {
  return new URLSearchParams(window.location.search).get('id');
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m]));
}

function renderPage(data, route) {
  document.title = `${route.title} | ${data.brand.name}`;

  const title = document.getElementById('route-title');
  const subtitle = document.getElementById('route-subtitle');
  const breadcrumb = document.getElementById('route-breadcrumb');
  const summary = document.getElementById('route-summary');
  const cover = document.getElementById('route-cover');
  const stageWrap = document.getElementById('stage-grid');
  const footerBrand = document.querySelector('[data-brand-name]');
  const whatsLinks = document.querySelectorAll('[data-brand-whatsapp]');
  const supportSection = document.getElementById('route-support-section');

  if (title) title.textContent = route.title || '';
  if (subtitle) subtitle.textContent = route.subtitle || '';
  if (breadcrumb) breadcrumb.textContent = route.title || 'Percurso';

  if (cover) {
    cover.style.backgroundImage = `url('${route.cover}')`;
  }

  if (summary) {
    summary.innerHTML = `
      <div class="card route-panel reveal">
        <p class="section-tag">Ficha do percurso</p>
        <h2>${escapeHtml(route.title || '')}</h2>
        <p class="lead">${escapeHtml(route.description || '')}</p>

        <div class="stats-grid">
          <article class="stat-card">
            <span class="stat-number">${escapeHtml(route.distance || '-')}</span>
            <span class="stat-label">Distância</span>
          </article>
          <article class="stat-card">
            <span class="stat-number">${escapeHtml(route.duration || '-')}</span>
            <span class="stat-label">Duração</span>
          </article>
          <article class="stat-card">
            <span class="stat-number">${escapeHtml(route.difficulty || '-')}</span>
            <span class="stat-label">Dificuldade</span>
          </article>
          <article class="stat-card">
            <span class="stat-number">${escapeHtml(route.region || '-')}</span>
            <span class="stat-label">Região</span>
          </article>
        </div>

        <ul class="route-highlights">
          ${(route.highlights || []).map(item => `<li>${escapeHtml(item)}</li>`).join('')}
        </ul>

        <div class="route-actions" style="margin-top:18px">
          <a class="btn btn-primary" href="${data.brand.whatsapp}" target="_blank" rel="noopener">
            ${escapeHtml(route.ctaText || 'Falar no WhatsApp')}
          </a>
          <a class="btn btn-dark" href="index.html#percursos">
            Ver outros percursos
          </a>
        </div>

        <div class="route-extra-links" id="route-extra-links"></div>
      </div>
    `;
  }

  if (stageWrap) {
    if (!route.stages || !route.stages.length) {
      stageWrap.innerHTML = `
        <div class="empty-state">
          Este percurso ainda está em planejamento. Quando estiver pronto, bastará completar os dados no arquivo
          <strong>data/percursos.json</strong>.
        </div>
      `;
    } else {
      stageWrap.innerHTML = route.stages.map((stage, index) => `
        <button class="stage-card" type="button" data-stage-index="${index}">
          <div class="stage-card-image" style="background-image:url('${stage.cover}')"></div>
          <div class="stage-card-content">
            <span class="stage-kicker">${escapeHtml(stage.label || '')}</span>
            <h3>${escapeHtml(stage.day || '')}</h3>
            <p><strong>${escapeHtml(stage.route || '')}</strong></p>
            <p>${escapeHtml(stage.distance || '')} • ${escapeHtml(stage.summary || '')}</p>
          </div>
        </button>
      `).join('');
    }
  }

  if (footerBrand) footerBrand.textContent = data.brand.name || '';
  whatsLinks.forEach(link => {
    link.href = data.brand.whatsapp || '#';
  });

  renderRouteLinks(route);
  renderRouteSupport(route);
  bindStageModal(route);
  revealInit();
}

function renderRouteLinks(route) {
  const wrap = document.getElementById('route-extra-links');
  if (!wrap) return;

  const links = Array.isArray(route.links) ? route.links : [];

  wrap.innerHTML = links.map(link => `
    <a class="btn ${link.style || 'btn-primary'}" href="${link.url}" target="_blank" rel="noopener">
      ${escapeHtml(link.label || '')}
    </a>
  `).join('');
}

function renderRouteSupport(route) {
  const wrap = document.getElementById('route-support-section');
  if (!wrap) return;

  const items = Array.isArray(route.supportPoints) ? route.supportPoints : [];

  if (!items.length) {
    wrap.innerHTML = '';
    return;
  }

  wrap.innerHTML = `
    <section class="route-support reveal is-visible">
      <div class="section-head" style="margin-top:34px">
        <div>
          <p class="section-tag">Pontos de apoio</p>
          <h2>Estrutura para o caminhante</h2>
        </div>
        <p>Cada percurso pode exibir seus próprios pontos de apoio, conforme os dados cadastrados.</p>
      </div>

      <div class="grid-3 route-support-grid">
        ${items.map((item, index) => `
          <button class="card feature-item route-support-card" type="button" data-support-index="${index}">
            <h3>${escapeHtml(item.title || '')}</h3>
            <p>${escapeHtml(item.summary || '')}</p>
          </button>
        `).join('')}
      </div>
    </section>
  `;

  bindRouteSupportModal(items);
}

function bindRouteSupportModal(items) {
  const buttons = document.querySelectorAll('[data-support-index]');
  const modal = document.getElementById('stage-modal');
  const modalTitle = document.getElementById('stage-title');
  const modalSubtitle = document.getElementById('stage-subtitle');
  const modalContent = document.getElementById('stage-content');
  const closeBtn = document.getElementById('stage-close-btn');
  let lastButton = null;

  if (!buttons.length || !modal || !modalTitle || !modalContent) return;

  function close() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastButton) lastButton.focus();
  }

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const item = items[Number(button.dataset.supportIndex)];
      if (!item) return;

      lastButton = button;
      modalTitle.textContent = item.title || 'Ponto de apoio';
      modalSubtitle.textContent = item.summary || '';

      modalContent.innerHTML = `
        <div class="support-block">
          <h4>Informações</h4>
          <p>${escapeHtml(item.summary || '')}</p>
        </div>
        <div class="support-block" style="margin-top:18px">
          <h4>Detalhes</h4>
          <ul>
            ${(item.details || []).map(detail => `<li>${escapeHtml(detail)}</li>`).join('')}
          </ul>
        </div>
      `;

      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });

  closeBtn?.addEventListener('click', close);
  modal?.addEventListener('click', e => {
    if (e.target.dataset.stageClose === 'true') close();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open')) close();
  });
}

function bindStageModal(route) {
  const buttons = document.querySelectorAll('[data-stage-index]');
  const modal = document.getElementById('stage-modal');
  const modalTitle = document.getElementById('stage-title');
  const modalSubtitle = document.getElementById('stage-subtitle');
  const modalContent = document.getElementById('stage-content');
  const closeBtn = document.getElementById('stage-close-btn');
  let lastButton = null;

  if (!buttons.length || !modal || !modalTitle || !modalSubtitle || !modalContent) return;

  function close() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastButton) lastButton.focus();
  }

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const stage = route.stages[Number(button.dataset.stageIndex)];
      if (!stage) return;

      lastButton = button;
      modalTitle.textContent = `${stage.day || ''} — ${stage.route || ''}`;
      modalSubtitle.textContent = `${stage.distance || ''} • ${stage.summary || ''}`;

      modalContent.innerHTML = `
  <div class="modal-grid">
    <div class="support-block">
      <h4>Perfil da etapa</h4>
      <p>${escapeHtml(stage.profile || '')}</p>
    </div>
    <div class="support-block">
      <h4>Atenção</h4>
      <p>${escapeHtml(stage.attention || 'Confirme clima, hidratação e apoio local antes de sair.')}</p>
    </div>
  </div>

  <div class="support-block" style="margin-top:18px">
    <h4>Destaques</h4>
    <ul>${(stage.highlights || []).map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
  </div>

  ${
    Array.isArray(stage.links) && stage.links.length
      ? `
      <div class="support-block" style="margin-top:18px">
        <h4>Mapa e navegação</h4>
        <div class="route-extra-links">
          ${stage.links.map(link => `
            <a class="btn ${link.style || 'btn-primary'}" href="${link.url}" target="_blank" rel="noopener">
              ${escapeHtml(link.label || '')}
            </a>
          `).join('')}
        </div>
      </div>
      `
      : ''
  }

  <div class="stage-gallery">
    <h4 style="margin-bottom:12px">Fotos do dia</h4>
    <div class="stage-gallery-grid">
      ${(stage.photos || []).map((photo, idx) => `
        <button type="button" data-photo-index="${idx}" data-stage-open-photo="true">
          <img src="${photo.src}" alt="${escapeHtml(photo.alt || stage.day || '')}">
        </button>
      `).join('')}
    </div>
  </div>
`;

      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      modal.querySelectorAll('[data-stage-open-photo]').forEach(photoButton => {
        photoButton.addEventListener('click', () => {
          openPhotoModal(stage, Number(photoButton.dataset.photoIndex || 0));
        });
      });
    });
  });

  closeBtn?.addEventListener('click', close);
  modal?.addEventListener('click', e => {
    if (e.target.dataset.stageClose === 'true') close();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open')) close();
  });
}

function openPhotoModal(stage, startIndex = 0) {
  const modal = document.getElementById('photo-modal');
  const image = document.getElementById('photo-modal-image');
  const title = document.getElementById('photo-modal-title');
  const counter = document.getElementById('photo-modal-counter');
  const thumbs = document.getElementById('photo-modal-thumbs');
  const prev = document.getElementById('photo-prev');
  const next = document.getElementById('photo-next');
  const close = document.getElementById('photo-close-btn');
  let currentIndex = startIndex;
  const photos = stage.photos || [];

  if (!modal || !image || !title || !counter || !thumbs || !prev || !next || !close) return;

  function render() {
    const current = photos[currentIndex];
    if (!current) return;

    image.src = current.src;
    image.alt = current.alt || stage.day || '';
    title.textContent = `${stage.day || ''} — ${stage.route || ''}`;
    counter.textContent = `${currentIndex + 1} / ${photos.length}`;
    prev.disabled = currentIndex === 0;
    next.disabled = currentIndex === photos.length - 1;

    thumbs.innerHTML = photos.map((photo, idx) => `
      <button type="button" class="${idx === currentIndex ? 'active' : ''}" data-thumb-index="${idx}">
        <img src="${photo.src}" alt="${escapeHtml(photo.alt || stage.day || '')}">
      </button>
    `).join('');

    thumbs.querySelectorAll('[data-thumb-index]').forEach(button => {
      button.addEventListener('click', () => {
        currentIndex = Number(button.dataset.thumbIndex);
        render();
      });
    });
  }

  function hide() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = 'hidden';
  }

  prev.onclick = () => {
    if (currentIndex > 0) {
      currentIndex -= 1;
      render();
    }
  };

  next.onclick = () => {
    if (currentIndex < photos.length - 1) {
      currentIndex += 1;
      render();
    }
  };

  close.onclick = hide;
  modal.onclick = event => {
    if (event.target.dataset.photoClose === 'true') hide();
  };

  function onKey(event) {
    if (!modal.classList.contains('open')) {
      document.removeEventListener('keydown', onKey);
      return;
    }

    if (event.key === 'Escape') hide();
    if (event.key === 'ArrowLeft' && currentIndex > 0) {
      currentIndex -= 1;
      render();
    }
    if (event.key === 'ArrowRight' && currentIndex < photos.length - 1) {
      currentIndex += 1;
      render();
    }
  }

  document.addEventListener('keydown', onKey);

  render();
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

getSiteData()
  .then(data => {
    const route =
      data.routes.find(item => item.id === getParamId()) ||
      data.routes.find(item => item.featured) ||
      data.routes[0];

    if (!route) throw new Error('Nenhum percurso encontrado');

    renderPage(data, route);
  })
  .catch(error => {
    const page = document.getElementById('route-summary');
    if (page) {
      page.innerHTML = `<div class="empty-state">Não foi possível abrir o percurso. ${escapeHtml(error.message)}</div>`;
    }
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
