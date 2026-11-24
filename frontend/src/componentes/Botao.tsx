import { LoaderCircle, type LucideIcon } from 'lucide-react';
import type { ComponentPropsWithRef } from 'react';
import { Link, type LinkProps } from 'react-router';
import { classesBotao, type TamanhoBotao, type VarianteBotao } from './estilos-botao';

interface Comuns {
  variante?: VarianteBotao;
  tamanho?: TamanhoBotao;
  icone?: LucideIcon;
  largo?: boolean;
}

export interface BotaoProps extends ComponentPropsWithRef<'button'>, Comuns {
  carregando?: boolean;
}

export function Botao({
  variante,
  tamanho,
  icone: Icone,
  largo,
  carregando = false,
  className,
  children,
  disabled,
  type = 'button',
  ...resto
}: BotaoProps) {
  return (
    <button
      type={type}
      className={classesBotao({ variante, tamanho, largo, className })}
      disabled={disabled || carregando}
      aria-busy={carregando || undefined}
      {...resto}
    >
      {carregando ? (
        <LoaderCircle aria-hidden="true" className="size-4.5 animate-spin" />
      ) : Icone ? (
        <Icone aria-hidden="true" className="size-4.5" />
      ) : null}
      <span>{children}</span>
    </button>
  );
}

export interface BotaoIconeProps extends Omit<ComponentPropsWithRef<'button'>, 'children'> {
  icone: LucideIcon;
  /** Nome acessível: obrigatório, já que não há texto visível. */
  rotulo: string;
  variante?: VarianteBotao;
}

export function BotaoIcone({
  icone: Icone,
  rotulo,
  variante = 'discreta',
  className,
  type = 'button',
  ...resto
}: BotaoIconeProps) {
  return (
    <button
      type={type}
      aria-label={rotulo}
      title={rotulo}
      className={classesBotao({ variante, apenasIcone: true, className })}
      {...resto}
    >
      <Icone aria-hidden="true" className="size-5" />
    </button>
  );
}

export interface BotaoLinkProps extends Omit<LinkProps, 'className'>, Comuns {
  className?: string;
}

/** Link do React Router com aparência de botão. */
export function BotaoLink({
  variante,
  tamanho,
  icone: Icone,
  largo,
  className,
  children,
  ...resto
}: BotaoLinkProps) {
  return (
    <Link
      className={classesBotao({
        variante,
        tamanho,
        largo,
        className: `no-underline ${className ?? ''}`,
      })}
      {...resto}
    >
      {Icone ? <Icone aria-hidden="true" className="size-4.5" /> : null}
      <span>{children}</span>
    </Link>
  );
}
