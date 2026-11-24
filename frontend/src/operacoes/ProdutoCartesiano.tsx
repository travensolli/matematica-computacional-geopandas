import { Check, X } from 'lucide-react';
import { useProduto } from '../api/consultas';
import { EstadoErro, Esqueleto } from '../componentes/Estados';
import { formatarInteiro } from '../utilitarios/formatar';

/** E × A: todos os pares (estabelecimento, área) e os que sobram com e ∈ a. */
export function ProdutoCartesiano() {
  const produto = useProduto();
  return (
    <section id="produto" aria-labelledby="titulo-produto" className="scroll-mt-4 space-y-3">
      <h2 id="titulo-produto" className="font-bold">
        Produto cartesiano <span className="notacao">E × A</span>
      </h2>
      {produto.isError ? (
        <EstadoErro erro={produto.error} aoTentarDeNovo={() => void produto.refetch()} />
      ) : produto.isPending ? (
        <Esqueleto rotulo="Contando os pares" linhas={4} />
      ) : (
        <>
          <p className="prosa text-sm">
            São{' '}
            <span className="notacao">
              |E| · |A| = {formatarInteiro(produto.data.estabelecimentos)} ·{' '}
              {formatarInteiro(produto.data.areas)} = {formatarInteiro(produto.data.pares)}
            </span>{' '}
            pares (estabelecimento, área). A junção espacial guarda só os{' '}
            <strong>{formatarInteiro(produto.data.pares_com_pertinencia)}</strong> pares com{' '}
            <span className="notacao">e ∈ a</span>, e o índice espacial do GeoPandas descarta os
            outros sem testá-los um a um.
          </p>
          <div className="rolagem-fina overflow-x-auto">
            <table className="w-full min-w-[20rem] border-collapse text-sm">
              <caption className="mb-1 text-left text-xs text-tinta-suave">
                Os primeiros {produto.data.amostra.length} pares do produto
              </caption>
              <thead>
                <tr className="border-b-2 border-tinta text-left">
                  <th scope="col" className="py-1 pr-2 font-semibold">
                    Estabelecimento (e)
                  </th>
                  <th scope="col" className="py-1 pr-2 font-semibold">
                    Área (a)
                  </th>
                  <th scope="col" className="py-1 font-semibold">
                    <span className="notacao">e ∈ a</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {produto.data.amostra.map((par) => (
                  <tr key={`${par.estabelecimento}-${par.area}`} className="border-b border-linha">
                    <td className="py-1 pr-2">{par.estabelecimento}</td>
                    <td className="py-1 pr-2">{par.area}</td>
                    <td className="py-1">
                      {par.pertence ? (
                        <span className="flex items-center gap-1 font-semibold text-sucesso">
                          <Check aria-hidden="true" className="size-4" /> sim
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-tinta-suave">
                          <X aria-hidden="true" className="size-4" /> não
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
