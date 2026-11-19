// Vídeos largos para dormir del canal PequeMundo.
//   node scripts/youtube-dormir.mjs olas      → youtube/largos/olas-1h.mp4      (mar de noche con olas en movimiento)
//   node scripts/youtube-dormir.mjs marron    → youtube/largos/ruido-marron-3h.mp4 (cielo estrellado)
//   node scripts/youtube-dormir.mjs miniaturas
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';

const MODE = process.argv[2];
const OUT = 'youtube/largos', TMP = 'youtube/.tmp-dormir';
mkdirSync(OUT, { recursive: true }); rmSync(TMP, { recursive: true, force: true }); mkdirSync(TMP, { recursive: true });
const ff = (...a) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...a], { stdio: 'inherit' });
const PLAY = 'https://play.google.com/store/apps/details?id=com.kikocastellano.mundodesonidos';
const txt = (file, title, desc, tags) => writeFileSync(`${OUT}/${file}.txt`, `TÍTULO:\n${title}\n\nDESCRIPCIÓN:\n${desc}\n\n🎮 Jugad con más de 170 animales y sus sonidos reales en nuestra app «Mundo de Sonidos» (gratis y sin anuncios): ${PLAY}\n\n🔔 Suscríbete a PequeMundo: vídeos tranquilos para aprender y dormir.\n\nETIQUETAS:\npequemundo, ${tags}\n\nAJUSTES: Público → «Sí, es contenido creado para niños» · Uso de IA → No · Lista: «Sonidos para dormir».\n`);

/** Imagen fija (1 fps) + audio → mp4 ligero. */
function still(png, audio, secs, out) {
  ff('-loop', '1', '-framerate', '1', '-i', png, '-i', audio, '-t', String(secs), '-c:v', 'libx264', '-tune', 'stillimage', '-preset', 'veryfast', '-crf', '30',
    '-pix_fmt', 'yuv420p', '-r', '1', '-c:a', 'copy', '-movflags', '+faststart', out);
}
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 1280, height: 720 } });

