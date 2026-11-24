import type { Map as MapaLeaflet } from 'leaflet';
import { ChevronRight, Crosshair, MapPinPlus, Pentagon } from 'lucide-react';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GeoJSON } from 'react-leaflet';
import { useSearchParams } from 'react-router';
import {
  useAreas,
  useConsultaPonto,
  useEstabelecimentos,
  useMunicipio,
  useSobreposicoes,
} from '../api/consultas';
import type {
  FeatureArea,
  FeatureEstabelecimento,
  Poligono,
  TipoEstabelecimento,
} from '../api/esquemas';
import { EstadoErro, Esqueleto } from '../componentes/Estados';
import { Amostra } from '../componentes/MarcaClasse';
import { SeletorSegmentado } from '../componentes/SeletorSegmentado';
import { aparencia } from '../dominio/classes';
import { useTituloPagina } from '../hooks/titulo-pagina';
import { DesenhoPoligono, EdicaoPoligono, MarcadorNovo } from '../mapa/Desenho';
import { limitesDasAreas } from '../mapa/geometria';
import { type CamadasVisiveis, MapaZoneamento } from '../mapa/MapaZoneamento';
import { AcoesArea } from '../painel/AcoesArea';
import { ConsultaPorCoordenada } from '../painel/ConsultaPorCoordenada';
import { FormArea } from '../painel/FormArea';
import { FormEstabelecimento } from '../painel/FormEstabelecimento';
import { FormRedesenho } from '../painel/FormRedesenho';
import { Legenda } from '../painel/Legenda';
import { ListaAreas } from '../painel/ListaAreas';
import { ListaEstabelecimentos } from '../painel/ListaEstabelecimentos';
import { ResultadoConsulta } from '../painel/ResultadoConsulta';

type Modo = 'consultar' | 'area' | 'estabelecimento';
type Posicao = { lat: number; lng: number };

const CASAS_URL = 6;

const MODOS = [
  { valor: 'consultar' as const, rotulo: 'Consultar', icone: Crosshair },
  { valor: 'area' as const, rotulo: 'Nova área', icone: Pentagon },
  { valor: 'estabelecimento' as const, rotulo: 'Estabelecimento', icone: MapPinPlus },
];

const ESTILO_RASCUNHO = {
  color: 'var(--tinta)',
  weight: 2.5,
  dashArray: '6 4',
  fillColor: 'var(--tinta)',
  fillOpacity: 0.1,
};

