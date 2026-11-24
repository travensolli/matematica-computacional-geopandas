import { useEditarArea } from '../api/consultas';
import type { FeatureArea, Poligono } from '../api/esquemas';
import { useAvisar } from '../componentes/avisos-contexto';
import { Botao } from '../componentes/Botao';
import { descreverClasses } from '../dominio/classes';
import { erroGeral } from './erros';

export interface FormRedesenhoProps {
  area: FeatureArea;
  novaForma: Poligono | null;
  aoConcluir: () => void;
}

/** Ajuste do contorno de uma área existente. */
export function FormRedesenho({ area, novaForma, aoConcluir }: FormRedesenhoProps) {
  const editar = useEditarArea();
  const avisar = useAvisar();

  async function salvar() {
    if (!novaForma) return;
    try {
      const atualizada = await editar.mutateAsync({
        id: area.properties.id,
        dados: { geometry: novaForma },
      });
      avisar(
        `Forma salva: “${atualizada.properties.nome}”, ${descreverClasses(atualizada.properties.classes)}.`,
      );
      aoConcluir();
    } catch {
      /* mensagem abaixo */
    }
  }

  const erro = erroGeral(editar.error, []);
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Redesenhar “{area.properties.nome}”</h2>
      <ul className="list-disc space-y-1 pl-5 text-sm text-tinta-suave">
        <li>Arraste os vértices para ajustar o contorno.</li>
        <li>Arraste o ponto do meio de uma aresta para criar um vértice.</li>
        <li>Clique com o botão direito num vértice para removê-lo.</li>
      </ul>
      <p aria-live="polite" className="text-sm font-semibold">
        {novaForma ? 'Forma alterada, ainda não salva.' : 'Nenhuma alteração ainda.'}
      </p>
      {erro ? (
        <p role="alert" className="text-sm font-semibold text-erro">
          {erro}
        </p>
      ) : null}
      <div className="flex flex-col gap-2">
        <Botao
          largo
          onClick={() => void salvar()}
          disabled={!novaForma}
          carregando={editar.isPending}
        >
          Salvar forma
        </Botao>
        <Botao variante="neutra" largo onClick={aoConcluir}>
          Cancelar
        </Botao>
      </div>
    </div>
  );
}
