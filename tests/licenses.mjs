// Prueba automática: falla si algún sonido real no tiene autor, fuente y licencia comercial válida, o falta el archivo.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { normalizeLicense } from '../scripts/licenses.mjs';

const sounds = JSON.parse(readFileSync(new URL('../src/sounds.json', import.meta.url)));
let bad = 0;
const fail = (m) => { bad++; console.error('✗', m); };
for (const [id, s] of Object.entries(sounds)) {
  if (!normalizeLicense(s.license)) fail(`${id}: licencia no comercial o desconocida (${s.license})`);
  if (!s.author) fail(`${id}: falta autor`);
  if (!/^https?:\/\//.test(s.source ?? '')) fail(`${id}: falta enlace a la fuente`);
  if (!existsSync(new URL(`../public/sounds/${s.file}`, import.meta.url))) fail(`${id}: falta public/sounds/${s.file}`);
}
const dir = new URL('../public/sounds/', import.meta.url);
for (const f of existsSync(dir) ? readdirSync(dir) : []) {
  if (!f.startsWith('.') && !Object.values(sounds).some((s) => s.file === f)) fail(`public/sounds/${f} no tiene licencia registrada`);
}
console.log(bad ? `${bad} problemas de licencia` : `Licencias correctas (${Object.keys(sounds).length} grabaciones reales)`);
process.exit(bad ? 1 : 0);
