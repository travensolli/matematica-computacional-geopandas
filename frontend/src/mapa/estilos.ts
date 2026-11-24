import type { PathOptions } from 'leaflet';
import type { Classe, TipoEstabelecimento } from '../api/esquemas';
import { aparencia, type Aparencia } from '../dominio/classes';
import { preenchimento } from '../componentes/padroes-hachura';

/* Estilos das camadas. As cores são variáveis CSS: o SVG do Leaflet as resolve no tema atual. */

export const CENTRO_JACAREI: [number, number] = [-23.3, -45.966];
export const ZOOM_INICIAL = 13;

/* Blocos padrão do OpenStreetMap, sem chave de API. O filtro CSS da camada de blocos
   (global.css) os deixa em cinza, como uma planta, para as hachuras das classes se destacarem. */
export const FUNDO = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const ATRIBUICAO =
  '&copy; <a href="https://www.openstreetmap.org/copyright">colaboradores do OpenStreetMap</a> | limite municipal: IBGE';

const CONTORNO: Record<Aparencia, string> = {
  escolar: 'var(--escolar)',
  industrial: 'var(--industrial)',
  residencial: 'var(--residencial-traco)',
  misto: 'var(--tinta)',
  nenhuma: 'var(--sem-classe)',
};

export function estiloArea(classes: readonly Classe[], destacada = false): PathOptions {
  const chave = aparencia(classes);
  return {
    color: CONTORNO[chave],
    weight: destacada ? 4 : 2,
    opacity: 1,
    fillColor: preenchimento(chave),
    fillOpacity: 1,
    dashArray: chave === 'nenhuma' ? '6 4' : undefined,
  };
}

/** O universo U: o limite do município em traço e ponto, como nas divisas dos mapas. */
export const ESTILO_MUNICIPIO: PathOptions = {
  color: 'var(--universo)',
  weight: 2,
  opacity: 0.85,
  dashArray: '12 5 2 5',
  fill: false,
  interactive: false,
};

/** A ∩ B: contorno pontilhado sobre o trecho onde as hachuras já se cruzam. */
export const ESTILO_SOBREPOSICAO: PathOptions = {
  color: 'var(--tinta)',
  weight: 1.5,
  opacity: 0.9,
  dashArray: '2 4',
  fill: false,
};

const ICONES: Record<TipoEstabelecimento, string> = {
  escola:
    '<path d="M2 7.2 8 4l6 3.2-6 3.2z"/><path d="M4.6 8.6v2.8c0 .9 1.5 1.9 3.4 1.9s3.4-1 3.4-1.9V8.6"/>',
  industria: '<path d="M2.2 13.6V7.4l3.6 2V7.4l3.6 2V3.6h2.6v10z"/>',
  residencia: '<path d="M2.6 7.6 8 3.2l5.4 4.4"/><path d="M4.2 6.6v6.8h7.6V6.6"/>',
};

export const COR_TIPO: Record<TipoEstabelecimento, string> = {
  escola: 'var(--escolar)',
  industria: 'var(--industrial)',
  residencia: 'var(--residencial)',
};

/** HTML do marcador de um estabelecimento: círculo na cor do tipo com o ícone do tipo. */
export function htmlMarcador(tipo: TipoEstabelecimento): string {
  const traco = tipo === 'residencia' ? '#14212b' : '#ffffff';
  return `<span class="marcador-estabelecimento" style="--cor:${COR_TIPO[tipo]}"><svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="${traco}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">${ICONES[tipo]}</svg></span>`;
}
