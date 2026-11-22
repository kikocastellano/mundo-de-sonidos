// Carrusel de fotos para TikTok (1080x1920): gancho + 5 beneficios de la app + sorpresa final.
//   npm run build && node scripts/tiktok-carrusel.mjs  → youtube/tiktok/carrusel/1.png … 7.png
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
const OUT = 'youtube/tiktok/carrusel'; mkdirSync(OUT, { recursive: true });
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--port', '4191', '--strictPort']);
await new Promise((r) => setTimeout(r, 2500));
const B = 'http://localhost:4191/';
const ART = JSON.parse(readFileSync('src/art.json', 'utf8'));
const art = (id) => `data:image/svg+xml;base64,${readFileSync(`public/art/${ART[id]}`).toString('base64')}`;
const icon = readFileSync('docs/tienda/icono-512.png').toString('base64');
const b = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const ctx = await b.newContext({ viewport: { width: 360, height: 720 }, deviceScaleFactor: 2.5, isMobile: true, hasTouch: true, locale: 'es-ES' });
await ctx.addInitScript(() => localStorage.setItem('mundo-sonidos-v1', JSON.stringify({ lang: 'es', premium: true, welcomed: true, seen: { vaca: 1, leon: 1, perro: 1, gato: 1, pato: 1 }, stars: { granja: 12 } })));
const app = await ctx.newPage();
const frame = await b.newPage({ viewport: { width: 1080, height: 1920 } });
const FONT = '<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;800&display=swap" rel="stylesheet">';
async function shot(hash, prep) { await app.goto(B + hash); await app.waitForTimeout(1600); if (prep) await prep(); return (await app.screenshot()).toString('base64'); }
async function slide(n, bg, head, img) {
  await frame.setContent(`<html><head>${FONT}</head><body style="margin:0;width:1080px;height:1920px;overflow:hidden;background:${bg};font-family:'Baloo 2';color:#fff;display:flex;flex-direction:column;align-items:center">
    ${head}${img ? `<div style="margin-top:50px;width:600px;height:1200px;border-radius:64px;background:#111;padding:20px;box-shadow:0 40px 80px rgba(0,0,0,.4)"><img src="data:image/png;base64,${img}" style="width:100%;height:100%;border-radius:46px;object-fit:cover;object-position:top"></div>` : ''}</body></html>`);
  await frame.waitForTimeout(600); await frame.screenshot({ path: `${OUT}/${n}.png` });
}
const H = (num, t1, t2) => `<div style="margin-top:150px;text-align:center;padding:0 60px">
  <div style="display:inline-block;font-size:56px;font-weight:800;background:rgba(255,255,255,.25);padding:4px 34px;border-radius:50px">${num}</div>
  <div style="font-size:98px;font-weight:800;line-height:1;margin-top:20px;text-shadow:0 6px 0 rgba(0,0,0,.15)">${t1}</div>
  <div style="font-size:52px;font-weight:600;line-height:1.15;margin-top:18px;opacity:.95">${t2}</div></div>`;

// 1 · Gancho
const collage = [['leon', 330, 80, 1080, -8], ['elefante', 280, 640, 1130, 6], ['pinguino', 230, 400, 1350, 0], ['pulpo', 240, 120, 1460, 10], ['t-rex', 260, 700, 1450, -6], ['vaca', 220, 440, 1080, 4]];
await frame.setContent(`<html><head>${FONT}</head><body style="margin:0;width:1080px;height:1920px;overflow:hidden;position:relative;font-family:'Baloo 2';background:radial-gradient(circle at 50% 30%,#fff3a8,#ffcf3f 45%,#ff9a3c)">
  <div style="position:absolute;top:210px;left:60px;right:60px;text-align:center;color:#23324a">
    <div style="font-size:66px;font-weight:800">La app que uso para que</div>
    <div style="font-size:120px;font-weight:800;line-height:1;color:#fff;text-shadow:0 8px 0 #e2457a,0 14px 30px rgba(0,0,0,.2)">mi peque aprenda</div>
    <div style="font-size:120px;font-weight:800;line-height:1;color:#fff;text-shadow:0 8px 0 #e2457a,0 14px 30px rgba(0,0,0,.2)">sin pantallas basura</div>
    <div style="font-size:60px;font-weight:800;margin-top:40px;background:#23324a;color:#fff;display:inline-block;padding:10px 44px;border-radius:70px">la última te sorprenderá 👀</div></div>
  ${collage.map(([id, s, x, y, r]) => `<img src="${art(id)}" style="position:absolute;left:${x}px;top:${y}px;width:${s}px;height:${s}px;transform:rotate(${r}deg);filter:drop-shadow(0 16px 20px rgba(0,0,0,.25))">`).join('')}
  <div style="position:absolute;bottom:90px;left:0;right:0;text-align:center;font-size:54px;font-weight:800;color:#5a2d00">desliza 👉</div></body></html>`);
