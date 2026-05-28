
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


function getEventStatus(event){
  return String(event.status || 'published').trim().toLowerCase();
}

function isEventOpen(event){
  return getEventStatus(event) === 'published';
}

function isEventVisible(event){
  const status = getEventStatus(event);
  return status !== 'hidden' && status !== 'draft';
}

function eventUi(event){
  const status = getEventStatus(event);

  switch(status){
    case 'archived':
      return {
        badgeText:'Evento realizado',
        buttonText:'Ver fotos do evento',
        buttonClass:'btn-primary',
        cardClass:'event-archived'
      };

    case 'sold-out':
      return {
        badgeText:'Evento lotado',
        buttonText:'Evento lotado',
        buttonClass:'btn-primary',
        cardClass:'event-sold-out'
      };

    case 'postponed':
      return {
        badgeText:'Evento adiado',
        buttonText:'Evento adiado',
        buttonClass:'btn-primary',
        cardClass:'event-postponed'
      };

    case 'cancelled':
      return {
        badgeText:'Evento cancelado',
        buttonText:'Evento cancelado',
        buttonClass:'btn-primary',
        cardClass:'event-cancelled'
      };

    case 'coming-soon':
      return {
        badgeText:'Em breve',
        buttonText:'Em breve',
        buttonClass:'btn-dark btn-disabled',
        cardClass:'event-coming-soon'
      };

    case 'published':
      return {
        badgeText:event.badge || 'Inscrições abertas',
        buttonText:'Ver detalhes e inscrição',
        buttonClass:'btn-primary',
        cardClass:'event-published'
      };

    default:
      return {
        badgeText:'Evento',
        buttonText:'Ver detalhes',
        buttonClass:'btn-primary',
        cardClass:'event-status-unknown'
      };
  }
}

function eventLink(event) {
  const status = getEventStatus(event);

  if (status === 'hidden' || status === 'draft') return '#';

  return `eventos/evento.html?id=${encodeURIComponent(event.id)}`;
}

function routeCard(route) {
  const published = route.status === 'published';

  return `
    <article class="card route-card ${!published ? 'coming-soon' : ''}">
      <div class="route-media" style="background-image:url('${escapeHtml(route.cover || 'assets/hero.webp')}')">
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
  const status = getEventStatus(event);
  const ui = eventUi(event);
  const href = eventLink(event);
  const isDisabled = ui.buttonClass.includes('btn-disabled') || href === '#';

  return `
    <article class="card route-card event-card ${ui.cardClass}">
      <div class="route-media" style="background-image:url('${escapeHtml(event.cover || 'assets/hero.webp')}')">
        <span class="route-badge">${escapeHtml(ui.badgeText)}</span>
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
          <a class="btn ${ui.buttonClass}" href="${href}" ${isDisabled ? 'aria-disabled="true"' : ''}>
            ${escapeHtml(ui.buttonText)}
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
    .filter(isEventVisible)
    .filter(event => getEventStatus(event) !== 'archived');

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


bindSmartForm();

getSiteData()
  .then(data => {
    fillHome(data);

    window.initLoopCarousel?.({
      grid:'#route-grid',
      prev:'#routes-prev',
      next:'#routes-next',
      itemSelector:'.route-card'
    });

    if (typeof revealInit === 'function') revealInit();
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

    window.initLoopCarousel?.({
      grid:'#home-event-grid',
      prev:'#events-prev',
      next:'#events-next',
      itemSelector:'.route-card'
    });

    if (typeof revealInit === 'function') revealInit();
  })
  .catch(error => {
    const wrap = document.getElementById('home-event-grid');
    if (wrap) {
      wrap.innerHTML = `<div class="empty-state">Não foi possível carregar os eventos agora. ${escapeHtml(error.message)}</div>`;
    }
  });

