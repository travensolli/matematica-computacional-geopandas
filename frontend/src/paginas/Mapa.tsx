import { useTituloPagina } from '../hooks/titulo-pagina';

export default function PaginaMapa() {
  useTituloPagina('Mapa');
  return <h1 className="sr-only">Mapa de Jacareí</h1>;
}
