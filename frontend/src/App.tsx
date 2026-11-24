import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import { Esqueleto } from './componentes/Estados';
import { Layout } from './layout/Layout';
import { PaginaNaoEncontrada } from './paginas/NaoEncontrada';
import { PaginaTeoria } from './paginas/Teoria';

/* O Leaflet só é baixado quando alguém abre uma tela com mapa. */
const PaginaMapa = lazy(() => import('./paginas/Mapa'));
const PaginaOperacoes = lazy(() => import('./paginas/Operacoes'));

function Carregando() {
  return (
    <Esqueleto rotulo="Carregando a tela" linhas={4} className="mx-auto w-full max-w-3xl p-6" />
  );
}

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<PaginaTeoria />} />
        <Route
          path="mapa"
          element={
            <Suspense fallback={<Carregando />}>
              <PaginaMapa />
            </Suspense>
          }
        />
        <Route
          path="operacoes"
          element={
            <Suspense fallback={<Carregando />}>
              <PaginaOperacoes />
            </Suspense>
          }
        />
        <Route path="*" element={<PaginaNaoEncontrada />} />
      </Route>
    </Routes>
  );
}
