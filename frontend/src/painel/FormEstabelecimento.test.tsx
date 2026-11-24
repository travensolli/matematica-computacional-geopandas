import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { useAreas } from '../api/consultas';
import { AREAS, ESTABELECIMENTOS } from '../mocks/dados';
import { servidorMock } from '../mocks/servidor';
import { renderizar } from '../testes/renderizar';
import { FormEstabelecimento } from './FormEstabelecimento';

/** Mantém a consulta de áreas ativa, como a lista faz na página. */
function ObservaAreas() {
  useAreas();
  return null;
}

describe('FormEstabelecimento', () => {
  it('salva a escola e conta qual área mudou de classe', async () => {
    let salvo = false;
    servidorMock.use(
      http.post('/api/estabelecimentos', () => {
        salvo = true;
        return HttpResponse.json(ESTABELECIMENTOS.features[0], { status: 201 });
      }),
      http.get('/api/areas', () => {
        if (!salvo) return HttpResponse.json(AREAS);
        const features = AREAS.features.map((f) =>
          f.properties.id === 4
            ? { ...f, properties: { ...f.properties, classes: ['escolar'] } }
            : f,
        );
        return HttpResponse.json({ ...AREAS, features });
      }),
    );
    const aoConcluir = vi.fn();
    renderizar(
      <>
        <ObservaAreas />
        <FormEstabelecimento
          posicao={{ lat: -23.31, lng: -45.925 }}
          tipo="escola"
          aoMudarTipo={() => {}}
          editando={null}
          aoConcluir={aoConcluir}
        />
      </>,
    );
    expect(await screen.findByText('Local: -23,31000; -45,92500')).toBeInTheDocument();
    await screen.findByRole('radio', { name: 'Escola' });
    await new Promise((r) => setTimeout(r, 50));
    await userEvent.type(screen.getByRole('textbox', { name: 'Nome' }), 'EE Nova');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar estabelecimento' }));
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Escola salva: “EE Nova”. Vila residencial passou de residencial para escolar.',
    );
    expect(aoConcluir).toHaveBeenCalledOnce();
  });

  it('pede o local antes de salvar', () => {
    renderizar(
      <FormEstabelecimento
        posicao={null}
        tipo="industria"
        aoMudarTipo={() => {}}
        editando={null}
        aoConcluir={() => {}}
      />,
    );
    expect(screen.getByText('Local: clique no mapa onde ele fica.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Salvar estabelecimento' })).toBeDisabled();
  });
});
