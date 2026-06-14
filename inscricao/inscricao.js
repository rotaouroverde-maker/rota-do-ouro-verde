const params = new URLSearchParams(window.location.search);

const type = params.get('type') === 'event' ? 'event' : 'route';
const contentId = params.get(type === 'event' ? 'id' : 'route');

const contentConfig = {
  event: {
    dataFile: '../data/eventos.json',
    dataKey: 'events',
    fallbackLabel: 'Evento',
    formType: 'evento',
    originLabel: 'Eventos',
    originHref: '../eventos/eventos.html',
    originCta: 'Ver outros eventos',
    termsHref: './termo-eventos-rota-ouro-verde.pdf',
    termsText:
      'Declaro que li e concordo com o Termo de Responsabilidade e Participação para Eventos da Rota do Ouro Verde.',
    thanksUrl: id => `./obrigado.html?type=event&id=${encodeURIComponent(id || '')}`
  },

  route: {
    dataFile: '../data/percursos.json',
    dataKey: 'routes',
    fallbackLabel: 'Percurso',
    formType: 'inscricao-trilha',
    originLabel: 'Percursos',
    originHref: '../percursos/percursos.html',
    originCta: 'Ver outros percursos',
    termsHref: './termo-responsabilidade-rota-ouro-verde-final.pdf',
    termsText:
      'Declaro estar apto fisicamente para participar da atividade, ciente dos riscos inerentes ao montanhismo e caminhadas em ambiente natural. Também declaro que li e concordo com o Termo de Responsabilidade.',
    thanksUrl: id => `./obrigado.html?type=route&route=${encodeURIComponent(id || '')}`
  }
};

const config = contentConfig[type];
function setElementVisible(element, visible) {
  if (!element) return;

  element.hidden = !visible;
  element.style.display = visible ? '' : 'none';
}

function setRequired(element, required) {
  if (!element) return;

  if (required) {
    element.setAttribute('required', '');
  } else {
    element.removeAttribute('required');
  }
}


function getContentStatus(content) {
  return String(content?.status || 'published').trim().toLowerCase();
}

function canSubmitRegistration(content) {
  return type !== 'event' || getContentStatus(content) === 'published';
}

function blockRegistration(content) {
  const form = document.getElementById('formulario');
  const signupCard = form?.closest('.signup-card');
  const status = getContentStatus(content);

  const statusMessages = {
    archived: 'Este evento já foi realizado e não aceita novas inscrições.',
    'sold-out': 'As vagas para este evento estão encerradas.',
    postponed: 'Este evento foi adiado. Aguarde novas informações da organização.',
    cancelled: 'Este evento foi cancelado pela organização.',
    'coming-soon': 'As inscrições ainda não foram abertas para este evento.',
    draft: 'Este evento está em preparação.',
    hidden: 'Este evento está indisponível.'
  };

  if (form) {
    form.hidden = true;
    form.style.display = 'none';
  }

  if (signupCard) {
    const existing = document.getElementById('registration-blocked-message');

    if (!existing) {
      const message = document.createElement('div');
      message.id = 'registration-blocked-message';
      message.className = 'empty-state';
      message.textContent = statusMessages[status] || 'As inscrições não estão disponíveis para este evento.';
      signupCard.appendChild(message);
    }
  }
}

function configureFormMode() {
  const routeOnly = document.querySelectorAll('.js-route-only');
  const eventOnly = document.querySelectorAll('.js-event-only');

  routeOnly.forEach(element => setElementVisible(element, type === 'route'));
  eventOnly.forEach(element => setElementVisible(element, type === 'event'));

  const formType = document.getElementById('form-type');
  if (formType) {
    formType.value = config.formType;
  }

  const originLink = document.getElementById('origin-link');
  if (originLink) {
    originLink.href = config.originHref;
    originLink.textContent = config.originLabel;
  }

  const originCtaText = document.getElementById('origin-cta-text');
  const originCta = originCtaText?.closest('a');

  if (originCtaText) {
    originCtaText.textContent = config.originCta;
  }

  if (originCta) {
    originCta.href = config.originHref;
  }

  const termsLink = document.getElementById('terms-link');
  if (termsLink) {
    termsLink.href = config.termsHref;
  }

  const termsText = document.getElementById('terms-text');
  if (termsText) {
    termsText.textContent = config.termsText;
  }

  const startDate = document.getElementById('trail-start');
  const endDate = document.getElementById('trail-end');
  const routeSelect = document.getElementById('route-select');
  const city = document.getElementById('city');
  const escalationRadios = document.querySelectorAll('input[name="experiencia_escalada"]');

  setRequired(startDate, type === 'route');
  setRequired(endDate, type === 'route');
  setRequired(routeSelect, type === 'route');
  setRequired(city, type === 'route');

  if (city) {
    city.name = type === 'event' ? 'cidade' : 'cidade_estado';
  }

  escalationRadios.forEach(input => {
    setRequired(input, type === 'event');

    if (type !== 'event') {
      input.checked = false;
    }
  });
}


