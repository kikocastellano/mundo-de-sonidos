// Contenido premium: si no hay suscripción, muestra un aviso que lleva a la zona de padres (nunca vende al niño).
import { t } from '../i18n';
import { store } from '../store';
import { backBtn, icon } from '../ui';

export function premiumWall(root: HTMLElement, title: string, back = '/') {
  if (store.premium) return false;
  root.innerHTML = `
    <section class="screen">
      <header class="topbar">${backBtn(back)}<h2>${title}</h2><span class="spacer"></span></header>
      <div class="panel premium-lock"><div class="gate-lock">${icon.lock}</div><h3>${t('locked')}</h3>
        <p>${t('premiumBody')}</p><button class="pill" data-go="/padres?next=premium">${t('parents')}</button></div>
    </section>`;
  return true;
}
