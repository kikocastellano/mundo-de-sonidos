// Puerta para padres (mantener pulsado el número dicho en palabras) y zona de padres.
import { sfx } from '../audio';
import { buy, canBuy, onBillingChange, price, restore } from '../billing';
import { ANIMALS } from '../data';
import { t } from '../i18n';
import { save, store } from '../store';
import { $, backBtn, go, icon } from '../ui';

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
      <div class="panel premium ${next === 'premium' ? 'highlight' : ''}">
        <button class="btn-round close" data-go="/" aria-label="${t('close')}">${icon.close}</button>
        <div class="premium-emojis">🦁🐘🐨🦜🐧</div>
        <h3>${store.premium ? t('owned') : t('premiumTitle')}</h3>
        ${store.premium ? '' : `<p>${t('premiumBody')}</p>
        <p class="muted">+${premiumCount} ${store.lang === 'es' ? 'animales y modos extra' : 'animals and extra modes'}</p>
        <button class="buy-btn" ${canBuy() ? '' : 'disabled'}>${t('buy')} <b>${price()}</b></button>
        <p class="one-time">${t('oneTime')}</p>
        ${canBuy() ? '' : `<p class="muted">${t('webOnly')}</p>`}`}
        ${canBuy() ? `<button class="link-btn restore">${t('restore')}</button>` : ''}
        <p class="muted small">${t('family')}</p>
      </div>
      <div class="panel settings">
        <div class="row"><span>${t('language')}</span>
          <div class="seg">${(['es', 'en'] as const).map((l) => `<button data-lang="${l}" class="${store.lang === l ? 'on' : ''}">${l === 'es' ? 'Español' : 'English'}</button>`).join('')}</div></div>
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
  root.querySelector('.premium-test')?.addEventListener('click', () => { store.premium = !store.premium; save(); parentArea(root, next); });
  $('.toggle', root).addEventListener('click', () => { store.muted = !store.muted; save(); parentArea(root, next); });
}
