// Capturas de Google Play con frase y marco de móvil (1080x1920), en español e inglés. Requiere `npm run build`.
//   node scripts/store-marketing.mjs
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';

const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--port', '4181', '--strictPort']);
await new Promise((r) => setTimeout(r, 2500));
const B = 'http://localhost:4181/';
const seen = Object.fromEntries(['vaca', 'perro', 'gato', 'oveja', 'cerdo', 'caballo', 'pato', 'gallo', 'leon', 'elefante', 'jirafa', 'koala', 'pinguino', 'tigre', 'ballena', 'delfin', 'cabra', 'burro'].map((id, i) => [id, i + 1]));
const SHOTS = [
  { id: '1', hash: '', bg: ['#7cc8ff', '#2f8fd8'], es: ['134 animales', 'con su sonido real'], en: ['134 animals', 'with real sounds'] },
  { id: '2', hash: '#/mundo', bg: ['#5ab4f0', '#1f78b4'], es: ['Viaja por', 'todo el mundo'], en: ['Travel around', 'the world'] },
  { id: '3', hash: '#/animal/leon', bg: ['#ffb36b', '#d9822b'], es: ['Toca y escucha', 'al instante'], en: ['Tap and listen', 'instantly'] },
  { id: '4', hash: '#/animal/elefante', more: true, bg: ['#9bd67a', '#3c9445'], es: ['Aprende curiosidades', 'que se leen en voz alta'], en: ['Fun facts', 'read out loud'] },
  { id: '5', hash: '#/juego/granja', bg: ['#b8a4ff', '#7b5cff'], es: ['¿Quién suena?', 'Aprende jugando'], en: ['Who’s that sound?', 'Learn by playing'] },
  { id: '6', hash: '#/album', bg: ['#ffd75e', '#f08a24'], es: ['Completa tu álbum', 'de pegatinas'], en: ['Fill your', 'sticker album'] },
  { id: '7', hash: '#/calma', calm: true, bg: ['#3a3f8f', '#0b1440'], es: ['Modo calma', 'para dormir'], en: ['Calm mode', 'for bedtime'] },
  { id: '8', hash: '#/profe/preguntas', bg: ['#ffb48a', '#ff7d4a'], es: ['Sin anuncios · Sin internet', 'Pago único'], en: ['No ads · Works offline', 'One-time purchase'] },
];
const b = await chromium.launch();
for (const lang of ['es', 'en']) {
  mkdirSync(`docs/tienda/${lang}`, { recursive: true });
  const ctx = await b.newContext({ viewport: { width: 360, height: 720 }, deviceScaleFactor: 2.5, isMobile: true, hasTouch: true, locale: lang });
  await ctx.addInitScript(([l, s]) => localStorage.setItem('mundo-sonidos-v1', JSON.stringify({ lang: l, premium: true, seen: s, stars: { granja: 12 }, favs: ['leon'] })), [lang, seen]);
  const p = await ctx.newPage();
  const frame = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  for (const s of SHOTS) {
    await p.goto(B + s.hash); await p.waitForTimeout(1600);
    if (s.more) { await p.tap('.more-btn'); await p.waitForTimeout(900); }
    if (s.calm) { await p.tap('.calm-play'); await p.evaluate(() => document.querySelector('.view').scrollTo(0, 0)); await p.waitForTimeout(800); }
    const img = (await p.screenshot()).toString('base64');
    const [t1, t2] = s[lang];
    await frame.setContent(`<html><head><link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@800&display=swap" rel="stylesheet"></head>
      <body style="margin:0;width:1080px;height:1920px;overflow:hidden;background:linear-gradient(160deg,${s.bg[0]},${s.bg[1]});font-family:'Baloo 2',sans-serif;display:flex;flex-direction:column;align-items:center">
      <div style="margin-top:110px;text-align:center;color:#fff;line-height:1;text-shadow:0 6px 0 rgba(0,0,0,.15),0 10px 30px rgba(0,0,0,.25)">
        <div style="font-size:112px;font-weight:800">${t1}</div><div style="font-size:72px;font-weight:800;opacity:.95;margin-top:10px">${t2}</div></div>
      <div style="margin-top:70px;width:720px;height:1440px;border-radius:70px;background:#111;padding:22px;box-shadow:0 40px 80px rgba(0,0,0,.4)">
        <img src="data:image/png;base64,${img}" style="width:100%;height:100%;border-radius:50px;display:block;object-fit:cover;object-position:top"></div></body></html>`);
    await frame.waitForTimeout(700);
    await frame.screenshot({ path: `docs/tienda/${lang}/captura-${s.id}.png` });
  }
  await ctx.close(); await frame.close();
}
await b.close(); server.kill(); console.log('capturas de tienda listas en docs/tienda/es y docs/tienda/en');
