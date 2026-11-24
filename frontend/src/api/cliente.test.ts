import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { servidorMock } from '../mocks/servidor';
import { api, ErroApi } from './cliente';

describe('cliente da API', () => {
  it('valida e devolve a coleção de áreas', async () => {
    const colecao = await api.areas();
    expect(colecao.features).toHaveLength(5);
    expect(colecao.features[2]?.properties.classes).toEqual(['escolar', 'industrial']);
  });

  it('traz a mensagem e o campo de uma recusa do servidor', async () => {
    servidorMock.use(
      http.post('/api/areas', () =>
        HttpResponse.json(
          {
            erro: 'Polígono inválido: as arestas do polígono se cruzam.',
            campo: 'geometry',
            detalhes: [],
          },
          { status: 422 },
        ),
      ),
    );
    const promessa = api.criarArea({ nome: 'x', geometry: { type: 'Polygon', coordinates: [] } });
    await expect(promessa).rejects.toMatchObject({
      message: 'Polígono inválido: as arestas do polígono se cruzam.',
      status: 422,
      campo: 'geometry',
    });
  });

  it('explica quando o servidor não responde', async () => {
    servidorMock.use(http.get('/api/areas', () => HttpResponse.error()));
    await expect(api.areas()).rejects.toThrow('Confira se o backend está rodando');
  });

  it('recusa uma resposta fora do contrato', async () => {
    servidorMock.use(http.get('/api/areas', () => HttpResponse.json({ type: 'outra coisa' })));
    await expect(api.areas()).rejects.toBeInstanceOf(ErroApi);
  });

  it('aceita a resposta vazia de uma exclusão', async () => {
    servidorMock.use(http.delete('/api/areas/1', () => new HttpResponse(null, { status: 204 })));
    await expect(api.excluirArea(1)).resolves.toBeUndefined();
  });
});
