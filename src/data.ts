// Ficha de datos de animales y regiones.
import SOUNDS from './sounds.json';

// Fase 4 sustituirá `sound` (sonido sintetizado de prueba) por `audio` (grabación real con licencia).

export type Lang = 'es' | 'en';
export type RegionId = 'granja' | 'oceano' | 'africa' | 'america' | 'asia' | 'europa' | 'oceania' | 'polos';

export interface Region {
  id: RegionId;
  emoji: string;
  name: Record<Lang, string>;
  /** Colores del paisaje de fondo: cielo arriba, cielo abajo, colina lejana, colina cercana. */
  sky: [string, string];
  hills: [string, string];
  accent: string;
}

export interface Animal {
  id: string;
  emoji: string;
  region: RegionId;
  premium: boolean;
  name: Record<Lang, string>;
  fact: Record<Lang, string>;
  /** Receta del sintetizador (ver audio.ts). */
  sound: string;
  /** Ruta a una grabación real; si existe, tiene prioridad sobre `sound`. */
  audio?: string;
  credit?: { author: string; license: string; source: string };
}

export const REGIONS: Region[] = [
  { id: 'granja', emoji: '🏡', name: { es: 'La granja', en: 'The farm' }, sky: ['#7cc8ff', '#d9f1ff'], hills: ['#9bd67a', '#5fb648'], accent: '#e8553e' },
  { id: 'oceano', emoji: '🌊', name: { es: 'El océano', en: 'The ocean' }, sky: ['#5ab4f0', '#c8ecff'], hills: ['#3f9fd8', '#1f78b4'], accent: '#0d6fb8' },
  { id: 'africa', emoji: '🦁', name: { es: 'África', en: 'Africa' }, sky: ['#ffb36b', '#ffe6b0'], hills: ['#e2b65c', '#c8913a'], accent: '#d9822b' },
  { id: 'america', emoji: '🦅', name: { es: 'América', en: 'America' }, sky: ['#86c5ff', '#e4f4ff'], hills: ['#6cbf73', '#2f8f4e'], accent: '#2f8f4e' },
  { id: 'asia', emoji: '🐼', name: { es: 'Asia', en: 'Asia' }, sky: ['#ffb8c9', '#fff0e0'], hills: ['#8fcf8f', '#4e9e6a'], accent: '#d94f7a' },
  { id: 'europa', emoji: '🦉', name: { es: 'Europa', en: 'Europe' }, sky: ['#9fb8ff', '#eef1ff'], hills: ['#86c27a', '#4f8f45'], accent: '#5b6fd8' },
  { id: 'oceania', emoji: '🦘', name: { es: 'Oceanía', en: 'Oceania' }, sky: ['#ff9f7a', '#ffe1c4'], hills: ['#e08a4f', '#b8612f'], accent: '#c2532a' },
  { id: 'polos', emoji: '🐧', name: { es: 'Los polos', en: 'The poles' }, sky: ['#9fd8ff', '#f2fbff'], hills: ['#e6f4ff', '#c4e2f5'], accent: '#3a8fc8' },
];

const A = (
  id: string, emoji: string, region: RegionId, premium: boolean, sound: string,
  es: string, en: string, factEs: string, factEn: string,
): Animal => ({ id, emoji, region, premium, sound, name: { es, en }, fact: { es: factEs, en: factEn } });

