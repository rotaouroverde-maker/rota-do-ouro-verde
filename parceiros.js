document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('partners-wrap');
  if (!container) return;

  try {
    const response = await fetch('data/parceiros.json', { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`Erro ao carregar parceiros.json: ${response.status}`);
    }

    const parceiros = await response.json();

    if (!Array.isArray(parceiros) || parceiros.length === 0) {
      container.innerHTML = '<div class="empty-state">Nenhum parceiro cadastrado.</div>';
      return;
    }

    container.innerHTML = '';

    parceiros.forEach(parceiro => {
      const link = document.createElement('a');
      link.href = parceiro.link || '#';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.className = 'partner-logo-link';
      link.setAttribute('aria-label', parceiro.nome || 'Parceiro');

      const img = document.createElement('img');
      img.src = parceiro.logo || '';
      img.alt = parceiro.nome || 'Parceiro';
      img.loading = 'lazy';

      link.appendChild(img);
      container.appendChild(link);
    });
  } catch (error) {
    console.error(error);
    container.innerHTML = '<div class="empty-state">Não foi possível carregar os apoiadores.</div>';
  }
});