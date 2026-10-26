// Audio instantáneo: sintetizador de sonidos de prueba, grabaciones reales (cuando existan),
// voz que dice el nombre del animal y efectos de interfaz.
import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import type { Animal, Lang } from './data';
import { store } from './store';

let ctx: AudioContext | null = null;
let master: GainNode;
let noiseBuf: AudioBuffer;
let live: AudioScheduledSourceNode[] = [];
const decoded = new Map<string, AudioBuffer>();

/** Crea y desbloquea el contexto de audio; se llama en el primer toque. */
export function unlockAudio() {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx = new AC({ latencyHint: 'interactive' });
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 4;
    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(comp).connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === 'suspended') void ctx.resume();
}

export function stopAll() {
  for (const s of live) { try { s.stop(); } catch { /* ya parado */ } }
  live = [];
  if (native) void TextToSpeech.stop().catch(() => {});
  else if ('speechSynthesis' in window) speechSynthesis.cancel();
}

interface ToneOpts {
  type?: OscillatorType; at?: number; dur: number; f: [number, number][];
  gain?: number; attack?: number; release?: number;
  vib?: [number, number]; am?: [number, number]; filter?: [BiquadFilterType, number, number?];
  out?: AudioNode;
}

function tone(o: ToneOpts) {
  const c = ctx!; const t0 = c.currentTime + 0.01 + (o.at ?? 0);
  const osc = c.createOscillator(); osc.type = o.type ?? 'sawtooth';
  osc.frequency.setValueAtTime(o.f[0][1], t0);
  for (const [t, f] of o.f.slice(1)) osc.frequency.linearRampToValueAtTime(f, t0 + t * o.dur);
  const g = c.createGain(); const peak = o.gain ?? 0.3;
  const a = o.attack ?? 0.04; const r = o.release ?? 0.15;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.setValueAtTime(peak, t0 + Math.max(a, o.dur - r));
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur);
  let node: AudioNode = osc;
  if (o.vib) {
    const l = c.createOscillator(); const lg = c.createGain();
    l.frequency.value = o.vib[0]; lg.gain.value = o.vib[1];
    l.connect(lg).connect(osc.frequency); l.start(t0); l.stop(t0 + o.dur); live.push(l);
  }
  if (o.filter) {
    const bq = c.createBiquadFilter(); bq.type = o.filter[0]; bq.frequency.value = o.filter[1]; bq.Q.value = o.filter[2] ?? 1;
    node.connect(bq); node = bq;
  }
  node.connect(g);
  if (o.am) {
    const amg = c.createGain(); amg.gain.value = 1 - o.am[1];
    const l = c.createOscillator(); const lg = c.createGain();
    l.type = 'square'; l.frequency.value = o.am[0]; lg.gain.value = o.am[1];
    l.connect(lg).connect(amg.gain); l.start(t0); l.stop(t0 + o.dur); live.push(l);
    g.connect(amg).connect(o.out ?? master);
  } else g.connect(o.out ?? master);
  osc.start(t0); osc.stop(t0 + o.dur + 0.05); live.push(osc);
}

function noise(o: { at?: number; dur: number; gain?: number; filter: [BiquadFilterType, number, number?]; sweep?: number; attack?: number }) {
  const c = ctx!; const t0 = c.currentTime + 0.01 + (o.at ?? 0);
  const src = c.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
  const bq = c.createBiquadFilter(); bq.type = o.filter[0]; bq.Q.value = o.filter[2] ?? 1;
  bq.frequency.setValueAtTime(o.filter[1], t0);
  if (o.sweep) bq.frequency.linearRampToValueAtTime(o.sweep, t0 + o.dur);
  const g = c.createGain(); const p = o.gain ?? 0.3;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(p, t0 + (o.attack ?? 0.05));
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur);
  src.connect(bq).connect(g).connect(master);
  src.start(t0); src.stop(t0 + o.dur + 0.05); live.push(src);
}

function echo(time: number, fb: number, dest: AudioNode = master) {
  const c = ctx!; const d = c.createDelay(1); d.delayTime.value = time;
  const g = c.createGain(); g.gain.value = fb;
  d.connect(g).connect(d); d.connect(dest);
  const input = c.createGain(); input.connect(dest); input.connect(d);
  return input;
}

const range = (n: number, fn: (i: number) => void) => { for (let i = 0; i < n; i++) fn(i); };

