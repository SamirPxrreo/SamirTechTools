import React, { useState, useEffect } from 'react';
import { Sun, Moon, ShieldCheck, ShieldAlert } from 'lucide-react';

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

  return (
    <header className="h-[52px] shrink-0 z-20 flex items-center justify-between px-4 gap-4 bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0">
      {/* Brand */}
      <div className="flex items-center gap-3 min-w-0">
        <img src="/logo.jpg" alt="ST" className="w-8 h-8 rounded-full object-cover shrink-0 shadow-sm border border-slate-200" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
        <div className="min-w-0 leading-none">
          <p className="text-[13px] font-bold tracking-tight text-slate-900">
            SamirTech<span className="text-indigo-600">Tools</span>
          </p>
          <p className="text-[11px] text-slate-500 hidden sm:block truncate">
            {computerName || '—'} · {username || '—'} · v{version}
          </p>
        </div>
        <span className={`hidden lg:inline-flex items-center gap-1.5 ml-2 px-2.5 py-1 rounded-full text-[11px] font-medium border ${isAdmin ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
          {isAdmin ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
          {isAdmin ? 'Administrador' : 'Usuario'}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => setTheme(t => (t === 'light' ? 'dark' : 'light'))}
          className="w-8 h-8 grid place-items-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
          title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
        >
          {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
        </button>
        <div className="w-px h-6 bg-slate-200 mx-1" />
        {/* Window controls */}
        <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden bg-white">
          <button onClick={() => window.electronAPI?.minimize()} className="w-8 h-8 grid place-items-center hover:bg-slate-50 text-slate-500 transition-colors" title="Minimizar">
            <svg width="12" height="12" viewBox="0 0 12 12"><rect x="1" y="5.5" width="10" height="1" rx="0.5" fill="currentColor" /></svg>
          </button>
          <div className="w-px h-4 bg-slate-200" />
          <button onClick={() => window.electronAPI?.maximize()} className="w-8 h-8 grid place-items-center hover:bg-slate-50 text-slate-500 transition-colors" title="Maximizar">
            <svg width="12" height="12" viewBox="0 0 12 12"><rect x="2" y="2" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.2" /></svg>
          </button>
          <div className="w-px h-4 bg-slate-200" />
          <button onClick={() => window.electronAPI?.close()} className="w-8 h-8 grid place-items-center hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors" title="Cerrar">
            <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 2 L10 10 M10 2 L2 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
          </button>
        </div>
      </div>
    </header>
  );
}
