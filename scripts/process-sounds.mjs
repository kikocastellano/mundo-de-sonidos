// Recorta el silencio, limita a 4 s, pasa a mono y nivela el volumen (-16 LUFS) de los sonidos aprobados.
// Entrada: sounds-approved.json  →  { "vaca": { "file": "02-commons.ogg", "start": 0.5 }, ... }
// Salida: public/sounds/<animal>.mp3 y src/sounds.json (créditos que usa la app).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { normalizeLicense } from './licenses.mjs';

const approved = JSON.parse(readFileSync('sounds-approved.json', 'utf8'));
mkdirSync('public/sounds', { recursive: true });
const out = {};
for (const [id, sel] of Object.entries(approved)) {
  const cands = JSON.parse(readFileSync(`sounds-raw/${id}/candidatos.json`, 'utf8'));
  const c = cands.find((x) => x.file === sel.file);
  if (!c) throw new Error(`${id}: ${sel.file} no está en candidatos.json`);
  const license = normalizeLicense(c.license);
  if (!license) throw new Error(`${id}: licencia no válida (${c.license})`);
  const dur = sel.duration ?? 4;
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(sel.start ?? 0), '-i', `sounds-raw/${id}/${sel.file}`,
    '-af', `silenceremove=start_periods=1:start_threshold=-45dB,atrim=0:${dur},afade=t=in:d=0.03,afade=t=out:st=${dur - 0.3}:d=0.3,loudnorm=I=-16:TP=-1.5:LRA=11`,
    '-ac', '1', '-ar', '44100', '-b:a', '96k', `public/sounds/${id}.mp3`]);
  out[id] = { file: `${id}.mp3`, author: c.author, license, source: c.page };
  console.log(`✓ ${id} (${license}, ${c.author})`);
}
writeFileSync('src/sounds.json', JSON.stringify(out, null, 2) + '\n');
