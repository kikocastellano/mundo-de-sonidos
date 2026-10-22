// Prueba de humo: recorre todas las pantallas en móvil, tablet y ordenador y guarda capturas.
import { chromium, devices } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const OUT = new URL('./screenshots/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--port', '4174', '--strictPort'], { stdio: 'pipe' });
await new Promise((r) => { server.stdout.on('data', (d) => { if (String(d).includes('4174')) r(); }); setTimeout(r, 5000); });
const BASE = 'http://localhost:4174/';

const targets = [
  { name: 'iphone', opts: devices['iPhone 13'] },
  { name: 'android', opts: devices['Galaxy S8'] },
  { name: 'phone-landscape', opts: devices['iPhone 13 landscape'] },
  { name: 'ipad', opts: devices['iPad (gen 7)'] },
  { name: 'desktop', opts: { viewport: { width: 1440, height: 900 } } },
];

let failures = 0;
const check = (c, m) => { if (!c) { failures++; console.error('  ✗', m); } else console.log('  ✓', m); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch();

for (const t of targets) {
  console.log(`\n[${t.name}]`);
  const ctx = await browser.newContext({ ...t.opts, locale: 'es-ES' });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  const shot = async (n) => { await sleep(700); await page.screenshot({ path: `${OUT}${t.name}-${n}.png` }); };
  const noHScroll = async (n) => {
    const bad = await page.evaluate(() => [...document.querySelectorAll('.view')].flatMap((v) => v.scrollWidth <= v.clientWidth + 1 ? [] : [...v.querySelectorAll('*')].filter((e) => e.getBoundingClientRect().right > v.clientWidth + 1).map((e) => String(e.className.baseVal ?? e.className) + JSON.stringify([Math.round(e.getBoundingClientRect().left), Math.round(e.getBoundingClientRect().width), e.children.length])).slice(0, 5)));
    check(bad.length === 0, `${n}: sin scroll horizontal ${bad.join(', ')}`);
  };
  const tap = (sel) => (t.opts.hasTouch ? page.tap(sel) : page.click(sel));

  await page.goto(BASE); await shot('1-inicio'); await noHScroll('inicio');
  check(await page.isVisible('text=Explorar'), 'botón Explorar visible');
  await tap('.big-btn.primary'); await shot('2-mapa'); await noHScroll('mapa');
  check((await page.locator('.zone').count()) === 8, '8 zonas en el mapa');
  await page.locator('.zone[data-go="/region/granja"]').click(); await shot('3-granja'); await noHScroll('región');
  check((await page.locator('.card').count()) === 22, 'granja con 22 animales');
  await tap('.card[data-animal="vaca"]'); await shot('4-vaca'); await noHScroll('ficha');
  await tap('.fav-btn'); check(await page.locator('.fav-btn.on').count() === 1, 'favorito marcado');
  await tap('.nav-arrow.right'); await sleep(300); check(page.url().includes('/animal/perro'), 'flecha pasa al siguiente animal');
  await page.goto(BASE + '#/animal/loro'); await shot('5-bloqueado'); check(await page.isVisible('.portrait-lock'), 'candado en animal de pago');
  await page.goto(BASE + '#/favoritos'); check((await page.locator('.card').count()) === 1, 'favorito guardado');
  await page.goto(BASE + '#/juego'); await shot('6-elegir-juego');
  await page.goto(BASE + '#/juego/granja'); await sleep(400);
  check((await page.locator('.choice').count()) === 3, 'juego con 3 opciones');
  // Acertar: leer la respuesta desde el estado de la página no es posible; se prueba todas hasta acertar.
  const ids = await page.locator('.choice').evaluateAll((els) => els.map((e) => e.dataset.id));
  await shot('7-juego');
  for (const id of ids) { await page.locator(`.choice[data-id="${id}"]`).click(); if (await page.locator('.choice.right').count()) break; await sleep(200); }
  check(await page.locator('.choice.right').count() === 1, 'se puede acertar sin castigos');
  await shot('8-acierto');
  await page.goto(BASE + '#/padres'); await shot('9-puerta');
  await page.goto(BASE + '#/region/polos'); await shot('10-polos');
  await page.goto(BASE + '#/region/oceano'); await shot('11-oceano');
  await page.goto(BASE + '#/region/africa'); await shot('12-africa');
  await page.goto(BASE + '#/calma'); check(await page.isVisible('.premium-lock'), 'modo calma bloqueado sin premium');
  await page.evaluate(() => { const k = 'mundo-sonidos-v1'; const s = JSON.parse(localStorage.getItem(k) || '{}'); s.premium = true; localStorage.setItem(k, JSON.stringify(s)); });
  await page.reload(); await page.goto(BASE + '#/calma'); await page.reload();
  check(await page.isVisible('.calm-play'), 'modo calma con premium'); await tap('.calm-play'); await shot('13-calma');
  await page.goto(BASE + '#/profe'); await sleep(600); check(await page.locator('.teacher-name').textContent() !== '', 'modo profe muestra animal'); await shot('14-profe');
  await page.goto(BASE + '#/creditos'); check((await page.locator('.credit-item').count()) >= 70, 'créditos de todos los animales'); await shot('15-creditos');
  check(errors.length === 0, `sin errores JS ${errors.join(' | ')}`);
  await ctx.close();
}
await browser.close(); server.kill();
console.log(failures ? `\n${failures} fallos` : '\nTodo correcto');
process.exit(failures ? 1 : 0);
