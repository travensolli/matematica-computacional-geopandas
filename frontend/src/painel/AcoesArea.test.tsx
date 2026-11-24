import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { ColecaoAreasSchema } from '../api/esquemas';
import { AREAS } from '../mocks/dados';
import { servidorMock } from '../mocks/servidor';
import { renderizar } from '../testes/renderizar';
import { AcoesArea } from './AcoesArea';

const area = ColecaoAreasSchema.parse(AREAS).features[0]!;

describe('AcoesArea', () => {
  it('exclui depois de confirmar no diálogo', async () => {
    const excluir = vi.fn(() => new HttpResponse(null, { status: 204 }));
    servidorMock.use(http.delete('/api/areas/1', excluir));
    renderizar(<AcoesArea area={area} aoRedesenhar={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: 'Excluir Jardim Santa Maria' }));
    expect(
      screen.getByRole('dialog', { name: 'Excluir a área “Jardim Santa Maria”?' }),
    ).toBeInTheDocument();
    expect(excluir).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Excluir área' }));
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Área excluída: “Jardim Santa Maria”.',
    );
    expect(excluir).toHaveBeenCalledOnce();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renomeia pelo diálogo', async () => {
    servidorMock.use(
      http.patch('/api/areas/1', async ({ request }) => {
        const corpo = (await request.json()) as { nome: string };
        return HttpResponse.json({ ...area, properties: { ...area.properties, nome: corpo.nome } });
      }),
    );
    renderizar(<AcoesArea area={area} aoRedesenhar={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: 'Renomear Jardim Santa Maria' }));
    const campo = screen.getByLabelText('Novo nome');
    await userEvent.clear(campo);
    await userEvent.type(campo, 'Santa Maria');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar nome' }));
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Área renomeada para “Santa Maria”.',
    );
  });

  it('pede o redesenho da área', async () => {
    const aoRedesenhar = vi.fn();
    renderizar(<AcoesArea area={area} aoRedesenhar={aoRedesenhar} />);
    await userEvent.click(screen.getByRole('button', { name: 'Redesenhar Jardim Santa Maria' }));
    expect(aoRedesenhar).toHaveBeenCalledWith(area);
  });
});
