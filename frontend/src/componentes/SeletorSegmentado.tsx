import type { LucideIcon } from 'lucide-react';
import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { juntarClasses } from '../utilitarios/classes';

export interface OpcaoSegmento<T extends string> {
  valor: T;
  rotulo: ReactNode;
  /** Nome acessível, quando o rótulo visível é um símbolo. */
  rotuloAcessivel?: string;
  icone?: LucideIcon;
}

export interface SeletorSegmentadoProps<T extends string> {
  rotulo: string;
  rotuloVisivel?: boolean;
  valor: T;
  aoMudar: (valor: T) => void;
  opcoes: ReadonlyArray<OpcaoSegmento<T>>;
  className?: string;
}

/** Grupo de rádios em segmentos, com setas, Home e End, como o padrão ARIA de radiogroup. */
export function SeletorSegmentado<T extends string>({
  rotulo,
  rotuloVisivel = false,
  valor,
  aoMudar,
  opcoes,
  className,
}: SeletorSegmentadoProps<T>) {
  const idRotulo = useId();
  const botoes = useRef<Array<HTMLButtonElement | null>>([]);

  function irPara(indice: number) {
    const alvo = (indice + opcoes.length) % opcoes.length;
    const opcao = opcoes[alvo];
    if (!opcao) return;
    aoMudar(opcao.valor);
    botoes.current[alvo]?.focus();
  }

  function aoTeclar(evento: KeyboardEvent<HTMLButtonElement>, indice: number) {
    const destinos: Record<string, number> = {
      ArrowRight: indice + 1,
      ArrowDown: indice + 1,
      ArrowLeft: indice - 1,
      ArrowUp: indice - 1,
      Home: 0,
      End: opcoes.length - 1,
    };
    const destino = destinos[evento.key];
    if (destino === undefined) return;
    evento.preventDefault();
    irPara(destino);
  }

  return (
    <div className={className}>
      {rotuloVisivel ? (
        <p id={idRotulo} className="mb-1.5 text-sm font-semibold">
          {rotulo}
        </p>
      ) : null}
      <div
        role="radiogroup"
        aria-label={rotuloVisivel ? undefined : rotulo}
        aria-labelledby={rotuloVisivel ? idRotulo : undefined}
        className="flex gap-1 rounded-painel border border-linha bg-superficie-suave p-1"
      >
        {opcoes.map((opcao, indice) => {
          const marcada = opcao.valor === valor;
          const Icone = opcao.icone;
          return (
            <button
              key={opcao.valor}
              ref={(elemento) => {
                botoes.current[indice] = elemento;
              }}
              type="button"
              role="radio"
              aria-checked={marcada}
              aria-label={opcao.rotuloAcessivel}
              tabIndex={marcada ? 0 : -1}
              onClick={() => aoMudar(opcao.valor)}
              onKeyDown={(evento) => aoTeclar(evento, indice)}
              className={juntarClasses(
                'flex min-h-toque min-w-0 flex-1 items-center justify-center gap-1.5 rounded-controle px-2 text-sm transition-colors duration-150 ease-suave',
                marcada
                  ? 'bg-acao font-bold text-acao-contraste'
                  : 'text-tinta-suave hover:bg-superficie hover:text-tinta',
              )}
            >
              {Icone ? <Icone aria-hidden="true" className="size-4 shrink-0" /> : null}
              <span className="truncate">{opcao.rotulo}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
