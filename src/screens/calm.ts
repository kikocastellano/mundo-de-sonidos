// Modo calma: paisajes sonoros de naturaleza con temporizador para dormir, sobre un paisaje de noche.
import { startAmbience, stopAmbience, type Ambience } from '../audio';
import { t } from '../i18n';
import { store } from '../store';
import { $, backBtn, icon } from '../ui';
import { premiumWall } from './premium';

const OPTS: { id: Ambience; emoji: string; es: string; en: string }[] = [
  { id: 'selva', emoji: '🌴', es: 'Selva', en: 'Jungle' },
  { id: 'lluvia', emoji: '🌧️', es: 'Lluvia', en: 'Rain' },
  { id: 'olas', emoji: '🌊', es: 'Olas', en: 'Waves' },
  { id: 'noche', emoji: '🦗', es: 'Noche', en: 'Night' },
  { id: 'viento', emoji: '🍃', es: 'Viento', en: 'Wind' },
];
const TIMERS = [5, 15, 30, 0];

export function calm(root: HTMLElement) {
  if (premiumWall(root, t('calm'))) return;
  let kind: Ambience = 'selva', minutes = 15, playing = false, endAt = 0, iv = 0;
  root.innerHTML = `
    <section class="screen calm">
      <header class="topbar">${backBtn('/')}<h2>🌙 ${t('calm')}</h2><span class="spacer"></span></header>
      <div class="calm-grid">${OPTS.map((o) => `<button class="calm-opt" data-k="${o.id}"><span>${o.emoji}</span>${o[store.lang]}</button>`).join('')}</div>
      <div class="timer-row">${TIMERS.map((m) => `<button data-m="${m}">${m ? `${m} min` : '∞'}</button>`).join('')}</div>
      <button class="calm-play" aria-label="play">${icon.play}</button>
      <p class="countdown"></p>
    </section>`;
  const btn = $('.calm-play', root), cd = $('.countdown', root);
  const paint = () => {
    root.querySelectorAll<HTMLElement>('.calm-opt').forEach((b) => b.classList.toggle('on', b.dataset.k === kind));
    root.querySelectorAll<HTMLElement>('[data-m]').forEach((b) => b.classList.toggle('on', Number(b.dataset.m) === minutes));
    btn.classList.toggle('playing', playing);
    btn.innerHTML = playing ? '<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>' : icon.play;
  };
  const tick = () => {
    if (!playing || !minutes) { cd.textContent = playing ? '∞' : ''; return; }
    const left = Math.max(0, endAt - Date.now());
    cd.textContent = `${Math.floor(left / 60000)}:${String(Math.floor(left / 1000) % 60).padStart(2, '0')}`;
    if (left <= 0) { stopAmbience(8); playing = false; paint(); cd.textContent = '💤'; }
  };
  const start = () => { playing = true; endAt = Date.now() + minutes * 60000; startAmbience(kind); paint(); tick(); };
  root.querySelectorAll<HTMLElement>('.calm-opt').forEach((b) => b.addEventListener('click', () => { kind = b.dataset.k as Ambience; if (playing) start(); else paint(); }));
  root.querySelectorAll<HTMLElement>('[data-m]').forEach((b) => b.addEventListener('click', () => { minutes = Number(b.dataset.m); if (playing) endAt = Date.now() + minutes * 60000; paint(); tick(); }));
  btn.addEventListener('click', () => { if (playing) { playing = false; stopAmbience(1.5); paint(); tick(); } else start(); });
  iv = window.setInterval(tick, 1000);
  paint();
  return () => { clearInterval(iv); stopAmbience(1); };
}
