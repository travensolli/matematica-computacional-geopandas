import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Formula } from './Formula';

describe('Formula', () => {
  it('separa variáveis, palavras, números e operadores', () => {
    const { container } = render(<Formula texto="Escolares = { a ∈ A | escola ∈ T(a) }" />);
    const tags = [...container.querySelectorAll('mrow > *')].map(
      (e) => `${e.tagName.toLowerCase()}:${e.textContent}`,
    );
    expect(tags).toEqual([
      'mtext:Escolares',
      'mo:=',
      'mo:{',
      'mi:a',
      'mo:∈',
      'mi:A',
      'mo:|',
      'mtext:escola',
      'mo:∈',
      'mi:T',
      'mo:(',
      'mi:a',
      'mo:)',
      'mo:}',
    ]);
  });

  it('monta cardinalidade, expoentes, índices, negativos e textos entre aspas', () => {
    const { container } = render(
      <Formula texto='#P(T)# = 2^3 = 8, x_1 ∈ [ −90 , 90 ] "e só"' bloco />,
    );
    const cardinalidade = container.querySelector('math > mrow > mrow');
    expect(cardinalidade?.firstElementChild?.textContent).toBe('|');
    expect(cardinalidade?.lastElementChild?.textContent).toBe('|');
    expect(cardinalidade?.textContent).toBe('|P(T)|');
    expect([...container.querySelectorAll('mn')].map((e) => e.textContent)).toContain('−90');
    expect(container.querySelector('msup')?.textContent).toBe('23');
    expect(container.querySelector('msub')?.textContent).toBe('x1');
    expect(container.querySelector('mtext:last-of-type')?.textContent).toBe('e só');
  });
});
