// Reel vertical de 12 s (YouTube Shorts 1080x1920) con escenas de la app, frases y sonidos reales.
//   node scripts/reel.mjs  →  docs/tienda/reel-12s.mp4      (requiere `npm run build`)
import { chromium } from 'playwright';
import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync } from 'node:fs';

const OUT = 'docs/tienda/.reel'; rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true });
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--port', '4185', '--strictPort']);
await new Promise((r) => setTimeout(r, 2500));
const B = 'http://localhost:4185/';
const seen = Object.fromEntries(['vaca', 'perro', 'gato', 'oveja', 'cerdo', 'caballo', 'pato', 'gallo', 'leon', 'elefante', 'jirafa', 'pinguino', 'tigre', 'ballena', 'delfin', 'cabra', 'burro', 'gallina', 'pollito', 'conejo'].map((id, i) => [id, i + 1]));
// [escena, ruta, frase principal, frase pequeña, color de fondo, sonido]
const SCENES = [
  ['1', '', '¡Descubre 152 animales!', 'de todo el mundo', ['#7cc8ff', '#2f8fd8'], 'vaca'],
  ['2', '#/mundo', 'Viaja por el mundo', 'granja, selva, océano…', ['#5ab4f0', '#1f78b4'], 'ballena'],
  ['3', '#/animal/leon', 'Sonidos reales', 'grabados en la naturaleza', ['#ffb36b', '#d9822b'], 'leon'],
  ['4', '#/juego/granja', '¿Quién suena?', 'aprende jugando', ['#b8a4ff', '#7b5cff'], 'elefante'],
  ['5', '#/album', 'Colecciona pegatinas', 'y aprende inglés', ['#7fe0b0', '#2bb06a'], 'pollito'],
];
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 360, height: 720 }, deviceScaleFactor: 2.5, isMobile: true, hasTouch: true, locale: 'es-ES' });
await ctx.addInitScript((s) => localStorage.setItem('mundo-sonidos-v1', JSON.stringify({ lang: 'es', premium: true, seen: s, stars: { granja: 12 } })), seen);
const p = await ctx.newPage();
const frame = await b.newPage({ viewport: { width: 1080, height: 1920 } });
const font = `<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@800&display=swap" rel="stylesheet">`;
for (const [id, hash, t1, t2, bg] of SCENES) {
  await p.goto(B + hash); await p.waitForTimeout(1700);
  const img = (await p.screenshot()).toString('base64');
  await frame.setContent(`<html><head>${font}</head><body style="margin:0;width:1080px;height:1920px;overflow:hidden;background:linear-gradient(160deg,${bg[0]},${bg[1]});font-family:'Baloo 2',sans-serif;display:flex;flex-direction:column;align-items:center">
    <div style="margin-top:120px;text-align:center;color:#fff;line-height:1;text-shadow:0 6px 0 rgba(0,0,0,.15),0 10px 30px rgba(0,0,0,.25)">
      <div style="font-size:${t1.length > 18 ? 88 : 104}px;font-weight:800">${t1}</div><div style="font-size:64px;font-weight:800;opacity:.95;margin-top:14px">${t2}</div></div>
    <div style="margin-top:70px;width:690px;height:1380px;border-radius:70px;background:#111;padding:22px;box-shadow:0 40px 80px rgba(0,0,0,.4)">
      <img src="data:image/png;base64,${img}" style="width:100%;height:100%;border-radius:50px;display:block;object-fit:cover;object-position:top"></div></body></html>`);
  await frame.waitForTimeout(700); await frame.screenshot({ path: `${OUT}/s${id}.png` });
}
// Cartel final
const icon = readFileSync('docs/tienda/icono-512.png').toString('base64');
await frame.setContent(`<html><head>${font}</head><body style="margin:0;width:1080px;height:1920px;background:linear-gradient(160deg,#ffd75e,#ff9a3c);font-family:'Baloo 2',sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:40px">
  <img src="data:image/png;base64,${icon}" style="width:420px;height:420px;border-radius:96px;box-shadow:0 30px 60px rgba(0,0,0,.3)">
  <div style="text-align:center;color:#fff;line-height:.9;text-shadow:0 8px 0 #e2457a,0 14px 30px rgba(0,0,0,.25)"><div style="font-size:80px;color:#fff7c2">Mundo de</div><div style="font-size:150px;font-weight:800">Sonidos</div></div>
  <div style="font-size:66px;font-weight:800;color:#5a2d00">¡Muy pronto en Google Play!</div>
  <div style="font-size:44px;font-weight:800;color:#5a2d00;opacity:.85">Sin anuncios · Para niños de 2 a 8 años</div></body></html>`);
await frame.waitForTimeout(700); await frame.screenshot({ path: `${OUT}/s6.png` });
await b.close(); server.kill();

// Vídeo: 6 escenas de 2,3 s con zoom suave y fundidos de 0,3 s → 12 s
const D = 2.3, X = 0.3, fps = 30;
const inputs = [1, 2, 3, 4, 5, 6].flatMap((i) => ['-loop', '1', '-t', String(D), '-i', `${OUT}/s${i}.png`]);
let f = [1, 2, 3, 4, 5, 6].map((i, k) => `[${k}:v]scale=1188:2112,zoompan=z='min(zoom+0.0009,1.06)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${Math.round(D * fps)}:s=1080x1920:fps=${fps},setsar=1[v${k}]`).join(';');
let last = 'v0', off = D - X;
for (let k = 1; k < 6; k++) { f += `;[${last}][v${k}]xfade=transition=${k === 5 ? 'fade' : 'slideleft'}:duration=${X}:offset=${off.toFixed(2)}[x${k}]`; last = `x${k}`; off += D - X; }
// Sonidos de animales colocados en cada escena
const SND = [['vaca', 0.3], ['ballena', 2.3], ['leon', 4.3], ['elefante', 6.3], ['pollito', 8.3], ['kookaburra', 10.2]];
const aIn = SND.flatMap(([s]) => ['-i', `public/sounds/${s}.mp3`]);
const a = SND.map(([, t], k) => `[${6 + k}:a]atrim=0:1.9,afade=t=out:st=1.5:d=0.4,adelay=${Math.round(t * 1000)}|${Math.round(t * 1000)},volume=0.9[a${k}]`).join(';');
f += `;${a};${SND.map((_, k) => `[a${k}]`).join('')}amix=inputs=${SND.length}:normalize=0,atrim=0:12,afade=t=out:st=11.3:d=0.7[aout]`;
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, ...aIn, '-filter_complex', f, '-map', `[${last}]`, '-map', '[aout]', '-t', '12', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', 'docs/tienda/reel-12s.mp4']);
rmSync(OUT, { recursive: true, force: true });
console.log('reel listo: docs/tienda/reel-12s.mp4');
