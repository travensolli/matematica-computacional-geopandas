import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderizar } from '../testes/renderizar';
import { CONCEITOS } from '../teoria/conceitos';
import { PaginaTeoria } from './Teoria';

describe('PaginaTeoria', () => {
  it('abre com a ideia central e leva às telas do sistema', () => {
    renderizar(<PaginaTeoria />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Cada área do mapa é um conjunto.' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Abrir o mapa' })).toHaveAttribute('href', '/mapa');
    expect(screen.getByRole('link', { name: 'Experimentar as operações' })).toHaveAttribute(
      'href',
      '/operacoes',
    );
  });

  it('lista os conceitos do material na ordem, cada um com a referência', () => {
    renderizar(<PaginaTeoria />);
    const indice = screen.getByRole('navigation', { name: 'Conceitos desta página' });
    expect(
      within(indice)
        .getAllByRole('link')
        .map((l) => l.textContent),
    ).toEqual(CONCEITOS.map((c) => c.titulo));
    expect(
      screen.getByRole('heading', { level: 3, name: 'Produto cartesiano' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Notas de aula, §4.7, eq. (16)')).toBeInTheDocument();
  });

  it('mostra P(T) e os números do produto calculados pelo backend', async () => {
    renderizar(<PaginaTeoria />);
    const tabela = await screen.findByRole('table');
    expect(within(tabela).getAllByRole('row')).toHaveLength(9);
    expect(within(tabela).getByText(/5 resultados diferentes/)).toBeInTheDocument();
    expect(await screen.findByText(/pares, dos quais 10 têm/)).toBeInTheDocument();
    expect(
      screen.getByText(/Todo estabelecimento está em ao menos uma área\./),
    ).toBeInTheDocument();
  });

  it('exibe o código-fonte lido do backend', async () => {
    renderizar(<PaginaTeoria />);
    const [primeiro] = screen.getAllByText('Código executado no backend');
    await userEvent.click(primeiro!);
    expect(await screen.findByText(/predicate="within"/)).toBeInTheDocument();
    expect(screen.getByText('zoneamento/geo/conjuntos.py, linha 18')).toBeInTheDocument();
  });
});
