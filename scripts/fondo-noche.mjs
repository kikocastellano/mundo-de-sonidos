import { chromium } from 'playwright';
const b = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
const st = Array.from({ length: 140 }, (_, i) => { const x = (i * 197.3) % 1920, y = (i * 83.7 + (i % 7) * 131) % 1080, s = 1.5 + (i % 4) * 1.2; return `<div style="position:absolute;left:${x}px;top:${y}px;width:${s}px;height:${s}px;border-radius:50%;background:#fff;opacity:${0.35 + (i % 5) / 10};box-shadow:0 0 ${s * 2}px rgba(255,255,255,.6)"></div>`; }).join('');
await p.setContent(`<body style="margin:0;width:1920px;height:1080px;overflow:hidden;background:radial-gradient(circle at 75% 25%,#26306e,#0b1440 55%,#050820)">${st}</body>`);
await p.screenshot({ path: process.argv[2] }); await b.close();
