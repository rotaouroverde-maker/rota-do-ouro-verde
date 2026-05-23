export function Header(base = './'){
  const isHome = location.pathname.endsWith('/') || location.pathname.endsWith('/index.html');
  const home = isHome ? '#inicio' : `${base}index.html#inicio`;
  const sobre = isHome ? '#sobre' : `${base}index.html#sobre`;
  const percursos = isHome ? '#percursos' : `${base}percursos/percursos.html`;
  const eventos = isHome ? '#eventos' : `${base}eventos/eventos.html`;
  const contato = isHome ? '#contato' : `${base}index.html#contato`;
  const parceiros = isHome ? '#parceiros' : `${base}index.html#parceiros`;

  return `
  <nav class="nav-shell">
    <div class="nav container">
      <a class="brand-wrap" href="${home}" aria-label="Rota do Ouro Verde">
        <img src="${base}assets/logo.webp" class="brand-logo" alt="Rota do Ouro Verde">
      </a>

      <button class="menu-toggle" aria-label="Abrir menu" aria-expanded="false">☰</button>

      <ul class="nav-links">
        <li><a href="${sobre}">Sobre</a></li>
        <li><a href="${percursos}">Percursos</a></li>
        <li><a href="${eventos}">Eventos</a></li>
        <li><a href="${contato}">Contato</a></li>
        <li><a href="${parceiros}">Parceiros</a></li>
      </ul>
    </div>
  </nav>`;
}
