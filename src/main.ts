import './style.css';
import type { RegionId } from './data';
import { regionById, animalById } from './data';
import { mountScene, setSceneRegion } from './scenery';
import { animal } from './screens/animal';
import { favorites } from './screens/favorites';
import { game, gamePicker } from './screens/game';
import { home } from './screens/home';
import { map } from './screens/map';
import { parents } from './screens/parents';
import { region } from './screens/region';
import { store } from './store';
import { installGlobalHandlers } from './ui';

const app = document.getElementById('app')!;
mountScene(document.body);
installGlobalHandlers();
document.documentElement.lang = store.lang;

let cleanup: void | (() => void);

function route() {
  if (typeof cleanup === 'function') cleanup();
  cleanup = undefined;
  const [path, query = ''] = location.hash.replace(/^#/, '').split('?');
  const params = new URLSearchParams(query);
  const parts = path.split('/').filter(Boolean);
  let scene: RegionId | null = null;
  const view = document.createElement('div');
  view.className = 'view';

  switch (parts[0]) {
    case 'mundo': map(view); scene = 'oceano'; break;
    case 'region': region(view, parts[1] as RegionId); scene = regionById(parts[1])?.id ?? null; break;
    case 'animal': cleanup = animal(view, parts[1], params.get('from') === 'fav'); scene = animalById(parts[1])?.region ?? null; break;
    case 'juego': if (parts[1]) { game(view, parts[1] as RegionId | 'todo'); scene = regionById(parts[1])?.id ?? 'asia'; } else { gamePicker(view); scene = 'asia'; } break;
    case 'favoritos': favorites(view); scene = 'europa'; break;
    case 'padres': parents(view, params.get('next')); scene = 'polos'; break;
    default: home(view);
  }
  setSceneRegion(scene);
  app.querySelectorAll('.view').forEach((v) => v.remove());
  app.appendChild(view);
  view.querySelector<HTMLElement>('h1, h2')?.setAttribute('tabindex', '-1');
}

window.addEventListener('hashchange', route);
route();

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
