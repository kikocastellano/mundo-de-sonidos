// Grupo de cada animal (para las preguntas del modo profe).
export type Clase = 'mamifero' | 'ave' | 'reptil' | 'anfibio' | 'insecto' | 'pez' | 'invertebrado';

const G: Record<Clase, string> = {
  mamifero: 'jirafa raton perezoso armadillo oso-hormiguero canguro oso-polar narval mamut lobo-marino titi mono-arana zorro-gris ciervo-cola-blanca daman ardilla-gigante muntiaco vaca perro gato oveja cerdo caballo cabra burro conejo toro cordero gatito ballena delfin foca orca nutria elefante-marino foca-gris leon elefante mono hipopotamo rinoceronte gorila camello nu babuino indri chacal lobo bisonte mapache alce mono-aullador coyote perrito-pradera castor uapiti pica capuchino tigre gibon yak macaco siamang zorro erizo jabali ciervo murcielago corzo marmota liron zorro-volador zarigueya reno',
  ave: 'dodo escribano-nival lori-arcoiris galah oropendola chochin chotacabras francolin bulbul koel pato gallo gallina pollito pavo periquito gallina-guinea gaviota flamenco calao turaco loro aguila colibri tucan guacamayo cardenal arrendajo-azul sinsonte buho-barrado colimbo martin-pescador codorniz pavo-real grulla faisan cotorra buho cuco cuervo paloma lechuza ruisenor cisne petirrojo mirlo gorrion urraca abubilla golondrina kookaburra cacatua ave-lira kiwi kea tui campanero ruru urraca-australiana pinguino buho-nival pinguino-emperador lagopodo charran-artico',
  reptil: 'tortuga camaleon diplodoco t-rex serpiente cobra geco',
  anfibio: 'rana-verde-australiana ranita-san-antonio sapo-partero rana rana-arboricola rana-toro coqui',
  pez: 'tiburon caballito-mar pez-payaso pez-globo manta-raya',
  invertebrado: 'pulpo medusa estrella-mar cangrejo calamar langosta langostino caracol arana lombriz escorpion',
  insecto: 'mariposa mariquita hormiga cigarra abeja grillo mosquito saltamontes saltamontes-cantor',
};

export const CLASE: Record<string, Clase> = Object.fromEntries(
  (Object.entries(G) as [Clase, string][]).flatMap(([c, ids]) => ids.split(/\s+/).filter(Boolean).map((id) => [id, c])),
);
