// Generador de vídeos para el canal de YouTube «PequeMundo» (publicita la app «Mundo de Sonidos»).
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
      <div class="t" style="font-size:60px;color:#5a2d00;text-shadow:none;margin-top:30px">Gratis en Google Play · Sin anuncios</div>
      <div class="t" style="font-size:64px;margin-top:70px;background:#e2457a;padding:10px 50px;border-radius:80px;text-shadow:none">🔔 Suscríbete a PequeMundo</div></div>`, 3.5);
    video(segs, snd, `youtube/shorts/short-${k}.mp4`);
    const names = ids.map((i) => byId[i].name.es.toLowerCase());
    writeFileSync(`youtube/shorts/short-${k}.txt`, `TÍTULO:
¿Adivinas qué animal es? 🔊 ${theme} | PequeMundo #shorts

DESCRIPCIÓN:
Escucha el sonido real y adivina el animal antes de que acabe la cuenta atrás. Hoy: ${names.join(', ')}. ¿Cuántos has acertado? 🦁🐮🐧
Sonidos reales grabados en la naturaleza y nombres en español e inglés.

📲 Más de 170 animales en la app Mundo de Sonidos (gratis, sin anuncios): ${PLAY}

Sonidos: ${ids.map((i) => `${byId[i].name.es}: ${byId[i].credit?.author} (${byId[i].credit?.license})`).join(' · ')}
Dibujos: Fluent Emoji de Microsoft (MIT).

