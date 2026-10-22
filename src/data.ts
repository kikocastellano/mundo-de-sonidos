// Ficha de datos de animales y regiones.
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
  A('foca', '🦭', 'oceano', true, 'seal', 'Foca', 'Seal', 'Las focas pueden aguantar la respiración casi una hora.', 'Seals can hold their breath for almost an hour.'),
  // África
  A('leon', '🦁', 'africa', false, 'roar', 'León', 'Lion', 'El rugido del león se oye a 8 kilómetros.', "A lion's roar can be heard 8 kilometres away."),
  A('elefante', '🐘', 'africa', false, 'trumpet', 'Elefante', 'Elephant', 'Los elefantes usan la trompa como nariz, mano y ducha.', 'Elephants use their trunk as a nose, a hand and a shower.'),
  A('mono', '🐒', 'africa', true, 'monkey', 'Chimpancé', 'Chimpanzee', 'Los chimpancés usan palitos como herramientas.', 'Chimpanzees use sticks as tools.'),
  A('hipopotamo', '🦛', 'africa', true, 'hippo', 'Hipopótamo', 'Hippo', 'Los hipopótamos pasan el día en el agua para no quemarse.', 'Hippos spend the day in water to avoid sunburn.'),
  // América
  A('lobo', '🐺', 'america', false, 'howl', 'Lobo', 'Wolf', 'Los lobos aúllan para encontrar a su manada.', 'Wolves howl to find their pack.'),
  A('oso', '🐻', 'america', true, 'growl', 'Oso', 'Bear', 'Los osos duermen casi todo el invierno.', 'Bears sleep through most of the winter.'),
  A('loro', '🦜', 'america', true, 'parrot', 'Loro', 'Parrot', 'Algunos loros pueden imitar palabras.', 'Some parrots can copy words.'),
  A('aguila', '🦅', 'america', true, 'eagle', 'Águila', 'Eagle', 'El águila ve un conejo desde muy, muy alto.', 'An eagle can spot a rabbit from very high up.'),
  // Asia
  A('tigre', '🐅', 'asia', false, 'tiger', 'Tigre', 'Tiger', 'No hay dos tigres con las mismas rayas.', 'No two tigers have the same stripes.'),
  A('panda', '🐼', 'asia', true, 'panda', 'Panda', 'Panda', 'Los pandas comen bambú casi todo el día.', 'Pandas eat bamboo almost all day long.'),
  A('pavo-real', '🦚', 'asia', true, 'peacock', 'Pavo real', 'Peacock', 'El pavo real abre su cola como un abanico gigante.', 'The peacock opens its tail like a giant fan.'),
  // Europa
  A('buho', '🦉', 'europa', false, 'owl', 'Búho', 'Owl', 'Los búhos giran la cabeza casi del todo.', 'Owls can turn their heads almost all the way round.'),
  A('rana', '🐸', 'europa', false, 'frog', 'Rana', 'Frog', 'Las ranas beben agua a través de la piel.', 'Frogs drink water through their skin.'),
  A('cuco', '🐦', 'europa', true, 'cuckoo', 'Cuco', 'Cuckoo', 'El cuco se llama así por su canto: «cu-cú».', 'The cuckoo is named after its song: "cuck-oo".'),
  // Oceanía
  A('canguro', '🦘', 'oceania', false, 'kangaroo', 'Canguro', 'Kangaroo', 'Las crías de canguro viven en la bolsa de su mamá.', 'Baby kangaroos live in their mum’s pouch.'),
  A('koala', '🐨', 'oceania', true, 'koala', 'Koala', 'Koala', 'Los koalas duermen hasta 20 horas al día.', 'Koalas sleep up to 20 hours a day.'),
  A('kookaburra', '🪶', 'oceania', true, 'kookaburra', 'Cucaburra', 'Kookaburra', 'Su canto parece una carcajada.', 'Its call sounds like laughter.'),
  // Polos
  A('pinguino', '🐧', 'polos', false, 'penguin', 'Pingüino', 'Penguin', 'Los pingüinos no vuelan, pero nadan rapidísimo.', "Penguins can't fly, but they swim super fast."),
  A('oso-polar', '🐻‍❄️', 'polos', true, 'polar', 'Oso polar', 'Polar bear', 'Bajo su pelo blanco, la piel del oso polar es negra.', "Under its white fur, a polar bear's skin is black."),
];

export const regionById = (id: string) => REGIONS.find((r) => r.id === id);
export const animalById = (id: string) => ANIMALS.find((a) => a.id === id);
export const animalsIn = (id: RegionId) => ANIMALS.filter((a) => a.region === id);
