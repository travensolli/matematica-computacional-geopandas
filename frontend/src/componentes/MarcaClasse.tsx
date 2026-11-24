import type { Aparencia } from '../dominio/classes';
import { juntarClasses } from '../utilitarios/classes';
import { preenchimento } from './padroes-hachura';

const CONTORNO: Record<Aparencia, string> = {
  escolar: 'var(--escolar)',
  industrial: 'var(--industrial)',
  residencial: 'var(--residencial-traco)',
  misto: 'var(--tinta)',
  nenhuma: 'var(--sem-classe)',
};

export interface AmostraProps {
  aparencia: Aparencia;
  tamanho?: number;
  className?: string;
}

/** Amostra da hachura de uma classe, como num quadro de legenda de mapa. Decorativa. */
export function Amostra({ aparencia, tamanho = 18, className }: AmostraProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={tamanho}
      height={tamanho}
      viewBox="0 0 18 18"
      className={juntarClasses('shrink-0', className)}
    >
      <rect
        x="1"
        y="1"
        width="16"
        height="16"
        rx="2"
        fill={preenchimento(aparencia)}
        stroke={CONTORNO[aparencia]}
        strokeWidth="1.5"
        strokeDasharray={aparencia === 'nenhuma' ? '3 2' : undefined}
      />
    </svg>
  );
}
