// Genera el icono, la pantalla de carga y la imagen destacada de Google Play a partir de HTML/SVG.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
mkdirSync('assets', { recursive: true }); mkdirSync('docs/tienda', { recursive: true });

const scene = (w, h, extra) => `<!doctype html><html><body style="margin:0">
<div style="width:${w}px;height:${h}px;position:relative;overflow:hidden;background:linear-gradient(#6fc0ff,#d9f1ff);font-family:'Baloo 2',ui-rounded,system-ui,sans-serif">
<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" style="position:absolute;inset:0">
  <circle cx="${w * 0.8}" cy="${h * 0.2}" r="${Math.min(w, h) * 0.2}" fill="#fff3a0" opacity=".5"/>
  <circle cx="${w * 0.8}" cy="${h * 0.2}" r="${Math.min(w, h) * 0.1}" fill="#ffd93b"/>
  <ellipse cx="${w * 0.22}" cy="${h * 0.22}" rx="${w * 0.13}" ry="${h * 0.05}" fill="#fff" opacity=".9"/>
  <path d="M0 ${h * 0.7} C${w * 0.3} ${h * 0.58} ${w * 0.6} ${h * 0.66} ${w} ${h * 0.6} V${h} H0Z" fill="#9bd67a"/>
  <path d="M0 ${h * 0.82} C${w * 0.35} ${h * 0.74} ${w * 0.65} ${h * 0.84} ${w} ${h * 0.76} V${h} H0Z" fill="#5fb648"/>
</svg>${extra}</div></body></html>`;

const emoji = (e, size, x, y) => `<div style="position:absolute;left:${x}px;top:${y}px;font-size:${size}px;line-height:1;font-family:'Noto Color Emoji';filter:drop-shadow(0 ${size * 0.05}px ${size * 0.04}px rgba(0,0,0,.25))">${e}</div>`;

const b = await chromium.launch();
const shot = async (html, w, h, path) => { const p = await b.newPage({ viewport: { width: w, height: h } }); await p.setContent(html); await p.waitForTimeout(400); await p.screenshot({ path }); await p.close(); };

// Icono 1024 (Play pide 512; Capacitor genera el resto)
await shot(scene(1024, 1024, emoji('🦁', 520, 262, 300) + `<div style="position:absolute;left:690px;top:120px;width:200px;height:200px;border-radius:50%;background:#fff;display:grid;place-items:center;box-shadow:0 12px 30px rgba(0,0,0,.2)"><svg viewBox="0 0 24 24" width="140" height="140" fill="none" stroke="#2bb06a" stroke-width="2.4" stroke-linecap="round"><path d="M4 9h4l5-4v14l-5-4H4z" fill="#2bb06a"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg></div>`), 1024, 1024, 'assets/icon-only.png');
await shot(scene(1024, 1024, ''), 1024, 1024, 'assets/icon-background.png');
const fg = `<!doctype html><html><body style="margin:0;background:transparent">${emoji('🦁', 470, 277, 300)}</body></html>`;
{ const p = await b.newPage({ viewport: { width: 1024, height: 1024 } }); await p.setContent(fg); await p.waitForTimeout(300); await p.screenshot({ path: 'assets/icon-foreground.png', omitBackground: true }); await p.close(); }
// Pantalla de carga
await shot(scene(2732, 2732, emoji('🦁', 700, 1016, 900) + `<div style="position:absolute;left:0;right:0;top:1680px;text-align:center;font-size:200px;font-weight:800;color:#fff;text-shadow:0 10px 0 #e2457a">Mundo de Sonidos</div>`), 2732, 2732, 'assets/splash.png');
// Imagen destacada de Google Play (1024x500)
const parade = ['🐄', '🦁', '🐘', '🐧', '🐸', '🦒', '🦉', '🐬'].map((e, i) => emoji(e, 92, 70 + i * 112, 330)).join('');
await shot(scene(1024, 500, `<div style="position:absolute;left:0;right:0;top:70px;text-align:center;color:#fff;font-weight:800;font-size:92px;line-height:.95;text-shadow:0 7px 0 #e2457a,0 12px 24px rgba(0,0,0,.2)"><div style="font-size:44px;color:#fff7c2;text-shadow:0 4px 0 #f08a24">Mundo de</div>Sonidos</div><div style="position:absolute;left:0;right:0;top:240px;text-align:center;font-size:30px;font-weight:800;color:#23324a">Sonidos reales · Sin anuncios · Pago único</div>${parade}`), 1024, 500, 'docs/tienda/destacada.png');
await b.close();
console.log('assets listos');
