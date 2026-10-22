// Puerta para padres (mantener pulsado el número dicho en palabras) y zona de padres.
import { availableVoices, sayName, sfx } from '../audio';
import { buy, canBuy, onBillingChange, price, restore } from '../billing';
import { ANIMALS } from '../data';
import { t } from '../i18n';
import { save, store, weekSummary } from '../store';
import { $, backBtn, esc, go, icon } from '../ui';

const WORDS = {
  es: ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'],
  en: ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'],
};
let unlockedUntil = 0;
let offBilling: (() => void) | null = null;

export function parents(root: HTMLElement, next: string | null) {
  if (Date.now() < unlockedUntil) return parentArea(root, next);
  const target = 1 + Math.floor(Math.random() * 9);
  const nums = [target, ...[1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => n !== target).sort(() => Math.random() - 0.5).slice(0, 3)].sort(() => Math.random() - 0.5);
  root.innerHTML = `
    <section class="screen parents gate">
      <header class="topbar">${backBtn('/')}<h2>${t('parents')}</h2><span class="spacer"></span></header>
      <div class="panel">
        <div class="gate-lock">${icon.lock}</div>
        <p class="hint">${t('gateHint')}</p>
        <p>${t('gateAsk')} <b class="word">${WORDS[store.lang][target]}</b></p>
        <div class="gate-nums">${nums.map((n) => `<button class="gate-num" data-n="${n}"><span class="fillbar"></span><b>${n}</b></button>`).join('')}</div>
      </div>
    </section>`;
  root.querySelectorAll<HTMLElement>('.gate-num').forEach((b) => {
    let tm = 0;
    const start = (e: Event) => {
      e.preventDefault();
      b.classList.add('holding');
      tm = window.setTimeout(() => {
        if (Number(b.dataset.n) === target) { unlockedUntil = Date.now() + 5 * 60_000; sfx('win'); parentArea(root, next); }
        else { sfx('oops'); go('/'); }
      }, 1800);
    };
    const end = () => { clearTimeout(tm); b.classList.remove('holding'); };
    b.addEventListener('pointerdown', start);
    b.addEventListener('pointerup', end); b.addEventListener('pointerleave', end); b.addEventListener('pointercancel', end);
    b.addEventListener('contextmenu', (e) => e.preventDefault());
  });
}

