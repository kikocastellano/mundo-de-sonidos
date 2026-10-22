import { preload } from '../audio';
import { animalsIn, regionById, type RegionId } from '../data';
import { t } from '../i18n';
import { store } from '../store';
import { backBtn, card, esc, go, icon } from '../ui';

export function region(root: HTMLElement, id: RegionId) {
  const r = regionById(id);
  if (!r) return go('/mundo');
  const list = animalsIn(id);
  root.innerHTML = `
    <section class="screen region" style="--accent:${r.accent}">
      <header class="topbar">${backBtn('/mundo')}<h2><span class="title-emoji">${r.emoji}</span>${esc(r.name[store.lang])}</h2>
        <button class="btn-round" data-go="/juego/${id}" aria-label="${t('game')}">${icon.play}</button></header>
      <div class="grid">${list.map((a, i) => card(a, i, store.lang)).join('')}</div>
    </section>`;
  preload(list);
  root.querySelectorAll<HTMLElement>('[data-animal]').forEach((b) =>
    b.addEventListener('click', () => go(`/animal/${b.dataset.animal}`)));
}
