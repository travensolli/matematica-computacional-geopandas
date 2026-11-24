import type { Aparencia } from '../dominio/classes';

/* Hachuras como notação: cada classe tem uma direção de traço e, onde dois conjuntos se
   cruzam, os traços se cruzam também. O mapa (Leaflet), a legenda e os diagramas de Venn
   usam as mesmas definições por `url(#id)`; o componente DefinicoesHachuras as desenha. */

export const ID_HACHURA: Record<Aparencia | 'a' | 'b', string> = {
  escolar: 'hachura-escolar',
  industrial: 'hachura-industrial',
  residencial: 'hachura-residencial',
  misto: 'hachura-misto',
  nenhuma: 'hachura-nenhuma',
  a: 'hachura-a',
  b: 'hachura-b',
};

export const preenchimento = (chave: keyof typeof ID_HACHURA) => `url(#${ID_HACHURA[chave]})`;
