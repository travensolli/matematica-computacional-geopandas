import { useQueryClient } from '@tanstack/react-query';
import { LocateFixed, Pencil, Trash2 } from 'lucide-react';
import { useId, useState } from 'react';
import type { z } from 'zod';
import { chaves, useExcluirEstabelecimento } from '../api/consultas';
import type { ColecaoAreasSchema, FeatureEstabelecimento } from '../api/esquemas';
import { useAvisar } from '../componentes/avisos-contexto';
import { BotaoIcone } from '../componentes/Botao';
import { DialogoConfirmacao } from '../componentes/Dialogo';
import { ROTULO_TIPO } from '../dominio/classes';
import { mudancasDeClasse } from '../dominio/reclassificacao';
import { COR_TIPO } from '../mapa/estilos';
import { contar } from '../utilitarios/formatar';

const LIMITE = 25;

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

export interface ListaEstabelecimentosProps {
  estabelecimentos: FeatureEstabelecimento[];
  destacado: number | null;
  aoMostrar: (estabelecimento: FeatureEstabelecimento) => void;
  aoEditar: (estabelecimento: FeatureEstabelecimento) => void;
}

/** Busca de estabelecimentos: o caminho do teclado até o que está no mapa. */
export function ListaEstabelecimentos({
  estabelecimentos,
  destacado,
  aoMostrar,
  aoEditar,
}: ListaEstabelecimentosProps) {
  const idBusca = useId();
  const [busca, setBusca] = useState('');
  const [excluindo, setExcluindo] = useState<FeatureEstabelecimento | null>(null);
  const excluir = useExcluirEstabelecimento();
  const cliente = useQueryClient();
  const avisar = useAvisar();

  const termo = normalizar(busca.trim());
  const encontrados = estabelecimentos.filter(
    (e) =>
      e.properties.id === destacado || (termo && normalizar(e.properties.nome).includes(termo)),
  );
  const exibidos = encontrados.slice(0, LIMITE);

  async function confirmarExclusao() {
    if (!excluindo) return;
    const antes =
      cliente.getQueryData<z.output<typeof ColecaoAreasSchema>>(chaves.areas)?.features ?? [];
    try {
      await excluir.mutateAsync(excluindo.properties.id);
      const depois =
        cliente.getQueryData<z.output<typeof ColecaoAreasSchema>>(chaves.areas)?.features ?? [];
      const mudancas = mudancasDeClasse(antes, depois);
      avisar(
        `${ROTULO_TIPO[excluindo.properties.tipo]} excluída: “${excluindo.properties.nome}”.` +
          (mudancas.length ? ` ${mudancas.join('; ')}.` : ''),
      );
      setExcluindo(null);
    } catch (erro) {
      avisar(erro instanceof Error ? erro.message : 'Não foi possível excluir.', 'erro');
    }
  }

  return (
    <div className="space-y-2">
      <label htmlFor={idBusca} className="text-sm font-semibold">
        Buscar pelo nome
      </label>
      <input
        id={idBusca}
        type="search"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder={`${estabelecimentos.length} cadastrados`}
        className="min-h-toque w-full rounded-controle border border-linha-forte bg-superficie px-2.5"
      />
      {termo ? (
        <p className="text-xs text-tinta-suave" aria-live="polite">
          {contar(encontrados.length, 'encontrado', 'encontrados')}
          {encontrados.length > LIMITE ? `; mostrando os ${LIMITE} primeiros` : ''}
        </p>
      ) : null}
      <ul className="divide-y divide-linha">
        {exibidos.map((e) => {
          const p = e.properties;
          return (
            <li key={p.id} className="flex items-center gap-2 py-1.5">
              <span
                aria-hidden="true"
                className="size-3 shrink-0 rounded-full"
                style={{ background: COR_TIPO[p.tipo] }}
              />
              <span className="min-w-0 flex-1 text-sm">
                <span className="block truncate font-semibold">{p.nome}</span>
                <span className="block text-tinta-suave">{ROTULO_TIPO[p.tipo]}</span>
              </span>
              <BotaoIcone
                icone={LocateFixed}
                rotulo={`Mostrar ${p.nome} no mapa`}
                onClick={() => aoMostrar(e)}
              />
              <BotaoIcone icone={Pencil} rotulo={`Editar ${p.nome}`} onClick={() => aoEditar(e)} />
              <BotaoIcone
                icone={Trash2}
                rotulo={`Excluir ${p.nome}`}
                onClick={() => setExcluindo(e)}
              />
            </li>
          );
        })}
      </ul>
      <DialogoConfirmacao
        aberto={excluindo !== null}
        aoFechar={() => setExcluindo(null)}
        aoConfirmar={() => void confirmarExclusao()}
        titulo={`Excluir “${excluindo?.properties.nome ?? ''}”?`}
        descricao="As áreas que o contêm são reclassificadas sem ele. A exclusão não pode ser desfeita."
        rotuloConfirmar="Excluir estabelecimento"
        varianteConfirmar="perigo"
        carregando={excluir.isPending}
      />
    </div>
  );
}
