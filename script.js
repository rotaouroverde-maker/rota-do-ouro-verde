
const toggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (toggle && navLinks) {
  toggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

const form = document.querySelector('.contact-form');
if (form) {
  form.addEventListener('submit', event => {
    event.preventDefault();
    alert('Formulário visual enviado. Depois integramos com um serviço real de envio.');
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
const modalStage = document.querySelector('.modal-stage');
const closeButton = document.querySelector('.modal-close');
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

async function showAlbum(albumKey, triggerButton) {
  const album = albums[albumKey];
  if (!album) return;

  currentIndex = 0;
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

closeButton.addEventListener('click', closeModal);
modal.addEventListener('click', event => {
  if (event.target.dataset.close === 'true') closeModal();
});

prevButton.addEventListener('click', () => {
  const photos = getCurrentPhotos();
  if (currentIndex > 0) {
    currentIndex -= 1;
    renderPhoto(photos);
  }
});

nextButton.addEventListener('click', () => {
  const photos = getCurrentPhotos();
  if (currentIndex < photos.length - 1) {
    currentIndex += 1;
    renderPhoto(photos);
  }
});

document.addEventListener('keydown', event => {
  if (!modal.classList.contains('open')) return;
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
});
