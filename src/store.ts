// Preferencias, favoritos y estrellas guardados solo en el dispositivo.
import type { Lang } from './data';

export type Act = 'seen' | 'right' | 'listen';

interface State { lang: Lang; muted: boolean; favs: string[]; stars: Record<string, number>; premium: boolean; voice: Record<Lang, string>; seen: Record<string, number>; rounds: number; log: [number, Act, string][]; kid: string; rated: number; asked: number }

const KEY = 'mundo-sonidos-v1';
const defaults = (): State => ({
  lang: (navigator.language || 'es').toLowerCase().startsWith('es') ? 'es' : 'en',
  muted: false, favs: [], stars: {}, premium: false, voice: { es: '', en: '' }, seen: {}, rounds: 0, log: [], kid: '', rated: 0, asked: 0,
});

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...defaults(), ...JSON.parse(raw) };
  } catch { /* almacenamiento no disponible */ }
  return defaults();
}

export const store = load();

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(store)); } catch { /* sin almacenamiento */ }
}

export function toggleFav(id: string) {
  const i = store.favs.indexOf(id);
  if (i >= 0) store.favs.splice(i, 1); else store.favs.push(id);
  save();
  return i < 0;
}

export function addStar(region: string) {
  store.stars[region] = (store.stars[region] || 0) + 1;
  save();
}

export const isLocked = (a: { premium: boolean }) => a.premium && !store.premium;

const stickerListeners = new Set<(id: string) => void>();
export const onSticker = (fn: (id: string) => void) => stickerListeners.add(fn);

/** Marca un animal como descubierto (pegatina del álbum). Devuelve true si es nueva. */
export function discover(id: string) {
  if (store.seen[id]) return false;
  store.seen[id] = Date.now(); logAct('seen', id);
  stickerListeners.forEach((f) => f(id));
  return true;
}

/** Guarda lo que hace el niño (solo en este dispositivo) para el resumen de los padres. */
export function logAct(type: Act, id: string) {
  store.log.push([Date.now(), type, id]);
  if (store.log.length > 3000) store.log.splice(0, store.log.length - 3000);
  save();
}

/** Resumen de los últimos 7 días. */
export function weekSummary() {
  const from = Date.now() - 7 * 864e5;
  const week = store.log.filter(([ts]) => ts >= from);
  const days = new Set(week.map(([ts]) => new Date(ts).toDateString()));
  const count = (t: Act) => week.filter(([, k]) => k === t).length;
  const top: Record<string, number> = {};
  week.filter(([, k]) => k === 'listen').forEach(([, , id]) => { top[id] = (top[id] || 0) + 1; });
  const fav = Object.entries(top).sort((a, b) => b[1] - a[1])[0]?.[0];
  const perDay = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 864e5).toDateString();
    return week.filter(([ts]) => new Date(ts).toDateString() === d).length;
  });
  return { seen: count('seen'), right: count('right'), listen: count('listen'), days: days.size, fav, perDay };
}
