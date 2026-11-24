import { CircleAlert, RotateCw } from 'lucide-react';
import type { ReactNode } from 'react';
import { juntarClasses } from '../utilitarios/classes';
import { Botao } from './Botao';

export interface EstadoErroProps {
  erro: unknown;
  aoTentarDeNovo?: () => void;
  className?: string;
}

/** Diz o que deu errado e como seguir, sem pedir desculpas e sem vaguezas. */
export function EstadoErro({ erro, aoTentarDeNovo, className }: EstadoErroProps) {
  const mensagem = erro instanceof Error ? erro.message : 'Algo deu errado ao carregar os dados.';
  return (
    <div
      role="alert"
      className={juntarClasses(
        'flex flex-col items-start gap-3 rounded-painel border border-erro bg-erro-suave p-4',
        className,
      )}
    >
      <p className="flex items-start gap-2 font-semibold">
        <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-erro" />
        {mensagem}
      </p>
      {aoTentarDeNovo ? (
        <Botao variante="neutra" tamanho="pequeno" icone={RotateCw} onClick={aoTentarDeNovo}>
          Tentar de novo
        </Botao>
      ) : null}
    </div>
  );
}

export interface EstadoVazioProps {
  titulo: string;
  children?: ReactNode;
  acao?: ReactNode;
  className?: string;
}

/** Tela vazia como convite à ação. */
export function EstadoVazio({ titulo, children, acao, className }: EstadoVazioProps) {
  return (
    <div
      className={juntarClasses(
        'flex flex-col items-start gap-2 rounded-painel border border-dashed border-linha-forte p-4',
        className,
      )}
    >
      <p className="font-semibold">{titulo}</p>
      {children ? <div className="text-sm text-tinta-suave">{children}</div> : null}
      {acao}
    </div>
  );
}

export interface EsqueletoProps {
  linhas?: number;
  rotulo: string;
  className?: string;
}

/** Linhas cinzas no lugar do conteúdo que está chegando. */
export function Esqueleto({ linhas = 3, rotulo, className }: EsqueletoProps) {
  return (
    <div role="status" aria-label={rotulo} className={juntarClasses('space-y-2', className)}>
      {Array.from({ length: linhas }, (_, i) => (
        <div
          key={i}
          className="h-4 animate-pulse rounded-controle bg-superficie-suave"
          style={{ width: `${92 - ((i * 17) % 40)}%` }}
        />
      ))}
    </div>
  );
}
