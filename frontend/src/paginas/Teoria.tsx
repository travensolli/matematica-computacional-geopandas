import { Blend, Map as IconeMapa } from 'lucide-react';
import { useTrechos } from '../api/consultas';
import { BotaoLink } from '../componentes/Botao';
import { Amostra } from '../componentes/MarcaClasse';
import type { Aparencia } from '../dominio/classes';
import { useTituloPagina } from '../hooks/titulo-pagina';
import { CONCEITOS } from '../teoria/conceitos';
import { FiguraAbertura } from '../teoria/FiguraAbertura';
import { Formula } from '../teoria/Formula';
import { LinhaConceito } from '../teoria/LinhaConceito';
import { NumerosProduto } from '../teoria/NumerosProduto';
import { TabelaPartes } from '../teoria/TabelaPartes';

const DEFINICOES: Array<{ aparencia: Aparencia; formula: string; leitura: string }> = [
  {
    aparencia: 'escolar',
    formula: 'Escolares = { a ∈ A | escola ∈ T(a) }',
    leitura: 'Há ao menos uma escola dentro da área.',
  },
  {
    aparencia: 'industrial',
    formula: 'Industriais = { a ∈ A | indústria ∈ T(a) }',
    leitura: 'Há ao menos uma fábrica ou indústria dentro da área.',
  },
  {
    aparencia: 'residencial',
    formula: 'Residenciais = { a ∈ A | T(a) ≠ ∅ ∧ T(a) ⊆ { residência } }',
    leitura: 'Há estabelecimentos dentro da área, e todos são residências.',
  },
  {
    aparencia: 'nenhuma',
    formula: '"Sem classificação" = { a ∈ A | T(a) = ∅ }',
    leitura: 'Não há nenhum estabelecimento dentro da área.',
  },
];

export function PaginaTeoria() {
  useTituloPagina('Teoria');
  const trechos = useTrechos();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16">
      <section
        aria-labelledby="titulo-teoria"
        className="grid grid-cols-[minmax(0,1fr)] items-center gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] lg:py-16"
      >
        <div>
          <h1 id="titulo-teoria" className="text-4xl leading-[1.05] font-bold sm:text-5xl">
            Cada área do mapa é um conjunto.
          </h1>
          <p className="prosa mt-5 text-lg">
            Os estabelecimentos de Jacareí são os elementos, e o limite do município é o universo U.
            Uma área é escolar, industrial ou residencial conforme o que existe dentro dela, e
            descobrir o tipo de um ponto é uma pergunta de pertinência. Este sistema resolve o
            PRJ.15 com essas ideias da teoria dos conjuntos, executadas pelo GeoPandas.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <BotaoLink to="/mapa" tamanho="grande" icone={IconeMapa}>
              Abrir o mapa
            </BotaoLink>
            <BotaoLink to="/operacoes" variante="neutra" tamanho="grande" icone={Blend}>
              Experimentar as operações
            </BotaoLink>
          </div>
        </div>
        <FiguraAbertura className="h-auto w-full" />
      </section>

      <section aria-labelledby="titulo-regra" className="border-t-2 border-tinta py-10">
        <h2 id="titulo-regra" className="text-2xl font-bold">
          Como uma área ganha sua classe
        </h2>
        <p className="prosa mt-3">
          Seja <span className="notacao">E</span> o conjunto dos estabelecimentos e{' '}
          <span className="notacao">A</span> o das áreas. Para cada área, o sistema calcula os
          elementos que estão no seu interior e os tipos desses elementos:
        </p>
        <div className="mt-3 space-y-1 text-lg">
          <Formula texto="E(a) = { e ∈ E | e ∈ a }" bloco />
          <Formula texto="T(a) = { tipo(e) | e ∈ E(a) }" bloco />
        </div>
        <p className="prosa mt-4">
          A classe da área sai de <span className="notacao">T(a)</span>, como pede o enunciado:
        </p>
        <dl className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-x-10 gap-y-6 md:grid-cols-[repeat(2,minmax(0,1fr))]">
          {DEFINICOES.map((definicao) => (
            <div key={definicao.aparencia} className="flex min-w-0 gap-3">
              <Amostra aparencia={definicao.aparencia} tamanho={28} className="mt-1" />
              <div className="min-w-0">
                <dt className="text-lg">
                  <Formula texto={definicao.formula} bloco />
                </dt>
                <dd className="mt-1 text-sm text-tinta-suave">{definicao.leitura}</dd>
              </div>
            </div>
          ))}
        </dl>
        <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-x-10 gap-y-6 md:grid-cols-[repeat(2,minmax(0,1fr))]">
          <div>
            <h3 className="font-bold">Uma área pode ser escolar e industrial</h3>
            <Formula
              texto="Residenciais ∩ ( Escolares ∪ Industriais ) = ∅"
              bloco
              className="mt-1 text-lg"
            />
            <p className="prosa mt-1 text-sm text-tinta-suave">
              Escolar e industrial podem valer juntas, e no mapa as duas hachuras se cruzam. Só a
              classe residencial exclui as outras, porque exige que haja somente residências.
            </p>
          </div>
          <div>
            <h3 className="font-bold">O tipo de um ponto</h3>
            <Formula
              texto="classes(p) = ⋃ { classes(a) | a ∈ A ∧ p ∈ a }"
              bloco
              className="mt-1 text-lg"
            />
            <p className="prosa mt-1 text-sm text-tinta-suave">
              As áreas podem se sobrepor. Por isso a resposta para um ponto é a união das classes de
              todas as áreas que o contêm.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="titulo-material" className="border-t-2 border-tinta pt-10">
        <h2 id="titulo-material" className="text-2xl font-bold">
          Do material ao sistema
        </h2>
        <p className="prosa mt-3">
          Os conceitos das notas de aula, na ordem em que aparecem, cada um com a notação, uma
          leitura em português e o lugar do sistema onde ele trabalha. O código mostrado é lido do
          próprio backend: é o mesmo que roda quando você usa o mapa.
        </p>
        <nav aria-label="Conceitos desta página" className="mt-5">
          <ol className="flex flex-wrap gap-2">
            {CONCEITOS.map((conceito) => (
              <li key={conceito.id}>
                <a
                  href={`#${conceito.id}`}
                  className="inline-flex min-h-toque items-center rounded-controle border border-linha bg-superficie px-2.5 text-sm text-tinta no-underline hover:border-linha-forte"
                >
                  {conceito.titulo}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="mt-6">
          {CONCEITOS.map((conceito) => (
            <LinhaConceito
              key={conceito.id}
              conceito={conceito}
              trechos={trechos.data?.trechos}
              carregandoTrechos={trechos.isPending}
              erroTrechos={trechos.isError}
              extra={
                conceito.id === 'partes' ? (
                  <TabelaPartes />
                ) : conceito.id === 'produto' ? (
                  <NumerosProduto />
                ) : undefined
              }
            />
          ))}
        </div>
      </section>

      <footer className="space-y-1 border-t-2 border-tinta pt-6 text-sm text-tinta-suave">
        <p>
          Referência: CARVALHO, F. G. M.{' '}
          <cite className="not-italic">
            Notas de aula da disciplina matemática para a computação
          </cite>
          . São José dos Campos, 2026.
        </p>
        <p>
          Dados do mapa: limite municipal do IBGE; escolas e indústrias do OpenStreetMap (©
          colaboradores do OpenStreetMap, licença ODbL).
        </p>
      </footer>
    </div>
  );
}
