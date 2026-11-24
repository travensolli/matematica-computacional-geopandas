import { useProduto } from '../api/consultas';
import { formatarInteiro } from '../utilitarios/formatar';

function foraDeTodas(quantidade: number): string {
  if (quantidade === 0) return 'Todo estabelecimento está em ao menos uma área.';
  if (quantidade === 1) return 'Um estabelecimento fica fora de todas as áreas.';
  return `${formatarInteiro(quantidade)} estabelecimentos ficam fora de todas as áreas.`;
}

/** Os números do produto cartesiano com o cadastro atual. */
export function NumerosProduto() {
  const produto = useProduto();
  if (!produto.data) return null;
  const p = produto.data;
  return (
    <p className="prosa rounded-painel bg-superficie-suave p-3 text-sm">
      Com o cadastro de agora:{' '}
      <span className="notacao">
        |E| = {formatarInteiro(p.estabelecimentos)}, |A| = {formatarInteiro(p.areas)}, |E × A| ={' '}
        {formatarInteiro(p.pares)}
      </span>{' '}
      pares, dos quais {formatarInteiro(p.pares_com_pertinencia)} têm{' '}
      <span className="notacao">e ∈ a</span>. {foraDeTodas(p.fora_de_todas.length)}
    </p>
  );
}
