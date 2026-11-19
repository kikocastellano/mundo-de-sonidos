// Generador de vídeos para el canal de YouTube «Mundo de Sonidos».
//   node scripts/youtube.mjs shorts   → youtube/shorts/short-XX.mp4 + .txt (título, descripción, etiquetas)
//   node scripts/youtube.mjs dormir   → youtube/largos/dormir-1h.mp4 + .txt
//   node scripts/youtube.mjs canal    → youtube/canal/icono.png y banner.png
// Usa los dibujos (Fluent Emoji, MIT) y las grabaciones reales (CC0/CC BY/CC BY-SA) de la app.
import { chromium } from 'playwright';
import { build } from 'esbuild';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';

const MODE = process.argv[2] || 'shorts';
const TMP = 'youtube/.tmp'; rmSync(TMP, { recursive: true, force: true }); mkdirSync(TMP, { recursive: true });
await build({ entryPoints: ['src/data.ts'], bundle: true, platform: 'node', format: 'esm', outfile: `${TMP}/data.mjs`, loader: { '.json': 'json' }, logLevel: 'error' });
const { ANIMALS, REGIONS } = await import(`../${TMP}/data.mjs`);
const byId = Object.fromEntries(ANIMALS.map((a) => [a.id, a]));
const art64 = (a) => `data:image/svg+xml;base64,${readFileSync(`public/art/${a.art}`).toString('base64')}`;
const FONT = '<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;800&display=swap" rel="stylesheet">';
const dur = (f) => parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString());
const PLAY = 'https://play.google.com/store/apps/details?id=com.kikocastellano.mundodesonidos';

const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 1080, height: 1920 } });
async function png(html, path, w = 1080, h = 1920) {
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(`<html><head>${FONT}<style>body{margin:0;width:${w}px;height:${h}px;overflow:hidden;font-family:'Baloo 2',sans-serif;color:#fff}
  .c{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
  .t{font-weight:800;line-height:1;text-shadow:0 8px 0 rgba(0,0,0,.18),0 14px 30px rgba(0,0,0,.25)}
  .card{background:#fff;border-radius:90px;box-shadow:0 30px 70px rgba(0,0,0,.3);display:grid;place-items:center}</style></head><body>${html}</body></html>`);
  await page.waitForTimeout(350); await page.screenshot({ path });
}
const bg = (r) => { const R = REGIONS.find((x) => x.id === r) ?? REGIONS[0]; return `background:linear-gradient(170deg,${R.sky[0]},${R.sky[1]} 55%,${R.hills[0]} 56%,${R.hills[1]})`; };

/** Monta un vídeo a partir de [imagen, segundos] y sonidos [archivo, segundo, duración máx]. */
function video(segs, sounds, out, music = true) {
  const list = segs.map(([f, d]) => `file '${process.cwd()}/${f}'\nduration ${d}`).join('\n') + `\nfile '${process.cwd()}/${segs.at(-1)[0]}'`;
  writeFileSync(`${TMP}/list.txt`, list);
  const total = segs.reduce((s, [, d]) => s + d, 0);
  const aIn = sounds.flatMap(([f]) => ['-i', f]);
  const parts = sounds.map(([, t, m], k) => `[${k + 1}:a]atrim=0:${m},afade=t=out:st=${Math.max(0, m - 0.4)}:d=0.4,adelay=${Math.round(t * 1000)}:all=1[a${k}]`);
  // Música de fondo suave sintetizada (acordes de caja de música) para que no haya silencios
  const mi = sounds.length + 1;
  const bed = music ? `;sine=f=523:d=${total},volume=0.018[m1];sine=f=659:d=${total},volume=0.012[m2];sine=f=784:d=${total},volume=0.01[m3];[m1][m2][m3]amix=3:normalize=0,tremolo=f=1.2:d=0.6[bed]` : '';
  const f = `${parts.join(';')}${bed};${sounds.map((_, k) => `[a${k}]`).join('')}${music ? '[bed]' : ''}amix=inputs=${sounds.length + (music ? 1 : 0)}:normalize=0,atrim=0:${total},afade=t=out:st=${total - 0.6}:d=0.6[aout]`;
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', `${TMP}/list.txt`, ...aIn, '-filter_complex', f,
    '-map', '0:v', '-map', '[aout]', '-vf', 'fps=30,format=yuv420p', '-t', String(total), '-c:v', 'libx264', '-crf', '20', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', out]);
  void mi;
}

