function assetPath(path = '') {
  if (!path) return '../assets/hero.jpg';

  if (
    path.startsWith('http') ||
    path.startsWith('../')
  ) {
    return path;
  }

  return `../${path}`;
}

function getEventStatus(event) {
  return String(event.status || 'published').trim().toLowerCase();
}



function isEventVisible(event) {
  const status = getEventStatus(event);
  return status !== 'hidden' && status !== 'draft';
}



function eventLink(event) {
  const status = getEventStatus(event);

  if (status === 'hidden' || status === 'draft') {
    return '#';
  }

  return `evento.html?id=${encodeURIComponent(event.id)}`;
}

function eventUi(event) {
  const status = getEventStatus(event);

  switch(status) {
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



async function getEventsData() {
  const response = await fetch('../data/eventos.json');

  if (!response.ok) {
    throw new Error('Falha ao carregar eventos');
  }

  return response.json();
}

function eventCard(event) {
  const status = getEventStatus(event);
  const ui = eventUi(event);
  const href = eventLink(event);
  const disabled = ui.buttonClass.includes('btn-disabled') || href === '#';

  return `
    <article class="card route-card event-card ${ui.cardClass}">
      <div class="route-media" style="background-image:url('${escapeHtml(assetPath(event.cover || 'assets/hero.jpg'))}')">
        <span class="route-badge">${escapeHtml(ui.badgeText)}</span>
      </div>

      <div class="route-content">
        <p class="section-tag event-card-date">${escapeHtml(event.date || '')}</p>
        <h3>${escapeHtml(event.title || '')}</h3>
        <p>${escapeHtml(event.subtitle || '')}</p>

        <div class="route-meta">
          <span class="meta-chip">${escapeHtml(event.location || '-')}</span>
          <span class="meta-chip">${escapeHtml(event.category || '-')}</span>
        </div>

        <p>${escapeHtml(event.description || '')}</p>

        <div class="route-actions">
          <a class="btn ${ui.buttonClass}" href="${href}" ${disabled ? 'aria-disabled="true"' : ''}>
            ${escapeHtml(ui.buttonText)}
          </a>
        </div>
      </div>
    </article>
  `;
}

getEventsData()
  .then(data => {
    const wrap = document.getElementById('event-list-grid');

    if (!wrap) return;

    const allEvents = (data.events || [])
      .filter(isEventVisible);

    const upcomingEvents = allEvents
      .filter(event => getEventStatus(event) !== 'archived');

    const archivedEvents = allEvents
      .filter(event => getEventStatus(event) === 'archived');

    wrap.innerHTML = upcomingEvents.length
      ? upcomingEvents.map(eventCard).join('')
      : '<div class="empty-state">Nenhum próximo evento cadastrado no momento.</div>';

    const archivedWrap =
      document.getElementById('archived-event-list-grid');

    if (archivedWrap) {
      archivedWrap.innerHTML = archivedEvents.length
        ? archivedEvents.map(eventCard).join('')
        : '<div class="empty-state">Nenhum evento realizado cadastrado.</div>';
    }

    revealInit();

    window.initLoopCarousel?.({
      grid:'#event-list-grid',
      prev:'#event-prev',
      next:'#event-next',
      itemSelector:'.route-card'
    });
  })
  .catch(error => {
    const wrap = document.getElementById('event-list-grid');

    if (wrap) {
      wrap.innerHTML = `<div class="empty-state">Não foi possível carregar os eventos agora. ${escapeHtml(error.message)}</div>`;
    }
  });