/** Recetas de sonidos de prueba. Devuelven la duración aproximada en segundos. */
const RECIPES: Record<string, () => number> = {
  moo: () => { tone({ dur: 1.5, f: [[0, 110], [0.2, 145], [0.8, 135], [1, 100]], gain: 0.45, attack: 0.15, release: 0.4, vib: [5, 3], filter: ['lowpass', 700, 4] }); return 1.5; },
  woof: () => { range(2, (i) => { tone({ at: i * 0.32, dur: 0.18, f: [[0, 380], [1, 180]], gain: 0.5, attack: 0.01, release: 0.1, filter: ['bandpass', 900, 1.5] }); noise({ at: i * 0.32, dur: 0.15, gain: 0.25, filter: ['bandpass', 1200, 1] }); }); return 0.7; },
  meow: () => { tone({ type: 'triangle', dur: 0.9, f: [[0, 520], [0.35, 820], [1, 430]], gain: 0.35, attack: 0.08, release: 0.3, vib: [6, 10], filter: ['bandpass', 1300, 2] }); tone({ type: 'sawtooth', dur: 0.9, f: [[0, 520], [0.35, 820], [1, 430]], gain: 0.08, attack: 0.08, release: 0.3, filter: ['lowpass', 2400] }); return 0.9; },
  baa: () => { tone({ dur: 1.0, f: [[0, 320], [0.2, 360], [1, 300]], gain: 0.35, attack: 0.05, release: 0.3, vib: [9, 28], filter: ['bandpass', 1100, 2] }); return 1; },
  oink: () => { range(3, (i) => tone({ type: 'square', at: i * 0.22, dur: 0.16, f: [[0, 220], [1, 170]], gain: 0.25, attack: 0.01, release: 0.06, am: [55, 0.6], filter: ['lowpass', 900, 3] })); return 0.7; },
  neigh: () => { tone({ dur: 1.4, f: [[0, 700], [0.15, 950], [1, 380]], gain: 0.3, attack: 0.04, release: 0.4, vib: [16, 60], filter: ['bandpass', 1400, 1.5] }); noise({ at: 1.3, dur: 0.4, gain: 0.15, filter: ['lowpass', 900] }); return 1.7; },
  quack: () => { range(3, (i) => tone({ at: i * 0.25, dur: 0.17, f: [[0, 480], [1, 380]], gain: 0.4, attack: 0.01, release: 0.08, filter: ['bandpass', 1500, 4] })); return 0.75; },
  rooster: () => { const n: [number, number, number][] = [[0, 0.18, 520], [0.2, 0.18, 760], [0.4, 0.22, 880], [0.65, 0.7, 820]]; for (const [at, dur, f] of n) tone({ at, dur, f: [[0, f], [1, f * 0.9]], gain: 0.3, attack: 0.02, release: 0.1, vib: [12, 15], filter: ['bandpass', 1600, 2] }); return 1.4; },
  whale: () => { const out = echo(0.35, 0.45); tone({ type: 'sine', dur: 2.8, f: [[0, 180], [0.3, 520], [0.6, 380], [1, 260]], gain: 0.4, attack: 0.5, release: 0.8, vib: [3, 12], out }); return 3.5; },
  dolphin: () => { tone({ type: 'sine', dur: 0.8, f: [[0, 2400], [0.5, 4200], [1, 3000]], gain: 0.25, attack: 0.05, release: 0.2 }); range(8, (i) => noise({ at: 0.9 + i * 0.05, dur: 0.03, gain: 0.3, filter: ['highpass', 3000], attack: 0.003 })); return 1.4; },
  seal: () => { range(3, (i) => tone({ at: i * 0.3, dur: 0.2, f: [[0, 620], [1, 450]], gain: 0.4, attack: 0.02, release: 0.08, filter: ['bandpass', 1000, 2] })); return 0.9; },
  roar: () => { tone({ dur: 2, f: [[0, 80], [0.3, 140], [1, 70]], gain: 0.5, attack: 0.3, release: 0.8, vib: [22, 8], filter: ['lowpass', 500, 2] }); noise({ dur: 2, gain: 0.35, filter: ['lowpass', 700], sweep: 250, attack: 0.3 }); return 2; },
  tiger: () => { tone({ dur: 1.4, f: [[0, 110], [0.2, 170], [1, 90]], gain: 0.5, attack: 0.08, release: 0.5, vib: [28, 10], filter: ['lowpass', 650, 3] }); noise({ dur: 1.3, gain: 0.3, filter: ['bandpass', 500, 1], attack: 0.05 }); return 1.4; },
  trumpet: () => { tone({ dur: 1.3, f: [[0, 450], [0.2, 760], [0.8, 700], [1, 520]], gain: 0.35, attack: 0.05, release: 0.3, vib: [7, 18], filter: ['bandpass', 1300, 2.5] }); noise({ dur: 1.2, gain: 0.08, filter: ['bandpass', 2500, 2] }); return 1.3; },
  monkey: () => { range(5, (i) => tone({ type: 'triangle', at: i * 0.2, dur: 0.18, f: [[0, 400 + i * 120], [1, 900 + i * 150]], gain: 0.3, attack: 0.02, release: 0.06, filter: ['bandpass', 1400, 1.5] })); return 1.1; },
  hippo: () => { range(3, (i) => { tone({ at: i * 0.35, dur: 0.3, f: [[0, 90], [1, 60]], gain: 0.55, attack: 0.03, release: 0.12, am: [30, 0.5], filter: ['lowpass', 400, 3] }); }); return 1.1; },
  howl: () => { tone({ type: 'triangle', dur: 2.6, f: [[0, 380], [0.25, 720], [0.75, 680], [1, 420]], gain: 0.4, attack: 0.3, release: 0.7, vib: [5, 9] }); return 2.6; },
  growl: () => { tone({ dur: 1.6, f: [[0, 70], [0.5, 95], [1, 65]], gain: 0.5, attack: 0.2, release: 0.5, am: [24, 0.5], filter: ['lowpass', 450, 3] }); noise({ dur: 1.5, gain: 0.2, filter: ['lowpass', 500], attack: 0.2 }); return 1.6; },
  polar: () => { const d = RECIPES.growl(); tone({ at: 0.1, dur: 1.2, f: [[0, 55], [1, 50]], gain: 0.3, attack: 0.2, release: 0.4, filter: ['lowpass', 300] }); return d; },
  parrot: () => { range(4, (i) => tone({ type: 'square', at: i * 0.17, dur: 0.14, f: [[0, 1500 + (i % 2) * 600], [1, 1100]], gain: 0.15, attack: 0.01, release: 0.05, filter: ['bandpass', 2200, 3] })); return 0.8; },
  eagle: () => { tone({ type: 'sawtooth', dur: 1.1, f: [[0, 2600], [0.3, 3200], [1, 1800]], gain: 0.18, attack: 0.02, release: 0.4, vib: [30, 120], filter: ['bandpass', 2800, 3] }); return 1.1; },
  panda: () => { range(2, (i) => tone({ type: 'triangle', at: i * 0.4, dur: 0.3, f: [[0, 600], [1, 500]], gain: 0.3, attack: 0.03, release: 0.1, vib: [14, 30], filter: ['bandpass', 1100, 2] })); return 0.8; },
  peacock: () => { range(2, (i) => tone({ at: i * 0.6, dur: 0.45, f: [[0, 900], [0.4, 1400], [1, 1000]], gain: 0.3, attack: 0.02, release: 0.15, filter: ['bandpass', 1600, 3] })); return 1.1; },
  owl: () => { const n: [number, number][] = [[0, 0.45], [0.75, 0.22], [1.05, 0.55]]; for (const [at, dur] of n) tone({ type: 'sine', at, dur, f: [[0, 400], [0.3, 420], [1, 360]], gain: 0.45, attack: 0.06, release: 0.2 }); return 1.6; },
  frog: () => { range(2, (i) => tone({ type: 'square', at: i * 0.5, dur: 0.3, f: [[0, 260], [1, 200]], gain: 0.25, attack: 0.01, release: 0.05, am: [32, 0.9], filter: ['lowpass', 1100, 5] })); return 0.9; },
  cuckoo: () => { range(2, (i) => { tone({ type: 'sine', at: i * 0.9, dur: 0.25, f: [[0, 760], [1, 740]], gain: 0.4, attack: 0.03, release: 0.08 }); tone({ type: 'sine', at: i * 0.9 + 0.3, dur: 0.35, f: [[0, 610], [1, 600]], gain: 0.4, attack: 0.03, release: 0.12 }); }); return 1.6; },
  kangaroo: () => { range(3, (i) => { tone({ at: i * 0.28, dur: 0.18, f: [[0, 160], [1, 120]], gain: 0.4, attack: 0.02, release: 0.08, filter: ['lowpass', 600, 2] }); noise({ at: i * 0.28, dur: 0.16, gain: 0.15, filter: ['bandpass', 700] }); }); return 0.9; },
  koala: () => { range(3, (i) => tone({ at: i * 0.5, dur: 0.4, f: [[0, 75], [0.5, 110], [1, 70]], gain: 0.5, attack: 0.1, release: 0.15, am: [40, 0.6], filter: ['lowpass', 500, 3] })); return 1.5; },
  kookaburra: () => { range(12, (i) => tone({ type: 'triangle', at: i * 0.11, dur: 0.1, f: [[0, 900 + Math.sin(i) * 300 + i * 40], [1, 1300 + i * 40]], gain: 0.25, attack: 0.01, release: 0.04, filter: ['bandpass', 1800, 2] })); return 1.4; },
  cluck: () => { range(4, (i) => tone({ at: i * 0.18, dur: 0.1, f: [[0, 600], [1, 420]], gain: 0.3, attack: 0.01, release: 0.05, filter: ['bandpass', 1200, 3] })); return 0.8; },
  peep: () => { range(5, (i) => tone({ type: 'sine', at: i * 0.2, dur: 0.12, f: [[0, 3200], [1, 2600]], gain: 0.2, attack: 0.01, release: 0.05 })); return 1; },
  gobble: () => { tone({ type: 'square', dur: 0.9, f: [[0, 700], [1, 500]], gain: 0.15, attack: 0.02, release: 0.2, am: [28, 0.9], filter: ['bandpass', 1300, 2] }); return 0.9; },
  bray: () => { range(2, (i) => { tone({ at: i * 0.7, dur: 0.35, f: [[0, 900], [1, 1100]], gain: 0.3, attack: 0.03, release: 0.1, filter: ['bandpass', 1400, 2] }); tone({ at: i * 0.7 + 0.35, dur: 0.35, f: [[0, 220], [1, 180]], gain: 0.4, attack: 0.03, release: 0.1, filter: ['lowpass', 700, 2] }); }); return 1.4; },
  honk: () => { range(3, (i) => tone({ at: i * 0.3, dur: 0.2, f: [[0, 420], [1, 380]], gain: 0.35, attack: 0.02, release: 0.08, filter: ['bandpass', 900, 3] })); return 0.9; },
  squeak: () => { range(3, (i) => tone({ type: 'sine', at: i * 0.16, dur: 0.1, f: [[0, 2200], [1, 3000]], gain: 0.2, attack: 0.01, release: 0.05 })); return 0.6; },
  gull: () => { range(4, (i) => tone({ type: 'triangle', at: i * 0.22, dur: 0.2, f: [[0, 1400], [0.3, 1800], [1, 1100]], gain: 0.25, attack: 0.02, release: 0.08, filter: ['bandpass', 1800, 2] })); return 1; },
  zebra: () => { range(4, (i) => tone({ at: i * 0.18, dur: 0.14, f: [[0, 700], [1, 500]], gain: 0.3, attack: 0.01, release: 0.05, filter: ['bandpass', 1100, 2] })); return 0.8; },
  hum: () => { tone({ type: 'sine', dur: 1.6, f: [[0, 90], [1, 95]], gain: 0.5, attack: 0.3, release: 0.5, vib: [4, 2] }); return 1.6; },
  saw: () => { range(6, (i) => noise({ at: i * 0.25, dur: 0.18, gain: 0.35, filter: ['bandpass', 400, 2], attack: 0.03 })); return 1.5; },
  rattle: () => { noise({ dur: 1.5, gain: 0.25, filter: ['highpass', 4000], attack: 0.05 }); tone({ type: 'square', dur: 1.5, f: [[0, 50], [1, 50]], gain: 0.05, am: [40, 1], filter: ['highpass', 3000] }); return 1.5; },
  hiss: () => { noise({ dur: 1.4, gain: 0.3, filter: ['highpass', 3000], attack: 0.1 }); return 1.4; },
  bugle: () => { tone({ type: 'triangle', dur: 1.6, f: [[0, 600], [0.3, 1200], [0.8, 1100], [1, 400]], gain: 0.35, attack: 0.1, release: 0.4, vib: [6, 15] }); return 1.6; },
  fox: () => { tone({ dur: 0.6, f: [[0, 900], [0.3, 1300], [1, 600]], gain: 0.25, attack: 0.02, release: 0.2, filter: ['bandpass', 1500, 2] }); return 0.6; },
  snuffle: () => { range(5, (i) => noise({ at: i * 0.15, dur: 0.1, gain: 0.25, filter: ['bandpass', 1500, 2], attack: 0.01 })); return 0.8; },
  chatter: () => { range(10, (i) => tone({ type: 'square', at: i * 0.07, dur: 0.05, f: [[0, 2600], [1, 2200]], gain: 0.08, attack: 0.005, release: 0.02, filter: ['bandpass', 2500, 3] })); return 0.8; },
  buzz: () => { tone({ type: 'sawtooth', dur: 1.5, f: [[0, 220], [0.5, 240], [1, 210]], gain: 0.15, attack: 0.1, release: 0.3, vib: [5, 8], filter: ['bandpass', 600, 1] }); return 1.5; },
  cricket: () => { range(4, (i) => tone({ type: 'sine', at: i * 0.35, dur: 0.18, f: [[0, 4500], [1, 4400]], gain: 0.12, am: [60, 1], attack: 0.01, release: 0.03 })); return 1.4; },
  caw: () => { range(3, (i) => tone({ at: i * 0.35, dur: 0.25, f: [[0, 700], [1, 550]], gain: 0.35, attack: 0.02, release: 0.1, filter: ['bandpass', 1200, 1.5] })); return 1; },
  coo: () => { tone({ type: 'sine', dur: 1.2, f: [[0, 380], [0.3, 460], [0.6, 360], [1, 330]], gain: 0.4, attack: 0.1, release: 0.3, vib: [8, 6] }); return 1.2; },
  woodpecker: () => { range(14, (i) => noise({ at: i * 0.05, dur: 0.03, gain: 0.4, filter: ['bandpass', 900, 3], attack: 0.002 })); return 0.8; },
  penguin: () => { range(4, (i) => tone({ at: i * 0.25, dur: i === 3 ? 0.6 : 0.2, f: [[0, 520], [1, 640]], gain: 0.3, attack: 0.02, release: 0.1, vib: [10, 20], filter: ['bandpass', 1100, 2] })); return 1.4; },
};