if (MODE === 'shorts') {
  mkdirSync('youtube/shorts', { recursive: true });
  const SETS = [
    ['granja', 'Animales de la granja', ['vaca', 'gallo', 'cerdo']],
    ['africa', 'Animales de la selva', ['leon', 'elefante', 'mono']],
    ['oceano', 'Animales del mar', ['ballena', 'delfin', 'foca']],
    ['granja', 'Animales de casa', ['perro', 'gato', 'pato']],
    ['europa', 'Animales de la noche', ['buho', 'lobo', 'grillo']],
    ['granja', 'Animales de la granja 2', ['oveja', 'caballo', 'gallina']],
    ['asia', 'Animales salvajes', ['tigre', 'gorila', 'hipopotamo']],
    ['polos', 'Animales del frío', ['pinguino', 'orca', 'reno']],
    ['america', 'Pájaros que cantan', ['loro', 'cuco', 'kookaburra']],
    ['granja', 'Animales pequeñitos', ['pollito', 'abeja', 'rana']],
  ];
  for (const [n, [reg, theme, ids]] of SETS.entries()) {
    const k = String(n + 1).padStart(2, '0'); const segs = []; const snd = []; let t = 0;
    const add = async (name, html, d) => { const f = `${TMP}/${k}-${segs.length}.png`; await png(html, f); segs.push([f, d]); t += d; };
    await add('intro', `<div class="c" style="${bg(reg)}"><div class="t" style="font-size:150px">¿Adivinas</div><div class="t" style="font-size:150px">qué animal es?</div>
      <div class="t" style="font-size:70px;margin-top:40px;color:#fff7c2">👂 ${theme}</div><div style="font-size:300px;margin-top:60px">🔊</div></div>`, 2);
    for (const [i, id] of ids.entries()) {
      const a = byId[id]; const st = t;
      for (const c of [3, 2, 1]) await add('q', `<div class="c" style="${bg(reg)}"><div class="t" style="font-size:90px">Animal ${i + 1} de 3</div>
        <div class="card" style="width:720px;height:720px;margin:60px 0"><div style="font-size:430px;filter:grayscale(1) brightness(.15)">❓</div></div>
        <div class="t" style="font-size:110px">Escucha… ${c}</div></div>`, 1.2);
      snd.push([`public/sounds/${id}.mp3`, st + 0.2, 3.4]);
      const rt = t;
      await add('a', `<div class="c" style="${bg(reg)}"><div class="t" style="font-size:110px">¡Es ${/^(vaca|oveja|gallina|foca|orca|abeja|rana|ballena|kookaburra)$/.test(id) ? 'una' : 'un'}…</div>
        <div class="card" style="width:720px;height:720px;margin:50px 0"><img src="${art64(a)}" style="width:560px;height:560px"></div>
        <div class="t" style="font-size:150px">${a.name.es}!</div><div class="t" style="font-size:80px;color:#fff7c2;margin-top:20px">🇬🇧 ${a.name.en}</div></div>`, 2.8);
      snd.push([`public/sounds/${id}.mp3`, rt + 0.3, 2.4]);
    }
    await add('end', `<div class="c" style="background:linear-gradient(160deg,#ffd75e,#ff9a3c)"><div class="t" style="font-size:110px">¿Cuántos acertaste?</div>
      <img src="data:image/png;base64,${readFileSync('docs/tienda/icono-512.png').toString('base64')}" style="width:380px;height:380px;border-radius:90px;margin:60px 0;box-shadow:0 30px 60px rgba(0,0,0,.3)">
      <div class="t" style="font-size:90px">177 animales más en</div><div class="t" style="font-size:120px;color:#fff7c2">Mundo de Sonidos</div>
      <div class="t" style="font-size:60px;color:#5a2d00;text-shadow:none;margin-top:30px">Gratis en Google Play · Sin anuncios</div></div>`, 3);
    video(segs, snd, `youtube/shorts/short-${k}.mp4`);
    const names = ids.map((i) => byId[i].name.es.toLowerCase());
    writeFileSync(`youtube/shorts/short-${k}.txt`, `TÍTULO:
¿Adivinas qué animal es? 🔊 ${theme} #shorts

DESCRIPCIÓN:
Escucha el sonido real y adivina el animal antes de que acabe la cuenta atrás. Hoy: ${names.join(', ')}. ¿Cuántos has acertado? 🦁🐮🐧
Sonidos reales grabados en la naturaleza y nombres en español e inglés.

📲 Más de 170 animales en la app Mundo de Sonidos (gratis, sin anuncios): ${PLAY}

Sonidos: ${ids.map((i) => `${byId[i].name.es}: ${byId[i].credit?.author} (${byId[i].credit?.license})`).join(' · ')}
Dibujos: Fluent Emoji de Microsoft (MIT).

ETIQUETAS:
sonidos de animales, adivina el animal, animales para niños, ${names.join(', ')}, aprender animales, animales en inglés, videos para niños, infantil, educativo

AJUSTES: Público → «Sí, es contenido creado para niños».
`);
    console.log('✓ short', k, theme);
  }
}

