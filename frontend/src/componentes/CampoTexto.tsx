import { type ComponentPropsWithRef, useId } from 'react';
import { juntarClasses } from '../utilitarios/classes';

export interface CampoTextoProps extends Omit<ComponentPropsWithRef<'input'>, 'id'> {
  rotulo: string;
  erro?: string | null;
  dica?: string;
}

/** Campo com rótulo visível, dica e erro ligados ao input por aria-describedby. */
export function CampoTexto({ rotulo, erro, dica, className, ...resto }: CampoTextoProps) {
  const id = useId();
  const idDica = dica ? `${id}-dica` : undefined;
  const idErro = erro ? `${id}-erro` : undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="text-sm font-semibold">
        {rotulo}
      </label>
      {dica ? (
        <p id={idDica} className="text-xs text-tinta-suave">
          {dica}
        </p>
      ) : null}
      <input
        id={id}
        aria-invalid={erro ? true : undefined}
        aria-describedby={[idDica, idErro].filter(Boolean).join(' ') || undefined}
        className={juntarClasses(
          'mt-1 min-h-toque w-full rounded-controle border bg-superficie px-2.5',
          erro ? 'border-erro' : 'border-linha-forte',
        )}
        {...resto}
      />
      {erro ? (
        <p id={idErro} className="mt-1 text-sm font-semibold text-erro">
          {erro}
        </p>
      ) : null}
    </div>
  );
}
