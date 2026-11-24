import type { DetailedHTMLProps, HTMLAttributes } from 'react';

/* As fórmulas usam MathML, desenhado com a fonte Libertinus Math servida pelo app. O React cria
   os elementos no namespace certo; faltam só os tipos, que o @types/react não traz. */

type PropsMathMl<Extras = object> = DetailedHTMLProps<
  HTMLAttributes<MathMLElement>,
  MathMLElement
> &
  Extras;

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      math: PropsMathMl<{ display?: 'block' | 'inline' }>;
      mrow: PropsMathMl;
      mi: PropsMathMl<{ mathvariant?: 'normal' }>;
      mn: PropsMathMl;
      mo: PropsMathMl<{ stretchy?: 'true' | 'false'; form?: 'prefix' | 'infix' | 'postfix' }>;
      mtext: PropsMathMl;
      msup: PropsMathMl;
      msub: PropsMathMl;
      mspace: PropsMathMl<{ width?: string }>;
    }
  }
}
