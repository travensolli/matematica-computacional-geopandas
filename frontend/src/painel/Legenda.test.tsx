import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Legenda } from './Legenda';

describe('Legenda', () => {
  it('explica cada classe e liga e desliga as camadas', async () => {
    const aoMudarCamada = vi.fn();
    render(
      <Legenda
        camadas={{ municipio: true, areas: true, sobreposicoes: false, estabelecimentos: true }}
        aoMudarCamada={aoMudarCamada}
      />,
    );
    expect(screen.getByText(/contém somente residências/)).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Sobreposições (A ∩ B)' })).not.toBeChecked();
    await userEvent.click(screen.getByRole('checkbox', { name: 'Limite do município (U)' }));
    expect(aoMudarCamada).toHaveBeenCalledWith('municipio', false);
  });
});
