import { describe, expect, it } from 'vitest';
import { contar, listarComE } from '../utilitarios/formatar';
import { aparencia, descreverClasses } from './classes';

describe('classes de área', () => {
  it('escolhe a aparência de cada combinação', () => {
    expect(aparencia([])).toBe('nenhuma');
    expect(aparencia(['residencial'])).toBe('residencial');
    expect(aparencia(['escolar', 'industrial'])).toBe('misto');
  });

  it('descreve as classes em português, na ordem fixa', () => {
    expect(descreverClasses(['industrial', 'escolar'])).toBe('escolar e industrial');
    expect(descreverClasses([])).toBe('sem classificação');
  });

  it('concorda número e junta listas com "e"', () => {
    expect(contar(1, 'escola', 'escolas')).toBe('1 escola');
    expect(contar(3, 'escola', 'escolas')).toBe('3 escolas');
    expect(listarComE(['a', 'b', 'c'])).toBe('a, b e c');
  });
});
