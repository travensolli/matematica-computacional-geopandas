import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CONSULTA_SOBREPOSICAO } from '../mocks/dados';
import { renderizar } from '../testes/renderizar';
import { ResultadoConsulta } from './ResultadoConsulta';

describe('ResultadoConsulta', () => {
  it('mostra o veredito, as áreas e a explicação em conjuntos', async () => {
    const aoLimpar = vi.fn();
    renderizar(
      <ResultadoConsulta
        consulta={CONSULTA_SOBREPOSICAO}
        carregando={false}
        erro={null}
        aoTentarDeNovo={() => {}}
        aoLimpar={aoLimpar}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Área escolar e industrial' })).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Classes do ponto' })).toHaveTextContent(
      'EscolarIndustrial',
    );
    expect(screen.getByText('Pertence a 2 de 5 áreas:')).toBeInTheDocument();
    expect(screen.getByText('p ∈ Jardim Santa Maria')).toBeInTheDocument();
    expect(screen.getByText('p ∉ cada uma das outras 3 áreas')).toBeInTheDocument();
    expect(
      screen.getByText('classes(p) = {escolar} ∪ {escolar, industrial} = {escolar, industrial}'),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Limpar consulta' }));
    expect(aoLimpar).toHaveBeenCalledOnce();
  });

  it('usa o quantificador quando o ponto está fora de todas as áreas', () => {
    renderizar(
      <ResultadoConsulta
        consulta={{
          ...CONSULTA_SOBREPOSICAO,
          classes: [],
          areas: [],
          resumo: 'O ponto não está em nenhuma área cadastrada.',
        }}
        carregando={false}
        erro={null}
        aoTentarDeNovo={() => {}}
        aoLimpar={() => {}}
      />,
    );
    expect(screen.getByText('∀ a ∈ A: p ∉ a')).toBeInTheDocument();
    expect(screen.getByText('classes(p) = ∅')).toBeInTheDocument();
  });

  it('oferece tentar de novo quando a consulta falha', async () => {
    const aoTentarDeNovo = vi.fn();
    renderizar(
      <ResultadoConsulta
        carregando={false}
        erro={new Error('Não foi possível falar com o servidor.')}
        aoTentarDeNovo={aoTentarDeNovo}
        aoLimpar={() => {}}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível falar com o servidor.');
    await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(aoTentarDeNovo).toHaveBeenCalledOnce();
  });
});
