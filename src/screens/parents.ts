// Puerta para padres (mantener pulsado el número dicho en palabras) y zona de padres.
import { availableVoices, sayName, sfx } from '../audio';
import { billingStatus, buy, redeemCode, canBuy, isNativeApp, onBillingChange, price, restore, testUnlockAllowed } from '../billing';
import { ANIMALS } from '../data';
import { t } from '../i18n';
import { save, store, weekSummary } from '../store';
import { $, backBtn, esc, go, icon } from '../ui';

let unlockedUntil = 0;
let offBilling: (() => void) | null = null;

export function parents(root: HTMLElement, next: string | null) {
  if (next === 'premium') return premiumScreen(root);
  if (Date.now() < unlockedUntil) return parentArea(root, next);
  // Pregunta rápida para adultos: una suma que un niño pequeño no sabe hacer
  const a = 3 + Math.floor(Math.random() * 6), b = 4 + Math.floor(Math.random() * 6), ok = a + b;
  const opts = [ok, ok + 1, ok - 2, ok + 3].sort(() => Math.random() - 0.5);
  root.innerHTML = `
    <section class="screen parents gate">
      <header class="topbar">${backBtn('/')}<h2>${t('parents')}</h2><span class="spacer"></span></header>
      <div class="panel">
        <div class="gate-lock">${icon.lock}</div>
        <p class="hint">${t('gateHint')}</p>
        <p class="gate-q">${a} + ${b} = ?</p>
        <div class="gate-nums">${opts.map((n) => `<button class="gate-num" data-n="${n}"><b>${n}</b></button>`).join('')}</div>
      </div>
    </section>`;
  root.querySelectorAll<HTMLElement>('.gate-num').forEach((btn) => btn.addEventListener('click', () => {
    if (Number(btn.dataset.n) === ok) { unlockedUntil = Date.now() + 10 * 60_000; sfx('win'); parentArea(root, next); }
    else { sfx('oops'); go('/'); }
  }));
}

