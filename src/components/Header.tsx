import React from 'react';
import { Sun, Moon, ShieldCheck, ShieldAlert, ChevronRight } from 'lucide-react';
import appIcon from '/icon.png';
import { Page } from '../types';
import { findNav } from '../config/nav';
import { usePrefs } from '../context/PrefsContext';
import { IconButton, cx } from './ui';

interface HeaderProps {
  computerName: string;
  username: string;
  isAdmin: boolean;
  version: string;
  currentPage: Page;
}

/** Barra de título de la ventana frameless (arrastrable). */
export function Header({ isAdmin, version, currentPage }: HeaderProps) {
  const { resolvedTheme, toggleTheme } = usePrefs();
  const nav = findNav(currentPage);

  return (
    <header className="drag h-11 shrink-0 z-30 flex items-center justify-between bg-bg/80 backdrop-blur-xl border-b border-line select-none">
      {/* Marca + breadcrumb */}
      <div className="flex items-center gap-3 pl-3.5 min-w-0">
        <img src={appIcon} alt="" className="w-6 h-6 shrink-0" draggable={false} />
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[13px] font-semibold tracking-tight text-fg whitespace-nowrap">
            SamirTech<span className="text-accent-fg">Tools</span>
          </span>
          <span className="kbd">v{version}</span>
        </div>
        {nav && (
          <div className="hidden md:flex items-center gap-1.5 text-[12.5px] text-subtle min-w-0">
            <ChevronRight size={13} className="text-line-strong" />
            <span>{nav.group}</span>
            <ChevronRight size={13} className="text-line-strong" />
            <span className="text-fg font-medium truncate">{nav.label}</span>
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="flex items-center h-full">
        <span
          className={cx(
            'no-drag hidden lg:inline-flex items-center gap-1.5 h-6 px-2.5 mr-2 rounded-full text-[11px] font-medium ring-1 ring-inset',
            isAdmin
              ? 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/25 dark:text-emerald-300'
              : 'bg-amber-500/10 text-amber-700 ring-amber-500/25 dark:text-amber-300',
          )}
          title={isAdmin ? 'La app se ejecuta como administrador' : 'Las tareas que lo necesiten pedirán elevación (UAC)'}
        >
          {isAdmin ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
          {isAdmin ? 'Administrador' : 'Usuario estándar'}
        </span>
        <IconButton label={resolvedTheme === 'dark' ? 'Tema claro' : 'Tema oscuro'} onClick={toggleTheme} className="no-drag mr-2">
          {resolvedTheme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </IconButton>

        {/* Controles de ventana estilo Windows 11 */}
        <div className="no-drag flex h-full border-l border-line">
          <WinButton label="Minimizar" onClick={() => window.electronAPI?.minimize()}>
            <svg width="10" height="10" viewBox="0 0 10 10"><rect y="4.5" width="10" height="1" fill="currentColor" /></svg>
          </WinButton>
          <WinButton label="Maximizar" onClick={() => window.electronAPI?.maximize()}>
            <svg width="10" height="10" viewBox="0 0 10 10"><rect x="0.5" y="0.5" width="9" height="9" rx="1.5" fill="none" stroke="currentColor" /></svg>
          </WinButton>
          <WinButton label="Cerrar" danger onClick={() => window.electronAPI?.close()}>
            <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" /></svg>
          </WinButton>
        </div>
      </div>
    </header>
  );
}

function WinButton({ label, danger, onClick, children }: { label: string; danger?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cx(
        'w-[46px] h-full grid place-items-center text-muted transition-colors',
        danger ? 'hover:bg-[#c42b1c] hover:text-white' : 'hover:bg-surface-2 hover:text-fg',
      )}
    >
      {children}
    </button>
  );
}
