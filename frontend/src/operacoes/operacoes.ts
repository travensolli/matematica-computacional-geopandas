import type { Operacao } from '../api/esquemas';
import type { FiguraVenn } from '../teoria/DiagramaVenn';

/* Cada operação do laboratório: o símbolo, a definição das notas de aula, a chamada GeoPandas
   que o backend executa e a consulta que o PRJ.14 faria no PostgreSQL com PostGIS. */

export interface DescricaoOperacao {
  simbolo: string;
  nome: string;
  formula: string;
  figura: FiguraVenn;
  referencia: string;
  geopandas: string;
  postgis: string;
}

export const ORDEM_OPERACOES: Operacao[] = [
  'uniao',
  'interseccao',
  'diferenca',
  'diferenca_inversa',
  'diferenca_simetrica',
];

export const OPERACOES: Record<Operacao, DescricaoOperacao> = {
  uniao: {
    simbolo: 'A ∪ B',
    nome: 'União',
    formula: 'x ∈ A ∪ B ↔ x ∈ A ∨ x ∈ B',
    figura: 'uniao',
    referencia: '§4.4, eq. (13)',
    geopandas: 'gpd.overlay(A, B, how="union")',
    postgis: 'SELECT ST_Union(a.geom, b.geom) FROM areas a, areas b WHERE a.id = :a AND b.id = :b;',
  },
  interseccao: {
    simbolo: 'A ∩ B',
    nome: 'Intersecção',
    formula: 'x ∈ A ∩ B ↔ x ∈ A ∧ x ∈ B',
    figura: 'interseccao',
    referencia: '§4.5, eq. (14)',
    geopandas: 'gpd.overlay(A, B, how="intersection")',
    postgis:
      'SELECT ST_Intersection(a.geom, b.geom) FROM areas a, areas b WHERE a.id = :a AND b.id = :b;',
  },
  diferenca: {
    simbolo: 'A − B',
    nome: 'Diferença',
    formula: 'x ∈ A − B ↔ x ∈ A ∧ x ∉ B',
    figura: 'diferenca',
    referencia: '§4.6, eq. (15)',
    geopandas: 'gpd.overlay(A, B, how="difference")',
    postgis:
      'SELECT ST_Difference(a.geom, b.geom) FROM areas a, areas b WHERE a.id = :a AND b.id = :b;',
  },
  diferenca_inversa: {
    simbolo: 'B − A',
    nome: 'Diferença inversa',
    formula: 'x ∈ B − A ↔ x ∈ B ∧ x ∉ A',
    figura: 'diferenca_inversa',
    referencia: '§4.6, eq. (15)',
    geopandas: 'gpd.overlay(B, A, how="difference")',
    postgis:
      'SELECT ST_Difference(b.geom, a.geom) FROM areas a, areas b WHERE a.id = :a AND b.id = :b;',
  },
  diferenca_simetrica: {
    simbolo: 'A Δ B',
    nome: 'Diferença simétrica',
    formula: 'A Δ B = ( A − B ) ∪ ( B − A )',
    figura: 'diferenca_simetrica',
    referencia: 'Figura 21(b)',
    geopandas: 'gpd.overlay(A, B, how="symmetric_difference")',
    postgis:
      'SELECT ST_SymDifference(a.geom, b.geom) FROM areas a, areas b WHERE a.id = :a AND b.id = :b;',
  },
};
