import { Moon, Sun } from 'lucide-react';
import { useTema } from '../hooks/tema';
import { BotaoIcone } from './Botao';

/** Alterna entre os temas claro e escuro e guarda a escolha. */
export function BotaoTema() {
  const { tema, alternar } = useTema();
  const escuro = tema === 'escuro';
  return (
    <BotaoIcone
      icone={escuro ? Sun : Moon}
      rotulo={escuro ? 'Usar tema claro' : 'Usar tema escuro'}
      onClick={alternar}
    />
  );
}
