import L, { type Map as MapaLeaflet } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { GeoJSON, MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import type {
  ColecaoSobreposicoes,
  FeatureArea,
  FeatureEstabelecimento,
  Municipio,
} from '../api/esquemas';
import { descreverClasses, ROTULO_TIPO } from '../dominio/classes';
import { formatarNumero } from '../utilitarios/formatar';
import { escaparHtml } from '../utilitarios/html';
import {
  ATRIBUICAO,
  CENTRO_JACAREI,
  ESTILO_MUNICIPIO,
  ESTILO_SOBREPOSICAO,
  estiloArea,
  FUNDO,
  htmlMarcador,
  ZOOM_INICIAL,
} from './estilos';

export interface CamadasVisiveis {
  municipio: boolean;
  areas: boolean;
  sobreposicoes: boolean;
  estabelecimentos: boolean;
}

export interface MapaZoneamentoProps {
  areas?: FeatureArea[];
  /** Muda quando as áreas são recarregadas, para o Leaflet redesenhar a camada. */
  versaoAreas?: number;
  estabelecimentos?: FeatureEstabelecimento[];
  versaoEstabelecimentos?: number;
  sobreposicoes?: ColecaoSobreposicoes;
  municipio?: Municipio;
  camadas: CamadasVisiveis;
  destacadas?: readonly number[];
  pontoConsulta?: { lat: number; lng: number } | null;
  aoClicar?: (lat: number, lng: number) => void;
  aoClicarEstabelecimento?: (id: number) => void;
  aoCriar?: (mapa: MapaLeaflet) => void;
  /** Cursor em cruz quando o clique no mapa marca algo. */
  cursorDeMira?: boolean;
  rotulo: string;
  children?: ReactNode;
}

const ICONE_CONSULTA = L.divIcon({
  className: '',
  html: '<svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true"><circle cx="16" cy="16" r="9" fill="none" stroke="var(--superficie)" stroke-width="5"/><circle cx="16" cy="16" r="9" fill="none" stroke="var(--tinta)" stroke-width="2.5"/><path d="M16 1v8M16 23v8M1 16h8M23 16h8" stroke="var(--tinta)" stroke-width="2.5"/></svg>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function OuvinteDeClique({ aoClicar }: { aoClicar?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(evento) {
      aoClicar?.(evento.latlng.lat, evento.latlng.lng);
    },
  });
  return null;
}

function rotuloArea(feature: FeatureArea): string {
  const p = feature.properties;
  return `<strong>${escaparHtml(p.nome)}</strong><br>${escaparHtml(descreverClasses(p.classes))}`;
}

/** O mapa de Jacareí com as camadas do zoneamento: U, áreas, sobreposições e estabelecimentos. */
export function MapaZoneamento({
  areas = [],
  versaoAreas = 0,
  estabelecimentos = [],
  versaoEstabelecimentos = 0,
  sobreposicoes,
  municipio,
  camadas,
  destacadas = [],
  pontoConsulta,
  aoClicar,
  aoClicarEstabelecimento,
  aoCriar,
  cursorDeMira = false,
  rotulo,
  children,
}: MapaZoneamentoProps) {
  const mapa = useRef<MapaLeaflet | null>(null);
  const clicarEstabelecimento = useRef(aoClicarEstabelecimento);
  useEffect(() => {
    clicarEstabelecimento.current = aoClicarEstabelecimento;
  }, [aoClicarEstabelecimento]);

  const registrar = useCallback(
    (instancia: MapaLeaflet | null) => {
      if (!instancia || mapa.current === instancia) return;
      mapa.current = instancia;
      instancia.getContainer().setAttribute('aria-label', rotulo);
      aoCriar?.(instancia);
    },
    [aoCriar, rotulo],
  );

  useEffect(() => {
    mapa.current?.getContainer().classList.toggle('cursor-crosshair', cursorDeMira);
  }, [cursorDeMira]);

  const estilo = useCallback(
    (feature?: GeoJSON.Feature) => {
      const p = (feature as FeatureArea | undefined)?.properties;
      return estiloArea(p?.classes ?? [], p ? destacadas.includes(p.id) : false);
    },
    [destacadas],
  );

  return (
    <MapContainer
      ref={registrar}
      center={CENTRO_JACAREI}
      zoom={ZOOM_INICIAL}
      className="h-full w-full"
      zoomControl
    >
      <TileLayer url={FUNDO} attribution={ATRIBUICAO} maxZoom={19} />
      {camadas.municipio && municipio ? (
        <GeoJSON data={municipio} style={ESTILO_MUNICIPIO} />
      ) : null}
      {camadas.areas ? (
        <GeoJSON
          key={`areas-${versaoAreas}`}
          data={{ type: 'FeatureCollection', features: areas } as GeoJSON.FeatureCollection}
          style={estilo}
          onEachFeature={(feature, camada) => {
            camada.bindTooltip(rotuloArea(feature as FeatureArea), {
              sticky: true,
              className: 'rotulo-mapa',
            });
          }}
        />
      ) : null}
      {camadas.sobreposicoes && sobreposicoes ? (
        <GeoJSON
          key={`sobreposicoes-${sobreposicoes.features.length}-${versaoAreas}`}
          data={sobreposicoes as GeoJSON.FeatureCollection}
          style={ESTILO_SOBREPOSICAO}
          onEachFeature={(feature, camada) => {
            const p = (feature as ColecaoSobreposicoes['features'][number]).properties;
            camada.bindTooltip(
              `<span class="notacao">${escaparHtml(p.nome_1)} ∩ ${escaparHtml(p.nome_2)}</span><br>${formatarNumero(p.area_m2 / 10_000)} ha`,
              { sticky: true, className: 'rotulo-mapa' },
            );
          }}
        />
      ) : null}
      {camadas.estabelecimentos ? (
        <GeoJSON
          key={`estabelecimentos-${versaoEstabelecimentos}`}
          data={
            { type: 'FeatureCollection', features: estabelecimentos } as GeoJSON.FeatureCollection
          }
          pointToLayer={(feature, posicao) => {
            const tipo = (feature as FeatureEstabelecimento).properties.tipo;
            return L.marker(posicao, {
              keyboard: false,
              icon: L.divIcon({ className: '', html: htmlMarcador(tipo), iconSize: [22, 22] }),
            });
          }}
          onEachFeature={(feature, camada) => {
            const p = (feature as FeatureEstabelecimento).properties;
            camada.bindTooltip(
              `<strong>${escaparHtml(p.nome)}</strong><br>${ROTULO_TIPO[p.tipo]}`,
              {
                className: 'rotulo-mapa',
                direction: 'top',
                offset: [0, -10],
              },
            );
          }}
        />
      ) : null}
      {pontoConsulta ? (
        <Marker
          position={[pontoConsulta.lat, pontoConsulta.lng]}
          icon={ICONE_CONSULTA}
          keyboard={false}
          interactive={false}
        />
      ) : null}
      <OuvinteDeClique aoClicar={aoClicar} />
      {children}
    </MapContainer>
  );
}
