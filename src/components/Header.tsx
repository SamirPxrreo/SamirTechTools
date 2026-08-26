import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

interface HeaderProps {
  computerName: string;
  username: string;
  isAdmin: boolean;
  version: string;
}

export function Header({ computerName, username, isAdmin, version }: HeaderProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('stt-theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('stt-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));

  return (
    <header className="h-12 select-none z-10 border-b border-neutral-300 bg-neutral-100 flex items-center justify-between px-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-7 h-7 rounded bg-neutral-800 flex items-center justify-center flex-shrink-0">
          <span className="text-[10px] font-bold text-white">ST</span>
        </div>
        <span className="text-sm font-bold text-neutral-800">
          SamirTech<span className="text-primary-600">Tools</span>
        </span>
        <span className="text-[11px] text-neutral-500 hidden lg:block truncate">
          {computerName} · {username} ·{' '}
          <span className={isAdmin ? 'text-green-700 font-semibold' : 'text-yellow-700 font-semibold'}>
            {isAdmin ? 'Admin' : 'Usuario'}
          </span>{' '}
          · v{version}
        </span>
      </div>

      <div className="flex items-center -mr-1 flex-shrink-0">
        <button
          onClick={toggleTheme}
          className="p-2 hover:bg-neutral-200 transition-colors text-neutral-600 hover:text-neutral-900 rounded mr-1"
          title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
        >
          {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
        </button>
        <button
          onClick={() => window.electronAPI?.minimize()}
          className="p-2 hover:bg-neutral-300 transition-colors text-neutral-500 hover:text-neutral-900 rounded"
        >
          <svg width="12" height="12" viewBox="0 0 12 12"><rect x="1" y="5.5" width="10" height="1" fill="currentColor" /></svg>
        </button>
        <button
          onClick={() => window.electronAPI?.maximize()}
          className="p-2 hover:bg-neutral-300 transition-colors text-neutral-500 hover:text-neutral-900 rounded"
        >
          <svg width="12" height="12" viewBox="0 0 12 12"><rect x="1.5" y="1.5" width="9" height="9" fill="none" stroke="currentColor" strokeWidth="1" /></svg>
        </button>
        <button
          onClick={() => window.electronAPI?.close()}
          className="p-2 hover:bg-red-600 transition-colors text-neutral-500 hover:text-white rounded"
        >
          <svg width="12" height="12" viewBox="0 0 12 12"><path d="M1 1 L11 11 M11 1 L1 11" stroke="currentColor" strokeWidth="1.2" /></svg>
        </button>
      </div>
    </header>
  );
}
