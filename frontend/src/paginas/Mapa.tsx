import type { Map as MapaLeaflet } from 'leaflet';
import { ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import {
  useAreas,
  useConsultaPonto,
  useEstabelecimentos,
  useMunicipio,
  useSobreposicoes,
} from '../api/consultas';
import type { FeatureArea } from '../api/esquemas';
import { EstadoErro, Esqueleto } from '../componentes/Estados';
import { Amostra } from '../componentes/MarcaClasse';
import { aparencia } from '../dominio/classes';
import { useTituloPagina } from '../hooks/titulo-pagina';
import { limitesDasAreas } from '../mapa/geometria';
import { type CamadasVisiveis, MapaZoneamento } from '../mapa/MapaZoneamento';
import { ConsultaPorCoordenada } from '../painel/ConsultaPorCoordenada';
import { Legenda } from '../painel/Legenda';
import { ListaAreas } from '../painel/ListaAreas';
import { ResultadoConsulta } from '../painel/ResultadoConsulta';

const CASAS_URL = 6;

function lerPonto(parametros: URLSearchParams): { lat: number; lng: number } | null {
  const lat = Number(parametros.get('lat'));
  const lng = Number(parametros.get('lng'));
  if (!parametros.has('lat') || !parametros.has('lng')) return null;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
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

  const [camadas, setCamadas] = useState<CamadasVisiveis>({
    municipio: true,
    areas: true,
    sobreposicoes: true,
    estabelecimentos: true,
  });
  const [selecionada, setSelecionada] = useState<number | null>(null);
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

  const destacadas = consulta.data
    ? consulta.data.areas.map((a) => a.id)
    : selecionada !== null
      ? [selecionada]
      : [];

  return (
    <div className="flex flex-1 flex-col md:grid md:h-[calc(100dvh-3.5rem)] md:grid-cols-[minmax(21rem,25rem)_1fr]">
      <aside
        aria-label="Painel do mapa"
        className="rolagem-fina order-2 border-t border-linha bg-superficie md:order-1 md:overflow-y-auto md:border-t-0 md:border-r"
      >
        <div className="space-y-7 p-4">
          <header>
            <h1 className="text-xl font-bold">Mapa de Jacareí</h1>
            <p className="prosa mt-1 text-sm text-tinta-suave">
              Cada área é um conjunto de pontos. A classe dela vem dos estabelecimentos que estão no
              seu interior.
            </p>
          </header>

          <section id="consulta" aria-label="Consulta de ponto" className="scroll-mt-16 space-y-4">
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
                  Clique em qualquer lugar do mapa para saber a que tipo de área o ponto pertence.
                </p>
              </div>
            )}
            <details className="group">
              <summary className="flex min-h-toque cursor-pointer list-none items-center gap-1.5 rounded-controle text-sm font-semibold [&::-webkit-details-marker]:hidden">
                <ChevronRight
                  aria-hidden="true"
                  className="size-4 transition-transform duration-150 group-open:rotate-90"
                />
                Consultar por coordenadas
              </summary>
              <div className="pt-2">
                <ConsultaPorCoordenada
                  aoConsultar={consultar}
                  centroDoMapa={() => {
                    const centro = mapa.current?.getCenter();
                    return centro ? { lat: centro.lat, lng: centro.lng } : null;
                  }}
                />
              </div>
            </details>
          </section>

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
              />
            )}
          </section>
        </div>
      </aside>

      <div className="relative order-1 h-[58dvh] md:order-2 md:h-auto">
        {ponto && consulta.data ? (
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
          pontoConsulta={ponto}
          aoClicar={consultar}
          cursorDeMira
          aoCriar={(instancia) => {
            mapa.current = instancia;
            if (ponto) instancia.setView([ponto.lat, ponto.lng], 15);
            enquadrar(instancia, listaAreas);
          }}
        />
      </div>
    </div>
  );
}
