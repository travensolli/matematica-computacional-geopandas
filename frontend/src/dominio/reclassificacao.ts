import type { FeatureArea } from '../api/esquemas';
import { descreverClasses } from './classes';

/** Frases sobre as áreas cuja classe mudou entre duas leituras do cadastro. */
export function mudancasDeClasse(antes: FeatureArea[], depois: FeatureArea[]): string[] {
  const anteriores = new Map(antes.map((a) => [a.properties.id, a.properties.classes]));
  return depois.flatMap((area) => {
    const anterior = anteriores.get(area.properties.id);
    const atual = area.properties.classes;
    if (!anterior || descreverClasses(anterior) === descreverClasses(atual)) return [];
    return [
      `${area.properties.nome} passou de ${descreverClasses(anterior)} para ${descreverClasses(atual)}`,
    ];
  });
}
