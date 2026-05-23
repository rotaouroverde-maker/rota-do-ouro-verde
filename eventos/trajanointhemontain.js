const FIXED_EVENT_ID = 'trajano-in-the-mountain';

function isArchivedEvent(event) {
  return event.status === 'archived';
}

function isPublishedEvent(event) {
  return event.status === 'published';
}

function assetPath(path = '') {
  if (!path) return '../assets/hero.jpg';
  if (path.startsWith('http') || path.startsWith('../')) return path;
  return `../${path}`;
}

function setElementVisible(element, visible) {
  if (!element) return;

  element.hidden = !visible;
  element.style.display = visible ? '' : 'none';
}

async function getEventsData() {
  const response = await fetch('../data/eventos.json');

  if (!response.ok) {
    throw new Error('Falha ao carregar eventos');
  }

  return response.json();
}

function infoRow(label, value) {
  if (!value) return '';

  return `
    <div class="event-info-row">
      <strong>${escapeHtml(label)}</strong>
      <span>${escapeHtml(value)}</span>
    </div>
  `;
}

function renderSchedule(schedule = []) {
  if (!schedule.length) {
    return '<div class="empty-state">Programação em atualização.</div>';
  }

  return schedule.map(day => `
    <div class="schedule-day">
      <div class="schedule-day-header">
        ${escapeHtml(day.day || '')}
      </div>

      <div class="schedule-day-items">
        ${(day.activities || []).map(activity => `
          <article class="card schedule-item">
            <div class="schedule-time">${escapeHtml(activity.time || '')}</div>

            <div>
              <h3>${escapeHtml(activity.title || '')}</h3>
              <p>${escapeHtml(activity.description || '')}</p>
            </div>
          </article>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function renderGallery(gallery = []) {
  if (!gallery.length) {
    return '<div class="empty-state">As fotos deste evento serão publicadas em breve.</div>';
  }

  return gallery.map((item, index) => {
    const src = typeof item === 'string' ? item : item.src;
    const alt = typeof item === 'string'
      ? `Foto ${index + 1} do evento`
      : item.alt || `Foto ${index + 1} do evento`;

    return `<img src="${escapeHtml(assetPath(src))}" alt="${escapeHtml(alt)}">`;
  }).join('');
}

function bindEventForm() {
  const form = document.querySelector('.js-smart-form');
  const feedback = form?.querySelector('.form-feedback');

  if (!form || !feedback || form.dataset.bound === 'true') return;

  form.dataset.bound = 'true';

  form.addEventListener('submit', async event => {
    event.preventDefault();

    const action = form.dataset.formAction || form.action || '';

    if (!action || action.includes('SEU_ID_AQUI')) {
      feedback.textContent = 'Formulário pronto. Configure o endpoint de envio no data/eventos.json.';
      feedback.className = 'form-feedback is-error';
      return;
    }

    try {
      const formData = new FormData(form);

      const response = await fetch(action, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Falha no envio');
      }

      form.reset();

      feedback.textContent = 'Inscrição enviada com sucesso. A organização entrará em contato se necessário.';
      feedback.className = 'form-feedback is-success';
    } catch {
      feedback.textContent = 'Não foi possível enviar agora. Tente novamente ou entre em contato pelo WhatsApp.';
      feedback.className = 'form-feedback is-error';
    }
  });
}

function bindSpeakerModal() {
  const modal = document.getElementById('speaker-modal');
  const modalImage = document.getElementById('modal-image');
  const modalName = document.getElementById('modal-name');
  const modalRole = document.getElementById('modal-role');
  const modalDescription = document.getElementById('modal-description');
  const closeButton = document.getElementById('speaker-modal-close');
  const cards = document.querySelectorAll('.speaker-slide');

  if (!modal || !modalImage || !modalName || !modalRole || !modalDescription || !closeButton || !cards.length) {
    return;
  }

  function openModal(card) {
    const cardImage = card.querySelector('img');

    modalImage.src = card.dataset.image || cardImage.src;
    modalImage.alt = card.dataset.name || cardImage.alt || '';

    modalName.textContent = card.dataset.name || '';
    modalRole.textContent = card.dataset.role || '';
    modalDescription.textContent = card.dataset.description || '';

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  cards.forEach(card => {
    card.addEventListener('click', () => {
      openModal(card);
    });
  });

  closeButton.addEventListener('click', closeModal);

  modal.addEventListener('click', event => {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

function renderEvent(event, data) {
  const archived = isArchivedEvent(event);
  const published = isPublishedEvent(event);

  document.body.classList.toggle('event-archived', archived);
  document.body.classList.toggle('event-published', published);

  document.title = `${event.title || 'Evento'} | ${data.brand?.name || 'Rota do Ouro Verde'}`;

  const hero = document.getElementById('event-hero');

  if (hero) {
    hero.style.backgroundImage = `linear-gradient(120deg,rgba(0,0,0,.72),rgba(0,0,0,.28)),url('${assetPath(event.cover)}')`;
  }

  const breadcrumb = document.getElementById('event-breadcrumb');
  const eyebrow = document.getElementById('event-eyebrow');
  const title = document.getElementById('event-title');
  const subtitle = document.getElementById('event-subtitle');
  const description = document.getElementById('event-description');

  if (breadcrumb) breadcrumb.textContent = event.title || 'Evento';
  if (eyebrow) eyebrow.textContent = archived ? 'Evento realizado' : event.category || 'Evento';
  if (title) title.textContent = event.title || 'Evento';
  if (subtitle) subtitle.textContent = event.subtitle || '';
  if (description) description.textContent = event.description || '';

  const ctaTitle = document.querySelector('.event-cta-title-group h3');
  const ctaText = document.querySelector('.event-cta-title-group p');
  const ctaButton = document.querySelector('.btn-inscricao-evento');

  if (archived) {
    if (ctaTitle) ctaTitle.textContent = 'Evento realizado';
    if (ctaText) ctaText.textContent = `Confira as fotos e registros do ${event.title || 'evento'}.`;

    if (ctaButton) {
      ctaButton.textContent = 'Ver fotos do evento';
      ctaButton.href = '#galeria';
    }
  } else {
    if (ctaTitle) ctaTitle.textContent = 'Inscrições abertas';
    if (ctaText) ctaText.textContent = `Garanta sua participação no ${event.title || 'evento'}.`;

    if (ctaButton) {
      ctaButton.textContent = 'Realizar inscrição';
      ctaButton.href = '#inscricao';
    }
  }

  const sideButton = document.querySelector('.event-info-card .btn');

  if (sideButton) {
    if (archived) {
      sideButton.textContent = 'Ver fotos do evento';
      sideButton.href = '#galeria';
    } else {
      sideButton.textContent = 'Inscrever-se';
      sideButton.href = '#inscricao';
    }
  }

  const heroPrimaryButton = document.querySelector('.event-hero-actions .btn-primary');

  if (heroPrimaryButton) {
    if (archived) {
      heroPrimaryButton.textContent = 'Ver fotos do evento';
      heroPrimaryButton.href = '#galeria';
    } else {
      heroPrimaryButton.textContent = 'Fazer inscrição';
      heroPrimaryButton.href = '#inscricao';
    }
  }

  const longDescription = document.getElementById('event-long-description');

  if (longDescription) {
    longDescription.innerHTML = (event.longDescription || [])
      .map(p => `<p>${escapeHtml(p)}</p>`)
      .join('');
  }

  const highlights = document.getElementById('event-highlights');

  if (highlights) {
    highlights.innerHTML = (event.highlights || [])
      .map(item => `<li>${escapeHtml(item)}</li>`)
      .join('');
  }

  const info = document.getElementById('event-info-list');

  if (info) {
    info.innerHTML = [
      infoRow('Data', event.date),
      infoRow('Horário', event.time),
      infoRow('Local', event.location),
      infoRow('Categoria', event.category),
      infoRow('Público', event.audience)
    ].join('');
  }

  const schedule = document.getElementById('event-schedule');

  if (schedule) {
    schedule.innerHTML = renderSchedule(event.schedule || []);
  }

  const gallerySection = document.getElementById('galeria');
  const galleryGrid = document.getElementById('event-gallery-grid');
  const formSection = document.getElementById('event-form-section');

  if (galleryGrid) {
    galleryGrid.innerHTML = renderGallery(event.gallery || []);
  }

  setElementVisible(gallerySection, archived);
  setElementVisible(formSection, !archived);

  const formTitle = document.getElementById('event-form-title');
  const formDescription = document.getElementById('event-form-description');
  const formEventName = document.querySelector('input[name="evento"]');
  const form = document.getElementById('form-inscricao');

  if (formTitle) {
    formTitle.textContent = event.form?.title || `Inscrição - ${event.title}`;
  }

  if (formDescription) {
    formDescription.textContent = event.form?.description || 'Preencha os dados abaixo para se inscrever.';
  }

  if (formEventName) {
    formEventName.value = event.title || '';
  }

  if (form && published) {
    form.action = event.form?.action || 'https://formspree.io/f/xaqlnvng';
    form.dataset.formAction = form.action;
    bindEventForm();
  }

  bindSpeakerModal();

  revealInit();
}

document.addEventListener('DOMContentLoaded', () => {
  setElementVisible(document.getElementById('galeria'), false);
});

getEventsData()
  .then(data => {
    const event = (data.events || [])
      .find(item => item.id === FIXED_EVENT_ID);

    if (!event) {
      throw new Error('Evento não encontrado');
    }

    renderEvent(event, data);
  })
  .catch(error => {
    const main = document.getElementById('event-main');

    if (main) {
      main.innerHTML = `
        <section class="section">
          <div class="container">
            <div class="empty-state">
              ${escapeHtml(error.message)}
            </div>
          </div>
        </section>
      `;
    }
  });