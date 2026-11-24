import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ConsultaPorCoordenada } from './ConsultaPorCoordenada';

describe('ConsultaPorCoordenada', () => {
  it('aceita vírgula decimal e consulta o ponto digitado', async () => {
    const aoConsultar = vi.fn();
    render(<ConsultaPorCoordenada aoConsultar={aoConsultar} centroDoMapa={() => null} />);
    await userEvent.type(screen.getByLabelText('Latitude'), '-23,29521');
    await userEvent.type(screen.getByLabelText('Longitude'), '-45,96692');
    await userEvent.click(screen.getByRole('button', { name: 'Consultar ponto' }));
    expect(aoConsultar).toHaveBeenCalledWith(-23.29521, -45.96692);
  });

  it('explica a coordenada fora do intervalo', async () => {
    const aoConsultar = vi.fn();
    render(<ConsultaPorCoordenada aoConsultar={aoConsultar} centroDoMapa={() => null} />);
    await userEvent.type(screen.getByLabelText('Latitude'), '95');
    await userEvent.type(screen.getByLabelText('Longitude'), '-45');
    await userEvent.click(screen.getByRole('button', { name: 'Consultar ponto' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Informe a latitude entre −90 e 90.');
    expect(aoConsultar).not.toHaveBeenCalled();
  });

  it('consulta o centro do mapa', async () => {
    const aoConsultar = vi.fn();
    render(
      <ConsultaPorCoordenada
        aoConsultar={aoConsultar}
        centroDoMapa={() => ({ lat: -23.3, lng: -45.966 })}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Usar o centro do mapa' }));
    expect(aoConsultar).toHaveBeenCalledWith(-23.3, -45.966);
    expect(screen.getByLabelText('Latitude')).toHaveValue('-23.30000');
  });
});
