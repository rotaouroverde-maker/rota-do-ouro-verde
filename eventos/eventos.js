function assetPath(path = '') {
  if (!path) return '../assets/hero.jpg';
  if (path.startsWith('http') || path.startsWith('../')) return path;
  return `../${path}`;
}

function eventLink(event) {
  if (event.status === 'hidden') return '#';

  if (event.id === 'trajano-in-the-mountain') {
    return 'trajanointhemontain.html';
  }

  if (event.id === 'evento-generico') {
    return 'evento-generico.html';
  }

  return '#';
}

async function getEventsData() {
  const response = await fetch('../data/eventos.json');

  if (!response.ok) {
    throw new Error('Falha ao carregar eventos');
  }

  return response.json();
}

function eventCard(event) {
  const archived = event.status === 'archived';
  const published = event.status === 'published';
  const draft = event.status === 'draft';
  const hidden = event.status === 'hidden';
  const href = eventLink(event);

  const badgeText = archived
    ? 'Evento realizado'
    : event.badge || 'Evento';

  const buttonText = archived
    ? 'Ver fotos do evento'
    : draft
      ? 'Em breve'
      : 'Ver detalhes e fazer inscrição';

  const buttonClass = draft || hidden
    ? 'btn-dark btn-disabled'
    : 'btn-primary';

  return `
    <article class="card route-card event-card ${draft ? 'coming-soon' : ''}">
      <div class="route-media" style="background-image:url('${escapeHtml(assetPath(event.cover || 'assets/hero.jpg'))}')">
        <span class="route-badge">${escapeHtml(badgeText)}</span>
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
          <a class="btn ${buttonClass}" href="${href}">
            ${buttonText}
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

    const events = (data.events || [])
      .filter(event => event.status !== 'hidden');

    wrap.innerHTML = events.length
      ? events.map(eventCard).join('')
      : '<div class="empty-state">Nenhum evento cadastrado no momento.</div>';

    revealInit();
  })
  .catch(error => {
    const wrap = document.getElementById('event-list-grid');

    if (wrap) {
      wrap.innerHTML = `<div class="empty-state">Não foi possível carregar os eventos agora. ${escapeHtml(error.message)}</div>`;
    }
  });
