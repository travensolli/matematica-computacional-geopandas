import { Crosshair, LocateFixed } from 'lucide-react';
import { useId, useState, type FormEvent } from 'react';
import { Botao } from '../componentes/Botao';

export interface ConsultaPorCoordenadaProps {
  aoConsultar: (lat: number, lng: number) => void;
  /** Coordenadas do centro do mapa, para quem não usa o mouse. */
  centroDoMapa: () => { lat: number; lng: number } | null;
}

const CAMPO =
  'min-h-toque w-full rounded-controle border border-linha-forte bg-superficie px-2.5 tabular-nums';

function lerNumero(texto: string): number | null {
  const normalizado = texto.trim().replace(',', '.').replace('−', '-');
  if (normalizado === '') return null;
  const valor = Number(normalizado);
  return Number.isFinite(valor) ? valor : null;
}

/** Consulta sem clicar no mapa: digitando as coordenadas ou usando o centro do mapa. */
export function ConsultaPorCoordenada({ aoConsultar, centroDoMapa }: ConsultaPorCoordenadaProps) {
  const id = useId();
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  function enviar(evento: FormEvent) {
    evento.preventDefault();
    const la = lerNumero(lat);
    const ln = lerNumero(lng);
    if (la === null || la < -90 || la > 90) return setErro('Informe a latitude entre −90 e 90.');
    if (ln === null || ln < -180 || ln > 180)
      return setErro('Informe a longitude entre −180 e 180.');
    setErro(null);
    aoConsultar(la, ln);
  }

  function usarCentro() {
    const centro = centroDoMapa();
    if (!centro) return;
    setLat(centro.lat.toFixed(5));
    setLng(centro.lng.toFixed(5));
    setErro(null);
    aoConsultar(centro.lat, centro.lng);
  }

  return (
    <form
      onSubmit={enviar}
      noValidate
      className="space-y-2"
      aria-describedby={erro ? `${id}-erro` : undefined}
    >
      <div className="grid grid-cols-2 gap-2">
        <label className="text-sm font-semibold">
          Latitude
          <input
            className={`${CAMPO} mt-1 font-normal`}
            inputMode="decimal"
            placeholder="-23,29521"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            aria-invalid={erro?.includes('latitude') || undefined}
          />
        </label>
        <label className="text-sm font-semibold">
          Longitude
          <input
            className={`${CAMPO} mt-1 font-normal`}
            inputMode="decimal"
            placeholder="-45,96692"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            aria-invalid={erro?.includes('longitude') || undefined}
          />
        </label>
      </div>
      {erro ? (
        <p id={`${id}-erro`} role="alert" className="text-sm font-semibold text-erro">
          {erro}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Botao type="submit" tamanho="pequeno" icone={Crosshair}>
          Consultar ponto
        </Botao>
        <Botao variante="neutra" tamanho="pequeno" icone={LocateFixed} onClick={usarCentro}>
          Usar o centro do mapa
        </Botao>
      </div>
    </form>
  );
}
