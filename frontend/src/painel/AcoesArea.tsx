import { Pencil, Spline, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useEditarArea, useExcluirArea } from '../api/consultas';
import type { FeatureArea } from '../api/esquemas';
import { useAvisar } from '../componentes/avisos-contexto';
import { Botao, BotaoIcone } from '../componentes/Botao';
import { CampoTexto } from '../componentes/CampoTexto';
import { Dialogo, DialogoConfirmacao } from '../componentes/Dialogo';
import { erroDoCampo, erroGeral } from './erros';

export interface AcoesAreaProps {
  area: FeatureArea;
  aoRedesenhar: (area: FeatureArea) => void;
}

/** Renomear, redesenhar e excluir uma área, com confirmação antes de excluir. */
export function AcoesArea({ area, aoRedesenhar }: AcoesAreaProps) {
  const { id, nome } = area.properties;
  const [dialogo, setDialogo] = useState<'renomear' | 'excluir' | null>(null);
  const [novoNome, setNovoNome] = useState(nome);
  const editar = useEditarArea();
  const excluir = useExcluirArea();
  const avisar = useAvisar();

  function fechar() {
    setDialogo(null);
    editar.reset();
    excluir.reset();
  }

  async function renomear(evento: FormEvent) {
    evento.preventDefault();
    try {
      const atualizada = await editar.mutateAsync({ id, dados: { nome: novoNome } });
      avisar(`Área renomeada para “${atualizada.properties.nome}”.`);
      fechar();
    } catch {
      /* erro no campo */
    }
  }

  async function confirmarExclusao() {
    try {
      await excluir.mutateAsync(id);
      avisar(`Área excluída: “${nome}”.`);
      fechar();
    } catch (erro) {
      avisar(erro instanceof Error ? erro.message : 'Não foi possível excluir a área.', 'erro');
    }
  }

  return (
    <>
      <BotaoIcone
        icone={Pencil}
        rotulo={`Renomear ${nome}`}
        onClick={() => {
          setNovoNome(nome);
          setDialogo('renomear');
        }}
      />
      <BotaoIcone icone={Spline} rotulo={`Redesenhar ${nome}`} onClick={() => aoRedesenhar(area)} />
      <BotaoIcone icone={Trash2} rotulo={`Excluir ${nome}`} onClick={() => setDialogo('excluir')} />

      <Dialogo aberto={dialogo === 'renomear'} aoFechar={fechar} titulo={`Renomear “${nome}”`}>
        <form onSubmit={renomear} noValidate className="space-y-4">
          <CampoTexto
            rotulo="Novo nome"
            maxLength={120}
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            erro={erroDoCampo(editar.error, 'nome') ?? erroGeral(editar.error, ['nome'])}
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Botao variante="neutra" onClick={fechar}>
              Cancelar
            </Botao>
            <Botao type="submit" disabled={!novoNome.trim()} carregando={editar.isPending}>
              Salvar nome
            </Botao>
          </div>
        </form>
      </Dialogo>

      <DialogoConfirmacao
        aberto={dialogo === 'excluir'}
        aoFechar={fechar}
        aoConfirmar={() => void confirmarExclusao()}
        titulo={`Excluir a área “${nome}”?`}
        descricao="Os estabelecimentos dentro dela continuam cadastrados. A exclusão não pode ser desfeita."
        rotuloConfirmar="Excluir área"
        varianteConfirmar="perigo"
        carregando={excluir.isPending}
      />
    </>
  );
}
