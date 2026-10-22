// Pago único «desbloquear todo» con Google Play Billing (cordova-plugin-purchase en la app nativa).
// En la web no hay compra: se muestra un aviso y, para pruebas, el interruptor de la zona de padres.
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
}
interface CdvPurchase { store: CdvStore; ProductType: { NON_CONSUMABLE: string }; Platform: { GOOGLE_PLAY: string } }

const cdv = () => (window as unknown as { CdvPurchase?: CdvPurchase }).CdvPurchase;
let ready = false;
const listeners = new Set<() => void>();
export const onBillingChange = (fn: () => void) => { listeners.add(fn); return () => listeners.delete(fn); };
const emit = () => listeners.forEach((f) => f());

/** ¿Hay tienda real disponible (app nativa)? */
export const canBuy = () => !!cdv();

function sync() {
  const p = cdv()?.store.get(PRODUCT_ID);
  if (p?.owned && !store.premium) { store.premium = true; save(); }
  emit();
}

export async function initBilling() {
  const C = cdv();
  if (!C || ready) return;
  ready = true;
  C.store.register([{ id: PRODUCT_ID, type: C.ProductType.NON_CONSUMABLE, platform: C.Platform.GOOGLE_PLAY }]);
  C.store.when().approved((t) => t.verify()).verified((r) => { r.finish(); sync(); });
  C.store.when().productUpdated(sync);
  await C.store.initialize([C.Platform.GOOGLE_PLAY]).catch(() => {});
  sync();
}

export const price = () => cdv()?.store.get(PRODUCT_ID)?.pricing?.price ?? FALLBACK_PRICE;

export async function buy(): Promise<boolean> {
  const offer = cdv()?.store.get(PRODUCT_ID)?.getOffer();
  if (!offer) return false;
  await offer.order().catch(() => {});
  return true;
}

export async function restore() {
  await cdv()?.store.restorePurchases().catch(() => {});
  sync();
}

// En la app nativa el plugin está listo tras «deviceready».
document.addEventListener('deviceready', () => void initBilling());
