// Prepara los sonidos aprobados para la app:
//  1. Busca automáticamente el tramo de N segundos donde el animal suena más fuerte (o usa "start").
//  2. Limpia el audio: quita zumbidos graves, reduce el ruido de fondo (FFT con perfil de ruido aprendido)
//     y atenúa el fondo entre llamadas con una puerta de ruido suave.
//  3. Pasa a mono, nivela el volumen (-16 LUFS) y añade fundidos.
// Entrada: sounds-approved.json → { "vaca": { "file": "02-commons.ogg", "start": 0.5, "duration": 4, "clean": true } }
//   clean: true = limpieza fuerte (grabaciones de campo); por defecto, limpieza suave.
// Salida: public/sounds/<animal>.mp3 y src/sounds.json (créditos que usa la app).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { normalizeLicense } from './licenses.mjs';

const approved = JSON.parse(readFileSync('sounds-approved.json', 'utf8'));
const only = process.argv.slice(2);
mkdirSync('public/sounds', { recursive: true });
let out = {};
try { out = JSON.parse(readFileSync('src/sounds.json', 'utf8')); } catch { /* primera vez */ }

/** Segundo de inicio del tramo más fuerte (ventana de `dur` segundos, pasos de 0,1 s). */
function loudestStart(src, dur) {
  const sr = 8000;
  const pcm = execFileSync('ffmpeg', ['-loglevel', 'error', '-i', src, '-ac', '1', '-ar', String(sr), '-af', 'highpass=f=150', '-f', 's16le', '-'], { maxBuffer: 1 << 28 });
  const n = pcm.length >> 1, hop = sr / 10, win = Math.round(dur * 10);
  const e = [];
  for (let i = 0; i + hop <= n; i += hop) {
    let s = 0;
    for (let j = i; j < i + hop; j++) { const v = pcm.readInt16LE(j * 2) / 32768; s += v * v; }
    e.push(s);
  }
  if (e.length <= win) return 0;
  let best = 0, acc = e.slice(0, win).reduce((a, b) => a + b, 0), max = acc;
  for (let k = win; k < e.length; k++) { acc += e[k] - e[k - win]; if (acc > max) { max = acc; best = k - win + 1; } }
  return Math.max(0, best / 10 - 0.15);
}

const cleanAuthor = (a) => (a || '').replace(/^\(c\)\s*/i, '').replace(/,?\s*(some|no) rights reserved.*$/i, '').trim() || 'iNaturalist';

for (const [id, sel] of Object.entries(approved)) {
  if (only.length && !only.includes(id)) continue;
  const cands = JSON.parse(readFileSync(`sounds-raw/${id}/candidatos.json`, 'utf8'));
  const c = cands.find((x) => x.file === sel.file);
  if (!c) throw new Error(`${id}: ${sel.file} no está en candidatos.json`);
  const license = normalizeLicense(c.license);
  if (!license) throw new Error(`${id}: licencia no válida (${c.license})`);
  const src = `sounds-raw/${id}/${sel.file}`;
  const dur = sel.duration ?? 4;
  const start = sel.start ?? loudestStart(src, dur);
  const strong = sel.clean === true;
  const chain = [
    `atrim=${start}:${start + dur + 0.5}`, 'asetpts=PTS-STARTPTS',
    `highpass=f=${sel.highpass ?? 90}`, 'lowpass=f=14000',
    // Reducción de ruido: aprende el ruido de fondo y lo resta
    strong ? 'afftdn=nr=24:nf=-40:tn=1' : 'afftdn=nr=10:nf=-45',
    // Puerta suave: baja el fondo entre llamadas sin cortar el animal
    strong ? 'agate=threshold=0.02:ratio=3:attack=5:release=250:range=0.12' : null,
    'silenceremove=start_periods=1:start_threshold=-42dB',
    `atrim=0:${dur}`,
    'loudnorm=I=-16:TP=-1.5:LRA=11',
    'afade=t=in:d=0.04', `afade=t=out:st=${dur - 0.35}:d=0.35`,
  ].filter(Boolean).join(',');
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', src, '-af', chain, '-ac', '1', '-ar', '44100', '-b:a', '96k', `public/sounds/${id}.mp3`]);
  out[id] = { file: `${id}.mp3`, author: cleanAuthor(c.author), license, source: c.page };
  console.log(`✓ ${id} (${license}, ${out[id].author}, desde ${start.toFixed(1)} s${strong ? ', limpieza fuerte' : ''})`);
}
writeFileSync('src/sounds.json', JSON.stringify(Object.fromEntries(Object.entries(out).sort()), null, 2) + '\n');