const raw = new Map<string, Promise<ArrayBuffer>>();
const fetchRaw = (url: string) => {
  let p = raw.get(url);
  if (!p) { p = fetch(url).then((r) => r.arrayBuffer()); raw.set(url, p); p.catch(() => raw.delete(url)); }
  return p;
};

/** Descarga (y decodifica si ya hay audio) las grabaciones para que suenen al instante. */
export function preload(list: Animal[]) {
  for (const a of list) if (a.audio && !decoded.has(a.audio)) {
    const url = a.audio;
    void fetchRaw(url).then(async (b) => { if (ctx && !decoded.has(url)) decoded.set(url, await ctx.decodeAudioData(b.slice(0))); }).catch(() => {});
  }
}

async function playFile(url: string) {
  const c = ctx!;
  let buf = decoded.get(url);
  if (!buf) { buf = await c.decodeAudioData((await fetchRaw(url)).slice(0)); decoded.set(url, buf); }
  const src = c.createBufferSource(); src.buffer = buf; src.connect(master); src.start(); live.push(src);
  return buf.duration;
}

/** Reproduce el sonido de un animal al instante. Devuelve la duración en segundos. */
export function playAnimal(a: Animal): number {
  unlockAudio();
  if (!ctx || store.muted) return 0;
  stopAll();
  if (a.audio) {
    const known = decoded.get(a.audio);
    void playFile(a.audio).catch(() => RECIPES[a.sound]?.());
    return known ? known.duration : 3;
  }
  return RECIPES[a.sound]?.() ?? 0;
}

