import { ErroApi } from '../api/cliente';

/** Separa o erro de um campo dos demais, para mostrar cada um junto de quem o causou. */
export function erroDoCampo(erro: unknown, campo: string): string | null {
  return erro instanceof ErroApi && erro.campo === campo ? erro.message : null;
}

export function erroGeral(erro: unknown, campos: string[]): string | null {
  if (!erro) return null;
  if (erro instanceof ErroApi && erro.campo && campos.includes(erro.campo)) return null;
  return erro instanceof Error ? erro.message : 'Não foi possível salvar.';
}
