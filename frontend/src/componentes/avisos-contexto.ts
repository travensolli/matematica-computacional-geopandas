import { createContext, useContext } from 'react';

export type TipoAviso = 'sucesso' | 'erro';
export type Avisar = (mensagem: string, tipo?: TipoAviso) => void;

export const ContextoAvisos = createContext<Avisar>(() => {});

/** Avisa o resultado de uma ação: "Área salva", "Não foi possível excluir a área". */
export const useAvisar = () => useContext(ContextoAvisos);
