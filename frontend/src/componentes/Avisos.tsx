import { CircleAlert, CircleCheck, X } from 'lucide-react';
import { useCallback, useRef, useState, type ReactNode } from 'react';
import { juntarClasses } from '../utilitarios/classes';

import { type Avisar, ContextoAvisos, type TipoAviso } from './avisos-contexto';

interface Aviso {
  id: number;
  mensagem: string;
  tipo: TipoAviso;
}

const DURACAO_MS = 6000;

export function ProvedorAvisos({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const proximo = useRef(1);

  const fechar = useCallback((id: number) => {
    setAvisos((atuais) => atuais.filter((aviso) => aviso.id !== id));
  }, []);

  const avisar = useCallback<Avisar>(
    (mensagem, tipo = 'sucesso') => {
      const id = proximo.current++;
      setAvisos((atuais) => [...atuais.slice(-2), { id, mensagem, tipo }]);
      window.setTimeout(() => fechar(id), DURACAO_MS);
    },
    [fechar],
  );

  return (
    <ContextoAvisos value={avisar}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[1500] flex flex-col items-center gap-2 px-4 md:right-auto md:left-4 md:w-[23rem] md:items-stretch md:px-0"
      >
        {avisos.map((aviso) => {
          const Icone = aviso.tipo === 'erro' ? CircleAlert : CircleCheck;
          return (
            <div
              key={aviso.id}
              role={aviso.tipo === 'erro' ? 'alert' : 'status'}
              className={juntarClasses(
                'animar-surgir pointer-events-auto flex w-full max-w-md items-start gap-2 rounded-painel border bg-superficie p-3 shadow-flutuante',
                aviso.tipo === 'erro' ? 'border-erro' : 'border-linha-forte',
              )}
            >
              <Icone
                aria-hidden="true"
                className={juntarClasses(
                  'mt-0.5 size-5 shrink-0',
                  aviso.tipo === 'erro' ? 'text-erro' : 'text-sucesso',
                )}
              />
              <p className="flex-1 text-sm">{aviso.mensagem}</p>
              <button
                type="button"
                onClick={() => fechar(aviso.id)}
                aria-label="Fechar aviso"
                className="-m-1 grid size-toque place-items-center rounded-controle text-tinta-suave hover:bg-superficie-suave"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ContextoAvisos>
  );
}
