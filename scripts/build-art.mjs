// Genera los dibujos de los animales (Fluent Emoji de Microsoft, licencia MIT) en public/art/*.svg
// y src/art.json (animal → archivo). Así se ven iguales en todos los móviles.
//   node scripts/build-art.mjs
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { VARIANTS, recolor } from './art-variants.mjs';

const set = JSON.parse(readFileSync('node_modules/@iconify-json/fluent-emoji/icons.json', 'utf8'));
const BY_EMOJI = { '🐁': 'mouse', '🐂': 'ox', '🐃': 'water-buffalo', '🐄': 'cow', '🐅': 'tiger', '🐇': 'rabbit', '🐈': 'cat', '🐋': 'whale', '🐍': 'snake', '🐎': 'horse', '🐐': 'goat', '🐑': 'ewe', '🐒': 'monkey', '🐓': 'rooster', '🐔': 'chicken', '🐕': 'dog', '🐖': 'pig', '🐗': 'boar', '🐘': 'elephant', '🐝': 'honeybee', '🐢': 'turtle', '🐥': 'front-facing-baby-chick', '🐦': 'bird', '🐧': 'penguin', '🐨': 'koala', '🐫': 'two-hump-camel', '🐬': 'dolphin', '🐭': 'mouse-face', '🐱': 'cat-face', '🐳': 'spouting-whale', '🐴': 'horse-face', '🐸': 'frog', '🐹': 'hamster', '🐺': 'wolf', '🐿️': 'chipmunk', '🕊️': 'dove', '🥝': 'kiwi-fruit', '🦁': 'lion', '🦃': 'turkey', '🦅': 'eagle', '🦆': 'duck', '🦇': 'bat', '🦉': 'owl', '🦊': 'fox', '🦌': 'deer', '🦍': 'gorilla', '🦎': 'lizard', '🦏': 'rhinoceros', '🦒': 'giraffe', '🦔': 'hedgehog', '🦗': 'cricket', '🦚': 'peacock', '🦛': 'hippopotamus', '🦜': 'parrot', '🦝': 'raccoon', '🦟': 'mosquito', '🦢': 'swan', '🦦': 'otter', '🦩': 'flamingo', '🦫': 'beaver', '🦬': 'bison', '🦭': 'seal', '🪶': 'feather' };
// Dibujos más precisos que el emoji genérico (antes no se usaban porque los móviles antiguos no los tenían)
// Dibujos propios en assets/art-custom (el set no tiene el pájaro kiwi, solo la fruta)
const CUSTOM = { kiwi: 'kiwi-bird' };
const BY_ID = { jirafa: 'giraffe', tortuga: 'turtle', raton: 'mouse', pulpo: 'octopus', tiburon: 'shark', mariposa: 'butterfly', medusa: 'jellyfish', 'caballito-mar': 'tropical-fish', 'estrella-mar': 'star', 'pez-payaso': 'tropical-fish', 'pez-globo': 'blowfish', cangrejo: 'crab', calamar: 'squid', langosta: 'lobster', langostino: 'shrimp', 'manta-raya': 'fish', caracol: 'snail', mariquita: 'lady-beetle', hormiga: 'ant', arana: 'spider', lombriz: 'worm', camaleon: 'lizard', escorpion: 'scorpion', dodo: 'dodo', perezoso: 'sloth', armadillo: 'hedgehog', 'oso-hormiguero': 'badger', diplodoco: 'sauropod', 't-rex': 't-rex', canguro: 'kangaroo', 'oso-polar': 'polar-bear', narval: 'dolphin', mamut: 'mammoth', burro: 'donkey', ganso: 'goose', barnacla: 'goose', alce: 'moose', pollito: 'baby-chick', cebra: 'zebra', canguro: 'kangaroo' };

const src = readFileSync('src/data.ts', 'utf8');
const animals = [...src.matchAll(/^ {2}A\(["']([\w-]+)["'], ["']([^"']+)["']/gm)].map((m) => [m[1], m[2]]);
mkdirSync('public/art', { recursive: true });
const map = {};
for (const [id, emoji] of animals) {
  if (CUSTOM[id] && existsSync(`assets/art-custom/${CUSTOM[id]}.svg`)) { copyFileSync(`assets/art-custom/${CUSTOM[id]}.svg`, `public/art/${CUSTOM[id]}.svg`); map[id] = `${CUSTOM[id]}.svg`; continue; }
  if (VARIANTS[id]) {
    const v = VARIANTS[id]; const ic = set.icons[v.base];
    if (!ic) throw new Error(`sin base ${v.base} para ${id}`);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ic.width ?? set.width ?? 32} ${ic.height ?? set.height ?? 32}">${ic.body}</svg>`;
    writeFileSync(`public/art/${id}.svg`, recolor(svg, v.base, v)); map[id] = `${id}.svg`; continue;
  }
  const name = BY_ID[id] ?? BY_EMOJI[emoji];
  const icon = name && set.icons[name];
  if (!icon) throw new Error(`sin dibujo para ${id} (${emoji})`);
  const w = icon.width ?? set.width ?? 32, h = icon.height ?? set.height ?? 32;
  writeFileSync(`public/art/${name}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${icon.body}</svg>`);
  map[id] = `${name}.svg`;
}
writeFileSync('src/art.json', JSON.stringify(map, null, 1) + '\n');
console.log(`${animals.length} animales, ${new Set(Object.values(map)).size} dibujos`);
