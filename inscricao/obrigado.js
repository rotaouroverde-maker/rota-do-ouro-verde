
const params = new URLSearchParams(window.location.search);

const type = params.get('type') || 'route';

const title = document.getElementById('thanks-title');
const description = document.getElementById('thanks-description');
const subtitle = document.getElementById('thanks-subtitle');
const list = document.getElementById('thanks-list');

if(type === 'event'){

  if(title){
    title.textContent =
      'Inscrição no evento recebida!';
  }

  if(description){
    description.textContent =
      'Recebemos sua inscrição e entraremos em contato caso necessário.';
  }

  if(subtitle){
    subtitle.textContent =
      'Próximos passos:';
  }

  if(list){
    list.innerHTML = `
      <li>Confirmar os dados da sua inscrição</li>
      <li>Enviar orientações do evento</li>
      <li>Compartilhar informações importantes</li>
      <li>Atualizar você sobre programação e logística</li>
    `;
  }

}
