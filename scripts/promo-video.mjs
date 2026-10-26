// Vídeo promocional vertical (1080x1920, ~25 s) para Google Play y redes. Requiere `npm run build`.
//   node scripts/promo-video.mjs   →  docs/tienda/promo.mp4
import { chromium } from 'playwright';
import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, rmSync } from 'node:fs';

const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--port', '4182', '--strictPort']);
await new Promise((r) => setTimeout(r, 2500));
const B = 'http://localhost:4182/';
const tmp = 'docs/tienda/.video'; rmSync(tmp, { recursive: true, force: true }); mkdirSync(tmp, { recursive: true });
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 432, height: 768 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true, locale: 'es-ES', recordVideo: { dir: tmp, size: { width: 432, height: 768 } } });
await ctx.addInitScript(() => localStorage.setItem('mundo-sonidos-v1', JSON.stringify({ lang: 'es', premium: true, seen: { vaca: 1, perro: 2, gato: 3, leon: 4, elefante: 5, koala: 6, pinguino: 7, oveja: 8, cerdo: 9, pato: 10 }, stars: { granja: 9 } })));
const LAG_WAIT = 2500;
const t0 = Date.now(); const marks = [];  // el vídeo empieza a grabar al crear la página
const p = await ctx.newPage();
const w = (ms) => p.waitForTimeout(ms);
const mark = (text) => marks.push([(Date.now() - t0) / 1000, text]);
await p.goto(B); await w(600); mark('134 animales con sonido real'); await w(2200);
mark('Viaja por todo el mundo'); await p.tap('.t-explore'); await w(2200);
await p.locator('.zone[data-go="/region/africa"]').click({ force: true }); await w(1800);
mark('Toca y escucha'); await p.tap('.card[data-animal="leon"]'); await w(2500);
await p.tap('.nav-arrow.right'); await w(2200);
mark('Curiosidades en voz alta'); await p.tap('.more-btn'); await w(2600);
await p.goto(B + '#/juego/granja'); mark('Aprende jugando'); await w(1800);
const ids = await p.locator('.choice').evaluateAll((els) => els.map((e) => e.dataset.id));
for (const id of ids) { await p.locator(`.choice[data-id="${id}"]`).click(); await w(500); if (await p.locator('.choice.right').count()) break; }
await w(1800);
await p.goto(B + '#/album'); mark('Completa tu álbum'); await w(2400);
await p.goto(B + '#/calma'); mark('Sin anuncios · Pago único'); await w(800); await p.tap('.calm-play'); await w(3000); mark('fin'); await w(LAG_WAIT);
await p.close(); await ctx.close(); await b.close(); server.kill();

const raw = `${tmp}/${readdirSync(tmp).find((f) => f.endsWith('.webm'))}`;
const font = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
// La grabación de Playwright va ~2 s por detrás del reloj: se retrasan las frases para que coincidan
const LAG = 2;
const start = marks[0][0] + LAG;
const caps = marks.slice(0, -1).map(([t, text], k) => {
  const a = Math.max(0, t + LAG - start).toFixed(2), z = (marks[k + 1][0] + LAG - start).toFixed(2);
  return `drawtext=fontfile=${font}:text='${text}':fontsize=58:fontcolor=white:box=1:boxcolor=0x1b2a4a@0.72:boxborderw=28:x=(w-text_w)/2:y=h-300:enable='between(t,${a},${z})'`;
});
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(start), '-t', String(marks.at(-1)[0] + LAG - start), '-i', raw, '-vf', [
  'scale=1080:1920:flags=lanczos', 'fps=30', ...caps, 'fade=t=in:st=0:d=0.4',
].join(','), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '22', '-movflags', '+faststart', '-an', 'docs/tienda/promo.mp4']);
rmSync(tmp, { recursive: true, force: true });
console.log('vídeo listo: docs/tienda/promo.mp4');
