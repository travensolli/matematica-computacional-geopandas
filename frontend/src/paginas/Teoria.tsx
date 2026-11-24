import { useTituloPagina } from '../hooks/titulo-pagina';

export function PaginaTeoria() {
  useTituloPagina('Teoria');
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold">Cada área do mapa é um conjunto.</h1>
    </div>
  );
}