if (MODE === 'dormir') {
  mkdirSync('youtube/largos', { recursive: true });
  const HOURS = Number(process.argv[3] || 1), total = HOURS * 3600;
  // Imagen nocturna con luna, estrellas y animales dormidos
  const sleepers = ['buho', 'oveja', 'gato', 'pinguino', 'rana'].map((i) => byId[i]);
  await png(`<div class="c" style="background:radial-gradient(circle at 75% 20%,#3b4aa0,#0b1440 70%)">
    ${Array.from({ length: 70 }, (_, i) => `<div style="position:absolute;left:${(i * 137) % 1920}px;top:${(i * 89) % 700}px;width:${2 + (i % 3) * 2}px;height:${2 + (i % 3) * 2}px;border-radius:50%;background:#fff;opacity:${0.4 + (i % 5) / 10}"></div>`).join('')}
    <div style="position:absolute;right:260px;top:120px;width:220px;height:220px;border-radius:50%;background:#fff6c8;box-shadow:0 0 120px 40px rgba(255,246,200,.35)"></div>
    <div style="position:absolute;left:0;right:0;bottom:0;height:300px;background:#14204d;border-radius:50% 50% 0 0/40% 40% 0 0"></div>
    <div style="position:absolute;bottom:150px;display:flex;gap:80px">${sleepers.map((a) => `<img src="${art64(a)}" style="width:190px;height:190px;filter:brightness(.75)">`).join('')}</div>
    <div class="t" style="position:absolute;top:330px;font-size:120px;color:#fff6c8">Sonidos para dormir</div>
    <div class="t" style="position:absolute;top:470px;font-size:60px;opacity:.85">lluvia suave · grillos · búhos · ${HOURS} hora${HOURS > 1 ? 's' : ''}</div></div>`, `${TMP}/noche.png`, 1920, 1080);
  // Fondo: lluvia (ruido marrón filtrado) + sonidos reales de la noche cada cierto tiempo
  const night = ['grillo', 'buho', 'rana', 'lechuza', 'grillo', 'rana-arboricola', 'buho-barrado'];
  const loop = 300; // pista base de 5 minutos que se repite
  const ev = []; for (let s = 8, i = 0; s < loop - 10; s += 22 + (i * 7) % 15, i++) ev.push([night[i % night.length], s]);
  const ins = ev.flatMap(([id]) => ['-i', `public/sounds/${id}.mp3`]);
  const mix = ev.map(([, s], k) => `[${k + 1}:a]volume=0.18,afade=t=in:d=1,afade=t=out:st=2.5:d=1.5,adelay=${s * 1000}:all=1[e${k}]`).join(';');
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', `anoisesrc=c=brown:d=${loop}:a=0.5`, ...ins, '-filter_complex',
    `[0:a]lowpass=f=900,highpass=f=80,volume=0.6[rain];${mix};[rain]${ev.map((_, k) => `[e${k}]`).join('')}amix=inputs=${ev.length + 1}:normalize=0,afade=t=in:d=3,afade=t=out:st=${loop - 3}:d=3[a]`,
    '-map', '[a]', '-ac', '2', '-c:a', 'aac', '-b:a', '128k', `${TMP}/loop.m4a`]);
  // Repetición con fundido cruzado suave entre bucles
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-stream_loop', String(Math.ceil(total / loop) - 1), '-i', `${TMP}/loop.m4a`, '-t', String(total), '-c', 'copy', `${TMP}/audio.m4a`]);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-loop', '1', '-framerate', '1', '-i', `${TMP}/noche.png`, '-i', `${TMP}/audio.m4a`, '-t', String(total),
    '-c:v', 'libx264', '-tune', 'stillimage', '-preset', 'veryfast', '-crf', '28', '-pix_fmt', 'yuv420p', '-r', '1', '-c:a', 'copy', '-movflags', '+faststart', `youtube/largos/dormir-${HOURS}h.mp4`]);
  writeFileSync(`youtube/largos/dormir-${HOURS}h.txt`, `TÍTULO:
Sonidos para dormir bebés y niños 🌙 Lluvia suave, grillos y búhos (${HOURS} hora${HOURS > 1 ? 's' : ''})

DESCRIPCIÓN:
${HOURS} hora${HOURS > 1 ? 's' : ''} de lluvia suave con sonidos reales de la noche (grillos, ranas y búhos) para ayudar a dormir a bebés y niños. Sin música fuerte ni cambios bruscos, sin anuncios a mitad.
🌙 Pantalla oscura: puedes dejarlo en la tele o el móvil.

📲 Modo calma con nana, lluvia, olas y más en la app Mundo de Sonidos (gratis, sin anuncios): ${PLAY}

Sonidos de animales: grabaciones con licencia libre (CC0 / CC BY / CC BY-SA) a través de iNaturalist y Freesound; autores en los créditos de la app.

ETIQUETAS:
sonidos para dormir, ruido blanco bebé, lluvia para dormir, dormir bebés, sonidos de la naturaleza, grillos, relajación niños, ruido marrón, canción de cuna, sonidos relajantes

AJUSTES: Público → «Sí, es contenido creado para niños».
`);
  console.log('✓ dormir', HOURS, 'h');
}

