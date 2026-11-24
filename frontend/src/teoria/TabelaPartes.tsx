import { usePartes } from '../api/consultas';
import { EstadoErro, Esqueleto } from '../componentes/Estados';
import { Amostra } from '../componentes/MarcaClasse';
import { aparencia, descreverClasses, ROTULO_TIPO } from '../dominio/classes';

/** P(T) e a classe que cada combinação de tipos produz, calculadas pela regra do backend. */
export function TabelaPartes() {
  const partes = usePartes();
  if (partes.isError)
    return <EstadoErro erro={partes.error} aoTentarDeNovo={() => void partes.refetch()} />;
  if (partes.isPending) return <Esqueleto rotulo="Calculando o conjunto das partes" linhas={8} />;
  const classificacoes = new Set(partes.data.linhas.map((l) => descreverClasses(l.classes)));

  return (
    <div className="rolagem-fina overflow-x-auto">
      <table className="w-full min-w-[26rem] border-collapse text-sm">
        <caption className="mb-2 text-left text-sm text-tinta-suave">
          Os {partes.data.linhas.length} elementos de P(T) e a classificação de cada um:{' '}
          {classificacoes.size} resultados diferentes.
        </caption>
        <thead>
          <tr className="border-b-2 border-tinta text-left">
            <th scope="col" className="py-1.5 pr-4 font-semibold">
              Tipos dentro da área, T(a)
            </th>
            <th scope="col" className="py-1.5 font-semibold">
              Classificação
            </th>
          </tr>
        </thead>
        <tbody>
          {partes.data.linhas.map((linha) => (
            <tr key={linha.tipos.join('-') || 'vazio'} className="border-b border-linha">
              <td className="notacao py-1.5 pr-4">
                {linha.tipos.length
                  ? `{${linha.tipos.map((t) => ROTULO_TIPO[t].toLowerCase()).join(', ')}}`
                  : '∅'}
              </td>
              <td className="py-1.5">
                <span className="flex items-center gap-2">
                  <Amostra aparencia={aparencia(linha.classes)} tamanho={16} />
                  {descreverClasses(linha.classes)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
