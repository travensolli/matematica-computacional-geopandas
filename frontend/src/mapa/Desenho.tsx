import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import L, { type PathOptions } from 'leaflet';
import { useEffect, useRef } from 'react';
import { Marker, useMap } from 'react-leaflet';
import type { GeometriaArea, Poligono, TipoEstabelecimento } from '../api/esquemas';
import { htmlMarcador } from './estilos';

const ESTILO_DESENHO: PathOptions = {
  color: 'var(--tinta)',
  weight: 2.5,
  fillColor: 'var(--tinta)',
  fillOpacity: 0.08,
};

/** Guarda a versão mais recente de uma função sem recriar os efeitos que a usam. */
function useUltima<T>(valor: T) {
  const ref = useRef(valor);
  useEffect(() => {
    ref.current = valor;
  });
  return ref;
}

type ControleDesenho = { _removeLastVertex?: () => void; _layer?: L.Polyline };

export interface DesenhoPoligonoProps {
  /** Muda para recomeçar o desenho do zero. */
  rodada: number;
  /** Muda para desfazer o último vértice. */
  pedidosDesfazer: number;
  aoFechar: (geometria: Poligono) => void;
  aoMudarVertices: (quantidade: number) => void;
}

/** Desenho de um polígono novo com o Leaflet-Geoman: arestas que se cruzam não são aceitas. */
export function DesenhoPoligono({
  rodada,
  pedidosDesfazer,
  aoFechar,
  aoMudarVertices,
}: DesenhoPoligonoProps) {
  const mapa = useMap();
  const fechar = useUltima(aoFechar);
  const contar = useUltima(aoMudarVertices);

  useEffect(() => {
    mapa.pm.setLang('pt_br');
    const iniciar = () =>
      mapa.pm.enableDraw('Polygon', {
        allowSelfIntersection: false,
        snappable: true,
        snapDistance: 14,
        templineStyle: ESTILO_DESENHO,
        hintlineStyle: { ...ESTILO_DESENHO, dashArray: '4 6' },
        pathOptions: ESTILO_DESENHO,
      });
    const aoComecar: L.PM.DrawStartEventHandler = (evento) => {
      const linha = evento.workingLayer as L.Polyline;
      linha.on('pm:vertexadded', () => contar.current(linha.getLatLngs().length));
    };
    const aoCriar: L.PM.CreateEventHandler = (evento) => {
      const camada = evento.layer as L.Polygon;
      const geometria = camada.toGeoJSON().geometry as Poligono;
      camada.remove();
      fechar.current(geometria);
    };
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key !== 'Escape') return;
      mapa.pm.disableDraw();
      contar.current(0);
      iniciar();
    };
    mapa.on('pm:drawstart', aoComecar);
    mapa.on('pm:create', aoCriar);
    document.addEventListener('keydown', aoTeclar);
    contar.current(0);
    iniciar();
    return () => {
      document.removeEventListener('keydown', aoTeclar);
      mapa.off('pm:drawstart', aoComecar as unknown as L.LeafletEventHandlerFn);
      mapa.off('pm:create', aoCriar as unknown as L.LeafletEventHandlerFn);
      mapa.pm.disableDraw();
    };
  }, [mapa, rodada, fechar, contar]);

  useEffect(() => {
    if (pedidosDesfazer === 0) return;
    const controle = (mapa.pm.Draw as unknown as { Polygon: ControleDesenho }).Polygon;
    controle._removeLastVertex?.();
    const linha = controle._layer;
    contar.current(linha ? linha.getLatLngs().length : 0);
  }, [mapa, pedidosDesfazer, contar]);

  return null;
}

export interface EdicaoPoligonoProps {
  geometria: GeometriaArea;
  aoMudar: (geometria: Poligono) => void;
}

/** Redesenho de uma área existente: os vértices viram alças que podem ser arrastadas. */
export function EdicaoPoligono({ geometria, aoMudar }: EdicaoPoligonoProps) {
  const mapa = useMap();
  const mudar = useUltima(aoMudar);

  useEffect(() => {
    mapa.pm.setLang('pt_br');
    const camada = L.geoJSON(geometria as GeoJSON.Geometry, {
      style: () => ESTILO_DESENHO,
    }).getLayers()[0] as L.Polygon;
    camada.addTo(mapa);
    camada.pm.enable({ allowSelfIntersection: false, snappable: true });
    const atualizar = () => mudar.current(camada.toGeoJSON().geometry as Poligono);
    camada.on('pm:edit', atualizar);
    mapa.fitBounds(camada.getBounds(), { padding: [48, 48] });
    return () => {
      camada.off('pm:edit', atualizar);
      camada.pm.disable();
      camada.remove();
    };
  }, [geometria, mapa, mudar]);

  return null;
}

export interface MarcadorNovoProps {
  posicao: { lat: number; lng: number };
  tipo: TipoEstabelecimento;
  aoMover: (posicao: { lat: number; lng: number }) => void;
}

/** O estabelecimento sendo cadastrado: maior que os demais e arrastável para o lugar certo. */
export function MarcadorNovo({ posicao, tipo, aoMover }: MarcadorNovoProps) {
  const icone = L.divIcon({
    className: '',
    html: htmlMarcador(tipo).replace('marcador-estabelecimento', 'marcador-estabelecimento novo'),
    iconSize: [28, 28],
  });
  return (
    <Marker
      position={[posicao.lat, posicao.lng]}
      icon={icone}
      draggable
      keyboard={false}
      eventHandlers={{
        dragend: (evento) => {
          const { lat, lng } = (evento.target as L.Marker).getLatLng();
          aoMover({ lat, lng });
        },
      }}
    />
  );
}
