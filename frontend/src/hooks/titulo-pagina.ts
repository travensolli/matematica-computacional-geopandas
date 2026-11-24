import { useEffect } from 'react';

export const TITULO_BASE = 'Conjuntos no mapa';

/** Define o título do documento por tela. */
export function useTituloPagina(titulo?: string): void {
  useEffect(() => {
    document.title = titulo ? `${titulo} – ${TITULO_BASE}` : TITULO_BASE;
  }, [titulo]);
}
