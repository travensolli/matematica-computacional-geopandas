import { ChevronRight, Code2 } from 'lucide-react';
import type { Trecho } from '../api/esquemas';

export interface TrechoCodigoProps {
  nomes: string[];
  trechos?: Trecho[];
  carregando: boolean;
  erro: boolean;
}

/** O código-fonte que o servidor executa, lido do próprio backend. */
export function TrechoCodigo({ nomes, trechos, carregando, erro }: TrechoCodigoProps) {
  if (nomes.length === 0) return null;
  const escolhidos = nomes
    .map((nome) => trechos?.find((t) => t.nome === nome))
    .filter((t): t is Trecho => t !== undefined);

  return (
    <details className="group rounded-painel border border-linha">
      <summary className="flex min-h-toque cursor-pointer list-none items-center gap-2 rounded-painel px-3 text-sm font-semibold [&::-webkit-details-marker]:hidden">
        <ChevronRight
          aria-hidden="true"
          className="size-4 transition-transform duration-150 group-open:rotate-90"
        />
        <Code2 aria-hidden="true" className="size-4" />
        Código executado no backend
      </summary>
      <div className="space-y-3 border-t border-linha p-3">
        {erro ? (
          <p className="text-sm text-tinta-suave">
            O código é lido do servidor, que não respondeu. Rode o backend para ver os trechos.
          </p>
        ) : carregando ? (
          <p className="text-sm text-tinta-suave">Carregando o código do servidor…</p>
        ) : (
          escolhidos.map((trecho) => (
            <figure key={trecho.nome}>
              <figcaption className="mb-1 text-xs text-tinta-suave">
                {trecho.arquivo}, linha {trecho.linha}
              </figcaption>
              <pre className="rolagem-fina overflow-x-auto rounded-controle bg-superficie-suave p-3 font-mono text-[0.8rem] leading-relaxed">
                <code>{trecho.codigo.trimEnd()}</code>
              </pre>
            </figure>
          ))
        )}
      </div>
    </details>
  );
}
