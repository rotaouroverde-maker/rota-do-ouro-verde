
function registerServiceWorker(){
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .catch(error => console.warn('Service Worker não registrado:', error));
  });
}

import { Header } from '../components/header.js';
import { Footer } from '../components/footer.js';

function initMenu(){
  const toggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (!toggle || !navLinks) return;

  toggle.addEventListener('click', (event) => {
    event.stopPropagation();
    const isOpen = navLinks.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', (event) => {
    if (!toggle.contains(event.target) && !navLinks.contains(event.target)) {
      navLinks.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

function initNavScroll(){
  let lastScroll = 0;
  const nav = document.querySelector('.nav-shell');

  if (!nav) return;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll <= 0) {
      nav.classList.remove('hide');
      lastScroll = 0;
      return;
    }

    if (currentScroll > lastScroll) {
      nav.classList.add('hide');
    } else {
      nav.classList.remove('hide');
    }

    lastScroll = currentScroll;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const script = document.currentScript || document.querySelector('script[src$="shared/layouts/app.js"]');
  const base = script?.dataset?.base || './';

  const header = document.getElementById('global-header');
  const footer = document.getElementById('global-footer');

  if (header) header.innerHTML = Header(base);
  if (footer) footer.innerHTML = Footer(base);

  initMenu();
  initNavScroll();
  registerServiceWorker();
});
