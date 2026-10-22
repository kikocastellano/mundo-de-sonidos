// Licencias que permiten uso comercial. NC (no comercial) y ND (sin derivados: recortamos y nivelamos) quedan fuera.
export const ALLOWED = ['CC0', 'Public domain', 'CC BY', 'CC BY-SA'];
export function normalizeLicense(raw = '') {
  const s = raw.toLowerCase().replace(/[_-]/g, ' ');
  if (/\bnc\b|noncommercial|non commercial/.test(s) || /\bnd\b|noderiv/.test(s)) return null;
  if (/cc0|zero|publicdomain\/zero/.test(s)) return 'CC0';
  if (/public ?domain|pd\b|\/mark\//.test(s)) return 'Public domain';
  if (/by sa|by\/sa|sharealike|by-sa/.test(s)) return 'CC BY-SA';
  if (/\bcc by\b|creativecommons\.org\/licenses\/by\/|attribution/.test(s)) return 'CC BY';
  return null;
}
