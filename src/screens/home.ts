// Pantalla principal: todo a la vista sin bajar, en una cuadrícula de tarjetas que se adapta a la pantalla.
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
  const es = store.lang === 'es';
  const total = Object.values(store.stars).reduce((a, b) => a + b, 0);
  const day = animalOfDay();
  const got = Object.keys(store.seen).length;
  const lockIcon = store.premium ? '' : `<span class="tile-lock">${icon.lock}</span>`;
  const tile = (cls: string, go: string, emoji: string, label: string, sub = '', extra = '') =>
    `<button class="tile-h ${cls}" data-go="${go}"><span class="th-emoji">${emoji}</span><span class="th-text"><b>${label}</b>${sub ? `<small>${sub}</small>` : ''}</span>${extra}</button>`;
  root.innerHTML = `
    <section class="screen home2">
      <header class="home-top">
        <button class="btn-round ghost" data-go="/padres" aria-label="${t('parents')}">${icon.gear}</button>
        <h1 class="home-logo"><span>${es ? 'Mundo de' : 'World of'}</span>${es ? 'Sonidos' : 'Sounds'}</h1>
        <div class="home-right">
          <div class="star-count" aria-label="${total} ${t('stars')}">${icon.star}<b>${total}</b></div>
          ${store.premium ? '' : `<button class="premium-pill" data-go="/premium">⭐ Premium</button>`}
        </div>
      </header>
      <div class="home-grid">
        <button class="tile-h aotd2" data-go="/animal/${day.id}">
          <span class="th-emoji">${day.emoji}</span>
          <span class="th-text"><small>🌟 ${t('today')}</small><b>${esc(day.name[store.lang])}</b></span>
          <span class="aotd-play">${icon.play}</span>
        </button>
        ${tile('t-explore', '/mundo', '🌍', t('play'), es ? `${ANIMALS.length} animales` : `${ANIMALS.length} animals`)}
        ${tile('t-game', '/juego', '👂', t('game'))}
        ${tile('t-english', '/ingles', '🗣️', t('english'), '', `<span class="lang-badge">${es ? 'EN' : 'ES'}</span>`)}
        ${tile('t-album', '/album', '📒', t('album'), `${got}/${ANIMALS.length}`)}
        ${tile('t-fav', '/favoritos', '💖', t('favorites'))}
        ${tile('t-calm', '/calma', '🌙', t('calm'), '', lockIcon)}
        ${tile('t-teach', '/profe', '🧑‍🏫', es ? 'Modo profe' : 'Teacher mode', '', lockIcon)}
      </div>
      <p class="tagline">${t('privacy')}</p>
    </section>`;
}
