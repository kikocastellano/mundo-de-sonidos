// Preferencias, favoritos y estrellas guardados solo en el dispositivo.
import type { Lang } from './data';

interface State { lang: Lang; muted: boolean; favs: string[]; stars: Record<string, number>; premium: boolean; voice: Record<Lang, string> }

const KEY = 'mundo-sonidos-v1';
const defaults = (): State => ({
  lang: (navigator.language || 'es').toLowerCase().startsWith('es') ? 'es' : 'en',
  muted: false, favs: [], stars: {}, premium: false, voice: { es: '', en: '' },
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
