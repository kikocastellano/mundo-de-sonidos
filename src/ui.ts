// Utilidades de interfaz compartidas por todas las pantallas.
import { sfx, stopAll, unlockAudio } from './audio';
import type { Animal } from './data';
import { t } from './i18n';
import { animalById } from './data';
import { isLocked, onSticker, store } from './store';

export const $ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel)!;

export function go(path: string) {
  stopAll();
  if (location.hash !== '#' + path) location.hash = path;
}

export const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export const icon = {
  back: '<svg viewBox="0 0 24 24"><path d="M15 5 8 12l7 7" /></svg>',
  speaker: '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z" class="fill"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>',
  mute: '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z" class="fill"/><path d="m17 9 5 6m0-6-5 6"/></svg>',
  heart: '<svg viewBox="0 0 24 24"><path d="M12 20s-7.5-4.6-9.3-9.2C1.4 7.4 3.6 4 7 4c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.4 0 5.6 3.4 4.3 6.8C19.5 15.4 12 20 12 20z"/></svg>',
  lock: '<svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="10" rx="2.5" class="fill"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" class="fill"/></svg>',
  mouth: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M5 20c1-4 4-6 7-6s6 2 7 6"/></svg>',
  globe: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/></svg>',
  gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" class="fill"/></svg>',
  chevL: '<svg viewBox="0 0 24 24"><path d="M15 5 8 12l7 7"/></svg>',
  chevR: '<svg viewBox="0 0 24 24"><path d="m9 5 7 7-7 7"/></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
};

export const backBtn = (to: string) => `<button class="btn-round back" data-go="${to}" aria-label="${t('back')}">${icon.back}</button>`;

/** Tarjeta de animal reutilizable (región, favoritos). */
export function card(a: Animal, i: number, lang: 'es' | 'en') {
  const locked = isLocked(a);
  return `<button class="card ${locked ? 'locked' : ''}" data-animal="${a.id}" style="--i:${i}" aria-label="${esc(a.name[lang])}${locked ? ' – ' + t('locked') : ''}">
    <span class="card-emoji">${a.emoji}</span>
    <span class="card-name">${esc(a.name[lang])}</span>
    ${locked ? `<span class="lock-badge">${icon.lock}</span>` : ''}
  </button>`;
}

/** Lluvia de confeti y estrellas para celebrar. */
export function confetti(n = 60) {
  const box = document.createElement('div');
  box.className = 'confetti';
  const colors = ['#ff5d8f', '#ffd23f', '#3bceac', '#4ea8ff', '#b07cff', '#ff9a3c'];
  for (let i = 0; i < n; i++) {
    const p = document.createElement('i');
    const star = i % 6 === 0;
    p.className = star ? 'star' : '';
    p.textContent = star ? '★' : '';
    p.style.cssText = `--x:${Math.random() * 100}vw;--dx:${(Math.random() - 0.5) * 30}vw;--r:${Math.random() * 720 - 360}deg;--d:${0.8 + Math.random() * 1.4}s;--delay:${Math.random() * 0.3}s;--c:${colors[i % colors.length]}`;
    box.appendChild(p);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 2600);
}

/** Ondas que salen del animal mientras suena. */
export function soundRings(host: HTMLElement, seconds: number) {
  host.classList.remove('talking');
  void host.offsetWidth;
  host.classList.add('talking');
  host.style.setProperty('--talk', `${Math.max(0.6, seconds)}s`);
  for (let i = 0; i < 3; i++) {
    const r = document.createElement('span');
    r.className = 'ring';
    r.style.animationDelay = `${i * 0.25}s`;
    host.appendChild(r);
    setTimeout(() => r.remove(), 1600 + i * 250);
  }
  clearTimeout(Number(host.dataset.tm));
  host.dataset.tm = String(setTimeout(() => host.classList.remove('talking'), Math.max(600, seconds * 1000)));
}

/** Delegación global: cualquier elemento con data-go navega. */
export function installGlobalHandlers() {
  document.addEventListener('pointerdown', () => unlockAudio(), { passive: true });
  document.addEventListener('click', (e) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-go]');
    if (el) { sfx('tap'); go(el.dataset.go!); }
  });
}

/** Aviso amable al tocar algo bloqueado: invita a llamar a un adulto (nunca vende al niño). */
export function lockedModal(emoji = '🔒') {
  sfx('tap');
  const m = document.createElement('div');
  m.className = 'sheet-wrap';
  m.innerHTML = `<div class="sheet locked-modal" role="dialog" aria-modal="true">
    <div class="lm-emoji">${emoji}<span class="lm-lock">${icon.lock}</span></div>
    <h3>${t('lockedTitle')}</h3><p>${t('lockedBody')}</p>
    <button class="buy-btn" data-act="adult">👨‍👩‍👧 ${t('askAdult')}</button>
    <button class="link-btn" data-act="close">${t('later')}</button></div>`;
  document.body.appendChild(m);
  const close = () => { m.classList.add('out'); setTimeout(() => m.remove(), 250); };
  m.addEventListener('click', (e) => {
    const act = (e.target as HTMLElement).closest<HTMLElement>('[data-act]')?.dataset.act;
    if (e.target === m || act === 'close') close();
    if (act === 'adult') { close(); go('/padres?next=premium'); }
  });
}

/** Al descubrir un animal nuevo aparece su pegatina volando hacia el álbum. */
onSticker((id) => {
  const a = animalById(id); if (!a) return;
  const el = document.createElement('div');
  el.className = 'sticker-toast';
  el.innerHTML = `<span class="st-emoji">${a.emoji}</span><b>${t('newSticker')}</b><small>${Object.keys(store.seen).length}</small>`;
  document.body.appendChild(el);
  setTimeout(() => sfx('star'), 150);
  setTimeout(() => el.remove(), 2600);
});
