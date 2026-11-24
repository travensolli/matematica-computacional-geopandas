import { type ReactNode, useId, useState } from 'react';
import type { FeatureArea } from '../api/esquemas';
import { EstadoVazio } from '../componentes/Estados';
import { Amostra } from '../componentes/MarcaClasse';
import { aparencia, type Aparencia, descreverClasses, PLURAL_TIPO } from '../dominio/classes';
import { juntarClasses } from '../utilitarios/classes';
import { contar, formatarNumero } from '../utilitarios/formatar';

const FILTROS: Array<{ valor: Aparencia | 'todas'; rotulo: string }> = [
  { valor: 'todas', rotulo: 'Todas as classes' },
  { valor: 'escolar', rotulo: 'Escolar' },
  { valor: 'industrial', rotulo: 'Industrial' },
  { valor: 'residencial', rotulo: 'Residencial' },
  { valor: 'misto', rotulo: 'Escolar e industrial' },
  { valor: 'nenhuma', rotulo: 'Sem classificação' },
];

function resumoContagem(area: FeatureArea['properties']): string {
  const partes = [
    area.escolas ? contar(area.escolas, 'escola', PLURAL_TIPO.escola) : null,
    area.industrias ? contar(area.industrias, 'indústria', PLURAL_TIPO.industria) : null,
    area.residencias ? contar(area.residencias, 'residência', PLURAL_TIPO.residencia) : null,
  ].filter(Boolean);
  return partes.length ? partes.join(', ') : 'nenhum estabelecimento';
}

export interface ListaAreasProps {
  areas: FeatureArea[];
  selecionada: number | null;
  aoSelecionar: (area: FeatureArea) => void;
  /** Ações de cada área (renomear, redesenhar, excluir), quando o cadastro está disponível. */
  acoes?: (area: FeatureArea) => ReactNode;
}

/** As áreas cadastradas, com filtro por classe e zoom ao escolher uma. */
export function ListaAreas({ areas, selecionada, aoSelecionar, acoes }: ListaAreasProps) {
  const idFiltro = useId();
  const [filtro, setFiltro] = useState<Aparencia | 'todas'>('todas');
  const visiveis = areas.filter(
    (area) => filtro === 'todas' || aparencia(area.properties.classes) === filtro,
  );

  if (areas.length === 0) {
    return (
      <EstadoVazio titulo="Nenhuma área cadastrada ainda.">
        Use “Nova área” para desenhar a primeira sobre o mapa.
      </EstadoVazio>
    );
  }

  return (
    <div className="space-y-2">
      <label htmlFor={idFiltro} className="sr-only">
        Filtrar áreas por classe
      </label>
      <select
        id={idFiltro}
        value={filtro}
        onChange={(e) => setFiltro(e.target.value as Aparencia | 'todas')}
        className="min-h-toque w-full rounded-controle border border-linha-forte bg-superficie px-2 text-sm"
      >
        {FILTROS.map((f) => (
          <option key={f.valor} value={f.valor}>
            {f.rotulo}
          </option>
        ))}
      </select>
      <p className="text-xs text-tinta-suave" aria-live="polite">
        {contar(visiveis.length, 'área exibida', 'áreas exibidas')} de {areas.length}
      </p>
      <ul className="divide-y divide-linha">
        {visiveis.map((area) => {
          const p = area.properties;
          const ativa = selecionada === p.id;
          return (
            <li
              key={p.id}
              className={juntarClasses('flex items-start gap-1', ativa && 'bg-superficie-suave')}
            >
              <button
                type="button"
                onClick={() => aoSelecionar(area)}
                aria-current={ativa || undefined}
                className="flex min-h-toque flex-1 items-start gap-2.5 rounded-controle px-1.5 py-2 text-left hover:bg-superficie-suave"
              >
                <Amostra aparencia={aparencia(p.classes)} className="mt-0.5" />
                <span className="min-w-0">
                  <span className="block font-semibold">{p.nome}</span>
                  <span className="block text-sm text-tinta-suave">
                    {descreverClasses(p.classes)}, {formatarNumero(p.area_km2)} km²
                  </span>
                  <span className="block text-sm text-tinta-suave">{resumoContagem(p)}</span>
                </span>
              </button>
              {acoes ? <div className="flex shrink-0 py-1.5">{acoes(area)}</div> : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
