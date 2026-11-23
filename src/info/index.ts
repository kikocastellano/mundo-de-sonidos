import agua from './agua-africa';
import america from './america';
import asiaEuropa from './asia-europa';
import granja from './granja';
import nuevos from './nuevos';
import oceaniaPolos from './oceania-polos';
import silenciosos from './silenciosos';
import type { AnimalInfo } from './types';
import { toInfoText } from './types';
import { PT_ANIMALS } from '../pt';

export type { AnimalInfo, Diet } from './types';
export const INFO: Record<string, AnimalInfo> = { ...granja, ...agua, ...america, ...asiaEuropa, ...oceaniaPolos, ...nuevos, ...silenciosos };
// Fichas en portugués (Brasil); si faltara alguna, se queda la inglesa.
for (const [id, p] of Object.entries(PT_ANIMALS)) if (INFO[id]) INFO[id].pt = toInfoText(p[3]);