// ---------- Voz ----------
// Se usa la voz del sistema más natural disponible, de mujer si existe. Los padres pueden cambiarla.
const FEMALE = /(female|mujer|woman|m[oó]nica|paulina|helena|elvira|laura|lucia|luc[ií]a|elena|marisol|sabina|dalia|paloma|ximena|camila|ines|in[eé]s|isabela|salome|google espa|samantha|serena|karen|moira|tessa|fiona|victoria|susan|hazel|zira|aria|jenny|libby|sonia|emma|ava|allison|martha|kate)/i;
const MALE = /(male|hombre|jorge|diego|juan|pablo|carlos|enrique|alvaro|raul|daniel|alex|fred|tom|david|mark|george|james|guy|ryan|thomas|oliver|arthur|rishi)/i;

// Voces de Google TTS en Android: el nombre no dice si es de mujer, pero estos códigos lo son
const GOOGLE_FEMALE = /-x-(eea|eec|esc|gba|gbc|gbg|sfg|tpc|iob|tpf)-/i;
const GOOGLE_MALE = /-x-(eed|eef|esd|gbb|gbd|tpd|iom|iol)-/i;

interface Voice { name: string; lang: string; localService: boolean; index: number }

/** En la app de Android/iOS la voz del navegador no existe: se usa el motor de voz del sistema (plugin). */
const native = Capacitor.isNativePlatform();
let nativeVoices: Voice[] = [];
if (native) {
  TextToSpeech.getSupportedVoices()
    .then(({ voices }) => { nativeVoices = voices.map((v, index) => ({ name: v.name, lang: v.lang, localService: v.localService, index })); })
    .catch(() => {});
}

