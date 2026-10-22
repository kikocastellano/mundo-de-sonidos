// Ficha del animal: imagen grande, sonido, nombre, dato curioso y deslizar al siguiente.
import { playAnimal, preload, sayName, sfx, stopAll } from '../audio';
import { ANIMALS, animalById, animalsIn, regionById } from '../data';
import { INFO } from '../info';
import { t } from '../i18n';
import { discover, isLocked, logAct, store, toggleFav } from '../store';
import { $, backBtn, esc, go, icon, lockedModal, soundRings } from '../ui';

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
        ? `<div class="fact locked-note">${icon.lock}<p>${t('locked')}</p><button class="pill ask-adult">${t('askAdult')}</button></div>`
        : `<div class="fact"><span class="fact-emoji">💡</span><p>${esc(a.fact[L])}</p></div>
           ${INFO[a.id] ? `<button class="more-btn">📖 ${t('more')}</button>` : ''}`}
    </section>`;
  delete root.dataset.dir;

  preload(list);
  const portrait = $('.portrait', root);
  const play = () => {
    if (locked) { portrait.classList.remove('shake'); void portrait.offsetWidth; portrait.classList.add('shake'); lockedModal(a.emoji); return; }
    soundRings(portrait, playAnimal(a)); logAct('listen', a.id);
    setTimeout(() => discover(a.id), 900);
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

  root.querySelector('.ask-adult')?.addEventListener('click', () => lockedModal(a.emoji));
  root.querySelector('.more-btn')?.addEventListener('click', () => { sfx('tap'); openInfo(a, r.accent); });

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

const DIET = { h: ['🌿', 'dietH'], c: ['🍖', 'dietC'], o: ['🍽️', 'dietO'], i: ['🐛', 'dietI'] } as const;

/** Panel «Saber más»: tarjetas grandes que se leen en voz alta al tocarlas. */
function openInfo(a: (typeof ANIMALS)[number], accent: string) {
  const info = INFO[a.id];
  if (!info) return;
  const L = store.lang, x = info[L];
  const [dEmoji, dKey] = DIET[info.diet];
  const tiles: [string, string, string][] = [
    ['🏠', t('home'), x.home], ['🍽️', t('food'), x.food],
    // «Cría» a secas no enseña nada: solo se muestra si la cría tiene un nombre propio (ternero, potro…)
    ...(/^cr[ií]a$/i.test(info.es.baby.trim()) ? [] : [['👶', t('baby'), x.baby] as [string, string, string]]),
    ['📏', t('size'), x.size], ['⚖️', t('weight'), info.weight], ['⏳', t('life'), `${info.life} ${t('years')}`],
  ];
  const facts = [a.fact[L], ...x.more];
  const sheet = document.createElement('div');
  sheet.className = 'sheet-wrap';
  sheet.innerHTML = `
    <div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(a.name[L])}" style="--accent:${accent}">
      <div class="sheet-head"><span class="sheet-emoji">${a.emoji}</span><h3>${esc(a.name[L])}</h3>
        <button class="btn-round close" aria-label="${t('close')}">${icon.close}</button></div>
      <button class="diet say" data-say="${esc(t(dKey))}"><span>${dEmoji}</span>${esc(t(dKey))}</button>
      <p class="hint-tap">🔊 ${t('tapToHear')}</p>
      <div class="tiles">${tiles.map(([e, k, v], i) => `<button class="tile say" style="--i:${i}" data-say="${esc(k)}: ${esc(v)}"><span class="tile-emoji">${e}</span><small>${esc(k)}</small><b>${esc(v)}</b></button>`).join('')}</div>
      <h4>${t('didYouKnow')}</h4>
      <div class="facts">${facts.map((f, i) => `<button class="fact-card say" style="--i:${i}" data-say="${esc(f)}"><span>${['💡', '⭐', '🌍'][i]}</span>${esc(f)}</button>`).join('')}</div>
    </div>`;
  document.body.appendChild(sheet);
  const close = () => { stopAll(); sheet.classList.add('out'); setTimeout(() => sheet.remove(), 250); window.removeEventListener('keydown', onEsc); };
  const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
  window.addEventListener('keydown', onEsc);
  sheet.addEventListener('click', (e) => {
    const el = e.target as HTMLElement;
    if (el === sheet || el.closest('.close')) return close();
    const s = el.closest<HTMLElement>('.say');
    if (s) {
      sheet.querySelectorAll('.say.speaking').forEach((n) => n.classList.remove('speaking'));
      s.classList.add('speaking'); sayName(s.dataset.say!);
      setTimeout(() => s.classList.remove('speaking'), 2500);
    }
  });
  sheet.querySelector<HTMLElement>('.close')!.focus();
}
