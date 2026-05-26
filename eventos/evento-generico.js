const FIXED_EVENT_ID = 'evento-generico';

function getEventStatus(event) {
  return String(event.status || 'published').trim().toLowerCase();
}

function isDraftEvent(event) {
  return getEventStatus(event) === 'draft';
}

function isHiddenEvent(event) {
  return getEventStatus(event) === 'hidden';
}

function isArchivedEvent(event) {
  return getEventStatus(event) === 'archived';
}

function isPublishedEvent(event) {
  return getEventStatus(event) === 'published';
}

function isSoldOutEvent(event) {
  return getEventStatus(event) === 'sold-out';
}

function isPostponedEvent(event) {
  return getEventStatus(event) === 'postponed';
}

function isCancelledEvent(event) {
  return getEventStatus(event) === 'cancelled';
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
  if (!response.ok) throw new Error('Falha ao carregar eventos');
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
      <div class="schedule-day-header">${escapeHtml(day.day || '')}</div>
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

    try {
      const formData = new FormData(form);
      const response = await fetch('/api/forms', {
        method:'POST',
        body:formData,
        headers:{ Accept:'application/json' }
      });

      if (!response.ok) throw new Error('Falha no envio');

      window.location.href =
        '../inscricao/obrigado.html?type=event&id=evento-generico';
    } catch {
      feedback.textContent = 'Não foi possível enviar agora. Tente novamente ou entre em contato pelo WhatsApp.';
      feedback.className = 'form-feedback is-error';
    }
  });
}