function parentArea(root: HTMLElement, next: string | null) {
  root.innerHTML = `
    <section class="screen parents">
      <header class="topbar">${backBtn('/')}<h2>${t('parents')}</h2><span class="spacer"></span></header>
      ${weekPanel()}
      ${next === 'valorar' ? ratePanel() : ''}
      ${paywallPanel(next)}
      <div class="panel settings">
        <div class="row"><span>${t('language')}</span>
          <div class="seg">${(['es', 'en'] as const).map((l) => `<button data-lang="${l}" class="${store.lang === l ? 'on' : ''}">${l === 'es' ? 'Español' : 'English'}</button>`).join('')}</div></div>
        <div class="row"><span>${t('kidName')}</span><input class="kid-name" maxlength="20" value="${esc(store.kid)}" autocomplete="off" /></div>
        ${store.premium ? '' : `<div class="row"><span>${store.lang === 'es' ? 'Código de acceso' : 'Access code'}</span><span class="code-row"><input class="code-input" maxlength="20" autocomplete="off" autocapitalize="characters" /><button class="pill code-btn">OK</button></span></div>`}
        <div class="row"><span>${t('voice')}</span>
          <select class="voice-select" aria-label="${t('voice')}">${availableVoices().map((v, i) => `<option value="${v.name}" ${(store.voice[store.lang] ? store.voice[store.lang] === v.name : i === 0) ? 'selected' : ''}>${v.name.replace(/^(Microsoft|Google|Apple)\s*/i, '').replace(/\s*-\s*.*$/, '')} (${v.lang})</option>`).join('') || '<option>—</option>'}</select></div>
        <div class="row"><span>${t('sound')}</span>
          <button class="toggle ${store.muted ? '' : 'on'}" aria-pressed="${!store.muted}">${store.muted ? icon.mute : icon.speaker}</button></div>
      </div>
      <div class="panel credits"><h3>${t('credits')}</h3><p>${t('creditsBody')}</p><p class="muted">${t('privacy')}</p>
        <div class="link-row"><button class="pill" data-go="/creditos">${t('credits')}</button><a class="pill" href="./privacidad.html" target="_blank" rel="noopener" style="text-decoration:none;display:inline-flex;align-items:center">${store.lang === 'es' ? 'Privacidad' : 'Privacy'}</a></div></div>
      ${!testUnlockAllowed() ? '' : `<div class="panel settings"><div class="row"><span>${store.lang === 'es' ? 'Probar premium (solo pruebas, sin pago)' : 'Try premium (testing only, no payment)'}</span>
        <button class="toggle premium-test ${store.premium ? 'on' : ''}" aria-pressed="${store.premium}">${icon.star}</button></div></div>`}
    </section>`;
  root.querySelectorAll<HTMLElement>('[data-lang]').forEach((b) => b.addEventListener('click', () => {
    store.lang = b.dataset.lang as 'es' | 'en'; save(); document.documentElement.lang = store.lang; parentArea(root, next);
  }));
  bindPaywall(root, () => parentArea(root, next));
  root.querySelector('.code-btn')?.addEventListener('click', async () => {
    const inp = root.querySelector<HTMLInputElement>('.code-input')!;
    if (await redeemCode(inp.value)) { sfx('win'); parentArea(root, next); } else { sfx('oops'); inp.value = ''; inp.placeholder = '✕'; }
  });
  root.querySelector<HTMLInputElement>('.kid-name')?.addEventListener('change', (e) => { store.kid = (e.target as HTMLInputElement).value.trim(); save(); parentArea(root, next); });
  root.querySelector('.rate-btn')?.addEventListener('click', () => { store.rated = Date.now(); save(); window.open('https://play.google.com/store/apps/details?id=com.kikocastellano.mundodesonidos', '_blank'); });
  root.querySelector<HTMLSelectElement>('.voice-select')?.addEventListener('change', (e) => {
    store.voice[store.lang] = (e.target as HTMLSelectElement).value; save(); sayName(t('voiceTry'));
  });
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

/** Panel de compra (se usa en la zona de padres y en la pantalla «Premium»). */
function paywallPanel(next: string | null) {
  const premiumCount = ANIMALS.filter((a) => a.premium).length;
        const es = store.lang === 'es';
        const lockedList = ANIMALS.filter((a) => a.premium);
        const got = Object.keys(store.seen).length;
        const row = (list: typeof ANIMALS, dir: string) => `<div class="mq ${dir}"><div>${[...list, ...list].map((a) => `<span>${a.emoji}</span>`).join('')}</div></div>`;
        const few = lockedList.filter((_, i) => i % 3 === 0).slice(0, 36);
        const half = Math.ceil(few.length / 2);
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
        <div class="marquee">${row(few.slice(0, half), 'l')}${row(few.slice(half), 'r')}</div>
        <h3>${t('premiumTitle')}</h3>
        <ul class="perks">${perks.map(([e, txt], k) => `<li style="--i:${k}"><span>${e}</span><p>${txt}</p></li>`).join('')}</ul>
        <div class="price-box"><b>${price()}</b><span>${es ? 'pago único · para siempre' : 'one-time · forever'}</span><small>${es ? 'Menos que un café ☕ y sin suscripciones' : 'Less than a coffee ☕ and no subscriptions'}</small></div>
        <button class="buy-btn" ${canBuy() ? '' : 'disabled'}>${t('buy')} <b>${price()}</b></button>
        <p class="one-time">${t('oneTime')}</p>
        ${canBuy() ? `<button class="link-btn restore">${t('restore')}</button>` : `<p class="muted">${isNativeApp() ? t('storeDown') : t('webOnly')}</p>`}
        <p class="muted small">${t('family')}</p>
        ${isNativeApp() ? `<p class="billing-status">Google Play: ${esc(billingStatus)}</p>` : ''}
      </div>`;
}

function bindPaywall(root: HTMLElement, rerender: () => void) {
  root.querySelector('.buy-btn:not(.rate-btn)')?.addEventListener('click', (e) => { const b = e.currentTarget as HTMLButtonElement; b.disabled = true; void buy().finally(() => { b.disabled = !canBuy(); }); });
  root.querySelector('.restore')?.addEventListener('click', () => void restore());
  root.querySelector('.premium-test')?.addEventListener('click', () => { store.premium = !store.premium; save(); rerender(); });
  offBilling?.();
  const wasPremium = store.premium;
  // Solo se redibuja entera si cambia el estado de compra; si no, se actualizan los textos en su sitio
  // (así no salta el scroll ni se reinician las animaciones cada vez que Google Play responde).
  offBilling = onBillingChange(() => {
    if (!document.body.contains(root)) { offBilling?.(); offBilling = null; return; }
    if (store.premium !== wasPremium) { offBilling?.(); offBilling = null; rerender(); return; }
    const st = root.querySelector('.billing-status'); if (st) st.textContent = `Google Play: ${billingStatus}`;
    root.querySelectorAll('.price-box b, .buy-btn:not(.rate-btn) b').forEach((b) => { b.textContent = price(); });
    const btn = root.querySelector<HTMLButtonElement>('.buy-btn:not(.rate-btn)'); if (btn) btn.disabled = !canBuy();
  });
}

/** Pantalla de compra directa: sin puerta (Google Play ya pide la contraseña o huella del adulto al pagar). */
export function premiumScreen(root: HTMLElement) {
  root.innerHTML = `
    <section class="screen parents">
      <header class="topbar">${backBtn('/')}<h2>⭐ Premium</h2><span class="spacer"></span></header>
      ${paywallPanel('premium')}
      ${!testUnlockAllowed() ? '' : `<div class="panel settings"><div class="row"><span>${store.lang === 'es' ? 'Probar premium (solo pruebas, sin pago)' : 'Try premium (testing only, no payment)'}</span>
        <button class="toggle premium-test ${store.premium ? 'on' : ''}" aria-pressed="${store.premium}">${icon.star}</button></div></div>`}
    </section>`;
  bindPaywall(root, () => premiumScreen(root));
}
