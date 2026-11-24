import type { ReactNode } from 'react';
import { juntarClasses } from '../utilitarios/classes';

/* Notação compacta para escrever fórmulas: letras isoladas viram variáveis (itálico),
   palavras e trechos entre aspas viram texto, números (inclusive negativos) viram números,
   "^" e "_" fazem expoente e índice do símbolo anterior, "#X#" vira a cardinalidade |X| e todo
   o resto vira operador. Exemplo: 'Escolares = { a ∈ A | escola ∈ T(a) }'. */

const LETRAS_CONJUNTO = new Set(['ℕ', 'ℤ', 'ℚ', 'ℝ', 'ℂ']);
const TOKEN = /"[^"]*"|[A-Za-zÀ-ÿ]+|−?\d+|\S/gu;

function elemento(token: string, chave: number): ReactNode {
  if (token.startsWith('"')) return <mtext key={chave}>{token.slice(1, -1)}</mtext>;
  if (/^−?\d+$/.test(token)) return <mn key={chave}>{token}</mn>;
  if (/^[A-Za-zÀ-ÿ]$/u.test(token) || LETRAS_CONJUNTO.has(token))
    return <mi key={chave}>{token}</mi>;
  if (/^[A-Za-zÀ-ÿ]+$/u.test(token)) return <mtext key={chave}>{token}</mtext>;
  return <mo key={chave}>{token}</mo>;
}

/** Converte a notação compacta em elementos MathML. */
function paraMathMl(texto: string): ReactNode[] {
  const tokens: string[] = texto.match(TOKEN) ?? [];
  const saida: ReactNode[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]!;
    if (token === '#') {
      // |X|: as barras ficam num mrow próprio, como cercas, sem o espaçamento de operador.
      const fim = tokens.indexOf('#', i + 1);
      if (fim > i) {
        const interior = tokens.slice(i + 1, fim).join(' ');
        saida.push(
          <mrow key={`c${i}`}>
            <mo>|</mo>
            {paraMathMl(interior)}
            <mo>|</mo>
          </mrow>,
        );
        i = fim;
        continue;
      }
    }
    if ((token === '^' || token === '_') && saida.length && tokens[i + 1]) {
      const base = saida.pop();
      const expoente = elemento(tokens[++i]!, i);
      saida.push(
        token === '^' ? (
          <msup key={`s${i}`}>
            {base}
            {expoente}
          </msup>
        ) : (
          <msub key={`s${i}`}>
            {base}
            {expoente}
          </msub>
        ),
      );
      continue;
    }
    saida.push(elemento(token, i));
  }
  return saida;
}

export interface FormulaProps {
  texto: string;
  bloco?: boolean;
  className?: string;
}

/** Fórmula em MathML, que os leitores de tela leem como matemática. */
export function Formula({ texto, bloco = false, className }: FormulaProps) {
  const formula = (
    <math className={bloco ? undefined : className}>
      <mrow>{paraMathMl(texto)}</mrow>
    </math>
  );
  // Em bloco, a fórmula fica numa linha própria alinhada à esquerda, como no material; o
  // display="block" do MathML centralizaria.
  return bloco ? (
    <div className={juntarClasses('rolagem-fina overflow-x-auto py-0.5', className)}>{formula}</div>
  ) : (
    formula
  );
}
