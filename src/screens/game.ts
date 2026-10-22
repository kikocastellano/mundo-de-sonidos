// Juego «¿Quién suena?»: suena un animal y el niño elige entre 3 (o 4) imágenes. Sin vidas ni castigos.
import { playAnimal, preload, sayName, sfx } from '../audio';
import { ANIMALS, REGIONS, type Animal, type RegionId } from '../data';
import { t } from '../i18n';
import { addStar, discover, isLocked, save, store } from '../store';
import { $, backBtn, confetti, esc, icon, soundRings } from '../ui';

const shuffle = <T,>(arr: T[]) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

export function gamePicker(root: HTMLElement) {
  const L = store.lang;
  root.innerHTML = `
    <section class="screen region" style="--accent:#7b5cff">
      <header class="topbar">${backBtn('/')}<h2><span class="title-emoji">👂</span>${t('game')}</h2><span class="spacer"></span></header>
      <p class="subtitle">${t('chooseRegion')}</p>
      <div class="grid picker">
        <button class="card" data-go="/juego/todo" style="--i:0"><span class="card-emoji">🌍</span><span class="card-name">${t('allRegions')}</span></button>
        ${REGIONS.map((r, i) => `<button class="card" data-go="/juego/${r.id}" style="--i:${i + 1}"><span class="card-emoji">${r.emoji}</span><span class="card-name">${esc(r.name[L])}</span>${store.stars[r.id] ? `<span class="stars-badge">★ ${store.stars[r.id]}</span>` : ''}</button>`).join('')}
      </div>
    </section>`;
}

export function game(root: HTMLElement, where: RegionId | 'todo') {
  const L = store.lang;
  const free = ANIMALS.filter((a) => !isLocked(a));
  let pool = where === 'todo' ? free : free.filter((a) => a.region === where);
  // Si una región tiene pocos animales gratis, se completa con otros para tener opciones.
  const distractors = free;
  if (pool.length === 0) pool = free;
  let streak = 0, round = 0, last = '';
  let target: Animal; let busy = false; let mistakes = 0;

  preload(pool);
  root.innerHTML = `
    <section class="screen game" style="--accent:#7b5cff">
      <header class="topbar">${backBtn('/juego')}<h2>${t('game')}</h2><div class="star-count">${icon.star}<b class="sc">${store.stars[where] || 0}</b></div></header>
      <div class="question">
        <button class="listen-btn" aria-label="${t('hearSound')}"><span class="ear">👂</span><span class="listen-wave"></span></button>
        <p class="prompt">${t('listen')}</p>
      </div>
      <div class="choices"></div>
    </section>`;
  const choices = $('.choices', root), prompt = $('.prompt', root), listenBtn = $('.listen-btn', root);

  const play = () => soundRings(listenBtn, playAnimal(target));
  listenBtn.addEventListener('click', play);

  function next() {
    busy = false; mistakes = 0; round++;
    const n = streak >= 5 ? 4 : 3;
    const cands = pool.filter((a) => a.id !== last);
    target = cands[Math.floor(Math.random() * cands.length)] ?? pool[0];
    last = target.id;
    const others: Animal[] = [];
    for (const a of shuffle(distractors)) if (others.length < n - 1 && a.emoji !== target.emoji && a.sound !== target.sound && !others.some((o) => o.emoji === a.emoji || o.sound === a.sound)) others.push(a);
    const opts = shuffle([target, ...others]);
    prompt.textContent = t('listen');
    choices.className = `choices n${opts.length}`;
    choices.innerHTML = opts.map((a, i) => `<button class="choice" data-id="${a.id}" style="--i:${i}" aria-label="${esc(a.name[L])}"><span>${a.emoji}</span></button>`).join('');
    choices.querySelectorAll<HTMLElement>('.choice').forEach((b) => b.addEventListener('click', () => pick(b)));
    setTimeout(play, round === 1 ? 500 : 350);
  }

  function pick(b: HTMLElement) {
    if (busy) return;
    if (b.dataset.id === target.id) {
      busy = true;
      b.classList.add('right');
      choices.querySelectorAll('.choice:not(.right)').forEach((o) => o.classList.add('fade'));
      prompt.innerHTML = `${t('great')} <b>${esc(target.name[L])}</b>`;
      sfx('win'); confetti();
      setTimeout(() => sayName(target.name[L]), 500);
      if (mistakes === 0) streak++;
      addStar(where); setTimeout(() => discover(target.id), 1200);
      store.rounds = (store.rounds || 0) + 1; save();
      if (!store.premium && store.rounds % 8 === 0) setTimeout(() => upsell(root), 2400);
      const sc = $('.sc', root); sc.textContent = String(store.stars[where]); sc.parentElement!.classList.add('pop');
      setTimeout(() => sc.parentElement!.classList.remove('pop'), 600);
      setTimeout(next, 2300);
    } else {
      mistakes++; streak = Math.max(0, streak - 1);
      sfx('oops');
      b.classList.remove('wrong'); void b.offsetWidth; b.classList.add('wrong');
      prompt.textContent = t('tryAgain');
      setTimeout(play, 700);
    }
  }
  next();
}

/** Cada 8 aciertos, un aviso suave (no bloquea) de que hay más animales en el álbum completo. */
function upsell(root: HTMLElement) {
  if (root.querySelector('.upsell')) return;
  const n = ANIMALS.filter((a) => isLocked(a)).length;
  const el = document.createElement('div');
  el.className = 'upsell';
  el.innerHTML = `<span>🦁🐼🦒</span><p><b>+${n}</b> ${t('moreWaiting')}</p><button class="pill" data-go="/padres?next=premium">${t('askAdult')}</button><button class="up-x" aria-label="${t('close')}">✕</button>`;
  root.querySelector('.screen')?.appendChild(el);
  el.querySelector('.up-x')!.addEventListener('click', () => el.remove());
  setTimeout(() => el.remove(), 9000);
}
