import { useId } from 'react';
import { preenchimento } from '../componentes/padroes-hachura';

/* Diagramas de Venn pequenos, no estilo da Figura 21 das notas de aula: A com hachura "/",
   B com hachura "\", e a região que a operação produz pintada com a cor de resultado. */

export type FiguraVenn =
  | 'pertinencia'
  | 'universo'
  | 'cardinalidade'
  | 'numeros'
  | 'igualdade'
  | 'subconjunto'
  | 'partes'
  | 'uniao'
  | 'interseccao'
  | 'diferenca'
  | 'diferenca_inversa'
  | 'diferenca_simetrica'
  | 'produto';

const DESCRICAO: Record<FiguraVenn, string> = {
  pertinencia: 'O ponto p está dentro do conjunto A e o ponto q está fora.',
  universo: 'Os conjuntos A e B desenhados dentro do retângulo do universo U.',
  cardinalidade: 'O conjunto A com três elementos e o conjunto vazio, sem nenhum.',
  numeros: 'Os naturais dentro dos inteiros, dentro dos racionais, dentro dos reais.',
  igualdade: 'Dois conjuntos com exatamente os mesmos pontos, desenhados um sobre o outro.',
  subconjunto: 'O conjunto A inteiro dentro do conjunto B.',
  partes: 'Três elementos e as oito combinações que eles formam.',
  uniao: 'A união de A e B: as duas regiões pintadas.',
  interseccao: 'A intersecção de A e B: só a região comum pintada.',
  diferenca: 'A diferença A menos B: a parte de A fora de B pintada.',
  diferenca_inversa: 'A diferença B menos A: a parte de B fora de A pintada.',
  diferenca_simetrica: 'A diferença simétrica: as partes de A e de B fora da região comum.',
  produto: 'Uma grade de pares: cada linha um elemento, cada coluna um conjunto.',
};

const TRACO = { stroke: 'var(--tinta)', strokeWidth: 1.4, fill: 'none' } as const;
const RESULTADO = { fill: 'var(--resultado)', fillOpacity: 0.42 } as const;

function Rotulo({ x, y, children }: { x: number; y: number; children: string }) {
  return (
    <text
      x={x}
      y={y}
      fontFamily="var(--font-notacao)"
      fontSize="13"
      fontStyle="italic"
      fill="var(--tinta)"
    >
      {children}
    </text>
  );
}

function DoisConjuntos({ id, figura }: { id: string; figura: FiguraVenn }) {
  const a = { cx: 66, cy: 52, r: 30 };
  const b = { cx: 98, cy: 52, r: 30 };
  return (
    <>
      <defs>
        <clipPath id={`${id}-a`}>
          <circle {...a} />
        </clipPath>
        <mask id={`${id}-sem-b`}>
          <rect width="164" height="104" fill="white" />
          <circle {...b} fill="black" />
        </mask>
        <mask id={`${id}-sem-a`}>
          <rect width="164" height="104" fill="white" />
          <circle {...a} fill="black" />
        </mask>
      </defs>
      {figura === 'uniao' ? (
        <>
          <circle {...a} {...RESULTADO} />
          <circle {...b} {...RESULTADO} mask={`url(#${id}-sem-a)`} />
        </>
      ) : null}
      {figura === 'interseccao' ? (
        <circle {...b} {...RESULTADO} clipPath={`url(#${id}-a)`} />
      ) : null}
      {figura === 'diferenca' || figura === 'diferenca_simetrica' ? (
        <circle {...a} {...RESULTADO} mask={`url(#${id}-sem-b)`} />
      ) : null}
      {figura === 'diferenca_simetrica' || figura === 'diferenca_inversa' ? (
        <circle {...b} {...RESULTADO} mask={`url(#${id}-sem-a)`} />
      ) : null}
      <circle {...a} fill={preenchimento('a')} />
      <circle {...b} fill={preenchimento('b')} />
      <circle {...a} {...TRACO} />
      <circle {...b} {...TRACO} />
      <Rotulo x={34} y={24}>
        A
      </Rotulo>
      <Rotulo x={122} y={24}>
        B
      </Rotulo>
    </>
  );
}

