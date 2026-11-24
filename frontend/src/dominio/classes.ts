import type { Classe, TipoEstabelecimento } from '../api/esquemas';
import { listarComE } from '../utilitarios/formatar';

export const CLASSES: readonly Classe[] = ['escolar', 'industrial', 'residencial'];
export const TIPOS: readonly TipoEstabelecimento[] = ['escola', 'industria', 'residencia'];

export const ROTULO_CLASSE: Record<Classe, string> = {
  escolar: 'Escolar',
  industrial: 'Industrial',
  residencial: 'Residencial',
};

export const ROTULO_TIPO: Record<TipoEstabelecimento, string> = {
  escola: 'Escola',
  industria: 'Indústria',
  residencia: 'Residência',
};

export const PLURAL_TIPO: Record<TipoEstabelecimento, string> = {
  escola: 'escolas',
  industria: 'indústrias',
  residencia: 'residências',
};

/** Classe que cada tipo de estabelecimento confere à área que o contém. */
export const CLASSE_DO_TIPO: Record<TipoEstabelecimento, Classe> = {
  escola: 'escolar',
  industria: 'industrial',
  residencia: 'residencial',
};

/**
 * Aparência de uma combinação de classes no mapa. Escolar e industrial juntas não ganham uma
 * cor nova: as duas hachuras se cruzam, que é o desenho da interseção.
 */
export type Aparencia = Classe | 'misto' | 'nenhuma';

export function aparencia(classes: readonly Classe[]): Aparencia {
  if (classes.length === 0) return 'nenhuma';
  if (classes.length > 1) return 'misto';
  return classes[0] ?? 'nenhuma';
}

/** "escolar e industrial", "residencial", "sem classificação". */
export function descreverClasses(classes: readonly Classe[]): string {
  if (classes.length === 0) return 'sem classificação';
  return listarComE(CLASSES.filter((c) => classes.includes(c)));
}
