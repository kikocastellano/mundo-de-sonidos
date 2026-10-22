// Mapa del mundo con continentes, granja y océano como zonas táctiles.
import { REGIONS, animalsIn, type RegionId } from '../data';
import { t } from '../i18n';
import { store } from '../store';
import { backBtn, esc } from '../ui';

/** Convierte una lista de puntos en una curva cerrada suave (Catmull-Rom). */
function blob(pts: [number, number][]) {
  const n = pts.length; let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1]}`;
  }
  return d + 'Z';
}

interface Zone { id: RegionId; shapes: [number, number][][]; label: [number, number]; fill: string }

const ZONES: Zone[] = [
  { id: 'america', fill: '#7ccf6b', label: [215, 205], shapes: [
    [[110, 90], [200, 60], [300, 80], [330, 130], [280, 190], [250, 250], [205, 240], [150, 200], [100, 150]],
    [[255, 280], [320, 290], [350, 340], [320, 420], [290, 470], [265, 430], [250, 360]],
  ] },
  { id: 'europa', fill: '#8fb6ff', label: [500, 115], shapes: [[[440, 80], [500, 60], [560, 75], [570, 120], [540, 160], [480, 165], [445, 135]]] },
  { id: 'africa', fill: '#f2bd5c', label: [525, 275], shapes: [[[455, 190], [540, 180], [600, 215], [610, 280], [575, 350], [545, 400], [515, 370], [490, 300], [450, 250]]] },
  { id: 'asia', fill: '#ff9fb6', label: [740, 150], shapes: [[[600, 70], [720, 50], [850, 70], [910, 120], [880, 190], [800, 230], [720, 240], [650, 200], [600, 140]]] },
  { id: 'oceania', fill: '#ff9a6b', label: [825, 360], shapes: [[[760, 320], [830, 300], [890, 330], [880, 390], [820, 410], [770, 385]]] },
  { id: 'polos', fill: '#ffffff', label: [520, 488], shapes: [[[300, 470], [520, 455], [740, 470], [700, 505], [520, 512], [340, 505]]] },
];

export function map(root: HTMLElement) {
  const L = store.lang;
  const reg = (id: RegionId) => REGIONS.find((r) => r.id === id)!;
  const zone = (z: Zone, i: number) => {
    const r = reg(z.id);
    return `<g class="zone" data-go="/region/${z.id}" role="button" tabindex="0" aria-label="${esc(r.name[L])}" style="--i:${i}">
      <g class="zone-bob">
        ${z.shapes.map((s) => `<path d="${blob(s)}" class="land-shadow"/><path d="${blob(s)}" fill="${z.fill}" class="land"/>`).join('')}
        <g transform="translate(${z.label[0]} ${z.label[1]})">
          <circle r="34" class="pin"/><text class="pin-emoji" y="12">${r.emoji}</text>
          <text class="zone-label" y="62">${esc(r.name[L])}</text>
        </g>
      </g></g>`;
  };
  const stars = (id: RegionId) => Math.min(store.stars[id] || 0, 99);
  root.innerHTML = `
    <section class="screen map">
      <header class="topbar">${backBtn('/')}<h2>${t('world')}</h2><span class="spacer"></span></header>
      <div class="map-wrap">
        <svg class="world" viewBox="0 0 1000 530" role="group" aria-label="${t('world')}">
          <defs><radialGradient id="seaG" cx=".5" cy=".45" r=".7"><stop offset="0" stop-color="#7fd4ff"/><stop offset="1" stop-color="#2a8fd6"/></radialGradient></defs>
          <rect x="6" y="6" width="988" height="518" rx="48" fill="url(#seaG)" class="sea"/>
          <g class="sea-waves">${Array.from({ length: 14 }, (_, i) => `<path d="M${60 + (i * 137) % 880} ${60 + (i * 89) % 420} q10 -8 20 0 t20 0" style="animation-delay:${i * 0.3}s"/>`).join('')}</g>
          ${ZONES.map(zone).join('')}
          <g class="zone" data-go="/region/oceano" role="button" tabindex="0" aria-label="${esc(reg('oceano').name[L])}" style="--i:7">
            <g class="zone-bob" transform="translate(395 330)">
              <circle r="46" class="bubble-zone"/><text class="pin-emoji big" y="16">🐳</text>
              <text class="zone-label" y="74">${esc(reg('oceano').name[L])}</text>
            </g></g>
          <g class="zone" data-go="/region/granja" role="button" tabindex="0" aria-label="${esc(reg('granja').name[L])}" style="--i:8">
            <g class="zone-bob" transform="translate(110 400)">
              <ellipse rx="78" ry="40" cy="16" fill="#5fb648" class="land"/><ellipse rx="78" ry="34" cy="8" fill="#9bd67a"/>
              <text class="pin-emoji big" y="6">🏡</text>
              <text class="zone-label" y="80">${esc(reg('granja').name[L])}</text>
            </g></g>
        </svg>
      </div>
      <div class="region-chips">${REGIONS.map((r) => `<button class="chip" data-go="/region/${r.id}" style="--c:${r.accent}"><span>${r.emoji}</span>${esc(r.name[L])}<small>${animalsIn(r.id).length}${stars(r.id) ? ` · ★${stars(r.id)}` : ''}</small></button>`).join('')}</div>
    </section>`;
  root.querySelectorAll<SVGGElement>('.zone').forEach((z) => z.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); z.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
  }));
}
