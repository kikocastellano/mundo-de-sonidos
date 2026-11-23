// Textos em português do Brasil para os animais (nome, gênero, curiosidade e ficha).
import a1 from './a1';
import a2 from './a2';
import a3 from './a3';
import a4 from './a4';
import type { PT } from './types';
export const PT_ANIMALS: Record<string, PT> = { ...a1, ...a2, ...a3, ...a4 };
