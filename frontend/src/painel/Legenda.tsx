import type { ReactNode } from 'react';
import type { CamadasVisiveis } from '../mapa/MapaZoneamento';
import { Amostra } from '../componentes/MarcaClasse';
import type { Aparencia } from '../dominio/classes';

const ITENS: Array<{ aparencia: Aparencia; rotulo: string; detalhe: string }> = [
  { aparencia: 'escolar', rotulo: 'Escolar', detalhe: 'contém ao menos uma escola' },
  { aparencia: 'industrial', rotulo: 'Industrial', detalhe: 'contém ao menos uma indústria' },
  { aparencia: 'residencial', rotulo: 'Residencial', detalhe: 'contém somente residências' },
  { aparencia: 'misto', rotulo: 'Escolar e industrial', detalhe: 'as duas hachuras se cruzam' },
  { aparencia: 'nenhuma', rotulo: 'Sem classificação', detalhe: 'nenhum estabelecimento dentro' },
];

function Linha({ tracejado }: { tracejado: string }) {
  return (
    <svg aria-hidden="true" width="26" height="12" className="shrink-0">
      <line
        x1="1"
        y1="6"
        x2="25"
        y2="6"
        stroke="var(--tinta)"
        strokeWidth="2"
        strokeDasharray={tracejado}
      />
    </svg>
  );
}

function Ponto() {
  return (
    <svg aria-hidden="true" width="26" height="12" className="shrink-0">
      <circle
        cx="7"
        cy="6"
        r="4.5"
        fill="var(--escolar)"
        stroke="var(--superficie)"
        strokeWidth="1.5"
      />
      <circle
        cx="19"
        cy="6"
        r="4.5"
        fill="var(--industrial)"
        stroke="var(--superficie)"
        strokeWidth="1.5"
      />
    </svg>
  );
}

const CAMADAS: Array<{ chave: keyof CamadasVisiveis; rotulo: string; amostra: ReactNode }> = [
  {
    chave: 'municipio',
    rotulo: 'Limite do município (U)',
    amostra: <Linha tracejado="12 5 2 5" />,
  },
  {
    chave: 'areas',
    rotulo: 'Áreas cadastradas',
    amostra: (
      <span className="flex w-[26px] shrink-0 justify-center">
        <Amostra aparencia="escolar" tamanho={14} />
      </span>
    ),
  },
  { chave: 'sobreposicoes', rotulo: 'Sobreposições (A ∩ B)', amostra: <Linha tracejado="2 4" /> },
  { chave: 'estabelecimentos', rotulo: 'Estabelecimentos', amostra: <Ponto /> },
];

export interface LegendaProps {
  camadas: CamadasVisiveis;
  aoMudarCamada: (chave: keyof CamadasVisiveis, visivel: boolean) => void;
}

/** O quadro de legenda do mapa e as camadas que podem ser ligadas e desligadas. */
export function Legenda({ camadas, aoMudarCamada }: LegendaProps) {
  return (
    <div className="space-y-4">
      <ul className="space-y-1.5">
        {ITENS.map((item) => (
          <li key={item.aparencia} className="flex items-center gap-2 text-sm">
            <Amostra aparencia={item.aparencia} />
            <span>
              <span className="font-semibold">{item.rotulo}</span>
              <span className="text-tinta-suave">: {item.detalhe}</span>
            </span>
          </li>
        ))}
      </ul>
      <fieldset>
        <legend className="text-sm font-semibold">Camadas</legend>
        <div className="mt-1 space-y-0.5">
          {CAMADAS.map((camada) => (
            <label key={camada.chave} className="flex min-h-toque items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4 accent-[var(--tinta)]"
                checked={camadas[camada.chave]}
                onChange={(e) => aoMudarCamada(camada.chave, e.target.checked)}
              />
              {camada.amostra}
              {camada.rotulo}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
