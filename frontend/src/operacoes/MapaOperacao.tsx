import L, { type Map as MapaLeaflet, type PathOptions } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import { GeoJSON, MapContainer, TileLayer } from 'react-leaflet';
import type {
  FeatureArea,
  FeatureEstabelecimento,
  Municipio,
  ResultadoOperacao,
} from '../api/esquemas';
import { preenchimento } from '../componentes/padroes-hachura';
import { ROTULO_TIPO } from '../dominio/classes';
import {
  ATRIBUICAO,
  CENTRO_JACAREI,
  ESTILO_MUNICIPIO,
  FUNDO,
  htmlMarcador,
  ZOOM_INICIAL,
} from '../mapa/estilos';
import { limitesDasAreas } from '../mapa/geometria';
import { escaparHtml } from '../utilitarios/html';

const ESTILO_A: PathOptions = {
  color: 'var(--tinta)',
  weight: 2,
  fillColor: preenchimento('a'),
  fillOpacity: 1,
};
const ESTILO_B: PathOptions = { ...ESTILO_A, fillColor: preenchimento('b'), dashArray: '8 5' };
const ESTILO_RESULTADO: PathOptions = {
  color: 'var(--resultado)',
  weight: 3,
  fillColor: 'var(--resultado)',
  fillOpacity: 0.38,
  interactive: false,
};

export interface MapaOperacaoProps {
  areaA?: FeatureArea;
  areaB?: FeatureArea;
  resultado?: ResultadoOperacao;
  estabelecimentos?: FeatureEstabelecimento[];
  municipio?: Municipio;
}

function rotuloConjunto(letra: 'A' | 'B', area: FeatureArea) {
  return (_feature: GeoJSON.Feature, camada: L.Layer) => {
    camada.bindTooltip(`<span class="notacao">${letra}</span>`, {
      permanent: true,
      direction: 'center',
      className: 'rotulo-conjunto',
    });
    camada.bindPopup(`<strong>${letra}:</strong> ${escaparHtml(area.properties.nome)}`);
  };
}

/** O mapa da operação: A e B com as hachuras do diagrama de Venn e o resultado pintado. */
export function MapaOperacao({
  areaA,
  areaB,
  resultado,
  estabelecimentos = [],
  municipio,
}: MapaOperacaoProps) {
  const mapa = useRef<MapaLeaflet | null>(null);
  const idA = areaA?.properties.id;
  const idB = areaB?.properties.id;

  useEffect(() => {
    const alvo = [areaA, areaB].filter((a): a is FeatureArea => a !== undefined);
    const limites = limitesDasAreas(alvo);
    if (limites) mapa.current?.fitBounds(limites, { padding: [40, 40] });
    // Só quando as áreas escolhidas mudam, não a cada recarga.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idA, idB]);

  const dentro = new Set(resultado?.estabelecimentos ?? []);
  const selecionados = estabelecimentos.filter((e) => dentro.has(e.properties.id));

  return (
    <MapContainer
      ref={(instancia) => {
        if (instancia && !mapa.current) {
          mapa.current = instancia;
          instancia
            .getContainer()
            .setAttribute('aria-label', 'Mapa com as áreas A e B e o resultado da operação');
          const limites = limitesDasAreas(
            [areaA, areaB].filter((a): a is FeatureArea => a !== undefined),
          );
          if (limites) instancia.fitBounds(limites, { padding: [40, 40] });
        }
      }}
      center={CENTRO_JACAREI}
      zoom={ZOOM_INICIAL}
      className="h-full w-full"
    >
      <TileLayer url={FUNDO} attribution={ATRIBUICAO} maxZoom={19} />
      {municipio ? <GeoJSON data={municipio} style={ESTILO_MUNICIPIO} /> : null}
      {areaA ? (
        <GeoJSON
          key={`a-${idA}`}
          data={areaA}
          style={ESTILO_A}
          onEachFeature={rotuloConjunto('A', areaA)}
        />
      ) : null}
      {areaB ? (
        <GeoJSON
          key={`b-${idB}`}
          data={areaB}
          style={ESTILO_B}
          onEachFeature={rotuloConjunto('B', areaB)}
        />
      ) : null}
      {resultado?.geometria ? (
        <GeoJSON
          key={`r-${resultado.operacao}-${idA}-${idB}-${resultado.area_km2}`}
          data={resultado.geometria}
          style={ESTILO_RESULTADO}
        />
      ) : null}
      <GeoJSON
        key={`e-${[...dentro].join(',')}`}
        data={{ type: 'FeatureCollection', features: selecionados } as GeoJSON.FeatureCollection}
        pointToLayer={(feature, posicao) =>
          L.marker(posicao, {
            keyboard: false,
            icon: L.divIcon({
              className: '',
              html: htmlMarcador((feature as FeatureEstabelecimento).properties.tipo),
              iconSize: [22, 22],
            }),
          })
        }
        onEachFeature={(feature, camada) => {
          const p = (feature as FeatureEstabelecimento).properties;
          camada.bindTooltip(`<strong>${escaparHtml(p.nome)}</strong><br>${ROTULO_TIPO[p.tipo]}`, {
            className: 'rotulo-mapa',
            direction: 'top',
            offset: [0, -10],
          });
        }}
      />
    </MapContainer>
  );
}
