// Variantes de color por especie a partir de un dibujo base (Fluent Emoji, MIT).
// Se recolorea solo el «cuerpo»: se respetan blancos, negros (ojos) y la banda de tono protegida (picos, patas…).
//  hue: tono destino (0-360) del cuerpo · sat: multiplica saturación · light: multiplica luminosidad
export const VARIANTS = {
  'pez-payaso': { base: 'tropical-fish', hue: 22, sat: 1.2, light: 1.0 }, 'estrella-mar': { base: 'star', hue: 15, sat: 1.0, light: 0.95 },
  'caballito-mar': { base: 'tropical-fish', hue: 40, sat: 1.1, light: 1.0 }, 'manta-raya': { base: 'fish', hue: 220, sat: 0.3, light: 0.55 },
  camaleon: { base: 'lizard', hue: 95, sat: 1.1, light: 0.95 }, armadillo: { base: 'hedgehog', hue: 30, sat: 0.25, light: 0.85 },
  'oso-hormiguero': { base: 'badger', hue: 30, sat: 0.5, light: 0.75 }, narval: { base: 'dolphin', hue: 210, sat: 0.2, light: 0.8 },
  // Pájaros (base «bird»: cuerpo rosa, pico/patas naranjas protegidos)
  cuco: { base: 'bird', hue: 210, sat: 0.25, light: 0.75 }, grulla: { base: 'flamingo', hue: 210, sat: 0.12, light: 0.95 },
  cuervo: { base: 'bird', hue: 260, sat: 0.15, light: 0.32 }, colibri: { base: 'bird', hue: 150, sat: 1.1, light: 0.85 },
  ruisenor: { base: 'bird', hue: 30, sat: 0.35, light: 0.8 }, 'pajaro-carpintero': { base: 'bird', hue: 0, sat: 1.1, light: 0.75 },
  'ave-lira': { base: 'bird', hue: 28, sat: 0.4, light: 0.6 }, calao: { base: 'bird', hue: 0, sat: 0.05, light: 0.45 },
  turaco: { base: 'bird', hue: 200, sat: 0.12, light: 0.85 }, tucan: { base: 'bird', hue: 260, sat: 0.1, light: 0.28 },
  cardenal: { base: 'bird', hue: 355, sat: 1.25, light: 0.92 }, 'arrendajo-azul': { base: 'bird', hue: 215, sat: 1.1, light: 0.9 },
  sinsonte: { base: 'bird', hue: 210, sat: 0.12, light: 0.85 }, 'martin-pescador': { base: 'bird', hue: 195, sat: 1.2, light: 0.85 },
  codorniz: { base: 'bird', hue: 28, sat: 0.45, light: 0.85 }, faisan: { base: 'rooster', hue: 20, sat: 1.1, light: 0.85 },
  petirrojo: { base: 'bird', hue: 22, sat: 1.0, light: 0.85 }, mirlo: { base: 'bird', hue: 260, sat: 0.08, light: 0.3 },
  gorrion: { base: 'bird', hue: 30, sat: 0.5, light: 0.75 }, urraca: { base: 'bird', hue: 230, sat: 0.35, light: 0.4 },
  abubilla: { base: 'bird', hue: 32, sat: 0.9, light: 0.95 }, golondrina: { base: 'bird', hue: 228, sat: 0.9, light: 0.55 },
  tui: { base: 'bird', hue: 240, sat: 0.4, light: 0.35 }, campanero: { base: 'bird', hue: 95, sat: 0.7, light: 0.8 },
  'urraca-australiana': { base: 'bird', hue: 0, sat: 0.0, light: 0.4 }, lagopodo: { base: 'chicken', hue: 40, sat: 0.08, light: 1.25 },
  'charran-artico': { base: 'dove', hue: 200, sat: 0.2, light: 1.05 }, koel: { base: 'bird', hue: 250, sat: 0.2, light: 0.3 },
  bulbul: { base: 'bird', hue: 35, sat: 0.35, light: 0.7 }, chotacabras: { base: 'bird', hue: 30, sat: 0.4, light: 0.55 },
  chochin: { base: 'bird', hue: 25, sat: 0.55, light: 0.65 }, oropendola: { base: 'bird', hue: 50, sat: 1.25, light: 1.05 },
  'escribano-nival': { base: 'bird', hue: 40, sat: 0.08, light: 1.3 },
  // Monos (base «monkey»)
  babuino: { base: 'monkey', hue: 45, sat: 0.6, light: 0.95 }, 'mono-aullador': { base: 'monkey', hue: 8, sat: 1.3, light: 0.85 },
  gibon: { base: 'monkey', hue: 35, sat: 0.4, light: 1.15 }, indri: { base: 'monkey', hue: 0, sat: 0.05, light: 0.55 },
  capuchino: { base: 'monkey', hue: 30, sat: 0.9, light: 1.1 }, macaco: { base: 'monkey', hue: 25, sat: 0.35, light: 1.0 },
  siamang: { base: 'monkey', hue: 0, sat: 0.0, light: 0.35 }, 'mono-arana': { base: 'monkey', hue: 15, sat: 0.4, light: 0.5 },
  titi: { base: 'monkey', hue: 0, sat: 0.08, light: 1.2 },
  // Loros (base «parrot»)
  cacatua: { base: 'parrot', hue: 50, sat: 0.08, light: 1.35 },
  periquito: { base: 'parrot', hue: 105, sat: 1.1, light: 0.95 }, cotorra: { base: 'parrot', hue: 120, sat: 1.0, light: 0.85 },
  kea: { base: 'parrot', hue: 85, sat: 0.5, light: 0.7 }, galah: { base: 'parrot', hue: 335, sat: 0.65, light: 1.15 },
  // Ranas (base «frog»)
  'rana-toro': { base: 'frog', hue: 85, sat: 0.6, light: 0.7 }, coqui: { base: 'frog', hue: 32, sat: 0.3, light: 0.8 },
  'sapo-partero': { base: 'frog', hue: 30, sat: 0.15, light: 0.65 }, 'rana-arboricola': { base: 'frog', hue: 160, sat: 0.3, light: 0.85 },
  'rana-verde-australiana': { base: 'frog', hue: 125, sat: 1.0, light: 1.0 },
  // Ciervos (base «deer»)
  reno: { base: 'deer', hue: 25, sat: 0.35, light: 0.8 }, uapiti: { base: 'deer', hue: 22, sat: 0.7, light: 0.75 },
  corzo: { base: 'deer', hue: 15, sat: 1.1, light: 0.95 }, muntiaco: { base: 'deer', hue: 12, sat: 1.2, light: 0.85 },
  'ciervo-cola-blanca': { base: 'deer', hue: 32, sat: 0.6, light: 1.1 },
  // Búhos (base «owl»)
  'buho-nival': { base: 'owl', hue: 40, sat: 0.06, light: 1.45 }, lechuza: { base: 'owl', hue: 30, sat: 0.5, light: 1.3 },
  'buho-barrado': { base: 'owl', hue: 30, sat: 0.15, light: 0.9 }, ruru: { base: 'owl', hue: 25, sat: 0.8, light: 0.85 },
  // Focas, grillos, lobos y demás pares
  'elefante-marino': { base: 'seal', hue: 25, sat: 0.6, light: 0.8 }, 'foca-gris': { base: 'seal', hue: 210, sat: 0.1, light: 0.75 },
  'lobo-marino': { base: 'seal', hue: 28, sat: 0.7, light: 0.6 },
  cigarra: { base: 'cricket', hue: 90, sat: 0.5, light: 0.8 }, 'saltamontes-cantor': { base: 'cricket', hue: 120, sat: 1.1, light: 1.0 },
  saltamontes: { base: 'cricket', hue: 75, sat: 1.0, light: 1.0 },
  coyote: { base: 'wolf', hue: 32, sat: 0.6, light: 1.05 }, chacal: { base: 'wolf', hue: 38, sat: 1.0, light: 1.05 },
  'gallina-guinea': { base: 'chicken', hue: 230, sat: 0.12, light: 0.5 }, francolin: { base: 'bird', hue: 25, sat: 0.3, light: 0.6 },
  'perrito-pradera': { base: 'chipmunk', hue: 35, sat: 0.6, light: 1.1 }, marmota: { base: 'chipmunk', hue: 25, sat: 0.5, light: 0.75 },
  'ardilla-gigante': { base: 'chipmunk', hue: 290, sat: 0.9, light: 0.8 },
  cordero: { base: 'ewe', hue: 40, sat: 0.3, light: 1.12 }, colimbo: { base: 'duck', hue: 0, sat: 0.0, light: 0.35 },
  'pinguino-emperador': { base: 'penguin', hue: 45, sat: 1.3, light: 1.0 }, barnacla: { base: 'goose', hue: 0, sat: 0.0, light: 0.6 },
  yak: { base: 'ox', hue: 20, sat: 0.4, light: 0.5 }, paloma: { base: 'dove', hue: 220, sat: 0.25, light: 0.82 },
  cobra: { base: 'snake', hue: 35, sat: 0.8, light: 0.85 }, nu: { base: 'water-buffalo', hue: 220, sat: 0.12, light: 0.75 },
  'zorro-gris': { base: 'fox', hue: 210, sat: 0.12, light: 0.85 }, 'zorro-volador': { base: 'bat', hue: 25, sat: 0.6, light: 0.85 },
  pica: { base: 'mouse-face', hue: 30, sat: 0.6, light: 0.9 }, liron: { base: 'mouse-face', hue: 30, sat: 0.2, light: 0.85 },
};