function renderEventSummary(eventData) {
  if (type !== 'event') return;

  const summaryTitle = document.getElementById('summary-title');
  const summaryList = document.getElementById('summary-list');

  if (!summaryList) return;

  if (summaryTitle) {
    summaryTitle.textContent = 'Resumo do evento';
  }

  const fields = [
    ['Data', eventData.date],
    ['Horário', eventData.time],
    ['Local', eventData.location],
    ['Categoria', eventData.category],
    ['Público', eventData.audience],
    ['Valor', eventData.price]
  ].filter(([, value]) => value);

  summaryList.innerHTML = fields.map(([label, value]) => `
    <div class="summary-item">
      <strong>${label}</strong>
      <span>${value}</span>
    </div>
  `).join('');
}


async function loadContent() {
  configureFormMode();

  if (!contentId) {
    return;
  }

  try {
    const response = await fetch(config.dataFile);

    if (!response.ok) {
      throw new Error('Falha ao carregar dados da inscrição');
    }

    const data = await response.json();
    const items = data[config.dataKey] || [];
    const content = items.find(item => item.id === contentId);

    if (!content) {
      return;
    }

    if (!canSubmitRegistration(content)) {
      blockRegistration(content);
    }

    const hero = document.querySelector('.inscricao-hero,.thanks-hero');

    if (hero && content.cover) {
      hero.style.backgroundImage =
        `linear-gradient(
          to bottom,
          rgba(0,0,0,.82),
          rgba(0,0,0,.55)
        ),
        url('../${content.cover}')`;
    }

    const title = document.getElementById('route-title');
    const desc = document.getElementById('route-description');
    const summaryTitle = document.getElementById('summary-title');

    if (title) {
      title.textContent = content.title || config.fallbackLabel;
    }

    if (desc) {
      desc.textContent =
        content.description ||
        content.subtitle ||
        `Inscrição para ${config.fallbackLabel.toLowerCase()}.`;
    }

    if (summaryTitle) {
      summaryTitle.textContent = content.title || config.fallbackLabel;
    }

    const routeSelect = document.getElementById('route-select');

    if (routeSelect) {
      routeSelect.innerHTML = '';

      const option = document.createElement('option');
      option.value = content.title || contentId || config.fallbackLabel;
      option.textContent = content.title || contentId || config.fallbackLabel;
      option.selected = true;

      routeSelect.appendChild(option);
    }

    const eventName = document.getElementById('event-name');

    if (eventName) {
      eventName.value = type === 'event' ? (content.title || contentId || 'Evento') : '';
    }

    const distance = document.getElementById('summary-distance');
    const duration = document.getElementById('summary-duration');
    const difficulty = document.getElementById('summary-difficulty');
    const price = document.getElementById('summary-price');

    if (distance) distance.textContent = content.distance || '--';
    if (duration) duration.textContent = content.duration || content.date || '--';
    if (difficulty) difficulty.textContent = content.difficulty || content.category || '--';
    if (price) price.textContent = content.price || '--';

    renderEventSummary(content);

    const thanksTitle = document.getElementById('thanks-title');
    const thanksDescription = document.getElementById('thanks-description');

    if (thanksTitle) {
      thanksTitle.textContent = `Inscrição recebida para ${content.title || config.fallbackLabel}`;
    }

    if (thanksDescription) {
      thanksDescription.textContent = `Recebemos sua inscrição para ${content.title || config.fallbackLabel}.`;
    }

  } catch (error) {
    console.error(error);
  }
}

loadContent();

const form = document.getElementById('formulario');

function setError(input, message) {
  if (!input) return;

  input.classList.add('input-error');
  input.classList.remove('input-valid');

  const error = input.parentElement?.querySelector('.field-error');

  if (error) {
    error.style.display = 'block';
    error.textContent = message;
  }
}