if (MODE === 'olas') {
  // Animación en bucle perfecto de 12 s (todo se mueve con periodos que dividen 12 s)
  const L = 12, FPS = 15, N = L * FPS;
  await page.setContent(`<body style="margin:0;background:#000"><canvas id="c" width="1280" height="720"></canvas><script>
  const c = document.getElementById('c'), x = c.getContext('2d'); const W = 1280, H = 720, HZ = 400;
  const stars = Array.from({ length: 110 }, (_, i) => ({ x: (i * 197.3) % W, y: (i * 61.7 + (i % 7) * 37) % (HZ - 30), r: 0.6 + (i % 4) * 0.45, p: i * 0.7 }));
  window.draw = (t) => { // t en [0,1)
    const T = 2 * Math.PI * t;
    let g = x.createLinearGradient(0, 0, 0, HZ); g.addColorStop(0, '#04071a'); g.addColorStop(1, '#14204f'); x.fillStyle = g; x.fillRect(0, 0, W, HZ);
    for (const s of stars) { x.globalAlpha = 0.45 + 0.35 * Math.sin(T * 2 + s.p); x.fillStyle = '#fff'; x.beginPath(); x.arc(s.x, s.y, s.r, 0, 7); x.fill(); }
    x.globalAlpha = 1;
    const mx = 900, my = 150; let mg = x.createRadialGradient(mx, my, 20, mx, my, 160); mg.addColorStop(0, 'rgba(255,246,200,.35)'); mg.addColorStop(1, 'rgba(255,246,200,0)'); x.fillStyle = mg; x.fillRect(mx - 160, my - 160, 320, 320);
    x.fillStyle = '#fff3c4'; x.beginPath(); x.arc(mx, my, 48, 0, 7); x.fill();
    g = x.createLinearGradient(0, HZ, 0, H); g.addColorStop(0, '#0d1a45'); g.addColorStop(1, '#030716'); x.fillStyle = g; x.fillRect(0, HZ, W, H - HZ);
    // reflejo de la luna: franjas que brillan y se mueven suavemente
    for (let k = 0; k < 26; k++) { const yy = HZ + 6 + k * k * 0.45; const w = 30 + k * 7 + 18 * Math.sin(T * 2 + k); const off = 10 * Math.sin(T + k * 0.6);
      x.globalAlpha = (0.5 - k * 0.016) * (0.6 + 0.4 * Math.sin(T * 3 + k * 1.3)); x.fillStyle = '#fff3c4'; x.fillRect(mx - w / 2 + off, yy, w, 2 + k * 0.12); }
    x.globalAlpha = 1;
    // capas de olas
    for (let l = 0; l < 7; l++) { const base = HZ + 20 + l * l * 7 + l * 14, amp = 2 + l * 1.6, len = 140 + l * 60, sp = l % 2 ? 1 : -1;
      x.beginPath(); x.moveTo(0, H); for (let px = 0; px <= W; px += 8) x.lineTo(px, base + amp * Math.sin(px / len * 2 * Math.PI + sp * T) + amp * 0.5 * Math.sin(px / (len * 0.53) * 2 * Math.PI - sp * 2 * T));
      x.lineTo(W, H); x.closePath(); x.fillStyle = 'rgba(' + (12 + l * 2) + ',' + (24 + l * 3) + ',' + (66 - l * 4) + ',0.55)'; x.fill();
      x.strokeStyle = 'rgba(160,190,255,' + (0.05 + l * 0.012) + ')'; x.lineWidth = 1.2; x.stroke(); }
  }; </script></body>`);
  for (let i = 0; i < N; i++) { await page.evaluate((t) => window.draw(t), i / N); await page.screenshot({ path: `${TMP}/f${String(i).padStart(4, '0')}.png` }); }
  ff('-framerate', String(FPS), '-i', `${TMP}/f%04d.png`, '-c:v', 'libx264', '-preset', 'slow', '-crf', '30', '-pix_fmt', 'yuv420p', '-g', String(N), `${TMP}/loop.mp4`);
  await page.screenshot({ path: `${OUT}/fondo-olas.png` });
  const secs = 3600;
  // Olas: ruido rosa/marrón filtrado con oleaje lento (subidas y bajadas cada ~9 s), estéreo
  ff('-f', 'lavfi', '-i', `anoisesrc=c=pink:d=${secs}:a=0.6,lowpass=f=1400,highpass=f=60`, '-f', 'lavfi', '-i', `anoisesrc=c=brown:d=${secs}:a=0.6:seed=7,lowpass=f=500`,
    '-filter_complex', `[0:a]tremolo=f=0.13:d=0.85,volume=0.9[w1];[1:a]tremolo=f=0.1:d=0.6,volume=0.8[w2];[w1][w2]amix=2:normalize=0,afade=t=in:d=4,afade=t=out:st=${secs - 6}:d=6,pan=stereo|c0=c0|c1=c0,aecho=0.6:0.4:40:0.25,volume=4.5,alimiter=limit=0.7[a]`,
    '-map', '[a]', '-c:a', 'aac', '-b:a', '96k', `${TMP}/olas.m4a`);
  ff('-stream_loop', String(Math.ceil(secs / L)), '-i', `${TMP}/loop.mp4`, '-i', `${TMP}/olas.m4a`, '-map', '0:v', '-map', '1:a', '-c', 'copy', '-t', String(secs), '-movflags', '+faststart', `${OUT}/olas-1h.mp4`);
  txt('olas-1h', 'Olas del mar de noche para dormir bebés 🌊 1 hora · sonido relajante',
    '1 hora de olas suaves del mar de noche, con la luna reflejada en el agua y un movimiento muy lento, para dormir y relajar a bebés y niños. Imagen oscura y tranquila para dejarlo en la tele o el móvil. 🌙',
    'olas del mar, sonido del mar para dormir, olas para dormir bebés, ruido de olas, sonidos para dormir, dormir bebés, mar de noche, sonidos relajantes, relajación niños, ruido blanco');
}