// Banda de tono que NO se cambia en cada dibujo base (picos, patas, ojos de color…)
export const PROTECT = { bird: [15, 65], parrot: [20, 70], flamingo: [], chicken: [40, 60], rooster: [40, 60], frog: [40, 70], owl: [40, 62] };

const hex2hsl = (h) => {
  let r = parseInt(h.slice(1, 3), 16) / 255, g = parseInt(h.slice(3, 5), 16) / 255, b = parseInt(h.slice(5, 7), 16) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let H = 0, S = 0; const L = (mx + mn) / 2;
  if (mx !== mn) { const d = mx - mn; S = L > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); H = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; H *= 60; }
  return [H, S, L];
};
const hsl2hex = (H, S, L) => {
  const f = (n) => { const k = (n + H / 30) % 12; const a = S * Math.min(L, 1 - L); return Math.round(255 * (L - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))).toString(16).padStart(2, '0'); };
  return `#${f(0)}${f(8)}${f(4)}`;
};

/** Recolorea el cuerpo de un SVG: tonos rotados para que su media quede en `hue`. */
export function recolor(svg, base, v) {
  const prot = PROTECT[base] ?? [];
  const isBody = (h) => { const [H, S, L] = hex2hsl(h); return S > 0.12 && L > 0.08 && L < 0.94 && !(prot.length && H >= prot[0] && H <= prot[1]); };
  const cols = [...new Set(svg.match(/#[0-9a-fA-F]{6}\b/g) ?? [])].filter(isBody);
  if (!cols.length) return svg;
  // media circular de los tonos del cuerpo
  let x = 0, y = 0; for (const c of cols) { const [H] = hex2hsl(c); x += Math.cos(H * Math.PI / 180); y += Math.sin(H * Math.PI / 180); }
  const mean = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  const map = {};
  for (const c of cols) { const [H, S, L] = hex2hsl(c); const nh = (H + (v.hue - mean) + 720) % 360; map[c.toLowerCase()] = hsl2hex(nh, Math.min(1, S * v.sat), Math.max(0.02, Math.min(0.97, L * v.light))); }
  return svg.replace(/#[0-9a-fA-F]{6}\b/g, (c) => map[c.toLowerCase()] ?? c);
}
