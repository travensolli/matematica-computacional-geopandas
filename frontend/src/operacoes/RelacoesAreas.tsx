import { Check, X } from 'lucide-react';
import type { Relacoes } from '../api/esquemas';
import { Esqueleto } from '../componentes/Estados';
import { juntarClasses } from '../utilitarios/classes';

function Linha({
  notacao,
  verdade,
  detalhe,
}: {
  notacao: string;
  verdade: boolean;
  detalhe?: string;
}) {
  const Icone = verdade ? Check : X;
  return (
    <li className="flex items-center gap-3 py-1.5">
      <span className="notacao w-24 shrink-0 text-base">{notacao}</span>
      <span
        className={juntarClasses(
          'flex items-center gap-1 font-semibold',
          verdade ? 'text-sucesso' : 'text-tinta-suave',
        )}
      >
        <Icone aria-hidden="true" className="size-4" />
        {verdade ? 'sim' : 'não'}
      </span>
      {detalhe ? <span className="text-sm text-tinta-suave">{detalhe}</span> : null}
    </li>
  );
}

/** Igualdade, inclusão e disjunção entre as duas áreas escolhidas. */
export function RelacoesAreas({ relacoes }: { relacoes?: Relacoes }) {
  if (!relacoes) return <Esqueleto rotulo="Comparando as áreas" linhas={4} />;
  return (
    <section aria-labelledby="titulo-relacoes">
      <h2 id="titulo-relacoes" className="font-bold">
        Relações entre A e B
      </h2>
      <ul className="mt-1 divide-y divide-linha">
        <Linha notacao="A = B" verdade={relacoes.iguais} />
        <Linha
          notacao="A ⊆ B"
          verdade={relacoes.a_subconjunto_b}
          detalhe={relacoes.a_subconjunto_proprio_b ? 'e próprio: A ⊂ B' : undefined}
        />
        <Linha
          notacao="B ⊆ A"
          verdade={relacoes.b_subconjunto_a}
          detalhe={relacoes.b_subconjunto_proprio_a ? 'e próprio: B ⊂ A' : undefined}
        />
        <Linha notacao="A ∩ B = ∅" verdade={relacoes.disjuntos} detalhe="disjuntas" />
      </ul>
    </section>
  );
}
