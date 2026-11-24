import { juntarClasses } from '../utilitarios/classes';

export type VarianteBotao = 'primaria' | 'neutra' | 'discreta' | 'perigo';
export type TamanhoBotao = 'pequeno' | 'medio' | 'grande';

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-controle font-semibold whitespace-nowrap select-none transition-colors duration-150 ease-suave disabled:cursor-not-allowed disabled:opacity-55';

const VARIANTES: Record<VarianteBotao, string> = {
  primaria: 'bg-acao text-acao-contraste hover:bg-acao-hover',
  neutra: 'border border-linha-forte bg-superficie text-tinta hover:bg-superficie-suave',
  discreta: 'text-tinta hover:bg-superficie-suave',
  perigo: 'bg-erro text-tinta-invertida hover:brightness-95',
};

/* Todo tamanho respeita o piso de alvo: 32 px com mouse, 44 px no toque. */
const TAMANHOS: Record<TamanhoBotao, string> = {
  pequeno: 'min-h-toque px-2.5 text-sm',
  medio: 'min-h-toque px-3.5 text-[0.95rem]',
  grande: 'min-h-toque-g px-4 text-base',
};

export function classesBotao({
  variante = 'primaria',
  tamanho = 'medio',
  largo = false,
  apenasIcone = false,
  className,
}: {
  variante?: VarianteBotao;
  tamanho?: TamanhoBotao;
  largo?: boolean;
  apenasIcone?: boolean;
  className?: string;
} = {}): string {
  return juntarClasses(
    BASE,
    VARIANTES[variante],
    apenasIcone ? 'size-toque shrink-0' : TAMANHOS[tamanho],
    largo && 'w-full',
    className,
  );
}
