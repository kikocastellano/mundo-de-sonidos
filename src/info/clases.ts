// Grupo de cada animal (para las preguntas del modo profe).
export type Clase = 'mamifero' | 'ave' | 'reptil' | 'anfibio' | 'insecto';

const G: Record<Clase, string> = {
  mamifero: 'vaca perro gato oveja cerdo caballo cabra burro conejo toro cordero gatito raton ballena delfin foca orca nutria elefante-marino foca-gris leon elefante mono hipopotamo jirafa rinoceronte gorila camello nu babuino indri chacal lobo bisonte mapache alce mono-aullador coyote perrito-pradera castor uapiti pica capuchino tigre bufalo gibon yak macaco siamang zorro erizo ardilla jabali ciervo murcielago corzo marmota liron koala zorro-volador zarigueya reno',
  ave: 'pato gallo gallina pollito pavo ganso periquito gallina-guinea gaviota flamenco calao turaco loro aguila colibri tucan guacamayo cardenal arrendajo-azul sinsonte buho-barrado colimbo martin-pescador codorniz pavo-real grulla faisan cotorra buho cuco cuervo paloma lechuza ruisenor pajaro-carpintero cisne petirrojo mirlo gorrion urraca abubilla golondrina mochuelo kookaburra cacatua ave-lira kiwi kea tui campanero ruru urraca-australiana pinguino buho-nival pinguino-emperador lagopodo charran-artico barnacla',
  reptil: 'serpiente cobra geco tortuga',
  anfibio: 'rana rana-arboricola rana-toro coqui',
  insecto: 'cigarra abeja grillo mosquito saltamontes saltamontes-cantor',
};

export const CLASE: Record<string, Clase> = Object.fromEntries(
  (Object.entries(G) as [Clase, string][]).flatMap(([c, ids]) => ids.split(' ').map((id) => [id, c])),
);
