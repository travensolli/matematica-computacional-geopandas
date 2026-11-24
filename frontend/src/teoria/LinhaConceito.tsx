import type { Trecho } from '../api/esquemas';
import { BotaoLink } from '../componentes/Botao';
import type { Conceito } from './conceitos';
import { DiagramaVenn } from './DiagramaVenn';
import { Formula } from './Formula';
import { TrechoCodigo } from './TrechoCodigo';
import type { ReactNode } from 'react';

export interface LinhaConceitoProps {
  conceito: Conceito;
  trechos?: Trecho[];
  carregandoTrechos: boolean;
  erroTrechos: boolean;
  /** Conteúdo vivo do conceito: a tabela de P(T), os números do produto. */
  extra?: ReactNode;
}

/** Um conceito do material: notação e leitura à esquerda, o que o sistema faz à direita. */
export function LinhaConceito({
  conceito,
  trechos,
  carregandoTrechos,
  erroTrechos,
  extra,
}: LinhaConceitoProps) {
  const idTitulo = `conceito-${conceito.id}`;
  return (
    <article
      id={conceito.id}
      aria-labelledby={idTitulo}
      className="grid scroll-mt-20 grid-cols-[minmax(0,1fr)] gap-x-10 gap-y-4 border-t border-linha py-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]"
    >
      <div className="min-w-0">
        <h3 id={idTitulo} className="text-xl font-bold">
          {conceito.titulo}
        </h3>
        <p className="text-sm text-tinta-suave">Notas de aula, {conceito.referencia}</p>
        <div className="mt-3 space-y-0.5 text-lg">
          {conceito.formulas.map((formula) => (
            <Formula key={formula} texto={formula} bloco />
          ))}
        </div>
        <div className="mt-3 flex items-start gap-4">
          <DiagramaVenn figura={conceito.figura} className="h-auto w-32 shrink-0" />
          <p className="prosa text-sm text-tinta-suave">{conceito.leitura}</p>
        </div>
      </div>
      <div className="space-y-4">
        <p className="prosa">{conceito.noSistema}</p>
        {extra}
        <TrechoCodigo
          nomes={conceito.funcoes}
          trechos={trechos}
          carregando={carregandoTrechos}
          erro={erroTrechos}
        />
        {conceito.link ? (
          <BotaoLink to={conceito.link.para} variante="neutra" tamanho="pequeno">
            {conceito.link.rotulo}
          </BotaoLink>
        ) : null}
      </div>
    </article>
  );
}
