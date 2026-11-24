import { useQueryClient } from '@tanstack/react-query';
import { Factory, House, School } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { chaves, useCriarEstabelecimento, useEditarEstabelecimento } from '../api/consultas';
import type {
  ColecaoAreasSchema,
  FeatureEstabelecimento,
  TipoEstabelecimento,
} from '../api/esquemas';
import { useAvisar } from '../componentes/avisos-contexto';
import { Botao } from '../componentes/Botao';
import { CampoTexto } from '../componentes/CampoTexto';
import { SeletorSegmentado } from '../componentes/SeletorSegmentado';
import { ROTULO_TIPO } from '../dominio/classes';
import { mudancasDeClasse } from '../dominio/reclassificacao';
import { formatarCoordenada } from '../utilitarios/formatar';
import { erroDoCampo, erroGeral } from './erros';
import type { z } from 'zod';

type Colecao = z.output<typeof ColecaoAreasSchema>;

const OPCOES_TIPO = [
  { valor: 'escola' as const, rotulo: 'Escola', icone: School },
  { valor: 'industria' as const, rotulo: 'Indústria', icone: Factory },
  { valor: 'residencia' as const, rotulo: 'Residência', icone: House },
];

export interface FormEstabelecimentoProps {
  posicao: { lat: number; lng: number } | null;
  tipo: TipoEstabelecimento;
  aoMudarTipo: (tipo: TipoEstabelecimento) => void;
  /** Estabelecimento em edição; sem ele, o formulário cadastra um novo. */
  editando: FeatureEstabelecimento | null;
  aoConcluir: () => void;
}

/** Cadastro e edição de um estabelecimento: tipo e nome aqui, posição no mapa. */
export function FormEstabelecimento({
  posicao,
  tipo,
  aoMudarTipo,
  editando,
  aoConcluir,
}: FormEstabelecimentoProps) {
  const [nome, setNome] = useState(editando?.properties.nome ?? '');
  const criar = useCriarEstabelecimento();
  const editar = useEditarEstabelecimento();
  const mutacao = editando ? editar : criar;
  const cliente = useQueryClient();
  const avisar = useAvisar();

  async function salvar(evento: FormEvent) {
    evento.preventDefault();
    if (!posicao) return;
    const antes = cliente.getQueryData<Colecao>(chaves.areas)?.features ?? [];
    const dados = { nome, tipo, lat: posicao.lat, lng: posicao.lng };
    try {
      if (editando) await editar.mutateAsync({ id: editando.properties.id, dados });
      else await criar.mutateAsync(dados);
      const depois = cliente.getQueryData<Colecao>(chaves.areas)?.features ?? [];
      const mudancas = mudancasDeClasse(antes, depois);
      avisar(
        `${ROTULO_TIPO[tipo]} salva: “${nome.trim()}”.` +
          (mudancas.length ? ` ${mudancas.join('; ')}.` : ''),
      );
      setNome('');
      mutacao.reset();
      aoConcluir();
    } catch {
      /* o erro aparece junto do campo */
    }
  }

  const outroErro = erroGeral(mutacao.error, ['nome', 'tipo', 'lat', 'lng']);
  const erroPosicao = erroDoCampo(mutacao.error, 'lat') ?? erroDoCampo(mutacao.error, 'lng');

  return (
    <form onSubmit={salvar} noValidate className="space-y-4">
      <SeletorSegmentado
        rotulo="Tipo de estabelecimento"
        rotuloVisivel
        valor={tipo}
        aoMudar={aoMudarTipo}
        opcoes={OPCOES_TIPO}
      />
      <CampoTexto
        rotulo="Nome"
        placeholder={
          tipo === 'escola'
            ? 'Ex.: Fatec Jacareí'
            : tipo === 'industria'
              ? 'Ex.: Metalúrgica'
              : 'Ex.: Residência 12'
        }
        maxLength={120}
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        erro={erroDoCampo(mutacao.error, 'nome')}
      />
      <div className="rounded-painel bg-superficie-suave p-3 text-sm">
        <p className="font-semibold" aria-live="polite">
          {posicao
            ? `Local: ${formatarCoordenada(posicao.lat)}; ${formatarCoordenada(posicao.lng)}`
            : 'Local: clique no mapa onde ele fica.'}
        </p>
        <p className="mt-1 text-xs text-tinta-suave">
          {posicao
            ? 'Arraste o marcador ou clique de novo para ajustar.'
            : 'O marcador aparece no ponto clicado.'}
        </p>
        {erroPosicao ? (
          <p role="alert" className="mt-1 font-semibold text-erro">
            {erroPosicao}
          </p>
        ) : null}
      </div>
      {outroErro ? (
        <p role="alert" className="text-sm font-semibold text-erro">
          {outroErro}
        </p>
      ) : null}
      <div className="flex flex-col gap-2">
        <Botao
          type="submit"
          largo
          disabled={!posicao || !nome.trim()}
          carregando={mutacao.isPending}
        >
          {editando ? 'Salvar alterações' : 'Salvar estabelecimento'}
        </Botao>
        {editando ? (
          <Botao variante="neutra" largo onClick={aoConcluir}>
            Cancelar edição
          </Botao>
        ) : null}
      </div>
    </form>
  );
}
