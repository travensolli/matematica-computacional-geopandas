import { ArrowLeftRight } from 'lucide-react';
import { useEffect, useId } from 'react';
import { useLocation, useSearchParams } from 'react-router';
import {
  useAreas,
  useEstabelecimentos,
  useMunicipio,
  useOperacao,
  useRelacoes,
} from '../api/consultas';
import { type Operacao, OperacaoSchema } from '../api/esquemas';
import { Botao } from '../componentes/Botao';
import { EstadoErro, EstadoVazio, Esqueleto } from '../componentes/Estados';
import { SeletorSegmentado } from '../componentes/SeletorSegmentado';
import { useTituloPagina } from '../hooks/titulo-pagina';
import { MapaOperacao } from '../operacoes/MapaOperacao';
import { OPERACOES, ORDEM_OPERACOES } from '../operacoes/operacoes';
import { ProdutoCartesiano } from '../operacoes/ProdutoCartesiano';
import { RelacoesAreas } from '../operacoes/RelacoesAreas';
import { ResultadoOperacaoCartao } from '../operacoes/ResultadoOperacao';

const OPCOES = ORDEM_OPERACOES.map((op) => ({
  valor: op,
  rotulo: <span className="notacao text-[1.05rem]">{OPERACOES[op].simbolo}</span>,
  rotuloAcessivel: OPERACOES[op].nome,
}));

const CAMPO =
  'mt-1 min-h-toque w-full rounded-controle border border-linha-forte bg-superficie px-2 text-sm';

function lerId(valor: string | null): number | null {
  const numero = Number(valor);
  return valor !== null && Number.isInteger(numero) ? numero : null;
}

export default function PaginaOperacoes() {
  useTituloPagina('Operações');
  const idCampoA = useId();
  const idCampoB = useId();
  const [parametros, setParametros] = useSearchParams();
  const { hash } = useLocation();

  const areas = useAreas();
  const estabelecimentos = useEstabelecimentos();
  const municipio = useMunicipio();
  const lista = areas.data?.features ?? [];

  const idA = lerId(parametros.get('a')) ?? lista[0]?.properties.id ?? null;
  const idB = lerId(parametros.get('b')) ?? lista[1]?.properties.id ?? null;
  const operacao: Operacao = OperacaoSchema.safeParse(parametros.get('op')).data ?? 'interseccao';
  const areaA = lista.find((a) => a.properties.id === idA);
  const areaB = lista.find((a) => a.properties.id === idB);
  const escolhidas = areaA && areaB;

  const resultado = useOperacao(escolhidas ? idA : null, escolhidas ? idB : null, operacao);
  const relacoes = useRelacoes(escolhidas ? idA : null, escolhidas ? idB : null);

  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash, areas.isSuccess]);

  function mudar(valores: Record<string, string | number | null>) {
    setParametros(
      (atual) => {
        const novos = new URLSearchParams(atual);
        if (idA !== null && !novos.has('a')) novos.set('a', String(idA));
        if (idB !== null && !novos.has('b')) novos.set('b', String(idB));
        for (const [chave, valor] of Object.entries(valores)) {
          if (valor === null) novos.delete(chave);
          else novos.set(chave, String(valor));
        }
        return novos;
      },
      { replace: true },
    );
  }

  return (
    <div className="flex flex-1 flex-col md:grid md:h-[calc(100dvh_-_3.5rem)] md:flex-none md:grid-cols-[minmax(22rem,27rem)_1fr] md:grid-rows-[minmax(0,1fr)]">
      <aside
        aria-label="Painel de operações"
        className="rolagem-fina relative order-2 border-t border-linha bg-superficie md:order-1 md:overflow-y-auto md:border-t-0 md:border-r"
      >
        <div className="space-y-7 p-4">
          <header>
            <h1 className="text-xl font-bold">Operações entre áreas</h1>
            <p className="prosa mt-1 text-sm text-tinta-suave">
              Escolha duas áreas e uma operação. O backend aplica a operação com o overlay do
              GeoPandas e devolve o conjunto resultante, desenhado no mapa.
            </p>
          </header>

          {areas.isError ? (
            <EstadoErro erro={areas.error} aoTentarDeNovo={() => void areas.refetch()} />
          ) : areas.isPending ? (
            <Esqueleto rotulo="Carregando as áreas" linhas={4} />
          ) : lista.length < 2 ? (
            <EstadoVazio titulo="São precisas duas áreas.">
              Cadastre ao menos duas áreas no mapa para operar com elas.
            </EstadoVazio>
          ) : (
            <section aria-label="Escolha das áreas e da operação" className="space-y-4">
              <div className="space-y-2">
                <div>
                  <label htmlFor={idCampoA} className="text-sm font-semibold">
                    Conjunto <span className="notacao">A</span>
                  </label>
                  <select
                    id={idCampoA}
                    className={CAMPO}
                    value={idA ?? ''}
                    onChange={(e) => mudar({ a: e.target.value })}
                  >
                    {lista.map((a) => (
                      <option key={a.properties.id} value={a.properties.id}>
                        {a.properties.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <Botao
                  variante="discreta"
                  tamanho="pequeno"
                  icone={ArrowLeftRight}
                  onClick={() => mudar({ a: idB, b: idA })}
                  className="-ml-2.5"
                >
                  Trocar A e B
                </Botao>
                <div>
                  <label htmlFor={idCampoB} className="text-sm font-semibold">
                    Conjunto <span className="notacao">B</span>
                  </label>
                  <select
                    id={idCampoB}
                    className={CAMPO}
                    value={idB ?? ''}
                    onChange={(e) => mudar({ b: e.target.value })}
                  >
                    {lista.map((a) => (
                      <option key={a.properties.id} value={a.properties.id}>
                        {a.properties.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <SeletorSegmentado
                rotulo="Operação"
                rotuloVisivel
                valor={operacao}
                aoMudar={(op) => mudar({ op })}
                opcoes={OPCOES}
              />
            </section>
          )}

          {escolhidas ? (
            <>
              <ResultadoOperacaoCartao
                resultado={resultado.data}
                carregando={resultado.isPending}
                erro={resultado.error}
                aoTentarDeNovo={() => void resultado.refetch()}
                estabelecimentos={estabelecimentos.data?.features}
              />
              <RelacoesAreas relacoes={relacoes.data} />
            </>
          ) : lista.length >= 2 ? (
            <EstadoVazio titulo="Escolha duas áreas que existam.">
              O endereço aponta para uma área que não está mais cadastrada.
            </EstadoVazio>
          ) : null}

          <ProdutoCartesiano />
        </div>
      </aside>

      <div className="relative order-1 h-[50dvh] md:order-2 md:h-auto">
        <MapaOperacao
          areaA={areaA}
          areaB={areaB}
          resultado={resultado.data}
          estabelecimentos={estabelecimentos.data?.features}
          municipio={municipio.data}
        />
      </div>
    </div>
  );
}
