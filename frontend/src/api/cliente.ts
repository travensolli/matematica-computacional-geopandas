import type { z } from 'zod';
import {
  ColecaoAreasSchema,
  ColecaoEstabelecimentosSchema,
  ColecaoSobreposicoesSchema,
  ConsultaSchema,
  ErroSchema,
  FeatureAreaSchema,
  FeatureEstabelecimentoSchema,
  MunicipioSchema,
  type Operacao,
  PartesSchema,
  type Poligono,
  ProdutoSchema,
  RelacoesSchema,
  ResultadoOperacaoSchema,
  SaudeSchema,
  type TipoEstabelecimento,
  TrechosSchema,
} from './esquemas';

/** Erro de comunicação ou recusa do servidor, com a mensagem em português e o campo de origem. */
export class ErroApi extends Error {
  readonly status: number;
  readonly campo: string | null;

  constructor(mensagem: string, status: number, campo: string | null = null) {
    super(mensagem);
    this.name = 'ErroApi';
    this.status = status;
    this.campo = campo;
  }
}

const BASE = import.meta.env.VITE_API_URL ?? '';

function analisarJson(texto: string): unknown {
  if (!texto) return null;
  try {
    return JSON.parse(texto);
  } catch {
    return null;
  }
}

async function requisitar<T extends z.ZodType>(
  caminho: string,
  schema: T,
  init: RequestInit = {},
): Promise<z.output<T>> {
  let resposta: Response;
  try {
    resposta = await fetch(`${BASE}${caminho}`, {
      ...init,
      headers: { accept: 'application/json', 'content-type': 'application/json', ...init.headers },
    });
  } catch {
    throw new ErroApi(
      'Não foi possível falar com o servidor. Confira se o backend está rodando.',
      0,
    );
  }

  if (resposta.status === 204) return undefined as z.output<T>;
  const corpo = analisarJson(await resposta.text());

  if (!resposta.ok) {
    const erro = ErroSchema.safeParse(corpo);
    if (erro.success) throw new ErroApi(erro.data.erro, resposta.status, erro.data.campo);
    throw new ErroApi(`O servidor respondeu com o erro ${resposta.status}.`, resposta.status);
  }

  const analise = schema.safeParse(corpo);
  if (!analise.success) {
    throw new ErroApi('A resposta do servidor não está no formato esperado.', resposta.status);
  }
  return analise.data;
}

function enviar<T extends z.ZodType>(metodo: string, caminho: string, corpo: unknown, schema: T) {
  return requisitar(caminho, schema, { method: metodo, body: JSON.stringify(corpo) });
}

const Vazio = {
  safeParse: () => ({ success: true, data: undefined }),
} as unknown as z.ZodType<void>;

export interface NovaArea {
  nome: string;
  geometry: Poligono;
}

export interface NovoEstabelecimento {
  nome: string;
  tipo: TipoEstabelecimento;
  lat: number;
  lng: number;
}

export const api = {
  saude: () => requisitar('/api/saude', SaudeSchema),

  areas: () => requisitar('/api/areas', ColecaoAreasSchema),
  criarArea: (dados: NovaArea) => enviar('POST', '/api/areas', dados, FeatureAreaSchema),
  editarArea: (id: number, dados: Partial<NovaArea>) =>
    enviar('PATCH', `/api/areas/${id}`, dados, FeatureAreaSchema),
  excluirArea: (id: number) => requisitar(`/api/areas/${id}`, Vazio, { method: 'DELETE' }),

  estabelecimentos: () => requisitar('/api/estabelecimentos', ColecaoEstabelecimentosSchema),
  criarEstabelecimento: (dados: NovoEstabelecimento) =>
    enviar('POST', '/api/estabelecimentos', dados, FeatureEstabelecimentoSchema),
  editarEstabelecimento: (id: number, dados: Partial<NovoEstabelecimento>) =>
    enviar('PATCH', `/api/estabelecimentos/${id}`, dados, FeatureEstabelecimentoSchema),
  excluirEstabelecimento: (id: number) =>
    requisitar(`/api/estabelecimentos/${id}`, Vazio, { method: 'DELETE' }),

  consulta: (lat: number, lng: number) =>
    requisitar(
      `/api/consulta?${new URLSearchParams({ lat: String(lat), lng: String(lng) })}`,
      ConsultaSchema,
    ),
  sobreposicoes: () => requisitar('/api/sobreposicoes', ColecaoSobreposicoesSchema),
  municipio: () => requisitar('/api/municipio', MunicipioSchema),

  operacao: (a: number, b: number, op: Operacao) =>
    requisitar(
      `/api/conjuntos/operacao?${new URLSearchParams({ a: String(a), b: String(b), op })}`,
      ResultadoOperacaoSchema,
    ),
  relacoes: (a: number, b: number) =>
    requisitar(
      `/api/conjuntos/relacoes?${new URLSearchParams({ a: String(a), b: String(b) })}`,
      RelacoesSchema,
    ),
  produto: () => requisitar('/api/conjuntos/produto', ProdutoSchema),
  partes: () => requisitar('/api/conjuntos/partes', PartesSchema),
  trechos: () => requisitar('/api/teoria/trechos', TrechosSchema),
};
