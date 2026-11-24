import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DialogoConfirmacao } from './Dialogo';

describe('DialogoConfirmacao', () => {
  it('anuncia o título, confirma pela ação nomeada e fecha com Esc', async () => {
    const usuario = userEvent.setup();
    const aoFechar = vi.fn();
    const aoConfirmar = vi.fn();
    render(
      <DialogoConfirmacao
        aberto
        aoFechar={aoFechar}
        aoConfirmar={aoConfirmar}
        titulo="Excluir a área Centro?"
        descricao="Os estabelecimentos dentro dela continuam cadastrados."
        rotuloConfirmar="Excluir área"
        varianteConfirmar="perigo"
      />,
    );
    const dialogo = screen.getByRole('dialog', { name: 'Excluir a área Centro?' });
    expect(dialogo).toHaveAccessibleDescription(
      'Os estabelecimentos dentro dela continuam cadastrados.',
    );
    await usuario.click(screen.getByRole('button', { name: 'Excluir área' }));
    expect(aoConfirmar).toHaveBeenCalledOnce();
    await usuario.keyboard('{Escape}');
    expect(aoFechar).toHaveBeenCalled();
  });
});
