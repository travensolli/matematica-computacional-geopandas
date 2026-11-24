import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ColecaoAreasSchema } from '../api/esquemas';
import { AREAS } from '../mocks/dados';
import { renderizar } from '../testes/renderizar';
import { ListaAreas } from './ListaAreas';

const areas = ColecaoAreasSchema.parse(AREAS).features;

describe('ListaAreas', () => {
  it('lista as áreas com classe, área e contagens em português', () => {
    renderizar(<ListaAreas areas={areas} selecionada={null} aoSelecionar={() => {}} />);
    const item = screen.getByRole('button', { name: /Jardim Santa Maria/ });
    expect(item).toHaveTextContent('escolar, 1,234 km²');
    expect(item).toHaveTextContent('2 escolas, 3 residências');
    expect(screen.getByRole('button', { name: /Parque sem cadastro/ })).toHaveTextContent(
      'nenhum estabelecimento',
    );
  });

  it('filtra por classe e avisa quantas restaram', async () => {
    renderizar(<ListaAreas areas={areas} selecionada={null} aoSelecionar={() => {}} />);
    await userEvent.selectOptions(screen.getByLabelText('Filtrar áreas por classe'), 'misto');
    const lista = screen.getByRole('list');
    expect(within(lista).getAllByRole('button')).toHaveLength(1);
    expect(screen.getByText('1 área exibida de 5')).toBeInTheDocument();
  });

  it('escolhe uma área e marca a selecionada', async () => {
    const aoSelecionar = vi.fn();
    renderizar(<ListaAreas areas={areas} selecionada={2} aoSelecionar={aoSelecionar} />);
    expect(screen.getByRole('button', { name: /Distrito industrial/ })).toHaveAttribute(
      'aria-current',
      'true',
    );
    await userEvent.click(screen.getByRole('button', { name: /Vila residencial/ }));
    expect(aoSelecionar).toHaveBeenCalledWith(
      expect.objectContaining({ properties: expect.objectContaining({ id: 4 }) }),
    );
  });

  it('convida a desenhar a primeira área quando não há nenhuma', () => {
    renderizar(<ListaAreas areas={[]} selecionada={null} aoSelecionar={() => {}} />);
    expect(screen.getByText('Nenhuma área cadastrada ainda.')).toBeInTheDocument();
  });
});
