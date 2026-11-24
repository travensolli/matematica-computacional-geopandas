import type { FeatureEstabelecimento, ResultadoOperacao } from '../api/esquemas';
import { EstadoErro, Esqueleto } from '../componentes/Estados';
import { DiagramaVenn } from '../teoria/DiagramaVenn';
import { Formula } from '../teoria/Formula';
import { contar, formatarNumero, listarComE } from '../utilitarios/formatar';
import { OPERACOES } from './operacoes';

export interface ResultadoOperacaoProps {
  resultado?: ResultadoOperacao;
  carregando: boolean;
  erro: unknown;
  aoTentarDeNovo: () => void;
  estabelecimentos?: FeatureEstabelecimento[];
}

const MOSTRAR = 4;

/** O resultado da operação: definição, medida, elementos e o código que o produziu. */
export function ResultadoOperacaoCartao({
  resultado,
  carregando,
  erro,
  aoTentarDeNovo,
  estabelecimentos = [],
}: ResultadoOperacaoProps) {
  if (erro) return <EstadoErro erro={erro} aoTentarDeNovo={aoTentarDeNovo} />;
  if (carregando || !resultado) return <Esqueleto rotulo="Calculando a operação" linhas={5} />;

  const descricao = OPERACOES[resultado.operacao];
  const nomes = new Map(estabelecimentos.map((e) => [e.properties.id, e.properties.nome]));
  const elementos = resultado.estabelecimentos.map((id) => nomes.get(id) ?? `#${id}`);
  const restantes = elementos.length - MOSTRAR;

  return (
    <section aria-labelledby="titulo-operacao" className="animar-surgir space-y-4">
      <div>
        <h2 id="titulo-operacao" className="text-lg font-bold">
          {descricao.nome}: <span className="notacao">{descricao.simbolo}</span>
        </h2>
        <p className="text-sm text-tinta-suave">
          A = {resultado.a.nome}; B = {resultado.b.nome}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <DiagramaVenn figura={descricao.figura} className="h-auto w-28 shrink-0" />
        <div className="min-w-0">
          <Formula texto={descricao.formula} bloco className="text-lg" />
          <p className="text-xs text-tinta-suave">Notas de aula, {descricao.referencia}</p>
        </div>
      </div>
      <dl className="grid grid-cols-[minmax(0,1fr)] gap-3 rounded-painel bg-superficie-suave p-3 sm:grid-cols-[repeat(2,minmax(0,1fr))]">
        <div>
          <dt className="text-xs font-semibold text-tinta-suave">Área do resultado</dt>
          <dd className="text-xl font-bold tabular-nums">
            {resultado.vazio ? (
              <span className="notacao">∅</span>
            ) : (
              `${formatarNumero(resultado.area_km2)} km²`
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-tinta-suave">Estabelecimentos dentro</dt>
          <dd className="text-xl font-bold tabular-nums">{elementos.length}</dd>
        </div>
      </dl>
      {resultado.vazio ? (
        <p className="text-sm">
          O resultado é o conjunto vazio: as duas áreas não têm nenhum ponto nessa combinação.
        </p>
      ) : elementos.length ? (
        <p className="text-sm">
          {listarComE([
            ...elementos.slice(0, MOSTRAR),
            ...(restantes > 0 ? [contar(restantes, 'outro', 'outros')] : []),
          ])}
          .
        </p>
      ) : (
        <p className="text-sm text-tinta-suave">
          Nenhum estabelecimento cadastrado nesse resultado.
        </p>
      )}
      <div className="space-y-2">
        <figure>
          <figcaption className="text-xs font-semibold text-tinta-suave">
            Executado pelo backend (GeoPandas)
          </figcaption>
          <pre className="rolagem-fina mt-1 overflow-x-auto rounded-controle bg-superficie-suave p-2.5 font-mono text-[0.8rem]">
            <code>{descricao.geopandas}</code>
          </pre>
        </figure>
        <figure>
          <figcaption className="text-xs font-semibold text-tinta-suave">
            O mesmo no PRJ.14, com PostgreSQL e PostGIS
          </figcaption>
          <pre className="rolagem-fina mt-1 overflow-x-auto rounded-controle bg-superficie-suave p-2.5 font-mono text-[0.8rem]">
            <code>{descricao.postgis}</code>
          </pre>
        </figure>
      </div>
    </section>
  );
}