function langVoices(lang: Lang): Voice[] {
  const all: Voice[] = native ? nativeVoices
    : 'speechSynthesis' in window ? speechSynthesis.getVoices().map((v, index) => ({ name: v.name, lang: v.lang, localService: v.localService, index })) : [];
  return all.filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith(lang));
}

/** Puntúa una voz: natural/neuronal y de mujer primero; español de España e inglés británico como acento por defecto. */
function voiceScore(v: Voice, lang: Lang) {
  let s = 0;
  if (/natural|neural|online|enhanced|premium|siri/i.test(v.name)) s += 40;
  if (FEMALE.test(v.name) && !/\bmale\b/i.test(v.name.replace(/female/i, ''))) s += 30;
  if (GOOGLE_FEMALE.test(v.name)) s += 30;
  if (MALE.test(v.name.replace(/female/i, '')) || GOOGLE_MALE.test(v.name)) s -= 30;
  if (/google/i.test(v.name)) s += 10;
  if (/-local$/i.test(v.name)) s += 6; // funciona sin internet
  const tag = v.lang.toLowerCase().replace('_', '-');
  if (tag === (lang === 'es' ? 'es-es' : 'en-gb')) s += 8;
  if (/espeak|compact|eloquence/i.test(v.name)) s -= 50;
  return s;
}