function Conteudo({ id, figura }: { id: string; figura: FiguraVenn }) {
  switch (figura) {
    case 'pertinencia':
      return (
        <>
          <circle cx="70" cy="52" r="34" fill={preenchimento('a')} />
          <circle cx="70" cy="52" r="34" {...TRACO} />
          <circle cx="64" cy="56" r="3.5" fill="var(--resultado)" stroke="var(--tinta)" />
          <Rotulo x={70} y={60}>
            p
          </Rotulo>
          <circle cx="132" cy="30" r="3.5" fill="var(--superficie)" stroke="var(--tinta)" />
          <Rotulo x={138} y={34}>
            q
          </Rotulo>
          <Rotulo x={34} y={24}>
            A
          </Rotulo>
        </>
      );
    case 'universo':
      return <DoisConjuntos id={id} figura="interseccao" />;
    case 'cardinalidade':
      return (
        <>
          <circle cx="52" cy="52" r="30" fill={preenchimento('a')} />
          <circle cx="52" cy="52" r="30" {...TRACO} />
          {[
            [42, 44],
            [60, 46],
            [50, 64],
          ].map(([x, y]) => (
            <circle key={`${x}${y}`} cx={x} cy={y} r="3.5" fill="var(--tinta)" />
          ))}
          <Rotulo x={22} y={22}>
            A
          </Rotulo>
          <circle cx="118" cy="52" r="24" {...TRACO} strokeDasharray="4 3" />
          <text x="111" y="57" fontFamily="var(--font-notacao)" fontSize="16" fill="var(--tinta)">
            ∅
          </text>
        </>
      );
    case 'numeros':
      return (
        <>
          {[
            ['ℝ', 76, 48, 72, 40],
            ['ℚ', 70, 52, 54, 30],
            ['ℤ', 64, 56, 36, 20],
            ['ℕ', 58, 59, 18, 11],
          ].map(([rotulo, cx, cy, rx, ry]) => (
            <g key={rotulo as string}>
              <ellipse cx={cx} cy={cy} rx={rx} ry={ry} {...TRACO} />
              <text
                x={(cx as number) + (rx as number) - 14}
                y={(cy as number) - (ry as number) + 14}
                fontFamily="var(--font-notacao)"
                fontSize="12"
                fill="var(--tinta)"
              >
                {rotulo}
              </text>
            </g>
          ))}
        </>
      );
    case 'igualdade':
      return (
        <>
          <circle cx="82" cy="52" r="32" fill={preenchimento('a')} />
          <circle cx="82" cy="52" r="32" fill={preenchimento('b')} />
          <circle cx="82" cy="52" r="32" {...TRACO} />
          <Rotulo x={40} y={24}>
            A = B
          </Rotulo>
        </>
      );
    case 'subconjunto':
      return (
        <>
          <circle cx="82" cy="52" r="40" fill={preenchimento('b')} />
          <circle cx="82" cy="52" r="40" {...TRACO} />
          <circle cx="74" cy="58" r="17" {...RESULTADO} />
          <circle cx="74" cy="58" r="17" fill={preenchimento('a')} />
          <circle cx="74" cy="58" r="17" {...TRACO} />
          <Rotulo x={68} y={62}>
            A
          </Rotulo>
          <Rotulo x={118} y={24}>
            B
          </Rotulo>
        </>
      );
    case 'partes':
      return (
        <>
          {['e', 'i', 'r'].map((letra, i) => (
            <g key={letra}>
              <circle cx={30 + i * 22} cy="52" r="9" {...TRACO} />
              <text
                x={26 + i * 22}
                y="56"
                fontFamily="var(--font-notacao)"
                fontSize="12"
                fill="var(--tinta)"
              >
                {letra}
              </text>
            </g>
          ))}
          <text x="98" y="57" fontFamily="var(--font-notacao)" fontSize="14" fill="var(--tinta)">
            → 2³ = 8
          </text>
        </>
      );
    case 'produto':
      return (
        <>
          {[0, 1, 2].map((linha) =>
            [0, 1, 2, 3].map((coluna) => {
              const pertence = (linha + coluna) % 3 === 0;
              return (
                <rect
                  key={`${linha}-${coluna}`}
                  x={44 + coluna * 22}
                  y={18 + linha * 22}
                  width="18"
                  height="18"
                  rx="3"
                  {...(pertence ? RESULTADO : { fill: 'none' })}
                  stroke="var(--tinta)"
                  strokeWidth="1.2"
                />
              );
            }),
          )}
          <Rotulo x={26} y={60}>
            E
          </Rotulo>
          <Rotulo x={84} y={98}>
            A
          </Rotulo>
        </>
      );
    default:
      return <DoisConjuntos id={id} figura={figura} />;
  }
}

/** Diagrama de Venn de uma operação ou relação, com descrição para leitores de tela. */
export function DiagramaVenn({ figura, className }: { figura: FiguraVenn; className?: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg
      role="img"
      aria-label={DESCRICAO[figura]}
      viewBox="0 0 164 104"
      className={className}
      width="164"
      height="104"
    >
      <rect
        x="3"
        y="3"
        width="158"
        height="98"
        rx="6"
        fill="var(--superficie)"
        stroke="var(--universo)"
        strokeWidth="1.2"
        strokeDasharray={figura === 'universo' ? '10 4 2 4' : undefined}
      />
      {figura === 'universo' ? (
        <Rotulo x={10} y={96}>
          U
        </Rotulo>
      ) : null}
      <Conteudo id={id} figura={figura} />
    </svg>
  );
}
