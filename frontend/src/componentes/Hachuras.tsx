import { ID_HACHURA } from './padroes-hachura';

/* Definições SVG das hachuras. As cores vêm dos tokens, então mudam junto com o tema. */

interface TracosProps {
  id: string;
  cor: string;
  angulo: number;
  fundo?: string;
  opacidadeFundo?: number;
  espessura?: number;
}

function Tracos({ id, cor, angulo, fundo, opacidadeFundo = 0.16, espessura = 1.6 }: TracosProps) {
  return (
    <pattern
      id={id}
      width="7"
      height="7"
      patternUnits="userSpaceOnUse"
      patternTransform={`rotate(${angulo})`}
    >
      <rect width="7" height="7" style={{ fill: fundo ?? cor, fillOpacity: opacidadeFundo }} />
      <line x1="0" y1="0" x2="0" y2="7" style={{ stroke: cor, strokeWidth: espessura }} />
    </pattern>
  );
}

/** Definições SVG das hachuras, montadas uma vez no topo da aplicação. */
export function DefinicoesHachuras() {
  return (
    <svg aria-hidden="true" focusable="false" width="0" height="0" className="absolute">
      <defs>
        <Tracos id={ID_HACHURA.escolar} cor="var(--escolar)" angulo={45} />
        <Tracos id={ID_HACHURA.industrial} cor="var(--industrial)" angulo={-45} />
        <Tracos
          id={ID_HACHURA.residencial}
          cor="var(--residencial-traco)"
          fundo="var(--residencial)"
          angulo={0}
          opacidadeFundo={0.3}
        />
        <pattern id={ID_HACHURA.misto} width="7" height="7" patternUnits="userSpaceOnUse">
          <rect width="7" height="7" style={{ fill: 'var(--escolar)', fillOpacity: 0.12 }} />
          <path d="M0 7 L7 0" style={{ stroke: 'var(--escolar)', strokeWidth: 1.6 }} />
          <path d="M0 0 L7 7" style={{ stroke: 'var(--industrial)', strokeWidth: 1.6 }} />
        </pattern>
        <pattern id={ID_HACHURA.nenhuma} width="6" height="6" patternUnits="userSpaceOnUse">
          <rect width="6" height="6" style={{ fill: 'var(--sem-classe)', fillOpacity: 0.1 }} />
          <circle cx="3" cy="3" r="0.8" style={{ fill: 'var(--sem-classe)' }} />
        </pattern>
        <Tracos
          id={ID_HACHURA.a}
          cor="var(--tinta)"
          angulo={45}
          opacidadeFundo={0}
          espessura={1.2}
        />
        <Tracos
          id={ID_HACHURA.b}
          cor="var(--tinta)"
          angulo={-45}
          opacidadeFundo={0}
          espessura={1.2}
        />
      </defs>
    </svg>
  );
}