ETIQUETAS:
pequemundo, sonidos de animales, adivina el animal, animales para niños, ${names.join(', ')}, aprender animales, animales en inglés, videos para niños, infantil, educativo

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
Sonidos para dormir bebés y niños 🌙 Lluvia suave, grillos y búhos (${HOURS} hora${HOURS > 1 ? 's' : ''}) | PequeMundo

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
  // Marca del canal «PequeMundo»: planeta con animales asomando (icono), logotipo con nombre, banner y marca de agua.
  mkdirSync('youtube/canal', { recursive: true });
  const A = (id, s, x, y, r = 0) => `<img src="${art64(byId[id])}" style="position:absolute;width:${s}px;height:${s}px;left:${x}px;top:${y}px;transform:rotate(${r}deg);filter:drop-shadow(0 ${s * 0.05}px ${s * 0.05}px rgba(0,0,0,.25))">`;
  const planet = (S) => `<div style="position:relative;width:${S}px;height:${S}px">
    <div style="position:absolute;inset:${S * 0.16}px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#7fd6ff,#2f8fd8 70%);box-shadow:inset -${S * 0.04}px -${S * 0.05}px 0 rgba(0,0,0,.12),0 ${S * 0.03}px ${S * 0.06}px rgba(0,0,0,.25);overflow:hidden">
      <div style="position:absolute;left:8%;top:22%;width:45%;height:30%;background:#7ed957;border-radius:48% 52% 40% 60%"></div>
      <div style="position:absolute;right:4%;top:48%;width:42%;height:34%;background:#5fc148;border-radius:60% 40% 55% 45%"></div>
      <div style="position:absolute;left:20%;bottom:6%;width:30%;height:16%;background:#8be36a;border-radius:50%"></div></div>
    ${A('leon', S * 0.36, S * 0.32, S * 0.0)}${A('elefante', S * 0.3, S * 0.0, S * 0.5, -12)}${A('pinguino', S * 0.27, S * 0.72, S * 0.52, 12)}
    ${A('mono', S * 0.26, S * 0.02, S * 0.12, -18)}${A('pulpo', S * 0.24, S * 0.72, S * 0.12, 16)}${A('vaca', S * 0.3, S * 0.35, S * 0.7)}</div>`;
  const word = (fs) => `<div class="t" style="font-size:${fs}px;letter-spacing:-1px"><span style="color:#ffd84a;text-shadow:0 ${fs * 0.06}px 0 #e2457a,0 ${fs * 0.1}px ${fs * 0.2}px rgba(0,0,0,.2)">Peque</span><span style="color:#fff;text-shadow:0 ${fs * 0.06}px 0 #2f8fd8,0 ${fs * 0.1}px ${fs * 0.2}px rgba(0,0,0,.2)">Mundo</span></div>`;
  const sky = 'background:radial-gradient(circle at 50% 30%,#ffe9a8,#ffc94a 45%,#ff9a3c)';
  await png(`<div class="c" style="${sky}">${planet(700)}</div>`, 'youtube/canal/icono.png', 800, 800);
  await png(`<div class="c" style="${sky}">${planet(600)}${word(150)}</div>`, 'youtube/canal/logo.png', 1000, 1000);
  await png(`<div class="c" style="background:transparent">${planet(150)}</div>`, 'youtube/canal/marca-de-agua.png', 150, 150);
  // Banner 2560x1440: lo importante dentro de la zona segura central (1546x423)
  const parade = ['vaca', 'leon', 'elefante', 'pinguino', 'ballena', 'mono', 'buho', 'pulpo', 't-rex', 'loro', 'rana', 'jirafa'];
  await png(`<div class="c" style="background:linear-gradient(#7cc8ff,#dff3ff 58%,#9bd67a 58.2%,#5fb648)">
    <div style="position:absolute;left:90px;top:610px;display:flex;gap:24px">${parade.slice(0, 4).map((i) => `<img src="${art64(byId[i])}" style="width:120px;height:120px">`).join('')}</div>
    <div style="position:absolute;right:90px;top:610px;display:flex;gap:24px">${parade.slice(8).map((i) => `<img src="${art64(byId[i])}" style="width:120px;height:120px">`).join('')}</div>
    <div style="position:absolute;top:520px;left:0;right:0;display:flex;flex-direction:column;align-items:center">${word(170)}
      <div class="t" style="font-size:46px;color:#23324a;text-shadow:none;margin-top:4px">Animales · Adivinanzas · Inglés · Para dormir</div>
      <div class="t" style="margin-top:22px;font-size:40px;color:#fff;background:#e2457a;padding:6px 34px;border-radius:60px;text-shadow:none">🎮 Juega con 177 animales en la app «Mundo de Sonidos»</div></div></div>`, 'youtube/canal/banner.png', 2560, 1440);
  writeFileSync('youtube/canal/descripcion.txt', `NOMBRE DEL CANAL: PequeMundo
IDENTIFICADOR: @pequemundo (o @pequemundo.oficial si está cogido)

DESCRIPCIÓN DEL CANAL:
¡Bienvenidos a PequeMundo! 🌍 Vídeos para que los peques aprendan jugando: sonidos reales de animales, adivinanzas, palabras en inglés, curiosidades y sonidos para dormir. 🦁🐘🐧🌙
Vídeos tranquilos, sin gritos ni sustos, pensados para niños de 2 a 8 años y sus familias.

🎮 ¿Os gustan los animales? Jugad con más de 170 en nuestra app «Mundo de Sonidos»: sonidos reales, juegos, álbum de pegatinas y modo calma. Gratis y sin anuncios en Google Play 👉 ${PLAY}

📅 Nuevo vídeo cada día.

ENLACES (Personalizar canal → Información básica → Enlaces):
- App Mundo de Sonidos → ${PLAY}

PALABRAS CLAVE (Configuración → Canal → Información básica → Palabras clave):
pequemundo, videos para niños, sonidos de animales, adivina el animal, animales para niños, aprender inglés niños, sonidos para dormir bebés, educación infantil, aprender jugando, mundo de sonidos

MARCA DE AGUA (Personalizar canal → Branding → Marca de agua del vídeo): marca-de-agua.png, «Todo el vídeo».

PÚBLICO: Configuración → Canal → Configuración avanzada → «Sí, establecer este canal como creado para niños».
`);
  console.log('✓ canal PequeMundo');
}
await b.close(); rmSync(TMP, { recursive: true, force: true });
