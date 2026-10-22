import agua from './agua-africa';
import america from './america';
import asiaEuropa from './asia-europa';
import granja from './granja';
import oceaniaPolos from './oceania-polos';
import type { AnimalInfo } from './types';

export type { AnimalInfo, Diet } from './types';
export const INFO: Record<string, AnimalInfo> = { ...granja, ...agua, ...america, ...asiaEuropa, ...oceaniaPolos };
