import type { z } from 'zod';
import type {
  ColecaoAreasSchema,
  Relacoes,
  ResultadoOperacao,
  Partes,
  Produto,
  TrechosSchema,
  ColecaoEstabelecimentosSchema,
  ColecaoSobreposicoesSchema,
  Consulta,
  MunicipioSchema,
} from '../api/esquemas';

/* Dados de teste no formato exato do backend, numa grade simples perto de Jacareí. */

function quadrado(x: number, y: number, lado = 0.01) {
  return {
    type: 'Polygon' as const,
    coordinates: [
      [
        [x, y],
        [x + lado, y],
        [x + lado, y + lado],
        [x, y + lado],
        [x, y],
      ],
    ],
  };
}

function area(
  id: number,
  nome: string,
  classes: Array<'escolar' | 'industrial' | 'residencial'>,
  x: number,
  extra: Partial<{ escolas: number; industrias: number; residencias: number }> = {},
) {
  const contagem = { escolas: 0, industrias: 0, residencias: 0, ...extra };
  const tipos_presentes = [
    ...(contagem.escolas ? (['escola'] as const) : []),
    ...(contagem.industrias ? (['industria'] as const) : []),
    ...(contagem.residencias ? (['residencia'] as const) : []),
  ];
  return {
    type: 'Feature' as const,
    properties: {
      id,
      nome,
      fonte: 'curadoria',
      criado_em: '2026-11-24T12:00:00',
      ...contagem,
      tipos_presentes,
      classes,
      estabelecimentos: [],
      area_km2: 1.234,
      dentro_do_municipio: true,
    },
    geometry: quadrado(x, -23.31),
  };
}

export const AREAS: z.input<typeof ColecaoAreasSchema> = {
  type: 'FeatureCollection',
  features: [
    area(1, 'Jardim Santa Maria', ['escolar'], -45.97, { escolas: 2, residencias: 3 }),
    area(2, 'Distrito industrial', ['industrial'], -45.95, { industrias: 2 }),
    area(3, 'Corredor misto', ['escolar', 'industrial'], -45.965, { escolas: 1, industrias: 1 }),
    area(4, 'Vila residencial', ['residencial'], -45.93, { residencias: 4 }),
    area(5, 'Parque sem cadastro', [], -45.91),
  ],
};

export const ESTABELECIMENTOS: z.input<typeof ColecaoEstabelecimentosSchema> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        id: 1,
        nome: 'Fatec Jacareí',
        tipo: 'escola',
        fonte: 'curadoria',
        osm_id: null,
        criado_em: null,
      },
      geometry: { type: 'Point', coordinates: [-45.96692, -23.29521] },
    },
    {
      type: 'Feature',
      properties: {
        id: 2,
        nome: 'Metalúrgica',
        tipo: 'industria',
        fonte: 'osm',
        osm_id: 'way/1',
        criado_em: null,
      },
      geometry: { type: 'Point', coordinates: [-45.945, -23.305] },
    },
  ],
};

export const SOBREPOSICOES: z.input<typeof ColecaoSobreposicoesSchema> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        id_1: 1,
        nome_1: 'Jardim Santa Maria',
        id_2: 3,
        nome_2: 'Corredor misto',
        area_m2: 5400,
      },
      geometry: quadrado(-45.965, -23.31, 0.005),
    },
  ],
};

export const MUNICIPIO: z.input<typeof MunicipioSchema> = {
  type: 'Feature',
  properties: { codarea: '3524402', nome: 'Jacareí', area_km2: 459.4 },
  geometry: quadrado(-46.15, -23.42, 0.36),
};

export const CONSULTA_SOBREPOSICAO: Consulta = {
  ponto: { lat: -23.305, lng: -45.962 },
  classes: ['escolar', 'industrial'],
  areas: [
    { id: 1, nome: 'Jardim Santa Maria', classes: ['escolar'] },
    { id: 3, nome: 'Corredor misto', classes: ['escolar', 'industrial'] },
  ],
  total_areas: 5,
  resumo: 'Área escolar e industrial.',
};

export const PARTES: Partes = {
  tipos: ['escola', 'industria', 'residencia'],
  linhas: [
    { tipos: [], classes: [] },
    { tipos: ['escola'], classes: ['escolar'] },
    { tipos: ['industria'], classes: ['industrial'] },
    { tipos: ['residencia'], classes: ['residencial'] },
    { tipos: ['escola', 'industria'], classes: ['escolar', 'industrial'] },
    { tipos: ['escola', 'residencia'], classes: ['escolar'] },
    { tipos: ['industria', 'residencia'], classes: ['industrial'] },
    { tipos: ['escola', 'industria', 'residencia'], classes: ['escolar', 'industrial'] },
  ],
};

export const PRODUTO: Produto = {
  estabelecimentos: 9,
  areas: 4,
  pares: 36,
  pares_com_pertinencia: 10,
  fora_de_todas: [],
  amostra: [{ estabelecimento: 'Fatec Jacareí', area: 'Jardim Santa Maria', pertence: true }],
};

export const TRECHOS: z.input<typeof TrechosSchema> = {
  trechos: [
    {
      nome: 'pertence',
      arquivo: 'zoneamento/geo/conjuntos.py',
      linha: 18,
      codigo:
        'def pertence(pontos, areas):\n    return gpd.sjoin(pontos, areas, how="inner", predicate="within")\n',
    },
  ],
};

export const OPERACAO_INTERSECCAO: ResultadoOperacao = {
  operacao: 'interseccao',
  a: { id: 1, nome: 'Jardim Santa Maria' },
  b: { id: 2, nome: 'Distrito industrial' },
  vazio: false,
  geometria: {
    type: 'Polygon',
    coordinates: [
      [
        [-45.96, -23.31],
        [-45.955, -23.31],
        [-45.955, -23.305],
        [-45.96, -23.31],
      ],
    ],
  },
  area_km2: 0.123,
  estabelecimentos: [1, 2],
};

export const RELACOES: Relacoes = {
  a: { id: 1, nome: 'Jardim Santa Maria' },
  b: { id: 2, nome: 'Distrito industrial' },
  iguais: false,
  a_subconjunto_b: true,
  b_subconjunto_a: false,
  a_subconjunto_proprio_b: true,
  b_subconjunto_proprio_a: false,
  disjuntos: false,
};
