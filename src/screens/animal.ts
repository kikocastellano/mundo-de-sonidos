// Ficha del animal: imagen grande, sonido, nombre, dato curioso y deslizar al siguiente.
import { playAnimal, preload, sayName, sfx } from '../audio';
import { ANIMALS, animalById, animalsIn, regionById } from '../data';
import { t } from '../i18n';
import { isLocked, store, toggleFav } from '../store';
import { $, backBtn, esc, go, icon, soundRings } from '../ui';

export function animal(root: HTMLElement, id: string, fromFav: boolean) {
  const a = animalById(id);
  if (!a) return go('/mundo');
  const r = regionById(a.region)!;
  const L = store.lang;
  const list = fromFav ? store.favs.map(animalById).filter((x) => !!x) as typeof ANIMALS : animalsIn(a.region);
  const idx = Math.max(0, list.findIndex((x) => x.id === id));
  const locked = isLocked(a);
  const q = fromFav ? '?from=fav' : '';
  const goTo = (d: number) => {
    const n = list[(idx + d + list.length) % list.length];
    if (n && n.id !== id) { sfx('tap'); root.dataset.dir = d > 0 ? 'next' : 'prev'; go(`/animal/${n.id}${q}`); }
  };

  root.innerHTML = `
    <section class="screen animal ${locked ? 'is-locked' : ''}" style="--accent:${r.accent}">
      <header class="topbar">${backBtn(fromFav ? '/favoritos' : `/region/${a.region}`)}
        <h2>${esc(a.name[L])}</h2>
        <button class="btn-round fav-btn ${store.favs.includes(a.id) ? 'on' : ''}" aria-pressed="${store.favs.includes(a.id)}" aria-label="${t('favorites')}">${icon.heart}</button>
      </header>
      <div class="stage ${root.dataset.dir ?? ''}">
        <button class="nav-arrow left" aria-label="prev">${icon.chevL}</button>
        <button class="portrait" aria-label="${t('hearSound')}">
          <span class="halo"></span>
          <span class="portrait-emoji">${a.emoji}</span>
          ${locked ? `<span class="portrait-lock">${icon.lock}</span>` : ''}
        </button>
        <button class="nav-arrow right" aria-label="next">${icon.chevR}</button>
      </div>
      <div class="dots">${list.map((_, i) => `<i class="${i === idx ? 'on' : ''}"></i>`).join('')}</div>
      <div class="actions">
        <button class="action sound" aria-label="${t('hearSound')}">${icon.speaker}</button>
        <button class="action name" aria-label="${t('hearName')}">${icon.mouth}<span>${esc(a.name[L])}</span></button>
      </div>
      ${locked
        ? `<div class="fact locked-note">${icon.lock}<p>${t('locked')}</p><button class="pill" data-go="/padres?next=premium">${t('parents')}</button></div>`
        : `<div class="fact"><span class="fact-emoji">💡</span><p>${esc(a.fact[L])}</p></div>`}
    </section>`;
  delete root.dataset.dir;

  preload(list);
  const portrait = $('.portrait', root);
  const play = () => {
    if (locked) { sfx('oops'); portrait.classList.remove('shake'); void portrait.offsetWidth; portrait.classList.add('shake'); return; }
    soundRings(portrait, playAnimal(a));
  };
  portrait.addEventListener('click', play);
  $('.action.sound', root).addEventListener('click', play);
  $('.action.name', root).addEventListener('click', () => { sayName(a.name[L]); soundRings(portrait, 1); });
  $('.nav-arrow.left', root).addEventListener('click', () => goTo(-1));
  $('.nav-arrow.right', root).addEventListener('click', () => goTo(1));
  const fav = $('.fav-btn', root);
  fav.addEventListener('click', () => {
    const on = toggleFav(a.id);
    fav.classList.toggle('on', on); fav.setAttribute('aria-pressed', String(on));
    sfx(on ? 'star' : 'tap');
    if (on) { fav.classList.remove('pop'); void fav.offsetWidth; fav.classList.add('pop'); }
  });

  // Deslizar para cambiar de animal
  const stage = $('.stage', root);
  let x0 = 0, y0 = 0, tracking = false;
  stage.addEventListener('pointerdown', (e) => { x0 = e.clientX; y0 = e.clientY; tracking = true; });
  stage.addEventListener('pointerup', (e) => {
    if (!tracking) return; tracking = false;
    const dx = e.clientX - x0, dy = e.clientY - y0;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.3) goTo(dx < 0 ? 1 : -1);
  });
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') goTo(1);
    else if (e.key === 'ArrowLeft') goTo(-1);
    else if (e.key === ' ' && e.target === document.body) { e.preventDefault(); play(); }
  };
  window.addEventListener('keydown', onKey);
  // Suena automáticamente al abrir, como sorpresa
  if (!locked) setTimeout(() => { if (document.body.contains(portrait)) play(); }, 350);
  return () => window.removeEventListener('keydown', onKey);
}
