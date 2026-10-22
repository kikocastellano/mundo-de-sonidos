import { ANIMALS } from '../data';
import { t } from '../i18n';
import { isLocked, store } from '../store';
import { esc, icon } from '../ui';

/** Mismo animal para todo el día; si no hay compra, uno de los gratuitos. */
export function animalOfDay() {
  const pool = ANIMALS.filter((a) => !isLocked(a));
  const d = new Date(); const n = d.getFullYear() * 400 + d.getMonth() * 31 + d.getDate();
  return pool[(n * 7919) % pool.length];
}

export function home(root: HTMLElement) {
  const parade = ['🐄', '🦁', '🐘', '🐧', '🐸', '🦒', '🦉', '🐬'];
  const total = Object.values(store.stars).reduce((a, b) => a + b, 0);
  const day = animalOfDay();
  root.innerHTML = `
    <section class="screen home">
      <header class="topbar">
        <button class="btn-round ghost" data-go="/padres" aria-label="${t('parents')}">${icon.gear}</button>
        <div class="star-count" aria-label="${total} ${t('stars')}">${icon.star}<b>${total}</b></div>
      </header>
      <div class="logo">
        <h1><span>${store.lang === 'es' ? 'Mundo de' : 'World of'}</span>${store.lang === 'es' ? 'Sonidos' : 'Sounds'}</h1>
        <div class="parade">${parade.map((e, i) => `<span style="--i:${i}">${e}</span>`).join('')}</div>
      </div>
      <button class="aotd" data-go="/animal/${day.id}"><span class="aotd-emoji">${day.emoji}</span><span><small>🌟 ${t('today')}</small><b>${esc(day.name[store.lang])}</b></span><span class="aotd-play">${icon.play}</span></button>
      <nav class="home-menu">
        <button class="big-btn primary" data-go="/mundo"><span class="big-emoji">🌍</span><span>${t('play')}</span></button>
        <button class="big-btn game" data-go="/juego"><span class="big-emoji">👂</span><span>${t('game')}</span></button>
        <button class="big-btn album-btn" data-go="/album"><span class="big-emoji">📒</span><span>${t('album')} <small class="hb-count">${Object.keys(store.seen).length}/${ANIMALS.length}</small></span></button>
        <button class="big-btn fav" data-go="/favoritos"><span class="big-emoji">💖</span><span>${t('favorites')}</span></button>
      </nav>
      <nav class="home-menu extra">
        <button class="big-btn calm-btn" data-go="/calma"><span class="big-emoji">🌙</span><span>${t('calm')}</span></button>
        <button class="big-btn teach-btn" data-go="/profe"><span class="big-emoji">🧑‍🏫</span><span>${store.lang === 'es' ? 'Modo profe' : 'Teacher mode'}</span></button>
      </nav>
      <p class="tagline">${ANIMALS.length} ${store.lang === 'es' ? 'animales' : 'animals'} · ${t('privacy')}</p>
    </section>`;
}
