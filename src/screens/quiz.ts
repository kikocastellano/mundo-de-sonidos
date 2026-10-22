// Modo profe · Preguntas: preguntas de opción múltiple sobre las fichas de los animales, para jugar en clase.
import { sayName, sfx } from '../audio';
import { ANIMALS, REGIONS, animalsIn, regionById, type Animal, type Lang, type RegionId } from '../data';
import { INFO } from '../info';
import { CLASE, type Clase } from '../info/clases';
import { isLocked, store } from '../store';
import { $, backBtn, confetti, esc, icon } from '../ui';
import { premiumWall } from './premium';

interface Q { animal: Animal; text: string; options: { label: string; emoji: string }[]; answer: number }

const CLASES: Record<Clase, { emoji: string; es: string; en: string }> = {
  mamifero: { emoji: '🐾', es: 'Mamífero', en: 'Mammal' },
  ave: { emoji: '🪶', es: 'Ave', en: 'Bird' },
  reptil: { emoji: '🦎', es: 'Reptil', en: 'Reptile' },
  anfibio: { emoji: '🐸', es: 'Anfibio', en: 'Amphibian' },
  insecto: { emoji: '🐞', es: 'Insecto', en: 'Insect' },
};
const DIETAS = { h: { emoji: '🌿', es: 'Plantas', en: 'Plants' }, c: { emoji: '🍖', es: 'Carne', en: 'Meat' }, o: { emoji: '🍽️', es: 'De todo', en: 'Everything' }, i: { emoji: '🐛', es: 'Bichitos', en: 'Bugs' } };

const shuffle = <T,>(a: T[]) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const MASC_A = /^(koala|gorila|panda|kea|cucaburra|ave)$/i;
const FEM = /^(serpiente|perdiz|codorniz)$/i;
const el = (a: Animal, L: Lang) => {
  const n = a.name[L].toLowerCase();
  if (L === 'en') return `the ${n}`;
  const w = n.split(' ')[0];
  const fem = FEM.test(w) || (/a$/.test(w) && !MASC_A.test(w));
  return `${fem ? 'la' : 'el'} ${n}`;
};

/** Palabras con significado (para evitar opciones que también serían correctas). */
const words = (t: string) => new Set(t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(/[^a-z]+/).filter((w) => w.length > 3));
const overlaps = (a: string, b: string) => { const A = words(a); return [...words(b)].some((w) => A.has(w) || A.has(w.replace(/s$/, '')) || A.has(w + 's')); };

/** «de» + artículo: «del león», «de la jirafa». */
const de = (who: string) => (who.startsWith('el ') ? `del ${who.slice(3)}` : `de ${who}`);

/** Crea una pregunta de 3 opciones con la respuesta correcta y dos distractores distintos. */
function makeQuestion(pool: Animal[], L: Lang, last: string): Q | null {
  const a = pick(pool.filter((x) => x.id !== last && INFO[x.id]));
  if (!a) return null;
  const info = INFO[a.id]; const x = info[L];
  const who = el(a, L);
  const kinds = ['clase', 'dieta', 'region', 'comida', 'cria', 'casa'];
  for (const k of shuffle(kinds)) {
    if (k === 'clase' && CLASE[a.id]) {
      const right = CLASE[a.id];
      const opts = [right, ...shuffle((Object.keys(CLASES) as Clase[]).filter((c) => c !== right)).slice(0, 2)];
      const o = shuffle(opts);
      return { animal: a, text: L === 'es' ? `¿Qué tipo de animal es ${who}?` : `What kind of animal is ${who}?`, options: o.map((c) => ({ label: CLASES[c][L], emoji: CLASES[c].emoji })), answer: o.indexOf(right) };
    }
    if (k === 'dieta') {
      const right = info.diet;
      const o = shuffle([right, ...shuffle((Object.keys(DIETAS) as (keyof typeof DIETAS)[]).filter((d) => d !== right)).slice(0, 2)]);
      return { animal: a, text: L === 'es' ? `¿Qué come ${who}?` : `What does ${who} eat?`, options: o.map((d) => ({ label: DIETAS[d][L], emoji: DIETAS[d].emoji })), answer: o.indexOf(right) };
    }
    if (k === 'region' && a.region !== 'granja') {
      const right = a.region;
      const o = shuffle([right, ...shuffle(REGIONS.map((r) => r.id).filter((r) => r !== right && r !== 'granja')).slice(0, 2)]) as RegionId[];
      return { animal: a, text: L === 'es' ? `¿De dónde es ${who}?` : `Where does ${who} come from?`, options: o.map((r) => ({ label: regionById(r)!.name[L], emoji: regionById(r)!.emoji })), answer: o.indexOf(right) };
    }
    if (k === 'cria' && !/^cr[ií]a/i.test(info.es.baby) && !/^es la cr/i.test(info.es.baby)) {
      const others = shuffle(ANIMALS.filter((b) => INFO[b.id] && CLASE[b.id] !== CLASE[a.id] && !/^cr[ií]a|^es la cr/i.test(INFO[b.id].es.baby) && !overlaps(INFO[b.id][L].baby, x.baby)));
      const seen = new Set([x.baby.toLowerCase()]); const d: string[] = [];
      for (const b of others) { const v = INFO[b.id][L].baby; if (!seen.has(v.toLowerCase()) && d.length < 2) { seen.add(v.toLowerCase()); d.push(v); } }
      const o = shuffle([x.baby, ...d]);
      return { animal: a, text: L === 'es' ? `¿Cómo se llama la cría ${de(who)}?` : `What is ${who}’s baby called?`, options: o.map((v) => ({ label: v, emoji: '👶' })), answer: o.indexOf(x.baby) };
    }
    if (k === 'comida' || k === 'casa') {
      const field = k === 'comida' ? 'food' : 'home';
      const others = shuffle(ANIMALS.filter((b) => INFO[b.id] && b.id !== a.id && INFO[b.id].diet !== (k === 'comida' ? info.diet : 'x') && (k === 'comida' || b.region !== a.region)));
      const d: string[] = [];
      for (const b of others) { const v = INFO[b.id][L][field]; if (d.length < 2 && !/^junto a|^leche y/i.test(v) && !overlaps(v, x[field]) && !d.some((o) => overlaps(o, v))) d.push(v); }
      if (d.length < 2) continue;
      const o = shuffle([x[field], ...d]);
      return { animal: a, text: k === 'comida' ? (L === 'es' ? `¿Cuál es la comida favorita ${de(who)}?` : `What does ${who} like to eat?`) : (L === 'es' ? `¿Dónde vive ${who}?` : `Where does ${who} live?`), options: o.map((v) => ({ label: v, emoji: k === 'comida' ? '🍽️' : '🏠' })), answer: o.indexOf(x[field]) };
    }
  }
  return null;
}