export function availableVoices(lang: Lang = store.lang) {
  return langVoices(lang).sort((a, b) => voiceScore(b, lang) - voiceScore(a, lang));
}

function pickVoice(lang: Lang) {
  const list = availableVoices(lang);
  return list.find((v) => v.name === store.voice[lang]) ?? list[0];
}

if (!native && 'speechSynthesis' in window) {
  speechSynthesis.getVoices();
  speechSynthesis.addEventListener?.('voiceschanged', () => speechSynthesis.getVoices());
}

/** Lee un texto con una voz natural (de mujer si hay) y a ritmo tranquilo para niños. */
export function sayName(text: string, lang: Lang = store.lang) {
  if (store.muted) return;
  const v = pickVoice(lang);
  const tag = v?.lang ?? (lang === 'es' ? 'es-ES' : 'en-GB');
  if (native) {
    void TextToSpeech.stop().catch(() => {}).finally(() =>
      TextToSpeech.speak({ text, lang: tag, rate: 0.92, pitch: 1, volume: 1, voice: v?.index, category: 'playback' }).catch(() =>
        // si la voz elegida falla, se intenta con la del sistema para ese idioma
        TextToSpeech.speak({ text, lang: lang === 'es' ? 'es-ES' : 'en-GB', rate: 0.92 }).catch(() => {})));
    return;
  }
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = tag;
  const sv = v ? speechSynthesis.getVoices()[v.index] : undefined;
  if (sv) u.voice = sv;
  u.rate = 0.92; u.pitch = 1;
  speechSynthesis.speak(u);
}

/** Efectos de interfaz: toque suave, acierto y fallo amable. */
export function sfx(kind: 'tap' | 'win' | 'oops' | 'star') {
  unlockAudio();
  if (!ctx || store.muted) return;
  if (kind === 'tap') tone({ type: 'sine', dur: 0.09, f: [[0, 880], [1, 1320]], gain: 0.12, attack: 0.005, release: 0.05 });
  if (kind === 'oops') tone({ type: 'triangle', dur: 0.35, f: [[0, 420], [1, 300]], gain: 0.15, attack: 0.01, release: 0.15 });
  if (kind === 'win') [523, 659, 784, 1047].forEach((f, i) => tone({ type: 'triangle', at: i * 0.09, dur: 0.3, f: [[0, f], [1, f]], gain: 0.2, attack: 0.01, release: 0.2 }));
  if (kind === 'star') tone({ type: 'sine', dur: 0.4, f: [[0, 1200], [1, 2400]], gain: 0.15, attack: 0.01, release: 0.3 });
}

export const hasRecipe = (k: string) => k in RECIPES;

