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
  { id: 'asia', emoji: '🐯', name: { es: 'Asia', en: 'Asia' }, sky: ['#ffb8c9', '#fff0e0'], hills: ['#8fcf8f', '#4e9e6a'], accent: '#d94f7a' },
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
  A('loro', '🦜', 'america', true, 'parrot', 'Loro', 'Parrot', 'Algunos loros pueden imitar palabras.', 'Some parrots can copy words.'),
  A('aguila', '🦅', 'america', true, 'eagle', 'Águila', 'Eagle', 'El águila ve un conejo desde muy, muy alto.', 'An eagle can spot a rabbit from very high up.'),
  // Asia
  A('tigre', '🐅', 'asia', false, 'tiger', 'Tigre', 'Tiger', 'No hay dos tigres con las mismas rayas.', 'No two tigers have the same stripes.'),
  A('pavo-real', '🦚', 'asia', false, 'peacock', 'Pavo real', 'Peacock', 'El pavo real abre su cola como un abanico gigante.', 'The peacock opens its tail like a giant fan.'),
  // Europa
  A('buho', '🦉', 'europa', false, 'owl', 'Búho', 'Owl', 'Los búhos giran la cabeza casi del todo.', 'Owls can turn their heads almost all the way round.'),
  A('rana', '🐸', 'europa', false, 'frog', 'Rana', 'Frog', 'Las ranas beben agua a través de la piel.', 'Frogs drink water through their skin.'),
  A('cuco', '🐦', 'europa', true, 'cuckoo', 'Cuco', 'Cuckoo', 'El cuco se llama así por su canto: «cu-cú».', 'The cuckoo is named after its song: "cuck-oo".'),
  // Oceanía
  A('koala', '🐨', 'oceania', false, 'koala', 'Koala', 'Koala', 'Los koalas duermen hasta 20 horas al día.', 'Koalas sleep up to 20 hours a day.'),
  A('kookaburra', '🪶', 'oceania', false, 'kookaburra', 'Cucaburra', 'Kookaburra', 'Su canto parece una carcajada.', 'Its call sounds like laughter.'),
  // Polos
  A('pinguino', '🐧', 'polos', false, 'penguin', 'Pingüino', 'Penguin', 'Los pingüinos no vuelan, pero nadan rapidísimo.', "Penguins can't fly, but they swim super fast."),
  // ---- Ampliación ----
  // Granja
  A('cabra', '🐐', 'granja', false, 'baa', 'Cabra', 'Goat', 'Las cabras trepan a los árboles para comer hojas.', 'Goats climb trees to eat leaves.'),
  A('gallina', '🐔', 'granja', false, 'cluck', 'Gallina', 'Hen', 'Las gallinas hablan con sus pollitos antes de que salgan del huevo.', 'Hens talk to their chicks before they hatch.'),
  A('pollito', '🐥', 'granja', false, 'peep', 'Pollito', 'Chick', 'Los pollitos pían para no perder a su mamá.', 'Chicks peep so they don’t lose their mum.'),
  A('pavo', '🦃', 'granja', false, 'gobble', 'Pavo', 'Turkey', 'Cuando el pavo se emociona, su cuello cambia de color.', 'When a turkey gets excited, its neck changes colour.'),
  A('burro', '🐴', 'granja', false, 'bray', 'Burro', 'Donkey', 'El rebuzno del burro se oye a 3 kilómetros.', 'A donkey’s bray can be heard 3 kilometres away.'),
  A('ganso', '🦢', 'granja', false, 'honk', 'Ganso', 'Goose', 'Los gansos vuelan en forma de V para cansarse menos.', 'Geese fly in a V shape to save energy.'),
  A('conejo', '🐇', 'granja', false, 'squeak', 'Conejo', 'Rabbit', 'Los conejos dan saltitos de alegría llamados «binkies».', 'Rabbits do happy jumps called "binkies".'),
  A('toro', '🐂', 'granja', false, 'moo', 'Toro', 'Bull', 'Los toros no ven bien el color rojo.', 'Bulls can’t really see the colour red.'),
  // Océano
  A('orca', '🐳', 'oceano', false, 'dolphin', 'Orca', 'Orca', 'Cada familia de orcas tiene su propio «idioma».', 'Each orca family has its own "language".'),
  A('nutria', '🦦', 'oceano', true, 'squeak', 'Nutria', 'Otter', 'Las nutrias se dan la mano para dormir y no separarse.', 'Otters hold hands while they sleep so they don’t drift apart.'),
  A('gaviota', '🕊️', 'oceano', true, 'gull', 'Gaviota', 'Seagull', 'Las gaviotas pueden beber agua salada.', 'Seagulls can drink salty water.'),
  // África
  A('jirafa', '🦒', 'africa', false, 'hum', 'Jirafa', 'Giraffe', 'Las jirafas casi no hacen ruido, pero de noche zumban.', 'Giraffes are very quiet, but they hum at night.'),
  A('rinoceronte', '🦏', 'africa', true, 'hippo', 'Rinoceronte', 'Rhino', 'El cuerno del rinoceronte está hecho de lo mismo que tus uñas.', 'A rhino’s horn is made of the same stuff as your nails.'),
  A('gorila', '🦍', 'africa', true, 'growl', 'Gorila', 'Gorilla', 'Los gorilas se golpean el pecho para saludar o avisar.', 'Gorillas beat their chests to say hello or warn others.'),
  A('flamenco', '🦩', 'africa', true, 'honk', 'Flamenco', 'Flamingo', 'Los flamencos son rosas por lo que comen.', 'Flamingos are pink because of what they eat.'),
  A('camello', '🐫', 'africa', true, 'hippo', 'Camello', 'Camel', 'La joroba del camello guarda grasa, no agua.', 'A camel’s hump stores fat, not water.'),
  // América
  A('bisonte', '🦬', 'america', true, 'growl', 'Bisonte', 'Bison', 'Los bisontes pueden correr tan rápido como un caballo.', 'Bison can run as fast as a horse.'),
  A('mapache', '🦝', 'america', true, 'squeak', 'Mapache', 'Raccoon', 'Los mapaches tocan todo con sus manitas para conocerlo.', 'Raccoons touch everything with their little hands to learn about it.'),
  A('serpiente', '🐍', 'america', true, 'rattle', 'Serpiente de cascabel', 'Rattlesnake', 'Agita la cola como un sonajero para decir «¡no te acerques!».', 'It shakes its tail like a rattle to say "stay away!".'),
  A('alce', '🦌', 'america', true, 'bugle', 'Alce', 'Moose', 'Los alces son grandes nadadores.', 'Moose are great swimmers.'),
  // Asia
  A('bufalo', '🐃', 'asia', true, 'moo', 'Búfalo de agua', 'Water buffalo', 'A los búfalos de agua les encanta bañarse en el barro.', 'Water buffalo love bathing in mud.'),
  A('cobra', '🐍', 'asia', true, 'hiss', 'Cobra', 'Cobra', 'La cobra abre su capucha para parecer más grande.', 'A cobra opens its hood to look bigger.'),
  A('grulla', '🐦', 'asia', true, 'honk', 'Grulla', 'Crane', 'Las grullas bailan dando saltos para enamorarse.', 'Cranes dance and jump to find a partner.'),
  // Europa
  A('zorro', '🦊', 'europa', false, 'fox', 'Zorro', 'Fox', 'El zorro oye a un ratón bajo la nieve.', 'A fox can hear a mouse under the snow.'),
  A('erizo', '🦔', 'europa', true, 'snuffle', 'Erizo', 'Hedgehog', 'Los erizos se hacen una bola de pinchos para protegerse.', 'Hedgehogs roll into a spiky ball to stay safe.'),
  A('ardilla', '🐿️', 'europa', true, 'chatter', 'Ardilla', 'Squirrel', 'Las ardillas esconden nueces y olvidan muchas: ¡así nacen árboles!', 'Squirrels hide nuts and forget many – that’s how trees grow!'),
  A('abeja', '🐝', 'europa', true, 'buzz', 'Abeja', 'Bee', 'Las abejas bailan para contar dónde hay flores.', 'Bees dance to tell each other where the flowers are.'),
  A('grillo', '🦗', 'europa', true, 'cricket', 'Grillo', 'Cricket', 'El grillo canta frotando sus alas.', 'A cricket sings by rubbing its wings.'),
  A('cuervo', '🐦', 'europa', true, 'caw', 'Cuervo', 'Crow', 'Los cuervos son tan listos que resuelven puzles.', 'Crows are so clever they can solve puzzles.'),
  A('jabali', '🐗', 'europa', true, 'oink', 'Jabalí', 'Wild boar', 'Los jabalíes huelen la comida bajo tierra.', 'Wild boars can smell food under the ground.'),
  A('ciervo', '🦌', 'europa', true, 'bugle', 'Ciervo', 'Deer', 'Al ciervo le crecen cuernos nuevos cada año.', 'Deer grow new antlers every year.'),
  A('paloma', '🕊️', 'europa', true, 'coo', 'Paloma', 'Dove', 'Las palomas siempre encuentran el camino a casa.', 'Doves always find their way home.'),
  // Oceanía
  A('cacatua', '🦜', 'oceania', true, 'parrot', 'Cacatúa', 'Cockatoo', 'Las cacatúas bailan cuando oyen música.', 'Cockatoos dance when they hear music.'),
  A('tortuga', '🐢', 'oceania', true, 'snuffle', 'Tortuga marina', 'Sea turtle', 'Las tortugas vuelven a la playa donde nacieron.', 'Sea turtles return to the beach where they were born.'),
  // Polos
  A('reno', '🦌', 'polos', false, 'snuffle', 'Reno', 'Reindeer', 'Las rodillas de los renos hacen «clic» al andar.', 'Reindeer knees go "click" when they walk.'),
  A('buho-nival', '🦉', 'polos', true, 'owl', 'Búho nival', 'Snowy owl', 'El búho nival caza de día porque en verano no anochece.', 'Snowy owls hunt by day because summer nights never get dark.'),
  // ---- Ampliación 2 ----
  // Granja y mascotas
  A('cordero', '🐑', 'granja', false, 'baa', 'Cordero', 'Lamb', 'Cada cordero reconoce el balido de su mamá entre cientos.', 'Every lamb knows its mum’s bleat among hundreds.'),
  A('gatito', '🐱', 'granja', false, 'meow', 'Gatito', 'Kitten', 'Los gatitos ronronean desde que tienen una semana.', 'Kittens can purr when they are just one week old.'),
  A('raton', '🐁', 'granja', false, 'squeak', 'Ratón', 'Mouse', 'Los ratones cantan canciones que nosotros no podemos oír.', 'Mice sing songs that we can’t hear.'),
  A('periquito', '🦜', 'granja', false, 'parrot', 'Periquito', 'Budgie', 'Los periquitos pueden aprender palabras.', 'Budgies can learn words.'),
  // Océano
  // África
  A('nu', '🐃', 'africa', true, 'growl', 'Ñu', 'Wildebeest', 'Millones de ñus viajan juntos buscando hierba.', 'Millions of wildebeest travel together looking for grass.'),
  A('babuino', '🐒', 'africa', true, 'monkey', 'Babuino', 'Baboon', 'Los babuinos viven en grupos grandes llamados tropas.', 'Baboons live in big groups called troops.'),
  // América
  A('mono-aullador', '🐒', 'america', true, 'roar', 'Mono aullador', 'Howler monkey', 'Es el mono más ruidoso: se oye a 5 kilómetros.', 'It’s the loudest monkey: you can hear it 5 kilometres away.'),
  A('coyote', '🐺', 'america', true, 'howl', 'Coyote', 'Coyote', 'Los coyotes «cantan» en grupo por la noche.', 'Coyotes "sing" together at night.'),
  A('rana-arboricola', '🐸', 'america', true, 'frog', 'Rana arborícola', 'Tree frog', 'Tiene ventosas en los dedos para subir a los árboles.', 'It has sticky toes to climb trees.'),
  A('colibri', '🐦', 'america', true, 'buzz', 'Colibrí', 'Hummingbird', 'El colibrí mueve las alas tan rápido que zumban.', 'Hummingbirds flap so fast their wings hum.'),
  // Asia
  A('gibon', '🐒', 'asia', true, 'monkey', 'Gibón', 'Gibbon', 'Las familias de gibones cantan juntas cada mañana.', 'Gibbon families sing together every morning.'),
  A('cigarra', '🦗', 'asia', true, 'cricket', 'Cigarra', 'Cicada', 'La cigarra canta cuando hace mucho calor.', 'Cicadas sing when it’s very hot.'),
  A('yak', '🐂', 'asia', true, 'growl', 'Yak', 'Yak', 'Los yaks gruñen en lugar de mugir.', 'Yaks grunt instead of mooing.'),
  // Europa
  A('murcielago', '🦇', 'europa', true, 'squeak', 'Murciélago', 'Bat', 'Los murciélagos «ven» con el sonido de su eco.', 'Bats "see" using the echo of their calls.'),
  A('lechuza', '🦉', 'europa', true, 'hiss', 'Lechuza', 'Barn owl', 'La lechuza no ulula: ¡bufa y chilla!', 'Barn owls don’t hoot – they hiss and screech!'),
  A('ruisenor', '🐦', 'europa', true, 'parrot', 'Ruiseñor', 'Nightingale', 'El ruiseñor sabe más de 200 canciones.', 'A nightingale knows more than 200 songs.'),
  A('pajaro-carpintero', '🐦', 'europa', true, 'woodpecker', 'Pájaro carpintero', 'Woodpecker', 'Golpea los árboles 20 veces por segundo.', 'It taps on trees 20 times a second.'),
  A('cisne', '🦢', 'europa', true, 'honk', 'Cisne', 'Swan', 'Las crías del cisne viajan en la espalda de sus padres.', 'Baby swans ride on their parents’ backs.'),
  A('mosquito', '🦟', 'europa', true, 'buzz', 'Mosquito', 'Mosquito', 'Su zumbido es el ruido de sus alas.', 'Its buzz is the sound of its wings.'),
  // Oceanía
  A('ave-lira', '🐦', 'oceania', true, 'kookaburra', 'Ave lira', 'Lyrebird', 'Imita cualquier sonido, ¡hasta una cámara de fotos!', 'It can copy any sound – even a camera!'),
  A('zorro-volador', '🦇', 'oceania', true, 'squeak', 'Zorro volador', 'Flying fox', 'Es un murciélago gigante que come fruta.', 'It’s a giant bat that eats fruit.'),
  // Polos
  A('pinguino-emperador', '🐧', 'polos', false, 'penguin', 'Pingüino emperador', 'Emperor penguin', 'Los papás cuidan el huevo sobre sus patas.', 'Dads keep the egg warm on their feet.'),
  // ---- Ampliación 3 (iNaturalist) ----
  A("gallina-guinea", "🐔", "granja", false, "cluck", "Gallina de Guinea", "Guinea fowl", "Las gallinas de Guinea gritan para avisar si viene un zorro.", "Guinea fowl shout to warn everyone when a fox is near."),
  A("elefante-marino", "🦭", "oceano", true, "growl", "Elefante marino", "Elephant seal", "Su nariz grande sirve de altavoz para su voz.", "Its big nose works like a loudspeaker for its voice."),
  A("foca-gris", "🦭", "oceano", true, "seal", "Foca gris", "Grey seal", "Las focas grises cantan en las rocas como fantasmas.", "Grey seals sing on the rocks like ghosts."),
  A("indri", "🐒", "africa", true, "monkey", "Indri", "Indri", "El indri canta cada mañana en los bosques de Madagascar.", "The indri sings every morning in the forests of Madagascar."),
  A("chacal", "🐺", "africa", true, "howl", "Chacal", "Jackal", "Los chacales aúllan en familia al atardecer.", "Jackals howl together as a family at sunset."),
  A("calao", "🐦", "africa", true, "caw", "Cálao", "Hornbill", "El cálao tiene un pico enorme pero muy ligero.", "The hornbill has a huge but very light beak."),
  A("turaco", "🐦", "africa", true, "caw", "Turaco gris", "Go-away bird", "Su grito suena como «¡vete!» en inglés: «go away».", "Its call sounds like \"go away!\"."),
  A("perrito-pradera", "🐿️", "america", true, "squeak", "Perrito de las praderas", "Prairie dog", "Ladra para avisar a su familia: ¡tiene palabras para cada peligro!", "It barks to warn its family – it has words for each danger!"),
  A("castor", "🦫", "america", true, "snuffle", "Castor", "Beaver", "Los castores construyen presas con palos y barro.", "Beavers build dams with sticks and mud."),
  A("tucan", "🐦", "america", false, "parrot", "Tucán", "Toucan", "El pico del tucán le ayuda a no pasar calor.", "The toucan’s beak helps it keep cool."),
  A("guacamayo", "🦜", "america", false, "parrot", "Guacamayo", "Macaw", "Los guacamayos viven muchos años, ¡hasta 60!", "Macaws live a long time – up to 60 years!"),
  A("cardenal", "🐦", "america", true, "peep", "Cardenal", "Cardinal", "El cardenal macho es rojo como un tomate.", "The male cardinal is as red as a tomato."),
  A("arrendajo-azul", "🐦", "america", true, "caw", "Arrendajo azul", "Blue jay", "Imita el grito de los halcones para asustar a otros pájaros.", "It copies hawk calls to scare other birds."),
  A("sinsonte", "🐦", "america", true, "parrot", "Sinsonte", "Mockingbird", "Imita a otros pájaros, ¡y hasta alarmas de coche!", "It copies other birds – and even car alarms!"),
  A("buho-barrado", "🦉", "america", true, "owl", "Búho barrado", "Barred owl", "Su canto parece preguntar: «¿quién cocina para ti?».", "Its call sounds like \"who cooks for you?\"."),
  A("colimbo", "🦆", "america", true, "howl", "Colimbo", "Loon", "Su canto en los lagos parece un lamento.", "Its call on the lakes sounds like a sad song."),
  A("rana-toro", "🐸", "america", true, "frog", "Rana toro", "Bullfrog", "Su croar grave suena como una vaca: «¡muuu!».", "Its deep croak sounds like a cow: \"moo!\"."),
  A("coqui", "🐸", "america", true, "peep", "Coquí", "Coquí frog", "Es diminuta y canta su nombre: «co-quí».", "It’s tiny and sings its name: \"co-kee\"."),
  A("uapiti", "🦌", "america", true, "bugle", "Uapití", "Elk", "El macho «trompetea» en otoño.", "The male \"bugles\" in autumn."),
  A("pica", "🐭", "america", true, "squeak", "Pica", "Pika", "Las picas guardan hierba seca para el invierno.", "Pikas store dry grass for the winter."),
  A("capuchino", "🐒", "america", true, "monkey", "Mono capuchino", "Capuchin monkey", "Los capuchinos rompen nueces con piedras.", "Capuchins crack nuts with stones."),
  A("martin-pescador", "🐦", "america", true, "chatter", "Martín pescador", "Kingfisher", "Se lanza al agua de cabeza para pescar.", "It dives head first into the water to catch fish."),
  A("codorniz", "🐦", "america", true, "peep", "Codorniz", "Quail", "Su canto dice su nombre en inglés: «bob-white».", "Its song says its name: \"bob-white\"."),
  A("saltamontes-cantor", "🦗", "america", true, "cricket", "Saltamontes cantor", "Katydid", "Canta de noche: «¡sí lo hizo, no lo hizo!».", "It sings at night: \"Katy did, Katy didn’t!\"."),
  A("geco", "🦎", "asia", true, "peep", "Geco tokay", "Tokay gecko", "El geco grita su nombre: «¡to-kei!».", "The gecko shouts its name: \"to-kay!\"."),
  A("macaco", "🐒", "asia", false, "monkey", "Macaco", "Macaque", "A algunos macacos les encantan los baños calientes.", "Some macaques love hot baths."),
  A("siamang", "🐒", "asia", true, "monkey", "Siamang", "Siamang", "Hincha su garganta como un globo para cantar más fuerte.", "It puffs its throat like a balloon to sing louder."),
  A("faisan", "🐦", "asia", true, "caw", "Faisán", "Pheasant", "El faisán macho tiene plumas de muchos colores.", "The male pheasant has very colourful feathers."),
  A("cotorra", "🦜", "asia", true, "parrot", "Cotorra de Kramer", "Ring-necked parakeet", "Viven en grupos muy ruidosos.", "They live in very noisy groups."),
  A("petirrojo", "🐦", "europa", true, "peep", "Petirrojo", "Robin", "El petirrojo canta incluso en invierno.", "The robin sings even in winter."),
  A("mirlo", "🐦", "europa", true, "parrot", "Mirlo", "Blackbird", "El mirlo canta muy temprano, antes de que salga el sol.", "The blackbird sings very early, before sunrise."),
  A("gorrion", "🐦", "europa", true, "peep", "Gorrión", "Sparrow", "Los gorriones viven cerca de las personas.", "Sparrows live close to people."),
  A("urraca", "🐦", "europa", true, "caw", "Urraca", "Magpie", "Las urracas se reconocen en un espejo.", "Magpies can recognise themselves in a mirror."),
  A("abubilla", "🐦", "europa", true, "coo", "Abubilla", "Hoopoe", "Su canto dice «up-up-up».", "Its call goes \"oop-oop-oop\"."),
  A("golondrina", "🐦", "europa", true, "peep", "Golondrina", "Swallow", "Viajan miles de kilómetros cada año.", "They travel thousands of kilometres every year."),
  A("mochuelo", "🦉", "europa", true, "owl", "Mochuelo", "Little owl", "Es un búho pequeñito que sale de día.", "It’s a tiny owl that comes out during the day."),
  A("corzo", "🦌", "europa", true, "bugle", "Corzo", "Roe deer", "El corzo ladra cuando se asusta.", "Roe deer bark when they get scared."),
  A("marmota", "🐿️", "europa", true, "peep", "Marmota", "Marmot", "Silba para avisar de peligro y duerme todo el invierno.", "It whistles to warn of danger and sleeps all winter."),
  A("liron", "🐭", "europa", true, "squeak", "Lirón", "Dormouse", "Los lirones duermen ¡hasta 7 meses!", "Dormice sleep for up to 7 months!"),
  A("saltamontes", "🦗", "europa", true, "cricket", "Saltamontes", "Grasshopper", "Canta frotando sus alas en verano.", "It sings by rubbing its wings in summer."),
  A("kiwi", "🥝", "oceania", false, "peep", "Kiwi", "Kiwi", "El kiwi no vuela y tiene la nariz en la punta del pico.", "The kiwi can’t fly and has its nose at the tip of its beak."),
  A("kea", "🦜", "oceania", true, "parrot", "Kea", "Kea", "Es un loro de las montañas nevadas, muy travieso.", "It’s a very cheeky parrot from the snowy mountains."),
  A("tui", "🐦", "oceania", true, "parrot", "Tui", "Tui", "El tui canta con dos voces a la vez.", "The tui sings with two voices at once."),
  A("campanero", "🐦", "oceania", true, "peep", "Campanero", "Bellbird", "Su canto suena como campanitas.", "Its song sounds like little bells."),
  A("ruru", "🦉", "oceania", true, "owl", "Ruru", "Morepork", "Su canto dice «more-pork».", "Its call says \"more-pork\"."),
  A("urraca-australiana", "🐦", "oceania", true, "parrot", "Urraca australiana", "Australian magpie", "Su canto es como una flauta.", "Its song sounds like a flute."),
  A("zarigueya", "🐨", "oceania", true, "growl", "Pósum", "Possum", "El pósum sale de noche y trepa muy bien.", "The possum comes out at night and climbs very well."),
  A("lagopodo", "🐦", "polos", true, "caw", "Perdiz nival", "Ptarmigan", "Sus plumas se vuelven blancas en invierno.", "Its feathers turn white in winter."),
  A("charran-artico", "🐦", "polos", true, "gull", "Charrán ártico", "Arctic tern", "Viaja cada año de un polo al otro.", "It flies from one pole to the other every year."),
  A("barnacla", "🦢", "polos", true, "honk", "Barnacla", "Barnacle goose", "Los pollitos saltan desde acantilados al nacer.", "Chicks jump from cliffs when they hatch."),
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