export function quiz(root: HTMLElement, src: string | null) {
  const L = store.lang;
  if (premiumWall(root, L === 'es' ? 'Preguntas' : 'Quiz', '/profe')) return;
  const pool = (src && regionById(src) ? animalsIn(src as RegionId) : ANIMALS).filter((a) => !isLocked(a));
  let score = 0, total = 0, last = '', q: Q | null = null, tries = 0, tm = 0;
  root.innerHTML = `
    <section class="screen quiz" style="--accent:#ff7d4a">
      <header class="topbar">${backBtn('/profe')}<h2>❓ ${L === 'es' ? 'Preguntas' : 'Quiz'}</h2><div class="star-count">${icon.star}<b class="qs">0</b></div></header>
      <div class="q-card">
        <span class="q-emoji"></span>
        <button class="q-text" aria-live="polite"></button>
      </div>
      <div class="q-options"></div>
      <p class="q-feedback"></p>
    </section>`;
  const qEmoji = $('.q-emoji', root), qText = $('.q-text', root), opts = $('.q-options', root), fb = $('.q-feedback', root);
  const read = () => q && sayName(q.text);
  qText.addEventListener('click', read);

  function next() {
    clearTimeout(tm);
    q = makeQuestion(pool, L, last);
    if (!q) { qText.textContent = '—'; return; }
    last = q.animal.id; tries = 0; fb.textContent = '';
    root.style.setProperty('--accent', regionById(q.animal.region)!.accent);
    qEmoji.textContent = q.animal.emoji; qEmoji.classList.remove('pop'); void qEmoji.offsetWidth; qEmoji.classList.add('pop');
    qText.innerHTML = `${esc(q.text)} <span class="q-speak">🔊</span>`;
    opts.innerHTML = q.options.map((o, i) => `<button class="q-opt" data-i="${i}" style="--i:${i}"><span>${o.emoji}</span>${esc(o.label)}</button>`).join('');
    opts.querySelectorAll<HTMLElement>('.q-opt').forEach((b) => b.addEventListener('click', () => answer(b)));
    setTimeout(read, 350);
  }

  function answer(b: HTMLElement) {
    if (!q || b.classList.contains('right') || opts.querySelector('.right')) return;
    const i = Number(b.dataset.i);
    if (i === q.answer) {
      b.classList.add('right'); total++; if (tries === 0) score++;
      $('.qs', root).textContent = String(score);
      opts.querySelectorAll('.q-opt:not(.right)').forEach((o) => o.classList.add('fade'));
      fb.textContent = L === 'es' ? '¡Correcto! 🎉' : 'Correct! 🎉';
      sfx('win'); confetti(40); sayName(`${L === 'es' ? '¡Correcto!' : 'Correct!'} ${q.options[i].label}`);
      tm = window.setTimeout(next, 2600);
    } else {
      tries++; sfx('oops');
      b.classList.remove('wrong'); void b.offsetWidth; b.classList.add('wrong', 'fade');
      fb.textContent = L === 'es' ? '¡Casi! Prueba otra' : 'Almost! Try another';
    }
  }
  next();
  return () => clearTimeout(tm);
}

/** Pantalla de inicio del modo profe: presentar animales o hacer preguntas. */
export function teacherMenu(root: HTMLElement, src: string | null) {
  const L = store.lang;
  const q = src ? `?src=${src}` : '';
  if (premiumWall(root, L === 'es' ? 'Modo profe' : 'Teacher mode')) return;
  root.innerHTML = `
    <section class="screen home">
      <header class="topbar">${backBtn('/')}<h2>🧑‍🏫 ${L === 'es' ? 'Modo profe' : 'Teacher mode'}</h2><span class="spacer"></span></header>
      <nav class="home-menu">
        <button class="big-btn teach-btn" data-go="/profe/ver${q}"><span class="big-emoji">▶️</span><span>${L === 'es' ? 'Presentar animales' : 'Show animals'}</span></button>
        <button class="big-btn game" data-go="/profe/preguntas${q}"><span class="big-emoji">❓</span><span>${L === 'es' ? 'Preguntas' : 'Quiz'}</span></button>
      </nav>
      <p class="tagline">${L === 'es' ? 'Ideal para proyectar en clase' : 'Great for the classroom projector'}</p>
    </section>`;
}
