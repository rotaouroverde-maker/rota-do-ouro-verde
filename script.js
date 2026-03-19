const toggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (toggle && navLinks) {
  toggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const smartForm = document.querySelector('.js-smart-form');
const formFeedback = document.querySelector('.form-feedback');
if (smartForm) {
  smartForm.addEventListener('submit', async event => {
    event.preventDefault();
    const action = smartForm.dataset.formAction || '';

    if (!action || action.includes('SEU_ID_AQUI')) {
      formFeedback.textContent = 'Formulário pronto. Para ativar no Cloudflare Free, substitua SEU_ID_AQUI pelo endpoint do Formspree.';
      formFeedback.className = 'form-feedback is-error';
      return;
    }

    try {
      const formData = new FormData(smartForm);
      const response = await fetch(action, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' }
      });

      if (!response.ok) throw new Error('Falha no envio');

      smartForm.reset();
      formFeedback.textContent = 'Mensagem enviada com sucesso.';
      formFeedback.className = 'form-feedback is-success';
    } catch (error) {
      formFeedback.textContent = 'Não foi possível enviar agora. Tente novamente ou use o WhatsApp.';
      formFeedback.className = 'form-feedback is-error';
    }
  });
}

const albums = {
  paisagens: {
    title: 'Paisagens',
    description: 'Mirantes, serras, vales e vistas abertas da Rota do Ouro Verde.',
    photos: [
      { src: 'assets/gallery/paisagens/paisagem-01.jpg', alt: 'Paisagem da rota', label: 'Foto 1' },
      { src: 'assets/gallery/paisagens/paisagem-02.jpg', alt: 'Mirante da rota', label: 'Foto 2' },
      { src: 'assets/gallery/paisagens/paisagem-03.jpg', alt: 'Serra ao longo da rota', label: 'Foto 3' }
    ]
  },
  caminho: {
    title: 'Caminho',
    description: 'Trechos do percurso, passagens, trilhas, estradas e experiências de caminhada.',
    photos: [
      { src: 'assets/gallery/caminho/caminho-01.jpg', alt: 'Trecho do caminho', label: 'Foto 1' },
      { src: 'assets/gallery/caminho/caminho-02.jpg', alt: 'Travessia da rota', label: 'Foto 2' },
      { src: 'assets/gallery/caminho/caminho-03.jpg', alt: 'Trecho de caminhada', label: 'Foto 3' }
    ]
  },
  cultura: {
    title: 'Cultura local',
    description: 'Comunidades, hospitalidade, tradições e vivências culturais da região.',
    photos: [
      { src: 'assets/gallery/cultura/cultura-01.jpg', alt: 'Cultura local da rota', label: 'Foto 1' },
      { src: 'assets/gallery/cultura/cultura-02.jpg', alt: 'Hospitalidade local', label: 'Foto 2' },
      { src: 'assets/gallery/cultura/cultura-03.jpg', alt: 'Comunidade do percurso', label: 'Foto 3' }
    ]
  },
  cafe: {
    title: 'Memória do café',
    description: 'Fazendas, vestígios históricos e símbolos do antigo Ouro Verde.',
    photos: [
      { src: 'assets/gallery/cafe/cafe-01.jpg', alt: 'Memória do café na rota', label: 'Foto 1' },
      { src: 'assets/gallery/cafe/cafe-02.jpg', alt: 'Patrimônio do café', label: 'Foto 2' },
      { src: 'assets/gallery/cafe/cafe-03.jpg', alt: 'História do Ouro Verde', label: 'Foto 3' }
    ]
  }
};

const modal = document.getElementById('gallery-modal');
const modalImage = document.getElementById('modal-image');
const modalTitle = document.getElementById('modal-title');
const modalDescription = document.getElementById('modal-description');
const modalCounter = document.getElementById('modal-counter');
const modalThumbs = document.getElementById('modal-thumbs');
const modalEmpty = document.getElementById('modal-empty');
const modalStage = document.querySelector('#gallery-modal .modal-stage');
const closeButton = document.querySelector('#gallery-modal .modal-close');
const prevButton = document.querySelector('.modal-nav.prev');
const nextButton = document.querySelector('.modal-nav.next');
const albumButtons = document.querySelectorAll('[data-album]');

