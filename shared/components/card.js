export function Card({
  image = '',
  title = '',
  description = '',
  link = '#',
  buttonText = 'Ver mais',
  badge = ''
} = {}){
  return `
    <article class="card route-card">
      <div class="route-media" style="background-image:url('${image}')">
        ${badge ? `<span class="route-badge">${badge}</span>` : ''}
      </div>

      <div class="route-content">
        <h3>${title}</h3>
        <p>${description}</p>

        <div class="route-actions">
          <a class="btn btn-primary" href="${link}">
            ${buttonText}
          </a>
        </div>
      </div>
    </article>
  `;
}
