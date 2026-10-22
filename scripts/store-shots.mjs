// Capturas para Google Play (1080x1920 móvil y 1920x1200 tablet). Requiere `npm run build`.
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
mkdirSync('docs/tienda', { recursive: true });
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--port', '4176', '--strictPort']);
await new Promise((r) => setTimeout(r, 2500));
const B = 'http://localhost:4176/';
const b = await chromium.launch();
const shots = [['1-inicio', ''], ['2-mapa', '#/mundo'], ['3-granja', '#/region/granja'], ['4-leon', '#/animal/leon'], ['5-juego', '#/juego/granja'], ['6-calma', '#/calma']];
for (const [dev, vp, dsf] of [['movil', { width: 360, height: 640 }, 3], ['tablet', { width: 960, height: 600 }, 2]]) {
  const c = await b.newContext({ viewport: vp, deviceScaleFactor: dsf, isMobile: dev === 'movil', hasTouch: true, locale: 'es-ES' });
  await c.addInitScript(() => localStorage.setItem('mundo-sonidos-v1', JSON.stringify({ lang: 'es', premium: true, favs: ['leon', 'panda'], stars: { granja: 12, africa: 5 } })));
  const p = await c.newPage();
  for (const [n, h] of shots) {
    await p.goto(B + h); await p.waitForTimeout(1500);
    if (n === '6-calma') { await p.tap('.calm-play'); await p.evaluate(() => document.querySelector('.view').scrollTo(0, 0)); await p.waitForTimeout(800); }
    await p.screenshot({ path: `docs/tienda/${dev}-${n}.png` });
  }
  await c.close();
}
await b.close(); server.kill(); console.log('capturas listas');
