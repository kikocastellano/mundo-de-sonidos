// Pago único «desbloquear todo» con Google Play Billing (cordova-plugin-purchase en la app nativa).
// En la web no hay compra: se muestra un aviso y, para pruebas, el interruptor de la zona de padres.
import { Capacitor } from '@capacitor/core';
import { save, store } from './store';

export const PRODUCT_ID = 'desbloquear_todo';
export const FALLBACK_PRICE = '3,99 €';

interface CdvProduct { id: string; owned: boolean; pricing?: { price: string }; getOffer(): { order(): Promise<unknown> } | undefined }
interface CdvStore {
  register(p: { id: string; type: string; platform: string }[]): void;
  when(): { approved(cb: (t: { finish(): void; verify(): void }) => void): { verified(cb: (r: { finish(): void }) => void): unknown }; productUpdated(cb: () => void): unknown };
  initialize(platforms: string[]): Promise<unknown>;
  get(id: string): CdvProduct | undefined;
  restorePurchases(): Promise<unknown>;
  error(cb: (e: { code?: number; message?: string }) => void): void;
  update?(): Promise<unknown>;
}
interface CdvPurchase { store: CdvStore; ProductType: { NON_CONSUMABLE: string }; Platform: { GOOGLE_PLAY: string } }

const cdv = () => (window as unknown as { CdvPurchase?: CdvPurchase }).CdvPurchase;
let ready = false;
/** Estado de la conexión con Google Play, visible en la pantalla de compra para diagnosticar. */
export let billingStatus = 'esperando';
const listeners = new Set<() => void>();
export const onBillingChange = (fn: () => void) => { listeners.add(fn); return () => listeners.delete(fn); };
const emit = () => listeners.forEach((f) => f());

/** ¿Hay tienda real disponible (app nativa)? */
export const canBuy = () => !!cdv();

/** ¿Es la app instalada desde la tienda (Android/iOS)? Ahí nunca existe el desbloqueo de pruebas. */
export const isNativeApp = () => Capacitor.isNativePlatform();

/** El interruptor «Probar premium» solo existe en la versión web, nunca en la app de la tienda. */
export const testUnlockAllowed = () => !isNativeApp();

function sync() {
  const p = cdv()?.store.get(PRODUCT_ID);
  if (p?.owned && !store.premium) { store.premium = true; store.purchased = true; save(); }
  emit();
}

// En la app de la tienda el premium solo puede venir de una compra verificada por Google Play
if (Capacitor.isNativePlatform() && store.premium && !store.purchased) { store.premium = false; save(); }

export async function initBilling() {
  const C = cdv();
  if (!C || ready) return;
  ready = true;
  billingStatus = 'conectando'; emit();
  C.store.error((e) => { billingStatus = `error ${e.code ?? ''}: ${e.message ?? ''}`; emit(); });
  C.store.register([{ id: PRODUCT_ID, type: C.ProductType.NON_CONSUMABLE, platform: C.Platform.GOOGLE_PLAY }]);
  C.store.when().approved((t) => t.verify()).verified((r) => { r.finish(); sync(); });
  C.store.when().productUpdated(sync);
  await C.store.initialize([C.Platform.GOOGLE_PLAY]).catch((e: { message?: string }) => { billingStatus = `error al iniciar: ${e?.message ?? e}`; });
  const p = C.store.get(PRODUCT_ID);
  if (!billingStatus.startsWith('error')) billingStatus = p ? (p.getOffer() ? 'listo' : 'producto sin oferta') : 'producto no encontrado';
  sync();
  // Si Google aún no había enviado el producto, se vuelve a intentar al rato
  if (!p?.getOffer()) setTimeout(() => void C.store.update?.().then(() => { if (C.store.get(PRODUCT_ID)?.getOffer()) { billingStatus = 'listo'; sync(); } }), 15000);
}

// El plugin de compras puede estar listo antes o después de nuestro código: se comprueba un rato
let tries = 0;
const poll = window.setInterval(() => { if (cdv()) { clearInterval(poll); void initBilling(); } else if (++tries > 40) { clearInterval(poll); if (isNativeApp()) { billingStatus = 'sin plugin de compras'; emit(); } } }, 500);

export const price = () => cdv()?.store.get(PRODUCT_ID)?.pricing?.price ?? FALLBACK_PRICE;

export async function buy(): Promise<boolean> {
  const C = cdv();
  if (C && !C.store.get(PRODUCT_ID)?.getOffer()) await C.store.update?.().catch(() => {});
  const offer = C?.store.get(PRODUCT_ID)?.getOffer();
  if (!offer) { billingStatus = billingStatus === 'listo' ? 'producto no encontrado' : billingStatus; emit(); return false; }
  const err = await offer.order().catch((e: unknown) => e) as { message?: string } | undefined;
  if (err && err.message) { billingStatus = `error al comprar: ${err.message}`; emit(); }
  return true;
}

export async function restore() {
  await cdv()?.store.restorePurchases().catch(() => {});
  sync();
}

// En la app nativa el plugin está listo tras «deviceready».
document.addEventListener('deviceready', () => void initBilling());
