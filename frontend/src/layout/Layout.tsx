import { BookOpen, Blend, Map as IconeMapa, type LucideIcon } from 'lucide-react';
import { Link, NavLink, Outlet } from 'react-router';
import { BotaoTema } from '../componentes/BotaoTema';
import { juntarClasses } from '../utilitarios/classes';
import { Marca } from './Marca';

interface Item {
  para: string;
  rotulo: string;
  icone: LucideIcon;
}

const ITENS: Item[] = [
  { para: '/', rotulo: 'Teoria', icone: BookOpen },
  { para: '/mapa', rotulo: 'Mapa', icone: IconeMapa },
  { para: '/operacoes', rotulo: 'Operações', icone: Blend },
];

export function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#conteudo"
        className="sr-only z-[3000] rounded-controle bg-superficie px-3 py-2 font-semibold shadow-flutuante focus:not-sr-only focus:absolute focus:top-2 focus:left-2"
      >
        Ir para o conteúdo
      </a>
      <header className="sticky top-0 z-[1200] h-14 border-b border-linha bg-superficie">
        <div className="mx-auto flex h-full max-w-[90rem] items-center gap-3 px-4">
          <Link
            to="/"
            className="flex min-h-toque items-center gap-2 rounded-controle font-bold text-tinta no-underline"
          >
            <Marca />
            <span className="hidden sm:inline">Conjuntos no mapa</span>
          </Link>
          <nav aria-label="Principal" className="ml-auto">
            <ul className="flex items-center gap-1">
              {ITENS.map(({ para, rotulo, icone: Icone }) => (
                <li key={para}>
                  <NavLink
                    to={para}
                    end={para === '/'}
                    className={({ isActive }) =>
                      juntarClasses(
                        'relative flex min-h-toque items-center gap-1.5 rounded-controle px-2.5 text-sm no-underline transition-colors duration-150 ease-suave',
                        isActive
                          ? 'font-bold text-tinta after:absolute after:inset-x-2 after:-bottom-[0.7rem] after:h-[3px] after:rounded-full after:bg-tinta'
                          : 'text-tinta-suave hover:bg-superficie-suave hover:text-tinta',
                      )
                    }
                  >
                    <Icone aria-hidden="true" className="size-4.5" />
                    {rotulo}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <BotaoTema />
        </div>
      </header>
      <main id="conteudo" tabIndex={-1} className="flex min-h-0 flex-1 flex-col outline-none">
        <Outlet />
      </main>
    </div>
  );
}
