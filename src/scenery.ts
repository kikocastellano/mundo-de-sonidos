// Paisaje animado de fondo (SVG + animaciones CSS). Cambia de colores y de detalles según la región.
import { REGIONS, type RegionId } from './data';

const cloud = (x: number, y: number, s: number, cls: string) => `
  <g class="cloud ${cls}" style="--x:${x}px"><g transform="translate(0 ${y}) scale(${s})">
    <ellipse cx="0" cy="0" rx="90" ry="38" /><circle cx="-38" cy="-18" r="40" /><circle cx="22" cy="-34" r="52" /><circle cx="70" cy="-8" r="34" />
  </g></g>`;

const tree = (x: number, y: number, s: number, d: number) => `
  <g class="tree" transform="translate(${x} ${y}) scale(${s})"><g class="sway" style="animation-delay:${d}s">
    <rect x="-7" y="-10" width="14" height="70" rx="6" fill="#8a5a33"/>
    <circle cx="0" cy="-40" r="46" class="leaf1"/><circle cx="-30" cy="-12" r="32" class="leaf2"/><circle cx="32" cy="-14" r="34" class="leaf2"/>
    <circle cx="-14" cy="-58" r="16" fill="#fff" opacity=".18"/>
  </g></g>`;

const acacia = (x: number, y: number, s: number) => `
  <g transform="translate(${x} ${y}) scale(${s})"><g class="sway slow">
    <path d="M-4 60 L-2 -10 L-40 -40 M-2 -10 L30 -45" stroke="#6b4423" stroke-width="10" fill="none" stroke-linecap="round"/>
    <ellipse cx="-5" cy="-55" rx="95" ry="22" fill="#5f8f35"/><ellipse cx="-10" cy="-65" rx="70" ry="16" fill="#79a945"/>
  </g></g>`;

const pine = (x: number, y: number, s: number, snow: boolean) => `
  <g transform="translate(${x} ${y}) scale(${s})"><g class="sway slow">
    <rect x="-6" y="30" width="12" height="30" fill="#6b4423"/>
    <path d="M0 -90 L45 0 L25 0 L55 40 L-55 40 L-25 0 L-45 0 Z" fill="#2f7a4a"/>
    ${snow ? '<path d="M0 -90 L18 -54 L6 -60 L-6 -50 L-18 -54 Z" fill="#fff"/>' : ''}
  </g></g>`;

const flower = (x: number, y: number, c: string, d: number) => `
  <g transform="translate(${x} ${y})"><g class="sway fast" style="animation-delay:${d}s">
    <path d="M0 0 Q3 -14 0 -26" stroke="#3f8f3a" stroke-width="3" fill="none"/>
    <g transform="translate(0 -28)">${[0, 72, 144, 216, 288].map((r) => `<ellipse rx="5" ry="9" transform="rotate(${r}) translate(0 -7)" fill="${c}"/>`).join('')}<circle r="4.5" fill="#ffd23f"/></g>
  </g></g>`;

const bird = (x: number, y: number, d: number, dur: number) => `
  <g class="bird" style="--y:${y}px; animation-delay:${d}s; animation-duration:${dur}s"><g transform="translate(${x} 0)">
    <path class="wing" d="M-16 0 Q-8 -10 0 0 Q8 -10 16 0" stroke="#2c3e50" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  </g></g>`;

const butterfly = (d: number, c: string) => `
  <g class="butterfly" style="animation-delay:${d}s"><g class="flap">
    <ellipse cx="-7" cy="0" rx="8" ry="11" fill="${c}"/><ellipse cx="7" cy="0" rx="8" ry="11" fill="${c}"/>
    <rect x="-1.5" y="-8" width="3" height="16" rx="1.5" fill="#333"/>
  </g></g>`;

let flowers = '';
for (let i = 0; i < 26; i++) {
  const x = 40 + i * 61 + ((i * 37) % 23);
  flowers += flower(x, 860 + ((i * 13) % 30), ['#ff6b8b', '#ffd23f', '#ffffff', '#b07cff', '#ff9a3c'][i % 5], (i % 7) * 0.3);
}

