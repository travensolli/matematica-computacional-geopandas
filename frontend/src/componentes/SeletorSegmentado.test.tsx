import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { SeletorSegmentado } from './SeletorSegmentado';

function Exemplo() {
  const [valor, setValor] = useState<'a' | 'b' | 'c'>('a');
  return (
    <SeletorSegmentado
      rotulo="Modo"
      valor={valor}
      aoMudar={setValor}
      opcoes={[
        { valor: 'a', rotulo: 'Consultar' },
        { valor: 'b', rotulo: 'Nova área' },
        { valor: 'c', rotulo: '∪', rotuloAcessivel: 'União' },
      ]}
    />
  );
}

describe('SeletorSegmentado', () => {
  it('troca a opção com as setas e mantém o foco na escolhida', async () => {
    const usuario = userEvent.setup();
    render(<Exemplo />);
    const grupo = screen.getByRole('radiogroup', { name: 'Modo' });
    expect(grupo).toBeInTheDocument();
    await usuario.click(screen.getByRole('radio', { name: 'Consultar' }));
    await usuario.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'Nova área' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByRole('radio', { name: 'Nova área' })).toHaveFocus();
    await usuario.keyboard('{End}');
    expect(screen.getByRole('radio', { name: 'União' })).toHaveAttribute('aria-checked', 'true');
    await usuario.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'Consultar' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });
});
