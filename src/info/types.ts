// Ficha ampliada de cada animal: dónde vive, qué come, su cría, tamaño, años de vida y curiosidades.
export type Diet = 'h' | 'c' | 'o' | 'i';
export interface InfoText { home: string; food: string; baby: string; size: string; more: [string, string] }
export interface AnimalInfo { diet: Diet; weight: string; life: string; es: InfoText; en: InfoText }

type Six = [string, string, string, string, string, string];
const T = (a: Six): InfoText => ({ home: a[0], food: a[1], baby: a[2], size: a[3], more: [a[4], a[5]] });

/** I(dieta, peso, años de vida, [es: hogar, comida, cría, tamaño, curiosidad, curiosidad], [en: …]) */
export const I = (diet: Diet, weight: string, life: string, es: Six, en: Six): AnimalInfo => ({ diet, weight, life, es: T(es), en: T(en) });
