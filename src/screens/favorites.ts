import { animalById } from '../data';
import { t } from '../i18n';
import { store } from '../store';
import { backBtn, card, go, icon } from '../ui';

export function favorites(root: HTMLElement) {
  const list = store.favs.map(animalById).filter((a) => !!a);
  root.innerHTML = `
    <section class="screen region" style="--accent:#e2457a">
      <header class="topbar">${backBtn('/')}<h2><span class="title-emoji">💖</span>${t('favorites')}</h2>${list.length ? `<button class="btn-round" data-go="/profe/ver" aria-label="${store.lang === 'es' ? 'Modo profe' : 'Teacher mode'}">${icon.play}</button>` : '<span class="spacer"></span>'}</header>
      ${list.length ? `<div class="grid">${list.map((a, i) => card(a!, i, store.lang)).join('')}</div>`
        : `<div class="empty"><div class="empty-emoji">🤍</div><p>${t('noFavs')}</p></div>`}
    </section>`;
  root.querySelectorAll<HTMLElement>('[data-animal]').forEach((b) =>
    b.addEventListener('click', () => go(`/animal/${b.dataset.animal}?from=fav`)));
}
