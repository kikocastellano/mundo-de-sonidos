# Busca grabaciones reales en iNaturalist (CC0 / CC BY / CC BY-SA) por nombre científico y descarga candidatos.
#   python3 scripts/fetch-inaturalist.py sounds-raw [animal ...]
import sys, json, os, urllib.request, urllib.parse, time
from concurrent.futures import ThreadPoolExecutor
OUT = sys.argv[1]
UA = {'User-Agent': 'MundoDeSonidos/0.1 (app educativa infantil)'}
TAXA = {
 'oso': 'Ursus arctos', 'panda': 'Ailuropoda melanoleuca', 'canguro': 'Macropodidae', 'cebra': 'Equus quagga', 'llama': 'Lama glama', 'alce': 'Alces alces',
 'perezoso': 'Bradypus', 'orangutan': 'Pongo', 'zorro': 'Vulpes vulpes', 'morsa': 'Odobenus rosmarus', 'buho-nival': 'Bubo scandiacus', 'bufalo': 'Bubalus bubalis',
 'oso-polar': 'Ursus maritimus', 'orca': 'Orcinus orca', 'nutria': 'Lutrinae', 'leopardo': 'Panthera pardus', 'cocodrilo': 'Crocodylidae', 'tortuga': 'Testudines',
 'zorro-artico': 'Vulpes lagopus', 'cordero': 'Ovis aries', 'cachorro': 'Canis familiaris', 'gatito': 'Felis catus', 'raton': 'Mus musculus', 'hamster': 'Cricetinae',
 'periquito': 'Melopsittacus undulatus', 'beluga': 'Delphinapterus leucas', 'cachalote': 'Physeter macrocephalus', 'nu': 'Connochaetes', 'babuino': 'Papio',
 'buitre': 'Gyps fulvus', 'jaguar': 'Panthera onca', 'mono-aullador': 'Alouatta', 'coyote': 'Canis latrans', 'caiman': 'Alligator mississippiensis',
 'rana-arboricola': 'Hyla', 'colibri': 'Trochilidae', 'gibon': 'Hylobatidae', 'cigarra': 'Cicadidae', 'yak': 'Bos grunniens', 'leopardo-nieves': 'Panthera uncia',
 'murcielago': 'Pipistrellus', 'sapo': 'Bufo bufo', 'lechuza': 'Tyto alba', 'ruisenor': 'Luscinia megarhynchos', 'pajaro-carpintero': 'Dendrocopos major',
 'cisne': 'Cygnus', 'mosquito': 'Culicidae', 'dingo': 'Canis lupus dingo', 'ave-lira': 'Menura novaehollandiae', 'zorro-volador': 'Pteropus',
 'lobo-artico': 'Canis lupus', 'foca-leopardo': 'Hydrurga leptonyx', 'pinguino-emperador': 'Aptenodytes forsteri', 'buey-almizclero': 'Ovibos moschatus',
}
# Grupos más amplios para animales con pocas grabaciones (INAT_AMPLIO=1)
WIDE = {'oso': 'Ursidae', 'oso-polar': 'Ursidae', 'canguro': 'Macropodiformes', 'llama': 'Camelidae', 'perezoso': 'Folivora', 'orangutan': 'Pongo',
  'morsa': 'Pinnipedia', 'foca-leopardo': 'Phocidae', 'cocodrilo': 'Crocodylia', 'raton': 'Muridae', 'hamster': 'Cricetidae', 'beluga': 'Odontoceti',
  'yak': 'Bos', 'leopardo-nieves': 'Panthera', 'buey-almizclero': 'Caprinae', 'buho-nival': 'Bubo', 'panda': 'Ailuridae'}
if os.environ.get('INAT_AMPLIO'): TAXA.update(WIDE)
SKIP = int(os.environ.get('INAT_SALTAR', '0'))  # salta los N primeros sonidos (ya vistos)
LIC = {'cc0': 'CC0', 'cc-by': 'CC BY', 'cc-by-sa': 'CC BY-SA'}

def get(u, b=False):
    for i in range(5):
        try:
            d = urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60).read()
            return d if b else json.loads(d)
        except urllib.error.HTTPError as e:
            if e.code in (429, 503): time.sleep(3 * (i + 1)); continue
            raise
    raise Exception('reintentos ' + u)

def one(aid):
    q = {'taxon_name': TAXA[aid], 'sounds': 'true', 'sound_license': 'cc0,cc-by,cc-by-sa', 'per_page': 60, 'order_by': 'votes'}
    obs = get('https://api.inaturalist.org/v1/observations?' + urllib.parse.urlencode(q))['results']
    obs.sort(key=lambda o: (o.get('quality_grade') != 'research', -(o.get('faves_count') or 0)))
    d = f'{OUT}/{aid}'; os.makedirs(d, exist_ok=True); out = []
    seen = 0
    for o in obs:
        for s in o.get('sounds') or []:
            lic = LIC.get((s.get('license_code') or '').lower())
            url = s.get('file_url')
            if not lic or not url or len(out) >= 6: continue
            seen += 1
            if seen <= SKIP: continue
            ext = url.split('?')[0].rsplit('.', 1)[-1].lower()[:4]
            fn = f'{len(out) + 1:02d}-inat.{ext}'
            try: open(f'{d}/{fn}', 'wb').write(get(url, True))
            except Exception: continue
            name = (o.get('taxon') or {}).get('preferred_common_name') or TAXA[aid]
            out.append({'file': fn, 'source': 'inaturalist', 'url': url, 'page': f"https://www.inaturalist.org/observations/{o['id']}",
                        'title': f"File:{name} ({o.get('place_guess') or 'iNaturalist'})", 'author': s.get('attribution') or o['user']['login'], 'license': lic})
    json.dump(out, open(f'{d}/candidatos.json', 'w'), indent=1, ensure_ascii=False)
    return f'{aid} {len(out)}'

ids = sys.argv[2:] or list(TAXA)
with ThreadPoolExecutor(3) as ex:
    for line in ex.map(one, ids): print(line, flush=True)
