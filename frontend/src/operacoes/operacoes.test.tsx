import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ESTABELECIMENTOS, OPERACAO_INTERSECCAO, RELACOES } from '../mocks/dados';
import { renderizar } from '../testes/renderizar';
import { ColecaoEstabelecimentosSchema } from '../api/esquemas';
import { RelacoesAreas } from './RelacoesAreas';
import { ResultadoOperacaoCartao } from './ResultadoOperacao';

const estabelecimentos = ColecaoEstabelecimentosSchema.parse(ESTABELECIMENTOS).features;

describe('ResultadoOperacaoCartao', () => {
  it('mostra a definição, a medida, os elementos e o código das duas versões', () => {
    renderizar(
      <ResultadoOperacaoCartao
        resultado={OPERACAO_INTERSECCAO}
        carregando={false}
        erro={null}
        aoTentarDeNovo={() => {}}
        estabelecimentos={estabelecimentos}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Intersecção: A ∩ B' })).toBeInTheDocument();
    expect(screen.getByText('A = Jardim Santa Maria; B = Distrito industrial')).toBeInTheDocument();
    expect(screen.getByText('0,123 km²')).toBeInTheDocument();
    expect(screen.getByText('Fatec Jacareí e Metalúrgica.')).toBeInTheDocument();
    expect(screen.getByText('gpd.overlay(A, B, how="intersection")')).toBeInTheDocument();
    expect(screen.getByText(/SELECT ST_Intersection/)).toBeInTheDocument();
  });

  it('chama de conjunto vazio o resultado sem pontos', () => {
    renderizar(
      <ResultadoOperacaoCartao
        resultado={{
          ...OPERACAO_INTERSECCAO,
          vazio: true,
          geometria: null,
          area_km2: 0,
          estabelecimentos: [],
        }}
        carregando={false}
        erro={null}
        aoTentarDeNovo={() => {}}
      />,
    );
    expect(screen.getByText('∅')).toBeInTheDocument();
    expect(screen.getByText(/O resultado é o conjunto vazio/)).toBeInTheDocument();
  });
});

describe('RelacoesAreas', () => {
  it('diz sim ou não por escrito, sem depender só da cor', () => {
    renderizar(<RelacoesAreas relacoes={RELACOES} />);
    const linhas = screen.getAllByRole('listitem');
    expect(linhas[0]).toHaveTextContent('A = Bnão');
    expect(linhas[1]).toHaveTextContent('A ⊆ Bsime próprio: A ⊂ B');
    expect(linhas[3]).toHaveTextContent('A ∩ B = ∅não');
  });
});
