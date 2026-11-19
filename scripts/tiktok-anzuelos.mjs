// 3 vídeos cortos (15 s, 1080x1920) para TikTok que llevan a los vídeos largos de dormir en YouTube.
//   node scripts/tiktok-anzuelos.mjs   → youtube/tiktok/anzuelo-{lluvia,olas,marron}.mp4 + .txt
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
const OUT = 'youtube/tiktok', TMP = 'youtube/.tmp-tt'; mkdirSync(OUT, { recursive: true }); rmSync(TMP, { recursive: true, force: true }); mkdirSync(TMP, { recursive: true });
const ff = (...a) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...a], { stdio: 'inherit' });
const D = 15;
const icon = readFileSync('docs/tienda/icono-512.png').toString('base64');
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
const FONT = '<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@800&display=swap" rel="stylesheet">';
const layer = async (html, f) => { await p.setContent(`<html><head>${FONT}</head><body style="margin:0;width:1080px;height:1920px;background:transparent;font-family:'Baloo 2';color:#fff;position:relative">${html}</body></html>`); await p.waitForTimeout(600); await p.screenshot({ path: f, omitBackground: true }); };
const T = (t, fs, c = '#fff') => `<div style="font-size:${fs}px;line-height:1.02;color:${c};text-shadow:0 6px 0 rgba(0,0,0,.35),0 10px 30px rgba(0,0,0,.6)">${t}</div>`;
const end = `<div style="position:absolute;left:0;right:0;top:1220px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:24px">
  <img src="data:image/png;base64,${icon}" style="width:220px;height:220px;border-radius:50px;box-shadow:0 20px 40px rgba(0,0,0,.5)">
  ${T('Vídeo completo en YouTube', 70)}<div style="font-size:88px;background:#ff0033;padding:6px 44px;border-radius:70px;box-shadow:0 12px 30px rgba(0,0,0,.4)">▶ PequeMundo</div></div>`;
const CLIPS = [
  { id: 'lluvia', src: 'youtube/largos/dormir-1h-v2.mp4', bg: 'still:youtube/largos/fondo-noche.png', ss: 300,
    a: [T('¿Tu peque', 130), T('no se duerme?', 130), T('😴', 160)], b: [T('Prueba con', 90, '#fff6c8'), T('lluvia suave 🌧️', 120), T('1 hora · pantalla oscura', 70, '#cfe0ff')],
    title: '¿Tu peque no se duerme? 😴🌧️ Prueba con lluvia suave. Vídeo completo de 1 hora (pantalla oscura) en nuestro YouTube: PequeMundo 🌙' },
  { id: 'olas', top: 640, src: 'youtube/largos/olas-1h.mp4', bg: 'video', ss: 600,
    a: [T('Olas del mar', 120), T('para dormir 🌊', 120)], b: [T('El sonido que', 90, '#fff6c8'), T('calma a los peques', 100), T('1 hora · imagen de noche', 70, '#cfe0ff')],
    title: 'Olas del mar de noche para dormir 🌊🌙 Así se relaja mi peque antes de dormir. Vídeo completo de 1 hora en nuestro YouTube: PequeMundo' },
  { id: 'marron', src: 'youtube/largos/ruido-marron-3h.mp4', bg: 'still:youtube/largos/fondo-noche.png', ss: 900,
    a: [T('El sonido que usan', 100), T('los padres para', 100), T('dormir al bebé 🤫', 110)], b: [T('Se llama', 90, '#fff6c8'), T('RUIDO MARRÓN', 130, '#ffd9a8'), T('más suave que el ruido blanco', 64, '#cfe0ff')],
    title: 'El sonido que usan muchos padres para dormir al bebé 🤫 Se llama ruido marrón: más suave y grave que el ruido blanco. 3 horas completas en nuestro YouTube: PequeMundo 🌙' },
];
for (const c of CLIPS) {
  await layer(`<div style="position:absolute;left:60px;right:60px;top:${c.top ?? 330}px;text-align:center">${c.a.join('')}</div>`, `${TMP}/${c.id}-a.png`);
  await layer(`<div style="position:absolute;left:60px;right:60px;top:${c.top ?? 330}px;text-align:center">${c.b.join('')}</div>${end}`, `${TMP}/${c.id}-b.png`);
  const base = c.bg === 'video'
    ? ['-ss', String(c.ss), '-t', String(D), '-i', c.src]
    : ['-loop', '1', '-framerate', '30', '-t', String(D), '-i', c.bg.slice(6)];
  const vf0 = c.bg === 'video'
    ? '[0:v]scale=-2:1920,crop=1080:1920:iw*0.7-540:0,fps=30,eq=brightness=0.02[bg]'
    : "[0:v]scale=3413:1920,crop=1080:1920:'(iw-1080)/2+120*t/15':0,fps=30[bg]";
  const audio = c.bg === 'video' ? [] : ['-ss', String(c.ss), '-t', String(D), '-i', c.src];
  const ai = c.bg === 'video' ? '0:a' : '3:a';
  ff(...base, '-loop', '1', '-t', String(D), '-i', `${TMP}/${c.id}-a.png`, '-loop', '1', '-t', String(D), '-i', `${TMP}/${c.id}-b.png`, ...audio,
    '-filter_complex', `${vf0};[1:v]format=rgba,fade=t=in:st=0.2:d=0.5:alpha=1,fade=t=out:st=6.5:d=0.5:alpha=1[ta];[2:v]format=rgba,fade=t=in:st=7:d=0.6:alpha=1[tb];[bg][ta]overlay=0:0[v1];[v1][tb]overlay=0:0,format=yuv420p[v];[${ai}]afade=t=in:d=0.8,afade=t=out:st=${D - 1.2}:d=1.2[aout]`,
    '-map', '[v]', '-map', '[aout]', '-t', String(D), '-c:v', 'libx264', '-crf', '21', '-preset', 'medium', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', `${OUT}/anzuelo-${c.id}.mp4`);
  writeFileSync(`${OUT}/anzuelo-${c.id}.txt`, `DESCRIPCIÓN TIKTOK:\n${c.title}\n\n🎮 Y para el día: más de 170 animales con su sonido real en la app «Mundo de Sonidos» (gratis, sin anuncios, Google Play)\n\n#dormirbebe #sonidosparadormir #rutinadesueño #mamaprimeriza #papaprimerizo #crianza #bebes #trucosdemama #fyp #parati\n`);
  console.log('✓', c.id);
}
await b.close(); rmSync(TMP, { recursive: true, force: true });
