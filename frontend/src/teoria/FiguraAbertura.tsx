import { preenchimento } from '../componentes/padroes-hachura';

/** A ideia do sistema numa figura: o município como universo, duas áreas e um ponto. */
export function FiguraAbertura({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      aria-label="Diagrama: o universo U é Jacareí; dentro dele, uma área escolar e uma industrial se sobrepõem. O ponto p está na sobreposição, então suas classes são a união: escolar e industrial."
      viewBox="0 0 420 300"
      className={className}
    >
      <rect
        x="6"
        y="6"
        width="408"
        height="288"
        rx="10"
        fill="var(--superficie)"
        stroke="var(--universo)"
        strokeWidth="2"
        strokeDasharray="14 6 3 6"
      />
      <text
        x="22"
        y="40"
        fontFamily="var(--font-notacao)"
        fontSize="22"
        fontStyle="italic"
        fill="var(--tinta)"
      >
        U = Jacareí
      </text>
      <path
        d="M70 130 L170 92 L238 120 L226 228 L120 246 L62 200 Z"
        fill={preenchimento('escolar')}
        stroke="var(--escolar)"
        strokeWidth="2.5"
      />
      <path
        d="M196 104 L340 88 L372 180 L300 250 L190 226 Z"
        fill={preenchimento('industrial')}
        stroke="var(--industrial)"
        strokeWidth="2.5"
      />
      <text
        x="84"
        y="124"
        fontFamily="var(--font-notacao)"
        fontSize="20"
        fontStyle="italic"
        fill="var(--escolar)"
      >
        A
      </text>
      <text
        x="344"
        y="118"
        fontFamily="var(--font-notacao)"
        fontSize="20"
        fontStyle="italic"
        fill="var(--industrial)"
      >
        B
      </text>
      <circle
        cx="214"
        cy="166"
        r="7"
        fill="var(--superficie)"
        stroke="var(--tinta)"
        strokeWidth="2.5"
      />
      <circle cx="214" cy="166" r="2.5" fill="var(--tinta)" />
      <text
        x="226"
        y="162"
        fontFamily="var(--font-notacao)"
        fontSize="18"
        fontStyle="italic"
        fill="var(--tinta)"
      >
        p
      </text>
      <text x="22" y="270" fontFamily="var(--font-notacao)" fontSize="17" fill="var(--tinta)">
        {'p ∈ A ∩ B'}
      </text>
      <text x="22" y="288" fontFamily="var(--font-notacao)" fontSize="15" fill="var(--tinta-suave)">
        {'classes(p) = {escolar} ∪ {industrial}'}
      </text>
    </svg>
  );
}