function clearError(input) {
  if (!input) return;

  input.classList.remove('input-error');
  input.classList.add('input-valid');

  const error = input.parentElement?.querySelector('.field-error');

  if (error) {
    error.style.display = 'none';
  }
}

function onlyNumbers(value) {
  return String(value || '').replace(/\D/g, '');
}

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validatePhone(value) {
  const numbers = onlyNumbers(value);

  return numbers.length >= 10 && numbers.length <= 11;
}

function validateCommonFields() {
  let valid = true;

  const fullName = document.getElementById('full-name');
  const whatsapp = document.getElementById('whatsapp');
  const email = document.getElementById('email');
  const city = document.getElementById('city');
  const acceptTerms = document.getElementById('accept-terms');

  if (fullName.value.trim().length < 5) {
    valid = false;
    setError(fullName, 'Digite seu nome completo.');
  } else {
    clearError(fullName);
  }

  if (!validatePhone(whatsapp.value)) {
    valid = false;
    setError(whatsapp, 'Digite um WhatsApp válido com DDD.');
  } else {
    clearError(whatsapp);
  }

  if (!validateEmail(email.value)) {
    valid = false;
    setError(email, 'Digite um e-mail válido.');
  } else {
    clearError(email);
  }

  if (type === 'route' && city.value.trim().length < 3) {
    valid = false;
    setError(city, 'Informe sua cidade e estado.');
  } else {
    clearError(city);
  }

  if (!acceptTerms.checked) {
    valid = false;
    alert('Você precisa concordar com o Termo de Responsabilidade.');
  }

  return valid;
}

function validateRouteFields() {
  let valid = true;

  const startDate = document.getElementById('trail-start');
  const endDate = document.getElementById('trail-end');
  const emergencyContact = document.getElementById('emergency-contact');
  const emergencyPhone = document.getElementById('emergency-phone');

  if (!startDate.value) {
    valid = false;
    setError(startDate, 'Selecione a data inicial.');
  } else {
    clearError(startDate);
  }

  if (!endDate.value) {
    valid = false;
    setError(endDate, 'Selecione a data final.');
  } else if (endDate.value < startDate.value) {
    valid = false;
    setError(endDate, 'A data final não pode ser menor que a inicial.');
  } else {
    clearError(endDate);
  }

  if (emergencyPhone.value.trim() && !validatePhone(emergencyPhone.value)) {
    valid = false;
    setError(emergencyPhone, 'Digite um telefone válido com DDD.');
  } else {
    clearError(emergencyPhone);
  }

  if (
    emergencyPhone.value.trim() &&
    emergencyContact.value.trim().length < 3
  ) {
    valid = false;
    setError(emergencyContact, 'Informe o contato de emergência.');
  } else {
    clearError(emergencyContact);
  }

  return valid;
}

function validateEventFields() {
  const escalationSelected =
    document.querySelector('input[name="experiencia_escalada"]:checked');

  if (!escalationSelected) {
    alert('Informe se você tem experiência em escalada.');
    return false;
  }

  return true;
}

if (form) {
  form.addEventListener('submit', async event => {
    event.preventDefault();

    const valid =
      validateCommonFields() &&
      (type === 'event' ? validateEventFields() : validateRouteFields());

    if (!valid) {
      return;
    }

    try {
      const response = await fetch(
        form.action,
        {
          method: 'POST',
          body: new FormData(form),
          headers: {
            Accept: 'application/json'
          }
        }
      );

      if (response.ok) {
        window.location.href =
          config.thanksUrl(contentId);
      } else {
        alert('Não foi possível enviar sua inscrição.');
      }

    } catch (error) {
      console.error(error);
      alert('Erro ao enviar inscrição.');
    }
  });
}

const trilhaSim = document.getElementById('trilha-sim');
const trilhaNao = document.getElementById('trilha-nao');
const opcoesTrilha = document.getElementById('opcoes-trilha');
const nascerSol = document.getElementById('nascer-sol');

function atualizarTrilhas() {
  if (!trilhaSim || !opcoesTrilha) {
    return;
  }

  const mostrar = trilhaSim.checked;

  opcoesTrilha.hidden = !mostrar;
  opcoesTrilha.style.display = mostrar ? '' : 'none';

  if (!mostrar && nascerSol) {
    nascerSol.value = 'Não';
  }
}

if (trilhaSim && trilhaNao && opcoesTrilha) {
  trilhaSim.addEventListener('change', atualizarTrilhas);
  trilhaNao.addEventListener('change', atualizarTrilhas);

  atualizarTrilhas();
}
