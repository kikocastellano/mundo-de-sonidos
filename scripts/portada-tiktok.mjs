// Portada vertical (1080x1920) para TikTok/Shorts. Lo importante cabe en el recorte 3:4 del perfil (1080x1440 centrado).
//   node scripts/portada-tiktok.mjs vaca,gallo,cerdo "Animales de la granja" youtube/portadas/short-01.png
import { chromium } from 'playwright';
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
const [ids, tema, out] = [process.argv[2].split(','), process.argv[3], process.argv[4]];
const ART = JSON.parse(readFileSync('src/art.json', 'utf8'));
const art = (id) => `data:image/svg+xml;base64,${readFileSync(`public/art/${ART[id]}`).toString('base64')}`;
mkdirSync(dirname(out), { recursive: true });
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
const sil = ids.map((id, k) => `<div style="position:relative;width:290px;height:290px;transform:rotate(${[-8, 4, 9][k]}deg)">
  <div style="position:absolute;inset:0;background:#fff;border-radius:60px;box-shadow:0 18px 40px rgba(0,0,0,.25)"></div>
  <img src="${art(id)}" style="position:absolute;left:30px;top:30px;width:240px;height:240px;filter:brightness(0) opacity(.85)">
  <div style="position:absolute;right:-18px;top:-22px;width:86px;height:86px;border-radius:50%;background:#ff3d6e;color:#fff;font:800 64px 'Baloo 2';display:grid;place-items:center;box-shadow:0 8px 16px rgba(0,0,0,.25)">?</div></div>`).join('');
await p.setContent(`<html><head><link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@800&display=swap" rel="stylesheet"></head>
<body style="margin:0;width:1080px;height:1920px;overflow:hidden;font-family:'Baloo 2';background:radial-gradient(circle at 50% 35%,#fff3a8,#ffcf3f 40%,#ff9a3c 80%)">
<div style="position:absolute;inset:0;background:repeating-conic-gradient(from 0deg at 50% 38%,rgba(255,255,255,.18) 0 10deg,transparent 10deg 20deg)"></div>
<div style="position:absolute;top:300px;left:0;right:0;text-align:center;color:#fff;line-height:.92;text-shadow:0 10px 0 #e2457a,0 18px 34px rgba(0,0,0,.25)">
  <div style="font-size:170px">¿ADIVINAS</div><div style="font-size:150px">EL ANIMAL?</div></div>
<div style="position:absolute;top:760px;left:0;right:0;display:flex;justify-content:center;gap:30px">${sil}</div>
<div style="position:absolute;top:1170px;left:0;right:0;display:flex;justify-content:center"><div style="background:#23324a;color:#fff;font-size:70px;padding:10px 50px;border-radius:80px;box-shadow:0 12px 24px rgba(0,0,0,.25)">🔊 ${tema}</div></div>
<div style="position:absolute;top:1330px;left:0;right:0;text-align:center;font-size:72px;color:#5a2d00">¿Cuántos aciertas? 🤔</div>
</body></html>`);
await p.waitForTimeout(800); await p.screenshot({ path: out }); await b.close(); console.log('✓', out);