if (MODE === 'canal') {
  mkdirSync('youtube/canal', { recursive: true });
  const icon = readFileSync('docs/tienda/icono-512.png').toString('base64');
  await png(`<img src="data:image/png;base64,${icon}" style="width:800px;height:800px">`, 'youtube/canal/icono.png', 800, 800);
  const parade = ['vaca', 'leon', 'elefante', 'pinguino', 'ballena', 'mono', 'buho', 'pulpo', 't-rex', 'loro'].map((i) => `<img src="${art64(byId[i])}" style="width:150px;height:150px">`).join('');
  await png(`<div class="c" style="background:linear-gradient(#6fc0ff,#d9f1ff 60%,#9bd67a 61%,#5fb648)">
    <div class="t" style="font-size:150px;line-height:.9"><span style="font-size:80px;color:#fff7c2">Mundo de</span><br>Sonidos</div>
    <div class="t" style="font-size:56px;color:#23324a;text-shadow:none;margin-top:20px">Sonidos de animales · Adivinanzas · Inglés · Para dormir</div>
    <div style="display:flex;gap:30px;margin-top:60px">${parade}</div></div>`, 'youtube/canal/banner.png', 2560, 1440);
  console.log('✓ canal');
}
await b.close(); rmSync(TMP, { recursive: true, force: true });