export const ANIMALS: Animal[] = [
  // Granja (gratis)
  A('vaca', '🐄', 'granja', false, 'moo', 'Vaca', 'Cow', 'Las vacas tienen mejores amigas y se ponen tristes si las separan.', 'Cows have best friends and get sad when they are apart.'),
  A('perro', '🐕', 'granja', false, 'woof', 'Perro', 'Dog', 'El olfato de un perro es miles de veces mejor que el nuestro.', "A dog's nose is thousands of times better than ours."),
  A('gato', '🐈', 'granja', false, 'meow', 'Gato', 'Cat', 'Los gatos maúllan sobre todo para hablar con las personas.', 'Cats meow mostly to talk to people.'),
  A('oveja', '🐑', 'granja', false, 'baa', 'Oveja', 'Sheep', 'Las ovejas recuerdan las caras de sus amigas durante años.', 'Sheep remember the faces of their friends for years.'),
  A('cerdo', '🐖', 'granja', false, 'oink', 'Cerdo', 'Pig', 'Los cerdos son muy listos y les encanta jugar.', 'Pigs are very clever and love to play.'),
  A('caballo', '🐎', 'granja', false, 'neigh', 'Caballo', 'Horse', 'Los caballos pueden dormir de pie.', 'Horses can sleep standing up.'),
  A('pato', '🦆', 'granja', false, 'quack', 'Pato', 'Duck', 'Las plumas del pato no se mojan gracias a un aceite especial.', 'Duck feathers stay dry thanks to a special oil.'),
  A('gallo', '🐓', 'granja', false, 'rooster', 'Gallo', 'Rooster', 'El gallo canta al amanecer para decir «¡esta es mi casa!».', 'The rooster crows at dawn to say "this is my home!".'),
  // Océano
  A('ballena', '🐋', 'oceano', false, 'whale', 'Ballena', 'Whale', 'Las ballenas cantan canciones que se oyen a kilómetros.', 'Whales sing songs that can be heard miles away.'),
  A('delfin', '🐬', 'oceano', false, 'dolphin', 'Delfín', 'Dolphin', 'Cada delfín tiene un silbido propio, como un nombre.', 'Every dolphin has its own whistle, like a name.'),
  A('foca', '🦭', 'oceano', false, 'seal', 'Foca', 'Seal', 'Las focas pueden aguantar la respiración casi una hora.', 'Seals can hold their breath for almost an hour.'),
  // África
  A('leon', '🦁', 'africa', false, 'roar', 'León', 'Lion', 'El rugido del león se oye a 8 kilómetros.', "A lion's roar can be heard 8 kilometres away."),
  A('elefante', '🐘', 'africa', false, 'trumpet', 'Elefante', 'Elephant', 'Los elefantes usan la trompa como nariz, mano y ducha.', 'Elephants use their trunk as a nose, a hand and a shower.'),
  A('mono', '🐒', 'africa', false, 'monkey', 'Chimpancé', 'Chimpanzee', 'Los chimpancés usan palitos como herramientas.', 'Chimpanzees use sticks as tools.'),
  A('hipopotamo', '🦛', 'africa', false, 'hippo', 'Hipopótamo', 'Hippo', 'Los hipopótamos pasan el día en el agua para no quemarse.', 'Hippos spend the day in water to avoid sunburn.'),
  // América
  A('lobo', '🐺', 'america', false, 'howl', 'Lobo', 'Wolf', 'Los lobos aúllan para encontrar a su manada.', 'Wolves howl to find their pack.'),
  A('oso', '🐻', 'america', false, 'growl', 'Oso', 'Bear', 'Los osos duermen casi todo el invierno.', 'Bears sleep through most of the winter.'),
  A('loro', '🦜', 'america', true, 'parrot', 'Loro', 'Parrot', 'Algunos loros pueden imitar palabras.', 'Some parrots can copy words.'),
  A('aguila', '🦅', 'america', false, 'eagle', 'Águila', 'Eagle', 'El águila ve un conejo desde muy, muy alto.', 'An eagle can spot a rabbit from very high up.'),
  // Asia
  A('tigre', '🐅', 'asia', false, 'tiger', 'Tigre', 'Tiger', 'No hay dos tigres con las mismas rayas.', 'No two tigers have the same stripes.'),
  A('panda', '🐼', 'asia', false, 'panda', 'Panda', 'Panda', 'Los pandas comen bambú casi todo el día.', 'Pandas eat bamboo almost all day long.'),
  A('pavo-real', '🦚', 'asia', true, 'peacock', 'Pavo real', 'Peacock', 'El pavo real abre su cola como un abanico gigante.', 'The peacock opens its tail like a giant fan.'),
  // Europa
  A('buho', '🦉', 'europa', false, 'owl', 'Búho', 'Owl', 'Los búhos giran la cabeza casi del todo.', 'Owls can turn their heads almost all the way round.'),
  A('rana', '🐸', 'europa', false, 'frog', 'Rana', 'Frog', 'Las ranas beben agua a través de la piel.', 'Frogs drink water through their skin.'),
  A('cuco', '🐦', 'europa', false, 'cuckoo', 'Cuco', 'Cuckoo', 'El cuco se llama así por su canto: «cu-cú».', 'The cuckoo is named after its song: "cuck-oo".'),
  // Oceanía
  A('canguro', '🦘', 'oceania', false, 'kangaroo', 'Canguro', 'Kangaroo', 'Las crías de canguro viven en la bolsa de su mamá.', 'Baby kangaroos live in their mum’s pouch.'),
  A('koala', '🐨', 'oceania', false, 'koala', 'Koala', 'Koala', 'Los koalas duermen hasta 20 horas al día.', 'Koalas sleep up to 20 hours a day.'),
  A('kookaburra', '🪶', 'oceania', true, 'kookaburra', 'Cucaburra', 'Kookaburra', 'Su canto parece una carcajada.', 'Its call sounds like laughter.'),
  // Polos
  A('pinguino', '🐧', 'polos', false, 'penguin', 'Pingüino', 'Penguin', 'Los pingüinos no vuelan, pero nadan rapidísimo.', "Penguins can't fly, but they swim super fast."),
  A('oso-polar', '🐻‍❄️', 'polos', true, 'polar', 'Oso polar', 'Polar bear', 'Bajo su pelo blanco, la piel del oso polar es negra.', "Under its white fur, a polar bear's skin is black."),
  // ---- Ampliación ----
  // Granja
  A('cabra', '🐐', 'granja', false, 'baa', 'Cabra', 'Goat', 'Las cabras trepan a los árboles para comer hojas.', 'Goats climb trees to eat leaves.'),
  A('gallina', '🐔', 'granja', false, 'cluck', 'Gallina', 'Hen', 'Las gallinas hablan con sus pollitos antes de que salgan del huevo.', 'Hens talk to their chicks before they hatch.'),
  A('pollito', '🐥', 'granja', false, 'peep', 'Pollito', 'Chick', 'Los pollitos pían para no perder a su mamá.', 'Chicks peep so they don’t lose their mum.'),
  A('pavo', '🦃', 'granja', false, 'gobble', 'Pavo', 'Turkey', 'Cuando el pavo se emociona, su cuello cambia de color.', 'When a turkey gets excited, its neck changes colour.'),
  A('burro', '🐴', 'granja', false, 'bray', 'Burro', 'Donkey', 'El rebuzno del burro se oye a 3 kilómetros.', 'A donkey’s bray can be heard 3 kilometres away.'),
  A('ganso', '🦢', 'granja', false, 'honk', 'Ganso', 'Goose', 'Los gansos vuelan en forma de V para cansarse menos.', 'Geese fly in a V shape to save energy.'),
  A('conejo', '🐇', 'granja', true, 'squeak', 'Conejo', 'Rabbit', 'Los conejos dan saltitos de alegría llamados «binkies».', 'Rabbits do happy jumps called "binkies".'),
  A('toro', '🐂', 'granja', true, 'moo', 'Toro', 'Bull', 'Los toros no ven bien el color rojo.', 'Bulls can’t really see the colour red.'),
  // Océano
  A('orca', '🐳', 'oceano', false, 'dolphin', 'Orca', 'Orca', 'Cada familia de orcas tiene su propio «idioma».', 'Each orca family has its own "language".'),
  A('nutria', '🦦', 'oceano', false, 'squeak', 'Nutria', 'Otter', 'Las nutrias se dan la mano para dormir y no separarse.', 'Otters hold hands while they sleep so they don’t drift apart.'),
  A('gaviota', '🕊️', 'oceano', true, 'gull', 'Gaviota', 'Seagull', 'Las gaviotas pueden beber agua salada.', 'Seagulls can drink salty water.'),
  // África
  A('cebra', '🦓', 'africa', false, 'zebra', 'Cebra', 'Zebra', 'Las cebras ladran como perros pequeñitos.', 'Zebras bark like little dogs.'),
  A('jirafa', '🦒', 'africa', false, 'hum', 'Jirafa', 'Giraffe', 'Las jirafas casi no hacen ruido, pero de noche zumban.', 'Giraffes are very quiet, but they hum at night.'),
  A('rinoceronte', '🦏', 'africa', false, 'hippo', 'Rinoceronte', 'Rhino', 'El cuerno del rinoceronte está hecho de lo mismo que tus uñas.', 'A rhino’s horn is made of the same stuff as your nails.'),
  A('gorila', '🦍', 'africa', false, 'growl', 'Gorila', 'Gorilla', 'Los gorilas se golpean el pecho para saludar o avisar.', 'Gorillas beat their chests to say hello or warn others.'),
  A('leopardo', '🐆', 'africa', true, 'saw', 'Leopardo', 'Leopard', 'El leopardo sube su comida a los árboles.', 'Leopards carry their food up into trees.'),
  A('flamenco', '🦩', 'africa', true, 'honk', 'Flamenco', 'Flamingo', 'Los flamencos son rosas por lo que comen.', 'Flamingos are pink because of what they eat.'),
  A('camello', '🐫', 'africa', true, 'hippo', 'Camello', 'Camel', 'La joroba del camello guarda grasa, no agua.', 'A camel’s hump stores fat, not water.'),
  // América
  A('bisonte', '🦬', 'america', false, 'growl', 'Bisonte', 'Bison', 'Los bisontes pueden correr tan rápido como un caballo.', 'Bison can run as fast as a horse.'),
  A('mapache', '🦝', 'america', false, 'squeak', 'Mapache', 'Raccoon', 'Los mapaches tocan todo con sus manitas para conocerlo.', 'Raccoons touch everything with their little hands to learn about it.'),
  A('llama', '🦙', 'america', false, 'hum', 'Llama', 'Llama', 'Las llamas tararean para hablar con sus crías.', 'Llamas hum to talk to their babies.'),
  A('serpiente', '🐍', 'america', false, 'rattle', 'Serpiente de cascabel', 'Rattlesnake', 'Agita la cola como un sonajero para decir «¡no te acerques!».', 'It shakes its tail like a rattle to say "stay away!".'),
  A('alce', '🦌', 'america', true, 'bugle', 'Alce', 'Moose', 'Los alces son grandes nadadores.', 'Moose are great swimmers.'),
  A('perezoso', '🦥', 'america', true, 'squeak', 'Perezoso', 'Sloth', 'Los perezosos bajan del árbol solo una vez por semana.', 'Sloths come down from their tree only once a week.'),
  // Asia
  A('orangutan', '🦧', 'asia', false, 'monkey', 'Orangután', 'Orangutan', 'Los orangutanes hacen paraguas con hojas grandes.', 'Orangutans make umbrellas out of big leaves.'),
  A('bufalo', '🐃', 'asia', false, 'moo', 'Búfalo de agua', 'Water buffalo', 'A los búfalos de agua les encanta bañarse en el barro.', 'Water buffalo love bathing in mud.'),
  A('cobra', '🐍', 'asia', true, 'hiss', 'Cobra', 'Cobra', 'La cobra abre su capucha para parecer más grande.', 'A cobra opens its hood to look bigger.'),
  A('grulla', '🐦', 'asia', true, 'honk', 'Grulla', 'Crane', 'Las grullas bailan dando saltos para enamorarse.', 'Cranes dance and jump to find a partner.'),
  // Europa
  A('zorro', '🦊', 'europa', false, 'fox', 'Zorro', 'Fox', 'El zorro oye a un ratón bajo la nieve.', 'A fox can hear a mouse under the snow.'),
  A('erizo', '🦔', 'europa', false, 'snuffle', 'Erizo', 'Hedgehog', 'Los erizos se hacen una bola de pinchos para protegerse.', 'Hedgehogs roll into a spiky ball to stay safe.'),
  A('ardilla', '🐿️', 'europa', false, 'chatter', 'Ardilla', 'Squirrel', 'Las ardillas esconden nueces y olvidan muchas: ¡así nacen árboles!', 'Squirrels hide nuts and forget many – that’s how trees grow!'),
  A('abeja', '🐝', 'europa', false, 'buzz', 'Abeja', 'Bee', 'Las abejas bailan para contar dónde hay flores.', 'Bees dance to tell each other where the flowers are.'),
  A('grillo', '🦗', 'europa', false, 'cricket', 'Grillo', 'Cricket', 'El grillo canta frotando sus alas.', 'A cricket sings by rubbing its wings.'),
  A('cuervo', '🐦', 'europa', false, 'caw', 'Cuervo', 'Crow', 'Los cuervos son tan listos que resuelven puzles.', 'Crows are so clever they can solve puzzles.'),
  A('jabali', '🐗', 'europa', true, 'oink', 'Jabalí', 'Wild boar', 'Los jabalíes huelen la comida bajo tierra.', 'Wild boars can smell food under the ground.'),
  A('ciervo', '🦌', 'europa', true, 'bugle', 'Ciervo', 'Deer', 'Al ciervo le crecen cuernos nuevos cada año.', 'Deer grow new antlers every year.'),
  A('paloma', '🕊️', 'europa', true, 'coo', 'Paloma', 'Dove', 'Las palomas siempre encuentran el camino a casa.', 'Doves always find their way home.'),
  // Oceanía
  A('cocodrilo', '🐊', 'oceania', false, 'growl', 'Cocodrilo', 'Crocodile', 'Las mamás cocodrilo llevan a sus crías en la boca.', 'Mother crocodiles carry their babies in their mouths.'),
  A('cacatua', '🦜', 'oceania', false, 'parrot', 'Cacatúa', 'Cockatoo', 'Las cacatúas bailan cuando oyen música.', 'Cockatoos dance when they hear music.'),
  A('tortuga', '🐢', 'oceania', true, 'snuffle', 'Tortuga marina', 'Sea turtle', 'Las tortugas vuelven a la playa donde nacieron.', 'Sea turtles return to the beach where they were born.'),
  // Polos
  A('reno', '🦌', 'polos', false, 'snuffle', 'Reno', 'Reindeer', 'Las rodillas de los renos hacen «clic» al andar.', 'Reindeer knees go "click" when they walk.'),
  A('morsa', '🦭', 'polos', false, 'hippo', 'Morsa', 'Walrus', 'Las morsas usan sus colmillos para salir del agua.', 'Walruses use their tusks to climb out of the water.'),
  A('buho-nival', '🦉', 'polos', true, 'owl', 'Búho nival', 'Snowy owl', 'El búho nival caza de día porque en verano no anochece.', 'Snowy owls hunt by day because summer nights never get dark.'),
  A('zorro-artico', '🦊', 'polos', true, 'fox', 'Zorro ártico', 'Arctic fox', 'Su pelo es blanco en invierno y marrón en verano.', 'Its fur is white in winter and brown in summer.'),
];

// Grabaciones reales aprobadas (las genera scripts/process-sounds.mjs).
const REAL = SOUNDS as Record<string, { file: string; author: string; license: string; source: string }>;
for (const a of ANIMALS) {
  const r = REAL[a.id];
  if (r) { a.audio = `./sounds/${r.file}`; a.credit = { author: r.author, license: r.license, source: r.source }; }
}

export const regionById = (id: string) => REGIONS.find((r) => r.id === id);
export const animalById = (id: string) => ANIMALS.find((a) => a.id === id);
export const animalsIn = (id: RegionId) => ANIMALS.filter((a) => a.region === id);
