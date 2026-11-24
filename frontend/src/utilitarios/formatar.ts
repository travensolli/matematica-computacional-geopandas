const NUMERO = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 3 });
const INTEIRO = new Intl.NumberFormat('pt-BR');
const COORDENADA = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 5,
  maximumFractionDigits: 5,
});

export const formatarNumero = (valor: number) => NUMERO.format(valor);
export const formatarInteiro = (valor: number) => INTEIRO.format(valor);
export const formatarCoordenada = (valor: number) => COORDENADA.format(valor);

/** "1 escola", "2 escolas": concordância de número sem gambiarra de "(s)". */
export function contar(quantidade: number, singular: string, plural: string): string {
  return `${formatarInteiro(quantidade)} ${quantidade === 1 ? singular : plural}`;
}

/** "a, b e c". */
export function listarComE(itens: string[]): string {
  if (itens.length <= 1) return itens.join('');
  return `${itens.slice(0, -1).join(', ')} e ${itens.at(-1)}`;
}