function parentArea(root: HTMLElement, next: string | null) {
  const premiumCount = ANIMALS.filter((a) => a.premium).length;
  root.innerHTML = `
    <section class="screen parents">
      <header class="topbar">${backBtn('/')}<h2>${t('parents')}</h2><span class="spacer"></span></header>
      ${weekPanel()}
      ${next === 'valorar' ? ratePanel() : ''}
      ${(() => {
        const es = store.lang === 'es';
        const lockedList = ANIMALS.filter((a) => a.premium);
        const got = Object.keys(store.seen).length;
        const row = (list: typeof ANIMALS, dir: string) => `<div class="mq ${dir}"><div>${[...list, ...list].map((a) => `<span>${a.emoji}</span>`).join('')}</div></div>`;
        const half = Math.ceil(lockedList.length / 2);
        const perks: [string, string][] = es ? [
          ['🦁', `<b>+${premiumCount} animales</b> de todo el mundo con su sonido real`],
          ['📒', `Completar el <b>álbum de ${ANIMALS.length} pegatinas</b> (ahora tiene ${got})`],
          ['🌙', '<b>Modo calma</b>: 10 sonidos para dormir con temporizador'],
          ['🧑‍🏫', '<b>Modo profe</b>: presentaciones y preguntas para clase'],
          ['✨', '<b>Animales nuevos</b> en el futuro, sin pagar más'],
          ['🚫', 'Sin anuncios y sin datos personales. <b>Nunca.</b>'],
        ] : [
          ['🦁', `<b>+${premiumCount} animals</b> from around the world with real sounds`],
          ['📒', `Complete the <b>${ANIMALS.length}-sticker album</b> (now ${got})`],
          ['🌙', '<b>Calm mode</b>: 10 bedtime sounds with a timer'],
          ['🧑‍🏫', '<b>Teacher mode</b>: slideshows and quizzes for class'],
          ['✨', '<b>New animals</b> in the future at no extra cost'],
          ['🚫', 'No ads and no personal data. <b>Ever.</b>'],
        ];
        return store.premium ? `
      <div class="panel premium owned-panel"><div class="premium-emojis">🎉🦁🐘🐨🦜🐧</div><h3>${t('owned')}</h3><p class="muted small">${t('family')}</p></div>` : `
      <div class="panel premium paywall ${next === 'premium' ? 'highlight' : ''}">
        <button class="btn-round close" data-go="/" aria-label="${t('close')}">${icon.close}</button>
        <div class="marquee">${row(lockedList.slice(0, half), 'l')}${row(lockedList.slice(half), 'r')}</div>
        <h3>${t('premiumTitle')}</h3>
        <ul class="perks">${perks.map(([e, txt], k) => `<li style="--i:${k}"><span>${e}</span><p>${txt}</p></li>`).join('')}</ul>
        <div class="price-box"><b>${price()}</b><span>${es ? 'pago único · para siempre' : 'one-time · forever'}</span><small>${es ? 'Menos que un café ☕ y sin suscripciones' : 'Less than a coffee ☕ and no subscriptions'}</small></div>
        <button class="buy-btn" ${canBuy() ? '' : 'disabled'}>${t('buy')} <b>${price()}</b></button>
        <p class="one-time">${t('oneTime')}</p>
        ${canBuy() ? `<button class="link-btn restore">${t('restore')}</button>` : `<p class="muted">${t('webOnly')}</p>`}
        <p class="muted small">${t('family')}</p>
      </div>`;
      })()}
      <div class="panel settings">
        <div class="row"><span>${t('language')}</span>
          <div class="seg">${(['es', 'en'] as const).map((l) => `<button data-lang="${l}" class="${store.lang === l ? 'on' : ''}">${l === 'es' ? 'Español' : 'English'}</button>`).join('')}</div></div>
        <div class="row"><span>${t('kidName')}</span><input class="kid-name" maxlength="20" value="${esc(store.kid)}" autocomplete="off" /></div>
        <div class="row"><span>${t('voice')}</span>
          <select class="voice-select" aria-label="${t('voice')}">${availableVoices().map((v, i) => `<option value="${v.name}" ${(store.voice[store.lang] ? store.voice[store.lang] === v.name : i === 0) ? 'selected' : ''}>${v.name.replace(/^(Microsoft|Google|Apple)\s*/i, '').replace(/\s*-\s*.*$/, '')} (${v.lang})</option>`).join('') || '<option>—</option>'}</select></div>
        <div class="row"><span>${t('sound')}</span>
          <button class="toggle ${store.muted ? '' : 'on'}" aria-pressed="${!store.muted}">${store.muted ? icon.mute : icon.speaker}</button></div>
      </div>
      <div class="panel credits"><h3>${t('credits')}</h3><p>${t('creditsBody')}</p><p class="muted">${t('privacy')}</p>
        <div class="link-row"><button class="pill" data-go="/creditos">${t('credits')}</button><a class="pill" href="./privacidad.html" target="_blank" rel="noopener" style="text-decoration:none;display:inline-flex;align-items:center">${store.lang === 'es' ? 'Privacidad' : 'Privacy'}</a></div></div>
      ${canBuy() ? '' : `<div class="panel settings"><div class="row"><span>${store.lang === 'es' ? 'Probar premium (solo pruebas, sin pago)' : 'Try premium (testing only, no payment)'}</span>
        <button class="toggle premium-test ${store.premium ? 'on' : ''}" aria-pressed="${store.premium}">${icon.star}</button></div></div>`}
    </section>`;
  root.querySelectorAll<HTMLElement>('[data-lang]').forEach((b) => b.addEventListener('click', () => {
    store.lang = b.dataset.lang as 'es' | 'en'; save(); document.documentElement.lang = store.lang; parentArea(root, next);
  }));
  root.querySelector('.buy-btn')?.addEventListener('click', () => void buy());
  root.querySelector('.restore')?.addEventListener('click', () => void restore());
  offBilling?.();
  offBilling = onBillingChange(() => { offBilling?.(); offBilling = null; if (document.body.contains(root)) parentArea(root, next); });
  root.querySelector<HTMLInputElement>('.kid-name')?.addEventListener('change', (e) => { store.kid = (e.target as HTMLInputElement).value.trim(); save(); parentArea(root, next); });
  root.querySelector('.rate-btn')?.addEventListener('click', () => { store.rated = Date.now(); save(); window.open('https://play.google.com/store/apps/details?id=com.kikocastellano.mundodesonidos', '_blank'); });
  root.querySelector<HTMLSelectElement>('.voice-select')?.addEventListener('change', (e) => {
    store.voice[store.lang] = (e.target as HTMLSelectElement).value; save(); sayName(t('voiceTry'));
  });
  root.querySelector('.premium-test')?.addEventListener('click', () => { store.premium = !store.premium; save(); parentArea(root, next); });
  $('.toggle', root).addEventListener('click', () => { store.muted = !store.muted; save(); parentArea(root, next); });
}

/** Resumen de la semana para los padres (calculado en el dispositivo, nunca sale de él). */
function weekPanel() {
  const w = weekSummary(); const es = store.lang === 'es';
  const who = store.kid || (es ? 'Tu peque' : 'Your child');
  const fav = w.fav ? ANIMALS.find((a) => a.id === w.fav) : undefined;
  const max = Math.max(1, ...w.perDay);
  const days = es ? ['L', 'M', 'X', 'J', 'V', 'S', 'D'] : ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const label = (i: number) => days[(new Date(Date.now() - (6 - i) * 864e5).getDay() + 6) % 7];
  const total = Object.keys(store.seen).length;
  return `<div class="panel week">
    <h3>📊 ${t('weekTitle')}</h3>
    <p class="week-lead">${esc(who)} ${es ? `ha descubierto <b>${w.seen}</b> animales nuevos y ha acertado <b>${w.right}</b> preguntas.` : `discovered <b>${w.seen}</b> new animals and got <b>${w.right}</b> answers right.`}</p>
    <div class="week-stats">
      <div><b>${w.listen}</b><small>${es ? 'sonidos escuchados' : 'sounds played'}</small></div>
      <div><b>${w.days}/7</b><small>${es ? 'días jugando' : 'days playing'}</small></div>
      <div><b>${total}</b><small>${es ? 'pegatinas en total' : 'stickers in total'}</small></div>
    </div>
    <div class="week-bars">${w.perDay.map((v, i) => `<div><i style="height:${Math.round((v / max) * 100)}%"></i><small>${label(i)}</small></div>`).join('')}</div>
    ${fav ? `<p class="muted">${es ? 'Su animal favorito esta semana' : 'Favourite animal this week'}: <b>${fav.emoji} ${esc(fav.name[store.lang])}</b></p>` : ''}
    <p class="muted small">${es ? 'Estos datos solo se guardan en este dispositivo.' : 'This data stays on this device only.'}</p>
  </div>`;
}

function ratePanel() {
  return `<div class="panel rate highlight"><div class="premium-emojis">⭐⭐⭐⭐⭐</div><h3>${t('rateTitle')}</h3><p>${t('rateBody')}</p><button class="buy-btn rate-btn">${t('rateBtn')}</button></div>`;
}
