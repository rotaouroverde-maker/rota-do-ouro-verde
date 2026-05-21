export function Footer(base = './'){
  return `
  <footer class="footer">
    <div class="container footer-grid">
      <div class="footer-brand">
        <div class="footer-brand-top">
          <img src="${base}assets/logo-rota-footer.png" alt="Logo da Rota do Ouro Verde">
          <p>Um caminho de natureza, história e conexão na Serra Fluminense.</p>
        </div>
      </div>

      <div class="footer-info">
        <p><strong>Contato oficial: </strong>
          <a href="https://wa.me/5522988083118" target="_blank" rel="noopener">
            <i class="fa-brands fa-whatsapp"></i>
            WhatsApp
          </a>

          <a href="https://instagram.com/rota_ouroverde/" target="_blank" rel="noopener">
            <i class="fa-brands fa-instagram"></i>
            Instagram
          </a>

          <a href="mailto:contato@rotaouroverde.com.br">
            <i class="fa-solid fa-envelope"></i>
            Email
          </a>
        </p>

        <p>© 2026 Rota do Ouro Verde. Todos os direitos reservados.</p>
      </div>
    </div>
  </footer>`;
}
