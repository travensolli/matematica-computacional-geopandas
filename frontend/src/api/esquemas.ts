import { z } from 'zod';

/* Contrato das respostas do backend (zoneamento/api). O frontend valida tudo o que recebe:
   uma mudança de formato no servidor vira um erro claro, e não uma tela quebrada. */

export const ClasseSchema = z.enum(['escolar', 'industrial', 'residencial']);
export const TipoSchema = z.enum(['escola', 'industria', 'residencia']);

export type Classe = z.infer<typeof ClasseSchema>;
export type TipoEstabelecimento = z.infer<typeof TipoSchema>;

const Posicao = z.array(z.number()).min(2);
const Anel = z.array(Posicao);

export const PoligonoSchema = z.object({
  type: z.literal('Polygon'),
  coordinates: z.array(Anel),
});
export const MultiPoligonoSchema = z.object({
  type: z.literal('MultiPolygon'),
  coordinates: z.array(z.array(Anel)),
});
export const GeometriaAreaSchema = z.discriminatedUnion('type', [
  PoligonoSchema,
  MultiPoligonoSchema,
]);
export const PontoSchema = z.object({ type: z.literal('Point'), coordinates: Posicao });

export type Poligono = z.infer<typeof PoligonoSchema>;
export type GeometriaArea = z.infer<typeof GeometriaAreaSchema>;

const IdentificacaoSchema = z.object({ id: z.number().int(), nome: z.string() });

export const PropriedadesAreaSchema = z.looseObject({
  id: z.number().int(),
  nome: z.string(),
  fonte: z.string().nullable(),
  criado_em: z.string().nullable(),
  escolas: z.number().int(),
  industrias: z.number().int(),
  residencias: z.number().int(),
  tipos_presentes: z.array(TipoSchema),
  classes: z.array(ClasseSchema),
  estabelecimentos: z.array(z.number().int()),
  area_km2: z.number(),
  dentro_do_municipio: z.boolean().nullable(),
});
export const FeatureAreaSchema = z.object({
  type: z.literal('Feature'),
  properties: PropriedadesAreaSchema,
  geometry: GeometriaAreaSchema,
});
export const ColecaoAreasSchema = z.object({
  type: z.literal('FeatureCollection'),
  features: z.array(FeatureAreaSchema),
});

export type Area = z.infer<typeof PropriedadesAreaSchema>;
export type FeatureArea = z.infer<typeof FeatureAreaSchema>;

export const PropriedadesEstabelecimentoSchema = z.looseObject({
  id: z.number().int(),
  nome: z.string(),
  tipo: TipoSchema,
  fonte: z.string().nullable(),
  osm_id: z.union([z.string(), z.number()]).nullable().optional(),
  criado_em: z.string().nullable(),
});
export const FeatureEstabelecimentoSchema = z.object({
  type: z.literal('Feature'),
  properties: PropriedadesEstabelecimentoSchema,
  geometry: PontoSchema,
});
export const ColecaoEstabelecimentosSchema = z.object({
  type: z.literal('FeatureCollection'),
  features: z.array(FeatureEstabelecimentoSchema),
});

export type Estabelecimento = z.infer<typeof PropriedadesEstabelecimentoSchema>;
export type FeatureEstabelecimento = z.infer<typeof FeatureEstabelecimentoSchema>;

export const ConsultaSchema = z.object({
  ponto: z.object({ lat: z.number(), lng: z.number() }),
  classes: z.array(ClasseSchema),
  areas: z.array(IdentificacaoSchema.extend({ classes: z.array(ClasseSchema) })),
  total_areas: z.number().int(),
  resumo: z.string(),
});
export type Consulta = z.infer<typeof ConsultaSchema>;

export const ColecaoSobreposicoesSchema = z.object({
  type: z.literal('FeatureCollection'),
  features: z.array(
    z.object({
      type: z.literal('Feature'),
      properties: z.object({
        id_1: z.number().int(),
        nome_1: z.string(),
        id_2: z.number().int(),
        nome_2: z.string(),
        area_m2: z.number(),
      }),
      geometry: GeometriaAreaSchema,
    }),
  ),
});
export type ColecaoSobreposicoes = z.infer<typeof ColecaoSobreposicoesSchema>;

export const MunicipioSchema = z.object({
  type: z.literal('Feature'),
  properties: z.looseObject({ area_km2: z.number(), nome: z.string().optional() }),
  geometry: GeometriaAreaSchema,
});
export type Municipio = z.infer<typeof MunicipioSchema>;

export const OperacaoSchema = z.enum([
  'uniao',
  'interseccao',
  'diferenca',
  'diferenca_inversa',
  'diferenca_simetrica',
]);
export type Operacao = z.infer<typeof OperacaoSchema>;

export const ResultadoOperacaoSchema = z.object({
  operacao: OperacaoSchema,
  a: IdentificacaoSchema,
  b: IdentificacaoSchema,
  vazio: z.boolean(),
  geometria: GeometriaAreaSchema.nullable(),
  area_km2: z.number(),
  estabelecimentos: z.array(z.number().int()),
});
export type ResultadoOperacao = z.infer<typeof ResultadoOperacaoSchema>;

export const RelacoesSchema = z.object({
  a: IdentificacaoSchema,
  b: IdentificacaoSchema,
  iguais: z.boolean(),
  a_subconjunto_b: z.boolean(),
  b_subconjunto_a: z.boolean(),
  a_subconjunto_proprio_b: z.boolean(),
  b_subconjunto_proprio_a: z.boolean(),
  disjuntos: z.boolean(),
});
export type Relacoes = z.infer<typeof RelacoesSchema>;

export const ProdutoSchema = z.object({
  estabelecimentos: z.number().int(),
  areas: z.number().int(),
  pares: z.number().int(),
  pares_com_pertinencia: z.number().int(),
  fora_de_todas: z.array(z.number().int()),
  amostra: z.array(
    z.object({ estabelecimento: z.string(), area: z.string(), pertence: z.boolean() }),
  ),
});
export type Produto = z.infer<typeof ProdutoSchema>;

export const PartesSchema = z.object({
  tipos: z.array(TipoSchema),
  linhas: z.array(z.object({ tipos: z.array(TipoSchema), classes: z.array(ClasseSchema) })),
});
export type Partes = z.infer<typeof PartesSchema>;

export const TrechosSchema = z.object({
  trechos: z.array(
    z.object({
      nome: z.string(),
      arquivo: z.string(),
      linha: z.number().int(),
      codigo: z.string(),
    }),
  ),
});
export type Trecho = z.infer<typeof TrechosSchema>['trechos'][number];

export const SaudeSchema = z.object({
  status: z.literal('ok'),
  areas: z.number().int(),
  estabelecimentos: z.number().int(),
  municipio: z.boolean(),
});

export const ErroSchema = z.object({
  erro: z.string(),
  campo: z.string().nullable(),
  detalhes: z.array(z.object({ campo: z.string(), mensagem: z.string() })).default([]),
});
