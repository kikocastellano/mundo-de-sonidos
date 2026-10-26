// Pago único «desbloquear todo» con Google Play Billing (plugin nativo @capgo/native-purchases).
// En la web no hay compra: se muestra un aviso y, para pruebas, el interruptor «Probar premium».
import { Capacitor } from '@capacitor/core';
import { NativePurchases, PURCHASE_TYPE, type Transaction } from '@capgo/native-purchases';
import { save, store } from './store';

export const PRODUCT_ID = 'desbloquear_todo';
export const FALLBACK_PRICE = '3,99 €';

const listeners = new Set<() => void>();
export const onBillingChange = (fn: () => void) => { listeners.add(fn); return () => listeners.delete(fn); };
const emit = () => listeners.forEach((f) => f());

/** Estado de la conexión con Google Play, visible en la pantalla de compra para diagnosticar. */
export let billingStatus = 'esperando';
let productPrice: string | null = null;
let started = false;

/** ¿Es la app instalada desde la tienda (Android/iOS)? Ahí nunca existe el desbloqueo de pruebas. */
export const isNativeApp = () => Capacitor.isNativePlatform();

/** El interruptor «Probar premium» solo existe en la versión web, nunca en la app de la tienda. */
export const testUnlockAllowed = () => !isNativeApp();

/** ¿Se puede comprar ya? (app nativa con el producto cargado) */
export const canBuy = () => isNativeApp() && productPrice !== null;

export const price = () => productPrice ?? FALLBACK_PRICE;

const errMsg = (e: unknown) => (e as { message?: string })?.message ?? String(e);

/** Desbloquea si la compra es válida (en Android, purchaseState «1» = comprada). */
function grant(list: Transaction[]) {
  const ok = list.some((t) => t.productIdentifier === PRODUCT_ID && (t.purchaseState === undefined || t.purchaseState === '1' || t.purchaseState === 'PURCHASED'));
  if (ok && !store.premium) { store.premium = true; store.purchased = true; save(); }
  return ok;
}

// En la app de la tienda el premium solo puede venir de una compra verificada por Google Play
if (isNativeApp() && store.premium && !store.purchased) { store.premium = false; save(); }

async function loadProduct() {
  try {
    const { product } = await NativePurchases.getProduct({ productIdentifier: PRODUCT_ID, productType: PURCHASE_TYPE.INAPP });
    productPrice = product.priceString || FALLBACK_PRICE;
    billingStatus = 'listo';
  } catch (e) {
    productPrice = null;
    billingStatus = `producto no disponible (${errMsg(e)})`;
  }
}

export async function initBilling() {
  if (!isNativeApp() || started) return;
  started = true;
  billingStatus = 'conectando'; emit();
  try {
    const { isBillingSupported } = await NativePurchases.isBillingSupported();
    if (!isBillingSupported) { billingStatus = 'Google Play Billing no disponible en este móvil'; emit(); return; }
  } catch (e) { billingStatus = `error: ${errMsg(e)}`; emit(); return; }
  await loadProduct();
  // ¿Ya lo había comprado? (reinstalación, otro móvil con la misma cuenta)
  try { const { purchases } = await NativePurchases.getPurchases({ productType: PURCHASE_TYPE.INAPP }); grant(purchases); } catch { /* sin conexión */ }
  emit();
  // Si Google aún no había enviado el producto, se vuelve a intentar al rato
  if (!productPrice) setTimeout(() => { void loadProduct().then(emit); }, 15000);
}

export async function buy(): Promise<boolean> {
  if (!productPrice) { await loadProduct(); emit(); if (!productPrice) return false; }
  try {
    const t = await NativePurchases.purchaseProduct({ productIdentifier: PRODUCT_ID, productType: PURCHASE_TYPE.INAPP, quantity: 1 });
    if (grant([t])) billingStatus = 'comprado';
    else billingStatus = 'compra pendiente: se desbloqueará cuando Google la confirme';
  } catch (e) {
    const m = errMsg(e);
    billingStatus = /cancel/i.test(m) ? 'compra cancelada' : `error al comprar: ${m}`;
  }
  emit();
  return true;
}

export async function restore() {
  try {
    await NativePurchases.restorePurchases();
    const { purchases } = await NativePurchases.getPurchases({ productType: PURCHASE_TYPE.INAPP });
    billingStatus = grant(purchases) ? 'compra restaurada' : 'no hay compras que restaurar';
  } catch (e) { billingStatus = `error al restaurar: ${errMsg(e)}`; }
  emit();
}

// Código de acceso para los revisores de Google Play (no pueden pagar). Solo se guarda su huella SHA-256.
const REVIEW_HASH = '168f28c280d074d9a173f77edf938c61b2aa9ca6d0e15e01dd74f59c08474442';
export async function redeemCode(code: string) {
  const data = new TextEncoder().encode(code.trim().toUpperCase());
  const hex = [...new Uint8Array(await crypto.subtle.digest('SHA-256', data))].map((b) => b.toString(16).padStart(2, '0')).join('');
  if (hex !== REVIEW_HASH) return false;
  store.premium = true; store.purchased = true; save(); emit();
  return true;
}
