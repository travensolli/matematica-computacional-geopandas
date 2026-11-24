import { BotaoLink } from '../componentes/Botao';
import { useTituloPagina } from '../hooks/titulo-pagina';

export function PaginaNaoEncontrada() {
  useTituloPagina('Página não encontrada');
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold">Este endereço não pertence ao conjunto de páginas.</h1>
      <p className="prosa mt-2 text-tinta-suave">
        Confira o endereço ou volte para a parte teórica, que explica o sistema desde o começo.
      </p>
      <BotaoLink to="/" className="mt-6">
        Ir para a Teoria
      </BotaoLink>
    </div>
  );
}
