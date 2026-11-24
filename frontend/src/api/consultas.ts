import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type NovaArea, type NovoEstabelecimento } from './cliente';
import type { Operacao } from './esquemas';

/* Chaves das consultas. Cadastrar ou excluir qualquer coisa invalida tudo o que depende do
   cadastro: a classificação das áreas, as sobreposições, a consulta de ponto e os conjuntos. */
export const chaves = {
  areas: ['areas'] as const,
  estabelecimentos: ['estabelecimentos'] as const,
  sobreposicoes: ['sobreposicoes'] as const,
  municipio: ['municipio'] as const,
  consulta: (lat: number, lng: number) => ['consulta', lat, lng] as const,
  operacao: (a: number, b: number, op: Operacao) => ['conjuntos', 'operacao', a, b, op] as const,
  relacoes: (a: number, b: number) => ['conjuntos', 'relacoes', a, b] as const,
  produto: ['conjuntos', 'produto'] as const,
  partes: ['partes'] as const,
  trechos: ['trechos'] as const,
};

const DEPENDENTES_DO_CADASTRO = [
  chaves.areas,
  chaves.estabelecimentos,
  chaves.sobreposicoes,
  ['consulta'],
  ['conjuntos'],
];

export const useAreas = () => useQuery({ queryKey: chaves.areas, queryFn: api.areas });

export const useEstabelecimentos = () =>
  useQuery({ queryKey: chaves.estabelecimentos, queryFn: api.estabelecimentos });

export const useSobreposicoes = () =>
  useQuery({ queryKey: chaves.sobreposicoes, queryFn: api.sobreposicoes });

export const useMunicipio = () =>
  useQuery({ queryKey: chaves.municipio, queryFn: api.municipio, staleTime: Infinity });

export function useConsultaPonto(ponto: { lat: number; lng: number } | null) {
  return useQuery({
    queryKey: chaves.consulta(ponto?.lat ?? 0, ponto?.lng ?? 0),
    queryFn: () => api.consulta(ponto!.lat, ponto!.lng),
    enabled: ponto !== null,
  });
}

export function useOperacao(a: number | null, b: number | null, op: Operacao) {
  return useQuery({
    queryKey: chaves.operacao(a ?? 0, b ?? 0, op),
    queryFn: () => api.operacao(a!, b!, op),
    enabled: a !== null && b !== null,
  });
}

export function useRelacoes(a: number | null, b: number | null) {
  return useQuery({
    queryKey: chaves.relacoes(a ?? 0, b ?? 0),
    queryFn: () => api.relacoes(a!, b!),
    enabled: a !== null && b !== null,
  });
}

export const useProduto = () => useQuery({ queryKey: chaves.produto, queryFn: api.produto });

export const usePartes = () =>
  useQuery({ queryKey: chaves.partes, queryFn: api.partes, staleTime: Infinity });

export const useTrechos = () =>
  useQuery({ queryKey: chaves.trechos, queryFn: api.trechos, staleTime: Infinity });

function useInvalidarCadastro() {
  const cliente = useQueryClient();
  return () =>
    Promise.all(DEPENDENTES_DO_CADASTRO.map((queryKey) => cliente.invalidateQueries({ queryKey })));
}

export function useCriarArea() {
  const invalidar = useInvalidarCadastro();
  return useMutation({
    mutationFn: (dados: NovaArea) => api.criarArea(dados),
    onSuccess: invalidar,
  });
}

export function useEditarArea() {
  const invalidar = useInvalidarCadastro();
  return useMutation({
    mutationFn: ({ id, dados }: { id: number; dados: Partial<NovaArea> }) =>
      api.editarArea(id, dados),
    onSuccess: invalidar,
  });
}

export function useExcluirArea() {
  const invalidar = useInvalidarCadastro();
  return useMutation({ mutationFn: (id: number) => api.excluirArea(id), onSuccess: invalidar });
}

export function useCriarEstabelecimento() {
  const invalidar = useInvalidarCadastro();
  return useMutation({
    mutationFn: (dados: NovoEstabelecimento) => api.criarEstabelecimento(dados),
    onSuccess: invalidar,
  });
}

export function useEditarEstabelecimento() {
  const invalidar = useInvalidarCadastro();
  return useMutation({
    mutationFn: ({ id, dados }: { id: number; dados: Partial<NovoEstabelecimento> }) =>
      api.editarEstabelecimento(id, dados),
    onSuccess: invalidar,
  });
}

export function useExcluirEstabelecimento() {
  const invalidar = useInvalidarCadastro();
  return useMutation({
    mutationFn: (id: number) => api.excluirEstabelecimento(id),
    onSuccess: invalidar,
  });
}
