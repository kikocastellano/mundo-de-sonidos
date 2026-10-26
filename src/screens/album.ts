// Álbum de pegatinas: cada animal descubierto es una pegatina; los huecos invitan a completarlo.
import { sfx } from '../audio';
import { ANIMALS, REGIONS, animalsIn } from '../data';
import { t } from '../i18n';
import { isLocked, store } from '../store';
import { backBtn, esc, go, icon, lockedModal } from '../ui';

export function album(root: HTMLElement) {
  const L = store.lang;
  const got = ANIMALS.filter((a) => store.seen[a.id]).length;
  const locked = ANIMALS.filter(isLocked).length;
  root.innerHTML = `
    <section class="screen album" style="--accent:#ffb627">
      <header class="topbar">${backBtn('/')}<h2>📒 ${t('album')}</h2><span class="spacer"></span></header>
      <div class="album-progress">
        <div class="ap-bar"><i style="width:${(got / ANIMALS.length) * 100}%"></i></div>
        <b>${got} / ${ANIMALS.length}</b> ${t('stickers')}
      </div>
      ${locked ? `<button class="album-unlock" data-go="/premium">🔒 <b>+${locked}</b> ${t('moreWaiting')} <span>›</span></button>` : ''}
      ${REGIONS.map((r) => {
        const list = animalsIn(r.id);
        const n = list.filter((a) => store.seen[a.id]).length;
        const done = n === list.length;
        return `<div class="album-page" style="--c:${r.accent}">
          <h3><span>${r.emoji}</span>${esc(r.name[L])}<small>${n}/${list.length}</small>${done ? `<em class="medal" title="${t('expert')} ${esc(r.name[L])}">🏅</em>` : ''}</h3>
          <div class="stickers">${list.map((a, i) => {
            const has = !!store.seen[a.id], lock = isLocked(a);
            return `<button class="sticker ${has ? 'got' : 'empty'} ${lock ? 'locked' : ''}" data-id="${a.id}" style="--i:${i};--r:${((i * 37) % 11) - 5}deg" aria-label="${has ? esc(a.name[L]) : '?'}">
              <span class="s-emoji">${a.emoji}</span>${has ? `<small>${esc(a.name[L])}</small>` : lock ? `<span class="s-lock">${icon.lock}</span>` : '<small>?</small>'}</button>`;
          }).join('')}</div></div>`;
      }).join('')}
    </section>`;
  root.querySelectorAll<HTMLElement>('.sticker').forEach((b) => b.addEventListener('click', () => {
    const a = ANIMALS.find((x) => x.id === b.dataset.id)!;
    if (isLocked(a)) return lockedModal(a.emoji);
    sfx('tap'); go(`/animal/${a.id}`);
  }));
}