function lerPonto(parametros: URLSearchParams): Posicao | null {
  const lat = Number(parametros.get('lat'));
  const lng = Number(parametros.get('lng'));
  if (!parametros.has('lat') || !parametros.has('lng')) return null;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

function SecaoRecolhivel({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <details className="group">
      <summary className="flex min-h-toque cursor-pointer list-none items-center gap-1.5 rounded-controle text-sm font-semibold [&::-webkit-details-marker]:hidden">
        <ChevronRight
          aria-hidden="true"
          className="size-4 transition-transform duration-150 group-open:rotate-90"
        />
        {titulo}
      </summary>
      <div className="pt-2">{children}</div>
    </details>
  );
}

export default function PaginaMapa() {
  useTituloPagina('Mapa');
  const [parametros, setParametros] = useSearchParams();
  const ponto = useMemo(() => lerPonto(parametros), [parametros]);

  const areas = useAreas();
  const estabelecimentos = useEstabelecimentos();
  const sobreposicoes = useSobreposicoes();
  const municipio = useMunicipio();
  const consulta = useConsultaPonto(ponto);

  const [modo, setModo] = useState<Modo>('consultar');
  const [camadas, setCamadas] = useState<CamadasVisiveis>({
    municipio: true,
    areas: true,
    sobreposicoes: true,
    estabelecimentos: true,
  });
  const [selecionada, setSelecionada] = useState<number | null>(null);

  // desenho de área nova
  const [rascunho, setRascunho] = useState<Poligono | null>(null);
  const [vertices, setVertices] = useState(0);
  const [rodada, setRodada] = useState(0);
  const [pedidosDesfazer, setPedidosDesfazer] = useState(0);
  // redesenho de área existente
  const [redesenho, setRedesenho] = useState<FeatureArea | null>(null);
  const [novaForma, setNovaForma] = useState<Poligono | null>(null);
  // estabelecimento novo ou em edição
  const [posicaoNova, setPosicaoNova] = useState<Posicao | null>(null);
  const [tipoNovo, setTipoNovo] = useState<TipoEstabelecimento>('escola');
  const [editandoEstabelecimento, setEditandoEstabelecimento] =
    useState<FeatureEstabelecimento | null>(null);
  const [estabelecimentoDestacado, setEstabelecimentoDestacado] = useState<number | null>(null);

  const mapa = useRef<MapaLeaflet | null>(null);
  const enquadrou = useRef(false);

  const enquadrar = useCallback(
    (instancia: MapaLeaflet | null, lista: FeatureArea[] | undefined) => {
      if (enquadrou.current || !instancia || !lista?.length || ponto) return;
      const limites = limitesDasAreas(lista);
      if (limites) instancia.fitBounds(limites, { padding: [24, 24] });
      enquadrou.current = true;
    },
    [ponto],
  );

  const listaAreas = areas.data?.features;
  useEffect(() => {
    enquadrar(mapa.current, listaAreas);
  }, [enquadrar, listaAreas]);

  function limparRascunhos() {
    setRascunho(null);
    setVertices(0);
    setPosicaoNova(null);
    setEditandoEstabelecimento(null);
    setRedesenho(null);
    setNovaForma(null);
  }

  function trocarModo(novo: Modo) {
    limparRascunhos();
    setModo(novo);
    setRodada((r) => r + 1);
  }

  const consultar = useCallback(
    (lat: number, lng: number) => {
      setSelecionada(null);
      setParametros({ lat: lat.toFixed(CASAS_URL), lng: lng.toFixed(CASAS_URL) });
      mapa.current?.panTo([lat, lng]);
    },
    [setParametros],
  );

  function selecionarArea(area: FeatureArea) {
    setSelecionada(area.properties.id);
    const limites = limitesDasAreas([area]);
    if (limites) mapa.current?.fitBounds(limites, { padding: [40, 40], maxZoom: 17 });
  }

  function editarEstabelecimento(e: FeatureEstabelecimento) {
    limparRascunhos();
    setModo('estabelecimento');
    setEditandoEstabelecimento(e);
    setTipoNovo(e.properties.tipo);
    const [lng = 0, lat = 0] = e.geometry.coordinates;
    setPosicaoNova({ lat, lng });
    mapa.current?.setView([lat, lng], Math.max(mapa.current.getZoom(), 16));
  }

  function mostrarEstabelecimento(e: FeatureEstabelecimento) {
    setEstabelecimentoDestacado(e.properties.id);
    const [lng = 0, lat = 0] = e.geometry.coordinates;
    mapa.current?.setView([lat, lng], Math.max(mapa.current.getZoom(), 17));
  }

  const emRedesenho = redesenho !== null;
  const aoClicarMapa =
    emRedesenho || modo === 'area'
      ? undefined
      : modo === 'estabelecimento'
        ? (lat: number, lng: number) => setPosicaoNova({ lat, lng })
        : consultar;

  const destacadas =
    modo === 'consultar' && consulta.data
      ? consulta.data.areas.map((a) => a.id)
      : selecionada !== null
        ? [selecionada]
        : [];

  return (
    <div className="flex flex-1 flex-col md:grid md:h-[calc(100dvh_-_3.5rem)] md:flex-none md:grid-cols-[minmax(21rem,25rem)_1fr] md:grid-rows-[minmax(0,1fr)]">
      <aside
        aria-label="Painel do mapa"
        className="rolagem-fina relative order-2 border-t border-linha bg-superficie md:order-1 md:overflow-y-auto md:border-t-0 md:border-r"
      >
        <div className="space-y-7 p-4">
          <header>
            <h1 className="text-xl font-bold">Mapa de Jacareí</h1>
            <p className="prosa mt-1 text-sm text-tinta-suave">
              Cada área é um conjunto de pontos. A classe dela vem dos estabelecimentos que estão no
              seu interior.
            </p>
          </header>

          {emRedesenho ? (
            <FormRedesenho
              area={redesenho}
              novaForma={novaForma}
              aoConcluir={() => {
                setSelecionada(redesenho.properties.id);
                limparRascunhos();
              }}
            />
          ) : (
            <section id="consulta" aria-label="Modo do mapa" className="scroll-mt-16 space-y-5">
              <SeletorSegmentado
                rotulo="O que fazer no mapa"
                valor={modo}
                aoMudar={trocarModo}
                opcoes={MODOS}
              />
              {modo === 'consultar' ? (
                <>
                  {ponto ? (
                    <ResultadoConsulta
                      consulta={consulta.data}
                      carregando={consulta.isPending}
                      erro={consulta.error}
                      aoTentarDeNovo={() => void consulta.refetch()}
                      aoLimpar={() => setParametros({})}
                    />
                  ) : (
                    <div className="rounded-painel border border-dashed border-linha-forte p-4">
                      <h2 className="font-bold">Consulte um ponto</h2>
                      <p className="mt-1 text-sm text-tinta-suave">
                        Clique em qualquer lugar do mapa para saber a que tipo de área o ponto
                        pertence.
                      </p>
                    </div>
                  )}
                  <SecaoRecolhivel titulo="Consultar por coordenadas">
                    <ConsultaPorCoordenada
                      aoConsultar={consultar}
                      centroDoMapa={() => {
                        const centro = mapa.current?.getCenter();
                        return centro ? { lat: centro.lat, lng: centro.lng } : null;
                      }}
                    />
                  </SecaoRecolhivel>
                </>
              ) : modo === 'area' ? (
                <FormArea
                  geometria={rascunho}
                  vertices={vertices}
                  aoDesfazer={() => setPedidosDesfazer((n) => n + 1)}
                  aoRecomecar={() => {
                    setRascunho(null);
                    setVertices(0);
                    setRodada((r) => r + 1);
                  }}
                  aoSalvar={(area) => {
                    setSelecionada(area.properties.id);
                    setRascunho(null);
                    setVertices(0);
                    setRodada((r) => r + 1);
                  }}
                />
              ) : (
                <FormEstabelecimento
                  key={editandoEstabelecimento?.properties.id ?? 'novo'}
                  posicao={posicaoNova}
                  tipo={tipoNovo}
                  aoMudarTipo={setTipoNovo}
                  editando={editandoEstabelecimento}
                  aoConcluir={() => {
                    setPosicaoNova(null);
                    setEditandoEstabelecimento(null);
                  }}
                />
              )}
            </section>
          )}

          <section aria-labelledby="titulo-legenda">
            <h2 id="titulo-legenda" className="mb-2 font-bold">
              Legenda
            </h2>
            <Legenda
              camadas={camadas}
              aoMudarCamada={(chave, visivel) =>
                setCamadas((atual) => ({ ...atual, [chave]: visivel }))
              }
            />
          </section>

          <section aria-labelledby="titulo-areas">
            <h2 id="titulo-areas" className="mb-2 font-bold">
              Áreas cadastradas
            </h2>
            {areas.isError ? (
              <EstadoErro erro={areas.error} aoTentarDeNovo={() => void areas.refetch()} />
            ) : areas.isPending ? (
              <Esqueleto rotulo="Carregando as áreas" linhas={5} />
            ) : (
              <ListaAreas
                areas={areas.data.features}
                selecionada={selecionada}
                aoSelecionar={selecionarArea}
                acoes={(area) => (
                  <AcoesArea
                    area={area}
                    aoRedesenhar={(alvo) => {
                      limparRascunhos();
                      setRedesenho(alvo);
                    }}
                  />
                )}
              />
            )}
          </section>

          <section aria-labelledby="titulo-estabelecimentos">
            <h2 id="titulo-estabelecimentos" className="mb-2 font-bold">
              Estabelecimentos
            </h2>
            {estabelecimentos.isError ? (
              <EstadoErro
                erro={estabelecimentos.error}
                aoTentarDeNovo={() => void estabelecimentos.refetch()}
              />
            ) : estabelecimentos.isPending ? (
              <Esqueleto rotulo="Carregando os estabelecimentos" linhas={3} />
            ) : (
              <ListaEstabelecimentos
                estabelecimentos={estabelecimentos.data.features}
                destacado={estabelecimentoDestacado}
                aoMostrar={mostrarEstabelecimento}
                aoEditar={editarEstabelecimento}
              />
            )}
          </section>
        </div>
      </aside>

      <div className="relative order-1 h-[58dvh] md:order-2 md:h-auto">
        {modo === 'consultar' && !emRedesenho && ponto && consulta.data ? (
          <a
            href="#consulta"
            className="absolute inset-x-3 bottom-7 z-[1000] flex items-center gap-2 rounded-painel border border-linha-forte bg-superficie p-2.5 font-bold text-tinta no-underline shadow-flutuante md:hidden"
          >
            <Amostra aparencia={aparencia(consulta.data.classes)} tamanho={24} />
            <span className="flex-1">{consulta.data.resumo.replace(/\.$/, '')}</span>
            <span className="text-sm font-semibold text-link">Detalhes</span>
          </a>
        ) : null}
        <MapaZoneamento
          rotulo="Mapa de Jacareí com as áreas cadastradas"
          areas={listaAreas}
          versaoAreas={areas.dataUpdatedAt}
          estabelecimentos={estabelecimentos.data?.features}
          versaoEstabelecimentos={estabelecimentos.dataUpdatedAt}
          sobreposicoes={sobreposicoes.data}
          municipio={municipio.data}
          camadas={camadas}
          destacadas={destacadas}
          pontoConsulta={modo === 'consultar' && !emRedesenho ? ponto : null}
          aoClicar={aoClicarMapa}
          aoClicarEstabelecimento={setEstabelecimentoDestacado}
          cursorDeMira={!emRedesenho}
          aoCriar={(instancia) => {
            mapa.current = instancia;
            if (ponto) instancia.setView([ponto.lat, ponto.lng], 15);
            enquadrar(instancia, listaAreas);
          }}
        >
          {modo === 'area' && !emRedesenho && !rascunho ? (
            <DesenhoPoligono
              rodada={rodada}
              pedidosDesfazer={pedidosDesfazer}
              aoFechar={setRascunho}
              aoMudarVertices={setVertices}
            />
          ) : null}
          {modo === 'area' && rascunho ? (
            <GeoJSON key={JSON.stringify(rascunho)} data={rascunho} style={ESTILO_RASCUNHO} />
          ) : null}
          {emRedesenho ? (
            <EdicaoPoligono geometria={redesenho.geometry} aoMudar={setNovaForma} />
          ) : null}
          {modo === 'estabelecimento' && posicaoNova ? (
            <MarcadorNovo posicao={posicaoNova} tipo={tipoNovo} aoMover={setPosicaoNova} />
          ) : null}
        </MapaZoneamento>
      </div>
    </div>
  );
}
