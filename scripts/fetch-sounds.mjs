// Busca grabaciones reales de cada animal en Wikimedia Commons, Xeno-canto y Freesound,
// SOLO con licencias que permiten uso comercial, y las descarga a sounds-raw/<animal>/ para escucharlas.
//   node scripts/fetch-sounds.mjs                 (todos)
//   node scripts/fetch-sounds.mjs vaca leon       (solo algunos)
// Variables opcionales: XC_KEY (clave de xeno-canto.org/account) y FREESOUND_TOKEN (freesound.org/apiv2/apply).
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { normalizeLicense } from './licenses.mjs';

const QUERIES = {
  vaca: { en: 'cow moo' }, perro: { en: 'dog bark' }, gato: { en: 'cat meow' }, oveja: { en: 'sheep bleat' },
  cerdo: { en: 'pig oink grunt' }, caballo: { en: 'horse neigh whinny' }, pato: { en: 'duck quack' }, gallo: { en: 'rooster crow' },
  ballena: { en: 'humpback whale song' }, delfin: { en: 'dolphin whistle' }, foca: { en: 'seal bark' },
  leon: { en: 'lion roar' }, elefante: { en: 'elephant trumpet' }, mono: { en: 'chimpanzee call' }, hipopotamo: { en: 'hippopotamus' },
  lobo: { en: 'wolf howl' }, oso: { en: 'bear growl' }, loro: { en: 'parrot macaw', xc: 'Ara macao' }, aguila: { en: 'bald eagle call', xc: 'Haliaeetus leucocephalus' },
  tigre: { en: 'tiger roar' }, panda: { en: 'giant panda' }, 'pavo-real': { en: 'peacock call', xc: 'Pavo cristatus' },
  buho: { en: 'tawny owl', xc: 'Strix aluco' }, rana: { en: 'frog croak', xc: 'Pelophylax ridibundus' }, cuco: { en: 'cuckoo call', xc: 'Cuculus canorus' },
  canguro: { en: 'kangaroo' }, koala: { en: 'koala bellow' }, kookaburra: { en: 'kookaburra laugh', xc: 'Dacelo novaeguineae' },
  pinguino: { en: 'penguin call', xc: 'Spheniscus demersus' }, 'oso-polar': { en: 'polar bear' },
};

const UA = { 'User-Agent': 'MundoDeSonidos/0.1 (app educativa; kikocastellano94 en GitHub)' };
const getJSON = async (u, h = {}) => { const r = await fetch(u, { headers: { ...UA, ...h } }); if (!r.ok) throw new Error(`${r.status} ${u}`); return r.json(); };

async function commons(q) {
  const u = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=15&gsrsearch=${encodeURIComponent(q + ' filetype:audio')}&prop=imageinfo&iiprop=url|extmetadata|size`;
  const d = await getJSON(u);
  return Object.values(d.query?.pages ?? {}).map((p) => {
    const ii = p.imageinfo?.[0]; const m = ii?.extmetadata ?? {};
    return { source: 'commons', url: ii?.url, page: ii?.descriptionurl, title: p.title,
      author: (m.Artist?.value ?? '').replace(/<[^>]+>/g, '').trim() || 'Wikimedia Commons',
      license: normalizeLicense(`${m.LicenseShortName?.value ?? ''} ${m.LicenseUrl?.value ?? ''}`) };
  });
}

async function xenocanto(sp) {
  if (!sp || !process.env.XC_KEY) return [];
  const [gen, spec] = sp.split(' ');
  const d = await getJSON(`https://xeno-canto.org/api/3/recordings?query=${encodeURIComponent(`gen:${gen} sp:${spec} q:A`)}&key=${process.env.XC_KEY}`);
  return (d.recordings ?? []).slice(0, 15).map((r) => ({ source: 'xeno-canto', url: r.file, page: `https://xeno-canto.org/${r.id}`, title: `XC${r.id} ${r.en}`,
    author: r.rec, license: normalizeLicense(r.lic) }));
}

async function freesound(q) {
  const tok = process.env.FREESOUND_TOKEN; if (!tok) return [];
  const d = await getJSON(`https://freesound.org/apiv2/search/text/?query=${encodeURIComponent(q)}&fields=id,name,username,license,previews,url,duration&filter=duration:[0.5 TO 15]&page_size=15&token=${tok}`);
  return (d.results ?? []).map((r) => ({ source: 'freesound', url: r.previews['preview-hq-mp3'], page: r.url, title: r.name, author: r.username, license: normalizeLicense(r.license) }));
}

const only = process.argv.slice(2);
for (const [id, q] of Object.entries(QUERIES)) {
  if (only.length && !only.includes(id)) continue;
  const dir = `sounds-raw/${id}`; mkdirSync(dir, { recursive: true });
  const found = (await Promise.allSettled([commons(q.en), xenocanto(q.xc), freesound(q.en)])).flatMap((r) => r.status === 'fulfilled' ? r.value : (console.warn('  aviso:', r.reason.message), []));
  const ok = found.filter((c) => c.url && c.license);
  console.log(`${id}: ${ok.length} candidatos con licencia válida (de ${found.length})`);
  const list = [];
  for (const [i, c] of ok.slice(0, 8).entries()) {
    const ext = (c.url.split('?')[0].match(/\.(\w+)$/)?.[1] ?? 'mp3').toLowerCase();
    const file = `${String(i + 1).padStart(2, '0')}-${c.source}.${ext}`;
    if (!existsSync(`${dir}/${file}`)) {
      const r = await fetch(c.url, { headers: UA }); if (!r.ok) continue;
      writeFileSync(`${dir}/${file}`, Buffer.from(await r.arrayBuffer()));
    }
    list.push({ file, ...c });
  }
  writeFileSync(`${dir}/candidatos.json`, JSON.stringify(list, null, 2));
}
console.log('\nEscucha sounds-raw/<animal>/ y apunta el elegido en sounds-approved.json, luego: node scripts/process-sounds.mjs');
