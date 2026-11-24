import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { AREAS } from '../mocks/dados';
import { servidorMock } from '../mocks/servidor';
import { renderizar } from '../testes/renderizar';
import { FormArea } from './FormArea';

const POLIGONO = {
  type: 'Polygon' as const,
  coordinates: [
    [
      [-45.97, -23.31],
      [-45.96, -23.31],
      [-45.96, -23.3],
      [-45.97, -23.31],
    ],
  ],
};

const props = { aoDesfazer: () => {}, aoRecomecar: () => {} };

describe('FormArea', () => {
  it('só deixa salvar depois de fechar o polígono e dar um nome', async () => {
    const { rerender } = renderizar(
      <FormArea {...props} geometria={null} vertices={2} aoSalvar={() => {}} />,
    );
    expect(screen.getByText(/2 vértices marcados/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Salvar área' })).toBeDisabled();
    rerender(<FormArea {...props} geometria={POLIGONO} vertices={3} aoSalvar={() => {}} />);
    expect(screen.getByText('Polígono fechado com 3 vértices.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Desfazer vértice' })).toBeDisabled();
    await userEvent.type(screen.getByLabelText('Nome da área'), 'Vila nova');
    expect(screen.getByRole('button', { name: 'Salvar área' })).toBeEnabled();
  });

  it('salva e avisa a classe com que a área nasceu', async () => {
    const criada = {
      ...AREAS.features[4]!,
      properties: { ...AREAS.features[4]!.properties, id: 9, nome: 'Vila nova' },
    };
    servidorMock.use(http.post('/api/areas', () => HttpResponse.json(criada, { status: 201 })));
    const aoSalvar = vi.fn();
    renderizar(<FormArea {...props} geometria={POLIGONO} vertices={3} aoSalvar={aoSalvar} />);
    await userEvent.type(screen.getByLabelText('Nome da área'), 'Vila nova');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar área' }));
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Área salva: “Vila nova”. Sem estabelecimentos dentro, ela fica sem classificação.',
    );
    expect(aoSalvar).toHaveBeenCalledOnce();
  });

  it('mostra a recusa do servidor junto do desenho', async () => {
    servidorMock.use(
      http.post('/api/areas', () =>
        HttpResponse.json(
          {
            erro: 'Já existe uma área com exatamente esses limites: Centro.',
            campo: 'geometry',
            detalhes: [],
          },
          { status: 422 },
        ),
      ),
    );
    renderizar(<FormArea {...props} geometria={POLIGONO} vertices={3} aoSalvar={() => {}} />);
    await userEvent.type(screen.getByLabelText('Nome da área'), 'Cópia');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar área' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Já existe uma área com exatamente esses limites',
    );
  });
});
