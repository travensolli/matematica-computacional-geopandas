import { describe, expect, it } from 'vitest';
import { ColecaoAreasSchema } from '../api/esquemas';
import { AREAS } from '../mocks/dados';
import { mudancasDeClasse } from './reclassificacao';

const antes = ColecaoAreasSchema.parse(AREAS).features;

describe('mudancasDeClasse', () => {
  it('descreve só as áreas que mudaram de classe', () => {
    const depois = antes.map((area) =>
      area.properties.id === 4
        ? { ...area, properties: { ...area.properties, classes: ['escolar' as const] } }
        : area,
    );
    expect(mudancasDeClasse(antes, depois)).toEqual([
      'Vila residencial passou de residencial para escolar',
    ]);
  });

  it('não descreve nada quando nenhuma classe mudou', () => {
    expect(mudancasDeClasse(antes, antes)).toEqual([]);
  });
});