// ---------- Modo calma: paisajes sonoros continuos ----------
// Todo parte de ruido «marrón» (grave y suave, como un rumor lejano), nunca del ruido blanco agudo.
export type Ambience = 'lluvia' | 'olas' | 'noche' | 'viento' | 'selva' | 'arroyo' | 'nana' | 'corazon' | 'ballenas' | 'chimenea';
let amb: { out: GainNode; nodes: AudioScheduledSourceNode[]; timers: number[] } | null = null;
let brownBuf: AudioBuffer | null = null;

function brown(c: AudioContext) {
  if (brownBuf) return brownBuf;
  const len = c.sampleRate * 8;
  brownBuf = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = brownBuf.getChannelData(ch); let last = 0;
    for (let k = 0; k < len; k++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[k] = last * 3.5; }
    // fundido del bucle para que no se note el salto
    for (let k = 0; k < 2000; k++) { const f = k / 2000; d[k] *= f; d[len - 1 - k] *= f; }
  }
  return brownBuf;
}

// Nana de Brahms (dominio público), notas en Hz y duración en tiempos
const NANA: [number, number][] = [[330, 1], [330, 1], [392, 3], [330, 1], [330, 1], [392, 3], [330, 1], [392, 1], [523, 2], [494, 2], [440, 2], [440, 2], [392, 2],
  [294, 1], [330, 1], [349, 2], [294, 2], [294, 1], [330, 1], [349, 3], [294, 1], [349, 1], [494, 1], [440, 1], [392, 2], [494, 2], [523, 4]];

