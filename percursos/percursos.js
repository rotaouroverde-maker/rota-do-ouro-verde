async function getPercursosData() {
  const response = await fetch('../data/percursos.json');
  if (!response.ok) throw new Error('Falha ao carregar percursos');
  return response.json();
}

function assetPath(path = '') {
  if (!path) return '../assets/hero.jpg';
  if (path.startsWith('http') || path.startsWith('../')) return path;
  return `../${path}`;
}

function routeLink(route) {
  return route.status === 'published'
    ? `percurso.html?id=${encodeURIComponent(route.id)}`
    : '#';
}

function routeCard(route) {
  const published = route.status === 'published';
  const href = routeLink(route);

  return `
    <article class="card route-card ${!published ? 'coming-soon' : ''}">
      <div class="route-media" style="background-image:url('${escapeHtml(assetPath(route.cover || route.image || 'assets/hero.jpg'))}')">
        <span class="route-badge">${escapeHtml(route.badge || (published ? 'Disponível agora' : 'Em breve'))}</span>
      </div>

      <div class="route-content">
        <h3>${escapeHtml(route.title || route.nome || '')}</h3>
        <p>${escapeHtml(route.subtitle || route.resumo || '')}</p>

        <div class="route-meta">
          ${route.duration ? `<span class="meta-chip">${escapeHtml(route.duration)}</span>` : ''}
          ${route.distance ? `<span class="meta-chip">${escapeHtml(route.distance)}</span>` : ''}
          ${route.difficulty ? `<span class="meta-chip">${escapeHtml(route.difficulty)}</span>` : ''}
        </div>

        <p>${escapeHtml(route.description || '')}</p>

        <div class="route-actions">
          <a class="btn ${published ? 'btn-primary' : 'btn-dark btn-disabled'}" href="${href}">
            ${published ? 'Ver detalhes' : 'Em breve'}
          </a>
        </div>
      </div>
    </article>
  `;
}

getPercursosData()
  .then(data => {
    const wrap = document.getElementById('route-list-grid');
    if (!wrap) return;

    const routes = (data.routes || data.percursos || [])
      .filter(route => route.status !== 'hidden');

    wrap.innerHTML = routes.length
      ? routes.map(routeCard).join('')
      : '<div class="empty-state">Nenhum percurso disponível no momento.</div>';

    revealInit();

    window.initLoopCarousel?.({
      grid:'#route-list-grid',
      prev:'#route-prev',
      next:'#route-next',
      itemSelector:'.route-card'
    });
  })
  .catch(error => {
    const wrap = document.getElementById('route-list-grid');
    if (wrap) {
      wrap.innerHTML = `<div class="empty-state">Não foi possível carregar os percursos agora. ${escapeHtml(error.message)}</div>`;
    }
  });