let currentIndex = 0;
let lastFocusedButton = null;

function fileExists(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

async function loadExistingPhotos(albumKey) {
  const album = albums[albumKey];
  const checks = await Promise.all(album.photos.map(photo => fileExists(photo.src)));
  return album.photos.filter((_, index) => checks[index]);
}

function openModal() {
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (lastFocusedButton) lastFocusedButton.focus();
}

function updateThumbs(photos) {
  modalThumbs.innerHTML = '';
  if (!photos.length) {
    const placeholder = document.createElement('div');
    placeholder.className = 'thumb-label';
    placeholder.textContent = 'Adicione fotos nesta pasta para preencher o álbum.';
    modalThumbs.appendChild(placeholder);
    return;
  }

  photos.forEach((photo, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'thumb';
    if (index === currentIndex) button.classList.add('active');

    const img = document.createElement('img');
    img.src = photo.src;
    img.alt = photo.alt;
    button.appendChild(img);

    button.addEventListener('click', () => {
      currentIndex = index;
      renderPhoto(photos);
    });

    modalThumbs.appendChild(button);
  });
}

function renderPhoto(photos) {
  updateThumbs(photos);

  if (!photos.length) {
    modalImage.removeAttribute('src');
    modalImage.alt = '';
    modalStage.classList.remove('has-image');
    modalEmpty.hidden = false;
    modalCounter.textContent = '0 / 0';
    prevButton.disabled = true;
    nextButton.disabled = true;
    return;
  }

  const photo = photos[currentIndex];
  modalImage.src = photo.src;
  modalImage.alt = photo.alt;
  modalStage.classList.add('has-image');
  modalEmpty.hidden = true;
  modalCounter.textContent = `${currentIndex + 1} / ${photos.length}`;
  prevButton.disabled = currentIndex === 0;
  nextButton.disabled = currentIndex === photos.length - 1;
}

async function showAlbum(albumKey, triggerButton, startIndex = 0) {
  const album = albums[albumKey];
  if (!album) return;

  currentIndex = startIndex;
  lastFocusedButton = triggerButton || null;
  modalTitle.textContent = album.title;
  modalDescription.textContent = album.description;
  openModal();

  const photos = await loadExistingPhotos(albumKey);
  modal.dataset.photos = JSON.stringify(photos);
  renderPhoto(photos);
}

function getCurrentPhotos() {
  try {
    return JSON.parse(modal.dataset.photos || '[]');
  } catch {
    return [];
  }
}

albumButtons.forEach(button => {
  button.addEventListener('click', () => showAlbum(button.dataset.album, button));
});

if (closeButton) closeButton.addEventListener('click', closeModal);
if (modal) {
  modal.addEventListener('click', event => {
    if (event.target.dataset.close === 'true') closeModal();
  });
}
if (prevButton) {
  prevButton.addEventListener('click', () => {
    const photos = getCurrentPhotos();
    if (currentIndex > 0) {
      currentIndex -= 1;
      renderPhoto(photos);
    }
  });
}
if (nextButton) {
  nextButton.addEventListener('click', () => {
    const photos = getCurrentPhotos();
    if (currentIndex < photos.length - 1) {
      currentIndex += 1;
      renderPhoto(photos);
    }
  });
}

document.addEventListener('keydown', event => {
  if (modal && modal.classList.contains('open')) {
    const photos = getCurrentPhotos();
    if (event.key === 'Escape') closeModal();
    if (event.key === 'ArrowLeft' && currentIndex > 0) {
      currentIndex -= 1;
      renderPhoto(photos);
    }
    if (event.key === 'ArrowRight' && currentIndex < photos.length - 1) {
      currentIndex += 1;
      renderPhoto(photos);
    }
  }
});

const supportData = {
  hospedagem: {
    title: 'Hospedagem',
    subtitle: 'Onde dormir ao longo da Rota do Ouro Verde.',
    content: `
      <div class="support-block">
        <h4>Hospedagens parceiras</h4>
        <p>Inclua aqui pousadas, sítios, casas de apoio e contatos oficiais da rota.</p>
      </div>
      <div class="support-block">
        <h4>Informações úteis</h4>
        <ul>
          <li>Check-in e check-out</li>
          <li>Capacidade por grupo</li>
          <li>Reserva antecipada</li>
          <li>Café da manhã e jantar</li>
        </ul>
      </div>
      <div class="support-block">
        <h4>Contato</h4>
        <p><a href="https://wa.me/5522988083118" target="_blank" rel="noopener">Falar no WhatsApp sobre hospedagem</a></p>
      </div>
    `
  },
  alimentacao: {
    title: 'Alimentação',
    subtitle: 'Onde comer e se abastecer durante as etapas.',
    content: `
      <div class="support-block">
        <h4>Restaurantes e cafés</h4>
        <p>Liste aqui restaurantes, lanchonetes, cafés e pontos de refeição em cada etapa.</p>
      </div>
      <div class="support-block">
        <h4>O que informar</h4>
        <ul>
          <li>Horários de funcionamento</li>
          <li>Se atende grupos</li>
          <li>Se oferece marmita ou lanche de trilha</li>
          <li>Formas de pagamento</li>
        </ul>
      </div>
      <div class="support-block">
        <h4>Contato</h4>
        <p><a href="https://wa.me/5522988083118" target="_blank" rel="noopener">Consultar alimentação no WhatsApp</a></p>
      </div>
    `
  },
  agua: {
    title: 'Água e abastecimento',
    subtitle: 'Pontos seguros para reabastecimento durante o percurso.',
    content: `
      <div class="support-block">
        <h4>Pontos de água</h4>
        <p>Cadastre aqui fontes seguras, comércios, propriedades autorizadas e pontos de apoio com água potável.</p>
      </div>
      <div class="support-block">
        <h4>Recomendações</h4>
        <ul>
          <li>Leve sempre reserva de água</li>
          <li>Confirme os pontos antes da caminhada</li>
          <li>Use filtro ou purificador quando necessário</li>
          <li>Evite depender de um único ponto no trajeto</li>
        </ul>
      </div>
    `
  },
  emergencia: {
    title: 'Apoio e emergência',
    subtitle: 'Contatos e orientações para situações imprevistas.',
    content: `
      <div class="support-block">
        <h4>Telefones úteis</h4>
        <ul>
          <li>Emergência geral: 190 / 193</li>
          <li>Coordenação da rota: inserir número oficial</li>
          <li>Posto de saúde local: inserir contato</li>
          <li>Resgate / apoio local: inserir contato</li>
        </ul>
      </div>
      <div class="support-block">
        <h4>Orientações</h4>
        <ul>
          <li>Compartilhe seu roteiro antes de sair</li>
          <li>Tenha bateria e internet sempre que possível</li>
          <li>Em caso de risco, interrompa a etapa</li>
          <li>Priorize segurança, clima e visibilidade</li>
        </ul>
      </div>
    `
  }
};

const supportButtons = document.querySelectorAll('[data-support]');
const supportModal = document.getElementById('support-modal');
const supportTitle = document.getElementById('support-title');
const supportSubtitle = document.getElementById('support-subtitle');
const supportContent = document.getElementById('support-content');
const supportCloseBtn = document.getElementById('support-close-btn');
let lastSupportButton = null;

function openSupportModal(key, button) {
  const item = supportData[key];
  if (!item) return;
  lastSupportButton = button || null;
  supportTitle.innerHTML = item.title;
  supportSubtitle.innerHTML = item.subtitle;
  supportContent.innerHTML = item.content;
  supportModal.classList.add('open');
  supportModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeSupportModal() {
  supportModal.classList.remove('open');
  supportModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (lastSupportButton) lastSupportButton.focus();
}

supportButtons.forEach(button => {
  button.addEventListener('click', () => openSupportModal(button.dataset.support, button));
});

if (supportCloseBtn) supportCloseBtn.addEventListener('click', closeSupportModal);
if (supportModal) {
  supportModal.addEventListener('click', event => {
    if (event.target.dataset.supportClose === 'true') closeSupportModal();
  });
}

document.addEventListener('keydown', event => {
  if (supportModal && supportModal.classList.contains('open') && event.key === 'Escape') {
    closeSupportModal();
  }
});

const stageData = {
  dia1: {
    title: 'Dia 1 — Amorosa → Trajano de Moraes',
    subtitle: '18 km | Início da experiência',
    content: `
      <div class="support-block"><h4>Perfil da etapa</h4><p>Trecho inicial para entrada no ritmo da rota, com foco em ambientação, paisagem e reconhecimento do território.</p></div>
      <div class="support-block"><h4>O que destacar</h4><ul><li>Saída organizada</li><li>Checagem de mochila e água</li><li>Contato inicial com a proposta histórica da rota</li></ul></div>
    `,
    photos: [
      { src: 'assets/etapas/dia1/foto-01.jpg', alt: 'Dia 1 da Rota do Ouro Verde' }
    ]
  },
  dia2: {
    title: 'Dia 2 — Trajano → São Francisco de Paula',
    subtitle: '16 km | Consolidação do ritmo da caminhada',
    content: `
      <div class="support-block"><h4>Perfil da etapa</h4><p>Etapa de continuidade, com deslocamento equilibrado e boa oportunidade para aprofundar a leitura da paisagem e da história local.</p></div>
      <div class="support-block"><h4>Pontos de atenção</h4><ul><li>Ritmo constante</li><li>Planejamento de alimentação</li><li>Chegada com tempo para aproveitar o destino</li></ul></div>
    `,
    photos: [
      { src: 'assets/etapas/dia2/foto-01.jpg', alt: 'Dia 2 da Rota do Ouro Verde' }
    ]
  },
  dia3: {
    title: 'Dia 3 — São Francisco → Sodrelândia',
    subtitle: '20 km | Uma das etapas mais exigentes',
    content: `
      <div class="support-block"><h4>Perfil da etapa</h4><p>Trecho mais longo, exigindo preparo físico moderado, boa gestão de ritmo e atenção à hidratação.</p></div>
      <div class="support-block"><h4>Recomendação</h4><ul><li>Sair cedo</li><li>Carregar reserva de água</li><li>Monitorar clima e visibilidade</li></ul></div>
    `,
    photos: [
      { src: 'assets/etapas/dia3/foto-01.jpg', alt: 'Dia 3 da Rota do Ouro Verde' }
    ]
  },
  dia4: {
    title: 'Dia 4 — Sodrelândia → Arranchadouro',
    subtitle: '12 km | Etapa intermediária',
    content: `
      <div class="support-block"><h4>Perfil da etapa</h4><p>Percurso intermediário, equilibrando caminhada e contemplação ao longo da jornada.</p></div>
      <div class="support-block"><h4>Bom uso da etapa</h4><ul><li>Registrar paisagens</li><li>Valorizar pontos de parada</li><li>Chegada com folga para descanso</li></ul></div>
    `,
    photos: [
      { src: 'assets/etapas/dia4/foto-01.jpg', alt: 'Dia 4 da Rota do Ouro Verde' }
    ]
  },
  dia5: {
    title: 'Dia 5 — Arranchadouro → Sibéria',
    subtitle: '6 km | Etapa curta',
    content: `
      <div class="support-block"><h4>Perfil da etapa</h4><p>Dia mais leve, favorável para grupos, recuperação física e aproveitamento do entorno.</p></div>
      <div class="support-block"><h4>Oportunidade</h4><ul><li>Inserir vivências culturais</li><li>Valorizar gastronomia local</li><li>Produzir conteúdo fotográfico</li></ul></div>
    `,
    photos: [
      { src: 'assets/etapas/dia5/foto-01.jpg', alt: 'Dia 5 da Rota do Ouro Verde' }
    ]
  },
  dia6: {
    title: 'Dia 6 — Sibéria → Tirol',
    subtitle: '10 km | Retomada do ritmo',
    content: `
      <div class="support-block"><h4>Perfil da etapa</h4><p>Trecho de retomada, com bom equilíbrio entre deslocamento, observação do território e experiência rural.</p></div>
      <div class="support-block"><h4>Checklist</h4><ul><li>Reforço de alimentação</li><li>Conferência de apoio na chegada</li><li>Revisão do dia final</li></ul></div>
    `,
    photos: [
      { src: 'assets/etapas/dia6/foto-01.jpg', alt: 'Dia 6 da Rota do Ouro Verde' }
    ]
  },
  dia7: {
    title: 'Dia 7 — Tirol → Fazenda do Canteiro',
    subtitle: '7 km | Encerramento da rota',
    content: `
      <div class="support-block"><h4>Perfil da etapa</h4><p>Encerramento simbólico da jornada, ideal para reforçar a narrativa histórica e a experiência completa da rota.</p></div>
      <div class="support-block"><h4>Fechamento</h4><ul><li>Registrar conclusão</li><li>Coletar depoimentos</li><li>Convidar para retorno e divulgação</li></ul></div>
    `,
    photos: [
      { src: 'assets/etapas/dia7/foto-01.jpg', alt: 'Dia 7 da Rota do Ouro Verde' }
    ]
  }
};

const stageButtons = document.querySelectorAll('[data-stage]');
const stageModal = document.getElementById('stage-modal');
const stageTitle = document.getElementById('stage-title');
const stageSubtitle = document.getElementById('stage-subtitle');
const stageContent = document.getElementById('stage-content');
const stageCloseBtn = document.getElementById('stage-close-btn');
let lastStageButton = null;
const stageGalleryGrid = document.getElementById('stage-gallery-grid');
const stageGalleryNote = document.getElementById('stage-gallery-note');

async function loadExistingStagePhotos(photos = []) {
  const checks = await Promise.all(photos.map(photo => fileExists(photo.src)));
  return photos.filter((_, index) => checks[index]);
}

function renderStageGallery(photos, title) {
  if (!stageGalleryGrid) return;
  stageGalleryGrid.innerHTML = '';

  if (!photos.length) {
    stageGalleryGrid.innerHTML = `
      <div class="stage-gallery-empty">
        <strong>Fotos em breve</strong>
        <p>Esta etapa já está pronta para receber imagens reais do percurso.</p>
      </div>
    `;
    if (stageGalleryNote) {
      stageGalleryNote.textContent = 'Adicione novas fotos na pasta desta etapa para ampliar a galeria.';
    }
    return;
  }

  if (stageGalleryNote) {
    stageGalleryNote.textContent = photos.length > 1
      ? 'Clique em uma foto para ampliar.'
      : 'A etapa já exibe a foto principal e está pronta para receber mais imagens.';
  }

  photos.forEach((photo, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'stage-gallery-item';
    button.innerHTML = `
      <img src="${photo.src}" alt="${photo.alt}">
      <span class="stage-gallery-caption">${title} • Foto ${String(index + 1).padStart(2, '0')}</span>
    `;
    button.addEventListener('click', () => {
      const albumKey = `${title}-${index}-${photos.length}`;
      albums[albumKey] = {
        title: title,
        description: 'Registro visual desta etapa da Rota do Ouro Verde.',
        photos: photos.map((item, i) => ({
          src: item.src,
          alt: item.alt,
          label: `Foto ${String(i + 1).padStart(2, '0')}`
        }))
      };
      showAlbum(albumKey, button, index);
    });
    stageGalleryGrid.appendChild(button);
  });
}


async function openStageModal(key, button) {
  const item = stageData[key];
  if (!item) return;
  lastStageButton = button || null;
  stageTitle.innerHTML = item.title;
  stageSubtitle.innerHTML = item.subtitle;
  stageContent.innerHTML = item.content;
  stageModal.classList.add('open');
  stageModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  renderStageGallery([], item.title);
  const photos = await loadExistingStagePhotos(item.photos || []);
  renderStageGallery(photos, item.title);
}

function closeStageModal() {
  stageModal.classList.remove('open');
  stageModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (lastStageButton) lastStageButton.focus();
}

stageButtons.forEach(button => {
  button.addEventListener('click', () => openStageModal(button.dataset.stage, button));
});

if (stageCloseBtn) stageCloseBtn.addEventListener('click', closeStageModal);
if (stageModal) {
  stageModal.addEventListener('click', event => {
    if (event.target.dataset.stageClose === 'true') closeStageModal();
  });
}

document.addEventListener('keydown', event => {
  if (stageModal && stageModal.classList.contains('open') && event.key === 'Escape') {
    closeStageModal();
  }
});

const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealItems.forEach(item => observer.observe(item));
} else {
  revealItems.forEach(item => item.classList.add('is-visible'));
}
