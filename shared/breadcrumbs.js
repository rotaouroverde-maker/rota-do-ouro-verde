function renderBreadcrumbs(items = []) {

  const wrap =
    document.getElementById('breadcrumbs');

  if (!wrap) return;

  wrap.className = 'breadcrumbs';

  wrap.innerHTML =
    items.map((item, index) => {

      const isLast =
        index === items.length - 1;

      return `
        ${
          item.href && !isLast
            ? `<a href="${item.href}">
                 ${item.label}
               </a>`
            : `<span>${item.label}</span>`
        }

        ${
          !isLast
            ? '<span>•</span>'
            : ''
        }
      `;
    }).join('');
}