function renderEvent(event, data) {

  const status = getEventStatus(event);

  if (isDraftEvent(event) || isHiddenEvent(event)) {
    const hero = document.getElementById('event-hero');
    const main = document.getElementById('event-main');

    if (hero) {
      hero.style.display = 'none';
    }

    if (main) {
      main.innerHTML = `
        <section class="section">
          <div class="container">
            <div class="empty-state">
              ${isDraftEvent(event) ? 'Evento em preparação.' : 'Evento indisponível.'}
            </div>
          </div>
        </section>
      `;
    }

    return;
  }

  const archived = isArchivedEvent(event);
  const published = isPublishedEvent(event);
  const soldOut = isSoldOutEvent(event);
  const postponed = isPostponedEvent(event);
  const cancelled = isCancelledEvent(event);

  document.body.classList.toggle('event-archived', archived);
  document.body.classList.toggle('event-published', published);
  document.body.classList.toggle('event-sold-out', soldOut);
  document.body.classList.toggle('event-postponed', postponed);
  document.body.classList.toggle('event-cancelled', cancelled);

  document.title =
    `${event.title || 'Evento'} | ${data.brand?.name || 'Rota do Ouro Verde'}`;

  const hero = document.getElementById('event-hero');

  if (hero) {
    hero.style.display = '';
    hero.style.backgroundImage =
      `linear-gradient(120deg,rgba(0,0,0,.72),rgba(0,0,0,.28)),url('${assetPath(event.cover)}')`;
  }

  const breadcrumb = document.getElementById('event-breadcrumb');
  const eyebrow = document.getElementById('event-eyebrow');
  const title = document.getElementById('event-title');
  const subtitle = document.getElementById('event-subtitle');
  const description = document.getElementById('event-description');

  if (breadcrumb) breadcrumb.textContent = event.title || 'Evento';

  if (eyebrow) {
    if (archived) eyebrow.textContent = 'Evento realizado';
    else if (soldOut) eyebrow.textContent = 'Evento lotado';
    else if (postponed) eyebrow.textContent = 'Evento adiado';
    else if (cancelled) eyebrow.textContent = 'Evento cancelado';
    else eyebrow.textContent = event.badge || 'Inscrições abertas';
  }

  if (title) title.textContent = event.title || 'Evento';
  if (subtitle) subtitle.textContent = event.subtitle || '';
  if (description) description.textContent = event.description || '';

  const ctaTitle = document.querySelector('.event-cta-title-group h3');
  const ctaText = document.querySelector('.event-cta-title-group p');

  if (ctaTitle) {
    if (archived) ctaTitle.textContent = 'Evento realizado';
    else if (soldOut) ctaTitle.textContent = 'Evento lotado';
    else if (postponed) ctaTitle.textContent = 'Evento adiado';
    else if (cancelled) ctaTitle.textContent = 'Evento cancelado';
    else ctaTitle.textContent = 'Inscrições abertas';
  }

  if (ctaText) {
    if (archived) ctaText.textContent = `Confira as fotos e registros do ${event.title || 'evento'}.`;
    else if (soldOut) ctaText.textContent = 'As vagas para este evento estão encerradas.';
    else if (postponed) ctaText.textContent = 'Este evento foi adiado. Aguarde novas informações da organização.';
    else if (cancelled) ctaText.textContent = 'Este evento foi cancelado pela organização.';
    else ctaText.textContent = `Garanta sua participação no ${event.title || 'evento'}.`;
  }

  const longDescription = document.getElementById('event-long-description');
  if (longDescription) {
    longDescription.innerHTML = (event.longDescription || [])
      .map(text => `<p>${escapeHtml(text)}</p>`)
      .join('');
  }

  const highlights = document.getElementById('event-highlights');
  if (highlights) {
    highlights.innerHTML = (event.highlights || [])
      .map(item => `<li>${escapeHtml(item)}</li>`)
      .join('');
  }

  const infoList = document.getElementById('event-info-list');
  if (infoList) {
    infoList.innerHTML = [
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

  const speakers = document.getElementById('event-speakers');
  if (speakers) {
    speakers.innerHTML = (event.speakers || []).length
      ? event.speakers.map(item => `
          <article class="card speaker-card">
            <h3>${escapeHtml(item.name || '')}</h3>
            <p>${escapeHtml(item.role || '')}</p>
          </article>
        `).join('')
      : '<div class="empty-state">Convidados em confirmação.</div>';
  }

  const ctaButtons = document.querySelectorAll('.btn-inscricao-evento');

  ctaButtons.forEach(button => {
    button.classList.toggle('btn-disabled', soldOut || postponed || cancelled);

    if (archived) {
      button.textContent = 'Ver fotos do evento';
      button.href = '#galeria';
      button.removeAttribute('aria-disabled');
    } else if (soldOut) {
      button.textContent = 'Evento lotado';
      button.removeAttribute('href');
      button.setAttribute('aria-disabled', 'true');
    } else if (postponed) {
      button.textContent = 'Evento adiado';
      button.removeAttribute('href');
      button.setAttribute('aria-disabled', 'true');
    } else if (cancelled) {
      button.textContent = 'Evento cancelado';
      button.removeAttribute('href');
      button.setAttribute('aria-disabled', 'true');
    } else {
      button.textContent = 'Realizar inscrição';
      button.href = '#inscricao';
      button.removeAttribute('aria-disabled');
    }
  });

  const gallerySection = document.getElementById('galeria');
  const galleryGrid = document.getElementById('event-gallery-grid');

  if (galleryGrid) {
    galleryGrid.innerHTML = renderGallery(event.gallery || []);
  }

  setElementVisible(gallerySection, archived);

  const formTitle = document.getElementById('event-form-title');
  const formDescription = document.getElementById('event-form-description');
  const formEventName = document.querySelector('input[name="evento"]');
  const form = document.getElementById('form-inscricao');
  const formSection = document.getElementById('event-form-section') || document.getElementById('inscricao');

  if (formTitle) {
    formTitle.textContent =
      event.form?.title || `Inscrição - ${event.title || 'Evento'}`;
  }

  if (formDescription) {
    formDescription.textContent =
      event.form?.description || 'Preencha os dados abaixo para se inscrever.';
  }

  if (formEventName) {
    formEventName.value = event.title || '';
  }

  if (form) {
    form.action = '/api/forms';
    form.dataset.formAction = '/api/forms';
  }

  setElementVisible(formSection, published);

  if (form && published) {
    bindEventForm();
  }

  bindSpeakerModal();

  if (typeof revealInit === 'function') revealInit();
}



getEventsData()
  .then(data => {
    const event = (data.events || []).find(item => item.id === FIXED_EVENT_ID);
    if (!event) throw new Error('Evento não encontrado');
    renderEvent(event, data);
  })
  .catch(error => {
    const main = document.getElementById('event-main');
    if (main) {
      main.innerHTML = `<section class="section"><div class="container"><div class="empty-state">${escapeHtml(error.message)}</div></div></section>`;
    }
  });
