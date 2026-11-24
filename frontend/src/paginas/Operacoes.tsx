import { useTituloPagina } from '../hooks/titulo-pagina';

export default function PaginaOperacoes() {
  useTituloPagina('Operações');
  return <h1 className="sr-only">Operações entre áreas</h1>;
}
