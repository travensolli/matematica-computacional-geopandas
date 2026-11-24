import { preenchimento } from '../componentes/padroes-hachura';

/** Dois conjuntos hachurados que se cruzam: a ideia do sistema num ícone. */
export function Marca({ tamanho = 30 }: { tamanho?: number }) {
  return (
    <svg aria-hidden="true" focusable="false" width={tamanho} height={tamanho} viewBox="0 0 32 32">
      <circle
        cx="12"
        cy="16"
        r="8.5"
        fill={preenchimento('escolar')}
        stroke="var(--tinta)"
        strokeWidth="1.5"
      />
      <circle
        cx="20"
        cy="16"
        r="8.5"
        fill={preenchimento('industrial')}
        stroke="var(--tinta)"
        strokeWidth="1.5"
      />
    </svg>
  );
}
