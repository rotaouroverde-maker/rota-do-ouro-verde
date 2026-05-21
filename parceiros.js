document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('partners-wrap');

  if (!container) return;

  try {
    const response = await fetch('data/parceiros.json', {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Erro ao carregar parceiros.json: ${response.status}`);
    }

    const parceiros = await response.json();

    if (!Array.isArray(parceiros) || parceiros.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          Nenhum parceiro cadastrado.
        </div>
      `;
      return;
    }

    container.innerHTML = '';

    parceiros.forEach(parceiro => {

      const link = document.createElement('a');

      // URL correta do JSON
      link.href = parceiro.url || '#';

      // Abrir em nova aba
      link.target = '_blank';
      link.rel = 'noopener noreferrer';

      link.className = 'partner-logo-link';

      // Nome correto do JSON
      link.setAttribute(
        'aria-label',
        parceiro.name || 'Parceiro'
      );

      const img = document.createElement('img');

      img.src = parceiro.logo || '';
      img.alt = parceiro.name || 'Parceiro';

      img.loading = 'lazy';

      link.appendChild(img);

      container.appendChild(link);
    });

  } catch (error) {

    console.error(error);

    container.innerHTML = `
      <div class="empty-state">
        Não foi possível carregar os apoiadores.
      </div>
    `;
  }
});