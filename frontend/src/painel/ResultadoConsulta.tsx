import { X } from 'lucide-react';
import type { Consulta } from '../api/esquemas';
import { BotaoIcone } from '../componentes/Botao';
import { EstadoErro, Esqueleto } from '../componentes/Estados';
import { Amostra } from '../componentes/MarcaClasse';
import { aparencia, descreverClasses, ROTULO_CLASSE } from '../dominio/classes';
import { formatarCoordenada } from '../utilitarios/formatar';

export interface ResultadoConsultaProps {
  consulta?: Consulta;
  carregando: boolean;
  erro: unknown;
  aoTentarDeNovo: () => void;
  aoLimpar: () => void;
}

function conjunto(itens: readonly string[]): string {
  return itens.length === 0 ? '∅' : `{${itens.join(', ')}}`;
}

/** O veredito da consulta e o porquê, em notação de conjuntos. */
export function ResultadoConsulta({
  consulta,
  carregando,
  erro,
  aoTentarDeNovo,
  aoLimpar,
}: ResultadoConsultaProps) {
  if (erro) return <EstadoErro erro={erro} aoTentarDeNovo={aoTentarDeNovo} />;
  if (carregando || !consulta) return <Esqueleto rotulo="Consultando o ponto" linhas={4} />;

  const { ponto, classes, areas, total_areas: total } = consulta;
  const fora = total - areas.length;

  return (
    <section aria-labelledby="titulo-resultado" className="animar-surgir space-y-4">
      <div className="flex items-start gap-3">
        <Amostra aparencia={aparencia(classes)} tamanho={40} className="mt-0.5" />
        <div className="min-w-0 flex-1">
          <h2 id="titulo-resultado" className="text-xl leading-tight font-bold">
            {consulta.resumo.replace(/\.$/, '')}
          </h2>
          <p className="mt-0.5 text-sm text-tinta-suave tabular-nums">
            {formatarCoordenada(ponto.lat)}; {formatarCoordenada(ponto.lng)}
          </p>
        </div>
        <BotaoIcone icone={X} rotulo="Limpar consulta" onClick={aoLimpar} className="-mt-1 -mr-2" />
      </div>

      {classes.length > 0 ? (
        <ul aria-label="Classes do ponto" className="flex flex-wrap gap-2">
          {classes.map((classe) => (
            <li
              key={classe}
              className="flex items-center gap-1.5 rounded-controle border border-linha bg-superficie px-2 py-1 text-sm font-semibold"
            >
              <Amostra aparencia={classe} tamanho={16} />
              {ROTULO_CLASSE[classe]}
            </li>
          ))}
        </ul>
      ) : null}

      {areas.length > 0 ? (
        <div>
          <p className="text-sm font-semibold">
            Pertence a {areas.length} de {total} {total === 1 ? 'área' : 'áreas'}:
          </p>
          <ul className="mt-1 space-y-1">
            {areas.map((area) => (
              <li key={area.id} className="flex items-center gap-2 text-sm">
                <Amostra aparencia={aparencia(area.classes)} tamanho={14} />
                <span className="font-semibold">{area.nome}</span>
                <span className="text-tinta-suave">{descreverClasses(area.classes)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="rounded-painel bg-superficie-suave p-3 text-[0.95rem] leading-relaxed">
        <p className="mb-1 text-xs font-semibold text-tinta-suave">Em conjuntos</p>
        {areas.map((area) => (
          <p key={area.id} className="notacao block whitespace-normal">
            p ∈ {area.nome}
          </p>
        ))}
        {areas.length === 0 ? (
          <p className="notacao block whitespace-normal">∀ a ∈ A: p ∉ a</p>
        ) : fora > 0 ? (
          <p className="notacao block whitespace-normal">
            p ∉ {fora === 1 ? 'à outra área' : `cada uma das outras ${fora} áreas`}
          </p>
        ) : null}
        <p className="notacao mt-1 block whitespace-normal">
          classes(p) ={' '}
          {areas.length > 1 ? `${areas.map((a) => conjunto(a.classes)).join(' ∪ ')} = ` : ''}
          {conjunto(classes)}
        </p>
      </div>
    </section>
  );
}