if (MODE === 'marron') {
  const secs = 3 * 3600;
  ff('-f', 'lavfi', '-i', `anoisesrc=c=brown:d=${secs}:a=0.7`, '-af', `lowpass=f=700,highpass=f=40,volume=0.9,afade=t=in:d=5,afade=t=out:st=${secs - 8}:d=8`, '-ac', '1', '-c:a', 'aac', '-b:a', '64k', `${TMP}/marron.m4a`);
  still('youtube/largos/fondo-noche.png', `${TMP}/marron.m4a`, secs, `${OUT}/ruido-marron-3h.mp4`);
  txt('ruido-marron-3h', 'Ruido marrón para dormir bebés 🌙 3 horas · pantalla oscura',
    '3 horas de ruido marrón: un sonido grave, suave y constante (más agradable que el ruido blanco) que ayuda a dormir a bebés y niños y tapa los ruidos de casa. Cielo estrellado y pantalla oscura. 🌙',
    'ruido marrón, ruido marrón para dormir, ruido blanco bebé, ruido blanco para dormir, dormir bebés, sonidos para dormir, brown noise, ruido para dormir, relajación niños, sonido constante');
}

if (MODE === 'miniaturas') {
  const FONT = '<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@800&display=swap" rel="stylesheet">';
  const ART = JSON.parse(readFileSync('src/art.json', 'utf8'));
  const art = (id) => `data:image/svg+xml;base64,${readFileSync(`public/art/${ART[id]}`).toString('base64')}`;
  const stars = Array.from({ length: 60 }, (_, i) => `<div style="position:absolute;left:${(i * 197) % 1280}px;top:${(i * 83) % 720}px;width:${3 + (i % 3) * 2}px;height:${3 + (i % 3) * 2}px;border-radius:50%;background:#fff;opacity:${0.5 + (i % 4) / 8}"></div>`).join('');
  const T = (t, fs, c) => `<div style="font-family:'Baloo 2';font-weight:800;font-size:${fs}px;line-height:1;color:${c};text-shadow:0 8px 0 rgba(0,0,0,.25),0 14px 30px rgba(0,0,0,.35)">${t}</div>`;
  const pill = (t) => `<div style="position:absolute;left:60px;bottom:60px;font-family:'Baloo 2';font-weight:800;font-size:46px;color:#0b1440;background:#fff6c8;padding:4px 28px;border-radius:40px">${t}</div>`;
  const zz = `<div style="position:absolute;left:1010px;top:170px;font-family:'Baloo 2';font-weight:800;font-size:110px;color:#fff6c8;transform:rotate(-12deg)">z<span style="font-size:82px">z</span><span style="font-size:60px">z</span></div>`;
  const shot = async (html, f) => { await page.setContent(`<html><head>${FONT}</head><body style="margin:0;width:1280px;height:720px;overflow:hidden;position:relative">${html}</body></html>`); await page.waitForTimeout(500); await page.screenshot({ path: `youtube/miniaturas/${f}` }); };
  mkdirSync('youtube/miniaturas', { recursive: true });
  // Olas: el propio fotograma del mar + texto
  const sea = readFileSync(`${OUT}/fondo-olas.png`).toString('base64');
  await shot(`<img src="data:image/png;base64,${sea}" style="position:absolute;inset:0;width:1280px;height:720px"><div style="position:absolute;left:60px;top:110px">${T('OLAS DEL MAR', 128, '#fff6c8')}${T('🌊 1 HORA', 110, '#fff')}</div>${pill('para dormir bebés')}`, 'olas-1h.png');
  await shot(`<div style="position:absolute;inset:0;background:radial-gradient(circle at 70% 35%,#5a3b2a,#1a0f0a 75%)">${stars}<img src="${art('oso-polar')}" style="position:absolute;left:720px;top:250px;width:470px;height:470px;filter:drop-shadow(0 20px 30px rgba(0,0,0,.5))">${zz}
    <div style="position:absolute;left:60px;top:130px">${T('RUIDO', 150, '#ffd9a8')}${T('MARRÓN', 150, '#fff')}${T('3 HORAS', 90, '#ffd9a8')}</div>${pill('pantalla oscura')}</div>`, 'ruido-marron-3h.png');
}
await b.close(); rmSync(TMP, { recursive: true, force: true });
console.log('✓', MODE);
