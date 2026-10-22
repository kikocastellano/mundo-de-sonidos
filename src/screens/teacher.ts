// Modo profe: reproduce seguidos los favoritos (o una región) a pantalla completa para proyectar en clase.
import { playAnimal, sayName, stopAll } from '../audio';
import { ANIMALS, animalById, animalsIn, regionById, type Animal, type RegionId } from '../data';
import { isLocked, store } from '../store';
import { $, backBtn, icon, soundRings } from '../ui';
import { premiumWall } from './premium';

export function teacher(root: HTMLElement, src: string | null) {
  const title = store.lang === 'es' ? 'Modo profe' : 'Teacher mode';
  if (premiumWall(root, title)) return;
  const favs = store.favs.map(animalById).filter((a): a is Animal => !!a);
  const list = (src && regionById(src) ? animalsIn(src as RegionId) : favs.length ? favs : ANIMALS).filter((a) => !isLocked(a));
  let i = 0, paused = false, tm = 0;
  root.innerHTML = `
    <section class="screen teacher">
      <header class="topbar">${backBtn(src && regionById(src) ? `/region/${src}` : '/favoritos')}<span class="spacer" style="flex:1"></span>
        <button class="btn-round fs" aria-label="fullscreen"><svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></button></header>
      <button class="portrait"><span class="halo"></span><span class="portrait-emoji"></span></button>
      <h1 class="teacher-name"></h1>
      <div class="teacher-bar">
        <button class="nav-arrow prev" aria-label="prev">${icon.chevL}</button>
        <button class="action sound pause" aria-label="pause"></button>
        <button class="nav-arrow next" aria-label="next">${icon.chevR}</button>
      </div>
    </section>`;
  const portrait = $('.portrait', root), name = $('.teacher-name', root), pause = $('.pause', root);
  const show = () => {
    clearTimeout(tm);
    const a = list[i];
    root.style.setProperty('--accent', regionById(a.region)!.accent);
    $('.portrait-emoji', root).textContent = a.emoji;
    name.textContent = a.name[store.lang];
    portrait.classList.remove('shake'); void portrait.offsetWidth;
    const d = playAnimal(a); soundRings(portrait, d);
    tm = window.setTimeout(() => { sayName(a.name[store.lang]); if (!paused) tm = window.setTimeout(() => step(1), 3500); }, d * 1000 + 400);
  };
  const step = (d: number) => { i = (i + d + list.length) % list.length; show(); };
  const paintPause = () => { pause.innerHTML = paused ? icon.play : '<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1" class="fill"/><rect x="14" y="5" width="4" height="14" rx="1" class="fill"/></svg>'; };
  pause.addEventListener('click', () => { paused = !paused; paintPause(); if (!paused) show(); else { clearTimeout(tm); stopAll(); } });
  $('.prev', root).addEventListener('click', () => step(-1));
  $('.next', root).addEventListener('click', () => step(1));
  portrait.addEventListener('click', () => soundRings(portrait, playAnimal(list[i])));
  $('.fs', root).addEventListener('click', () => {
    if (document.fullscreenElement) void document.exitFullscreen(); else void document.documentElement.requestFullscreen?.().catch(() => {});
  });
  name.setAttribute('aria-live', 'polite');
  paintPause();
  setTimeout(show, 300);
  return () => { clearTimeout(tm); if (document.fullscreenElement) void document.exitFullscreen(); };
}