export function startAmbience(kind: Ambience, volume = 0.55) {
  unlockAudio();
  stopAmbience(0.2);
  if (!ctx) return;
  const c = ctx; const out = c.createGain();
  out.gain.setValueAtTime(0.0001, c.currentTime);
  out.gain.exponentialRampToValueAtTime(volume, c.currentTime + 4);
  out.connect(master);
  const nodes: AudioScheduledSourceNode[] = []; const timers: number[] = [];
  /** Capa de ruido marrón filtrado, con «respiración» lenta opcional. */
  const bed = (type: BiquadFilterType, f: number, q: number, g: number, lfo?: [number, number], offset = 0) => {
    const src = c.createBufferSource(); src.buffer = brown(c); src.loop = true;
    const bq = c.createBiquadFilter(); bq.type = type; bq.frequency.value = f; bq.Q.value = q;
    const gn = c.createGain(); gn.gain.value = g;
    src.connect(bq).connect(gn).connect(out); src.start(0, offset); nodes.push(src);
    if (lfo) { const l = c.createOscillator(); const lg = c.createGain(); l.frequency.value = lfo[0]; lg.gain.value = lfo[1]; l.connect(lg).connect(gn.gain); l.start(); nodes.push(l); }
    return bq;
  };
  const every = (ms: number, fn: () => void) => { const tick = () => { if (!amb || amb.out !== out) return; fn(); timers.push(window.setTimeout(tick, ms * (0.6 + Math.random() * 0.8))); }; timers.push(window.setTimeout(tick, ms * Math.random())); };
  const soft = (f: number, dur: number, g: number, type: OscillatorType = 'sine', glide = 1, dest: AudioNode = out) =>
    tone({ type, dur, f: [[0, f], [1, f * glide]], gain: g, attack: Math.min(0.3, dur / 3), release: dur / 2, out: dest });

  if (kind === 'lluvia') {
    // lluvia suave sobre las hojas: rumor grave y gotitas lejanas
    bed('lowpass', 700, 0.4, 0.3, [0.05, 0.05]); bed('bandpass', 1400, 0.6, 0.05, [0.07, 0.02], 3);
    every(220, () => soft(900 + Math.random() * 900, 0.08, 0.008 + Math.random() * 0.01));
  }
  if (kind === 'olas') {
    // olas que llegan cada 8-10 s y se retiran despacio
    bed('lowpass', 420, 0.5, 0.7, [0.11, 0.55]); bed('lowpass', 900, 0.4, 0.15, [0.09, 0.12], 2);
  }
  if (kind === 'viento') {
    // brisa suave entre los árboles
    const f = bed('bandpass', 320, 0.8, 0.45, [0.04, 0.2]);
    const l = c.createOscillator(); const lg = c.createGain(); l.frequency.value = 0.05; lg.gain.value = 120; l.connect(lg).connect(f.frequency); l.start(); nodes.push(l);
    every(9000, () => soft(500 + Math.random() * 200, 3, 0.006, 'sine', 1.08));
  }
  if (kind === 'noche') {
    bed('lowpass', 250, 0.5, 0.25);
    every(2200, () => range(3, (i) => tone({ type: 'sine', at: i * 0.07, dur: 0.05, f: [[0, 4200], [1, 4150]], gain: 0.008, attack: 0.01, release: 0.03, out })));
    every(20000, () => { const n: [number, number][] = [[0, 0.5], [0.8, 0.25], [1.15, 0.6]]; for (const [at, dur] of n) tone({ type: 'sine', at, dur, f: [[0, 390], [1, 350]], gain: 0.025, attack: 0.08, release: 0.25, out }); });
  }
  if (kind === 'selva') {
    bed('lowpass', 600, 0.5, 0.25, [0.06, 0.05]);
    every(3200, () => { const f = 2000 + Math.random() * 1400; range(2 + Math.floor(Math.random() * 2), (i) => tone({ type: 'sine', at: i * 0.16, dur: 0.12, f: [[0, f], [1, f * 1.2]], gain: 0.012, attack: 0.02, release: 0.08, out })); });
    every(7000, () => { const f = 800 + Math.random() * 300; tone({ type: 'sine', dur: 0.9, f: [[0, f], [0.5, f * 1.4], [1, f * 1.1]], gain: 0.015, attack: 0.15, release: 0.4, vib: [5, 15], out }); });
  }
  if (kind === 'arroyo') {
    // agua que corre entre piedras: burbujitas suaves
    bed('bandpass', 900, 0.7, 0.22, [0.3, 0.05]); bed('lowpass', 400, 0.5, 0.25, undefined, 4);
    every(160, () => soft(250 + Math.random() * 500, 0.1 + Math.random() * 0.08, 0.012, 'sine', 1.6 + Math.random()));
  }
  if (kind === 'chimenea') {
    // fuego tranquilo: rumor cálido y chasquidos pequeños
    bed('lowpass', 300, 0.5, 0.3, [0.2, 0.06]);
    every(450, () => noise({ dur: 0.02 + Math.random() * 0.03, gain: 0.015 + Math.random() * 0.02, filter: ['bandpass', 1500 + Math.random() * 2500, 2], attack: 0.002 }));
  }
  if (kind === 'corazon') {
    // latido lento (60 por minuto), como dentro de mamá
    bed('lowpass', 200, 0.5, 0.18);
    const beat = () => { soft(55, 0.18, 0.2, 'sine', 0.8); window.setTimeout(() => { if (amb?.out === out) soft(50, 0.16, 0.13, 'sine', 0.8); }, 260); };
    beat(); const iv = window.setInterval(() => { if (amb?.out === out) beat(); else clearInterval(iv); }, 1000); timers.push(iv);
  }
  if (kind === 'ballenas') {
    const e = echo(0.6, 0.5, out);
    bed('lowpass', 350, 0.5, 0.3, [0.08, 0.18]);
    every(9000, () => { const f = 160 + Math.random() * 140; tone({ type: 'sine', dur: 3 + Math.random() * 2, f: [[0, f], [0.4, f * 1.8], [1, f * 1.2]], gain: 0.04, attack: 0.8, release: 1.5, vib: [3, 6], out: e }); });
  }
  if (kind === 'nana') {
    // caja de música con la nana de Brahms, muy suave y en bucle
    const e = echo(0.35, 0.3, out);
    const beat = 0.42; const total = NANA.reduce((a, [, d]) => a + d, 0) * beat + 2;
    const play = () => {
      let t = 0;
      for (const [f, d] of NANA) {
        tone({ type: 'sine', at: t, dur: Math.max(0.6, d * beat * 1.4), f: [[0, f * 2], [1, f * 2]], gain: 0.05, attack: 0.005, release: Math.max(0.5, d * beat), out: e });
        tone({ type: 'triangle', at: t, dur: 0.4, f: [[0, f * 4], [1, f * 4]], gain: 0.008, attack: 0.003, release: 0.3, out: e });
        t += d * beat;
      }
    };
    play(); const iv = window.setInterval(() => { if (amb?.out === out) play(); else clearInterval(iv); }, total * 1000); timers.push(iv);
  }
  amb = { out, nodes, timers };
}

export function stopAmbience(fade = 2) {
  if (!amb || !ctx) return;
  const a = amb; amb = null;
  a.timers.forEach((t) => { clearTimeout(t); clearInterval(t); });
  const t = ctx.currentTime;
  a.out.gain.cancelScheduledValues(t); a.out.gain.setValueAtTime(Math.max(a.out.gain.value, 0.0001), t);
  a.out.gain.exponentialRampToValueAtTime(0.0001, t + fade);
  a.nodes.forEach((n) => { try { n.stop(t + fade + 0.1); } catch { /* ya parado */ } });
}
