import { RotateCcw, Undo2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useCriarArea } from '../api/consultas';
import type { FeatureArea, Poligono } from '../api/esquemas';
import { useAvisar } from '../componentes/avisos-contexto';
import { Botao } from '../componentes/Botao';
import { CampoTexto } from '../componentes/CampoTexto';
import { descreverClasses } from '../dominio/classes';
import { erroDoCampo, erroGeral } from './erros';

export interface FormAreaProps {
  geometria: Poligono | null;
  vertices: number;
  aoDesfazer: () => void;
  aoRecomecar: () => void;
  aoSalvar: (area: FeatureArea) => void;
}

function mensagemAreaSalva(area: FeatureArea): string {
  const { nome, classes } = area.properties;
  return classes.length
    ? `Área salva: “${nome}”, classificada como ${descreverClasses(classes)}.`
    : `Área salva: “${nome}”. Sem estabelecimentos dentro, ela fica sem classificação.`;
}

/** Desenho de uma área nova: vértices no mapa, nome aqui. */
export function FormArea({
  geometria,
  vertices,
  aoDesfazer,
  aoRecomecar,
  aoSalvar,
}: FormAreaProps) {
  const [nome, setNome] = useState('');
  const criar = useCriarArea();
  const avisar = useAvisar();

  const fechado = geometria !== null;
  const status = fechado
    ? `Polígono fechado com ${(geometria.coordinates[0]?.length ?? 1) - 1} vértices.`
    : vertices === 0
      ? 'Nenhum vértice marcado.'
      : `${vertices} ${vertices === 1 ? 'vértice marcado' : 'vértices marcados'}. Clique no primeiro vértice para fechar.`;

  async function salvar(evento: FormEvent) {
    evento.preventDefault();
    if (!geometria) return;
    try {
      const area = await criar.mutateAsync({ nome, geometry: geometria });
      avisar(mensagemAreaSalva(area));
      setNome('');
      criar.reset();
      aoSalvar(area);
    } catch {
      /* o erro aparece junto do campo */
    }
  }

  const erroGeometria = erroDoCampo(criar.error, 'geometry');
  const outroErro = erroGeral(criar.error, ['nome', 'geometry']);

  return (
    <form onSubmit={salvar} noValidate className="space-y-4">
      <ol className="list-decimal space-y-1 pl-5 text-sm text-tinta-suave marker:font-semibold">
        <li>Clique no mapa para marcar cada vértice.</li>
        <li>Clique no primeiro vértice para fechar o polígono.</li>
        <li>Dê um nome à área e salve.</li>
      </ol>
      <div className="rounded-painel bg-superficie-suave p-3">
        <p aria-live="polite" className="text-sm font-semibold">
          {status}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Botao
            variante="neutra"
            tamanho="pequeno"
            icone={Undo2}
            onClick={aoDesfazer}
            disabled={fechado || vertices === 0}
          >
            Desfazer vértice
          </Botao>
          <Botao variante="neutra" tamanho="pequeno" icone={RotateCcw} onClick={aoRecomecar}>
            Recomeçar desenho
          </Botao>
        </div>
        <p className="mt-2 text-xs text-tinta-suave">Esc também recomeça o desenho.</p>
        {erroGeometria ? (
          <p role="alert" className="mt-2 text-sm font-semibold text-erro">
            {erroGeometria}
          </p>
        ) : null}
      </div>
      <CampoTexto
        rotulo="Nome da área"
        placeholder="Ex.: Jardim Santa Maria"
        maxLength={120}
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        erro={erroDoCampo(criar.error, 'nome')}
      />
      {outroErro ? (
        <p role="alert" className="text-sm font-semibold text-erro">
          {outroErro}
        </p>
      ) : null}
      <Botao type="submit" largo disabled={!fechado || !nome.trim()} carregando={criar.isPending}>
        Salvar área
      </Botao>
    </form>
  );
}