await frame.waitForTimeout(700); await frame.screenshot({ path: `${OUT}/1.png` });

await slide(2, 'linear-gradient(160deg,#ffb36b,#d9822b)', H('1/5', 'Sonidos REALES 🔊', 'grabados en la naturaleza, no voces de dibujos animados'), await shot('#/animal/leon'));
await slide(3, 'linear-gradient(160deg,#ff9aa6,#ef5466)', H('2/5', 'Aprende inglés 🇬🇧', 'cada animal en español e inglés, con un juego para practicar'), await shot('#/ingles'));
await slide(4, 'linear-gradient(160deg,#7cc8ff,#2f8fd8)', H('3/5', 'CERO anuncios 🚫', 'ni vídeos raros ni compras sin querer: los ajustes tienen puerta para padres'), await shot(''));
await slide(5, 'linear-gradient(160deg,#3a3f8f,#0b1440)', H('4/5', 'Modo calma 🌙', 'nana, lluvia y olas con temporizador para la hora de dormir'), await shot('#/calma', async () => { await app.tap('.calm-play'); await app.evaluate(() => document.querySelector('.view').scrollTo(0, 0)); await app.waitForTimeout(800); }));
await slide(6, 'linear-gradient(160deg,#ffb48a,#ff7d4a)', H('5/5', 'Lee en voz alta 🗣️', 'preguntas y respuestas para los que aún no saben leer'), await shot('#/profe/preguntas'));
// 7 · Sorpresa
await frame.setContent(`<html><head>${FONT}</head><body style="margin:0;width:1080px;height:1920px;overflow:hidden;font-family:'Baloo 2';color:#fff;background:linear-gradient(160deg,#2bd67b,#0f8f6e);display:flex;flex-direction:column;align-items:center;text-align:center">
  <div style="margin-top:170px;font-size:70px;font-weight:800">Y lo mejor… 👀</div>
  <div style="font-size:170px;font-weight:800;line-height:.95;margin-top:30px;text-shadow:0 10px 0 rgba(0,0,0,.18)">¡FUNCIONA<br>SIN INTERNET!</div>
  <div style="font-size:64px;font-weight:600;margin-top:30px">✈️ avión · 🚗 coche · 🏖️ playa</div>
  <div style="font-size:56px;font-weight:600;margin-top:20px;opacity:.95">+177 animales… ¡y hasta dinosaurios! 🦖</div>
  <img src="data:image/png;base64,${icon}" style="width:330px;height:330px;border-radius:76px;margin-top:80px;box-shadow:0 30px 60px rgba(0,0,0,.3)">
  <div style="font-size:110px;font-weight:800;margin-top:30px;line-height:1">Mundo de Sonidos</div>
  <div style="font-size:60px;font-weight:800;margin-top:24px;background:#fff;color:#0f8f6e;padding:10px 50px;border-radius:70px">Gratis en Google Play</div></body></html>`);
await frame.waitForTimeout(700); await frame.screenshot({ path: `${OUT}/7.png` });
await b.close(); server.kill(); console.log('✓ carrusel');
