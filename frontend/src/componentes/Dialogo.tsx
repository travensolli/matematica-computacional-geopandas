import { X } from 'lucide-react';
import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Botao, BotaoIcone } from './Botao';
import type { VarianteBotao } from './estilos-botao';

const FOCAVEIS =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface DialogoProps {
  aberto: boolean;
  aoFechar: () => void;
  titulo: string;
  descricao?: ReactNode;
  children?: ReactNode;
  acoes?: ReactNode;
}

/** Diálogo modal: foco preso, Esc fecha e o foco volta a quem abriu. */
export function Dialogo({ aberto, aoFechar, titulo, descricao, children, acoes }: DialogoProps) {
  const idTitulo = useId();
  const idDescricao = `${idTitulo}-descricao`;
  const painel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const anterior = document.activeElement as HTMLElement | null;
    const rolagem = document.body.style.overflow;
    // O resto da página fica inerte: nem o foco nem os leitores de tela saem do diálogo.
    const raiz = document.getElementById('raiz');
    raiz?.setAttribute('inert', '');
    document.body.style.overflow = 'hidden';
    painel.current?.focus();
    return () => {
      raiz?.removeAttribute('inert');
      document.body.style.overflow = rolagem;
      anterior?.focus?.();
    };
  }, [aberto]);

  function aoTeclar(evento: KeyboardEvent<HTMLDivElement>) {
    if (evento.key === 'Escape') {
      evento.stopPropagation();
      aoFechar();
      return;
    }
    if (evento.key !== 'Tab' || !painel.current) return;
    const alvos = [...painel.current.querySelectorAll<HTMLElement>(FOCAVEIS)];
    const primeiro = alvos[0];
    const ultimo = alvos.at(-1);
    if (!primeiro || !ultimo) return;
    const ativo = document.activeElement;
    if (evento.shiftKey && (ativo === primeiro || ativo === painel.current)) {
      evento.preventDefault();
      ultimo.focus();
    } else if (!evento.shiftKey && ativo === ultimo) {
      evento.preventDefault();
      primeiro.focus();
    }
  }

  if (!aberto) return null;

  return createPortal(
    <div
      className="animar-fundo fixed inset-0 z-[2000] flex items-end justify-center bg-[rgb(16_25_35/0.55)] sm:items-center sm:p-4"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) aoFechar();
      }}
    >
      <div
        ref={painel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        aria-describedby={descricao ? idDescricao : undefined}
        tabIndex={-1}
        onKeyDown={aoTeclar}
        className="animar-surgir max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-painel border border-linha bg-superficie p-5 shadow-flutuante sm:rounded-painel"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id={idTitulo} className="text-lg font-bold">
            {titulo}
          </h2>
          <BotaoIcone icone={X} rotulo="Fechar" onClick={aoFechar} className="-mt-1 -mr-2" />
        </div>
        {descricao ? (
          <p id={idDescricao} className="mt-1 text-tinta-suave">
            {descricao}
          </p>
        ) : null}
        {children ? <div className="mt-4">{children}</div> : null}
        {acoes ? (
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{acoes}</div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

export interface DialogoConfirmacaoProps {
  aberto: boolean;
  aoFechar: () => void;
  aoConfirmar: () => void;
  titulo: string;
  descricao?: ReactNode;
  rotuloConfirmar: string;
  varianteConfirmar?: VarianteBotao;
  carregando?: boolean;
}

/** Duas saídas claras: confirmar a ação, com o nome dela, ou voltar. */
export function DialogoConfirmacao({
  rotuloConfirmar,
  varianteConfirmar = 'primaria',
  carregando = false,
  aoConfirmar,
  ...dialogo
}: DialogoConfirmacaoProps) {
  return (
    <Dialogo
      {...dialogo}
      acoes={
        <>
          <Botao variante="neutra" onClick={dialogo.aoFechar} disabled={carregando}>
            Cancelar
          </Botao>
          <Botao variante={varianteConfirmar} onClick={aoConfirmar} carregando={carregando}>
            {rotuloConfirmar}
          </Botao>
        </>
      }
    />
  );
}
