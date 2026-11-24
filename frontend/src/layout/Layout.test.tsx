import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import { renderizar } from '../testes/renderizar';
import { Layout } from './Layout';

describe('Layout', () => {
  it('oferece o atalho para o conteúdo e marca a tela atual na navegação', () => {
    renderizar(
      <Routes>
        <Route element={<Layout />}>
          <Route path="mapa" element={<p>conteúdo do mapa</p>} />
        </Route>
      </Routes>,
      { rota: '/mapa' },
    );
    expect(screen.getByRole('link', { name: 'Ir para o conteúdo' })).toHaveAttribute(
      'href',
      '#conteudo',
    );
    const navegacao = screen.getByRole('navigation', { name: 'Principal' });
    expect(navegacao).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Mapa' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Teoria' })).not.toHaveAttribute('aria-current');
    expect(screen.getByText('conteúdo do mapa')).toBeInTheDocument();
  });
});