const SVG = `
<svg class="scene-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="sky-top"/><stop offset="1" class="sky-bot"/></linearGradient>
    <radialGradient id="sunGlow"><stop offset="0" stop-color="#fff6c2" stop-opacity=".95"/><stop offset=".45" stop-color="#ffe066" stop-opacity=".45"/><stop offset="1" stop-color="#ffe066" stop-opacity="0"/></radialGradient>
    <linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5ec8f2"/><stop offset="1" stop-color="#1b7fc4"/></linearGradient>
    <linearGradient id="deep" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c9be0"/><stop offset="1" stop-color="#0b4f8a"/></linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#sky)"/>
  <g class="sun"><circle cx="1290" cy="170" r="230" fill="url(#sunGlow)"/>
    <g class="rays">${Array.from({ length: 12 }, (_, i) => `<rect x="-6" y="-150" width="12" height="44" rx="6" fill="#ffe066" opacity=".55" transform="rotate(${i * 30})"/>`).join('')}</g>
    <circle cx="1290" cy="170" r="78" fill="#ffd93b"/><circle cx="1268" cy="150" r="26" fill="#fff3a8" opacity=".7"/>
  </g>
  <g class="clouds far">${cloud(-200, 150, 0.8, 'c1')}${cloud(-200, 260, 0.6, 'c2')}${cloud(-200, 90, 0.5, 'c3')}</g>
  <g class="birds">${bird(0, 220, 0, 26)}${bird(40, 250, 0.4, 26)}${bird(-30, 265, 0.8, 26)}${bird(0, 140, 9, 34)}</g>
  <path class="mount" d="M0 560 L180 380 L300 470 L470 300 L640 480 L780 390 L960 520 L1120 340 L1300 470 L1450 380 L1600 470 L1600 900 L0 900Z"/>
  <path class="snowcaps" d="M470 300 L520 352 L495 345 L470 362 L445 345 L420 352Z M1120 340 L1165 385 L1140 380 L1120 395 L1098 380 L1075 385Z M180 380 L215 415 L195 410 L180 422 L165 410 L145 415Z"/>
  <path class="hill1" d="M0 620 C200 540 380 560 560 610 C760 665 900 560 1100 570 C1300 580 1450 640 1600 600 L1600 900 L0 900Z"/>
  <g class="deco deco-trees">${tree(140, 640, 0.9, 0)}${tree(1460, 650, 1, 0.6)}${tree(1040, 600, 0.7, 1.2)}${tree(330, 600, 0.6, 0.3)}</g>
  <g class="deco deco-africa">${acacia(230, 650, 1.1)}${acacia(1350, 640, 1.3)}${acacia(860, 600, 0.7)}</g>
  <g class="deco deco-pines">${pine(160, 640, 1.2, false)}${pine(260, 660, 0.9, false)}${pine(1380, 650, 1.3, false)}${pine(1480, 670, 1, false)}</g>
  <g class="deco deco-snowpines">${pine(220, 680, 1, true)}${pine(1420, 690, 1.1, true)}</g>
  <path class="hill2" d="M0 760 C220 680 420 700 620 740 C820 780 1000 690 1220 700 C1400 710 1520 750 1600 740 L1600 900 L0 900Z"/>
  <g class="deco deco-pond"><ellipse cx="1180" cy="800" rx="190" ry="34" fill="url(#water)"/><g class="shine"><path d="M1060 795 h70 M1180 806 h90 M1110 815 h40" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/></g></g>
  <g class="deco deco-flowers">${flowers}</g>
  <g class="deco deco-sea">
    <rect y="560" width="1600" height="340" fill="url(#deep)"/>
    <path class="wave w1" d="M0 580 Q100 550 200 580 T400 580 T600 580 T800 580 T1000 580 T1200 580 T1400 580 T1600 580 T1800 580 T2000 580 V900 H0Z" fill="#3aa9ea" opacity=".85"/>
    <path class="wave w2" d="M0 650 Q100 625 200 650 T400 650 T600 650 T800 650 T1000 650 T1200 650 T1400 650 T1600 650 T1800 650 T2000 650 V900 H0Z" fill="#1f86cc" opacity=".8"/>
    <path class="wave w3" d="M0 740 Q100 715 200 740 T400 740 T600 740 T800 740 T1000 740 T1200 740 T1400 740 T1600 740 T1800 740 T2000 740 V900 H0Z" fill="#0f62a8" opacity=".9"/>
    ${Array.from({ length: 10 }, (_, i) => `<circle class="bubble" cx="${120 + i * 150}" cy="900" r="${5 + (i % 3) * 3}" style="animation-delay:${i * 0.7}s"/>`).join('')}
  </g>
  <g class="deco deco-ice"><path d="M120 640 L220 560 L300 600 L360 640Z M1240 650 L1330 540 L1420 590 L1500 650Z" fill="#fff"/><path d="M220 560 L250 640 L120 640Z M1330 540 L1360 650 L1240 650Z" fill="#cfe9f8"/></g>
  <g class="deco deco-snow">${Array.from({ length: 40 }, (_, i) => `<circle class="flake" cx="${(i * 97) % 1600}" cy="-20" r="${2 + (i % 4)}" style="animation-delay:${(i * 0.37) % 9}s; animation-duration:${7 + (i % 5)}s"/>`).join('')}</g>
  <g class="deco deco-butterflies">${butterfly(0, '#ff7eb6')}${butterfly(4, '#ffc93c')}${butterfly(8, '#8fd3ff')}</g>
  <g class="clouds near">${cloud(-200, 120, 1.1, 'c4')}</g>
</svg>`;

let el: HTMLElement | null = null;

export function mountScene(host: HTMLElement) {
  el = document.createElement('div');
  el.className = 'scene';
  el.innerHTML = SVG;
  host.prepend(el);
  setSceneRegion(null);
}

/** Aplica el tema de una región al paisaje (null = paisaje de inicio). */
export function setSceneRegion(id: RegionId | null) {
  if (!el) return;
  const r = REGIONS.find((x) => x.id === id) ?? REGIONS[0];
  const s = el.style;
  s.setProperty('--sky-top', r.sky[0]); s.setProperty('--sky-bot', r.sky[1]);
  s.setProperty('--hill1', r.hills[0]); s.setProperty('--hill2', r.hills[1]);
  el.dataset.region = id ?? 'home';
}
