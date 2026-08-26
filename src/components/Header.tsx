import React, { useState, useEffect } from 'react';
import { Page } from '../types';
import { Sun, Moon, Download } from 'lucide-react';
import {
  LayoutDashboard,
  Cpu,
  Monitor,
  FileText,
  Globe,
  Wrench,
  Terminal,
  Trash2,
  Settings,
  Network,
} from 'lucide-react';

interface HeaderProps {
  computerName: string;
  username: string;
  isAdmin: boolean;
  version: string;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const menuItems: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Diagnóstico', icon: <LayoutDashboard size={14} /> },
  { id: 'install', label: 'Instalar', icon: <Download size={14} /> },
  { id: 'windows', label: 'Windows', icon: <Monitor size={14} /> },
  { id: 'office', label: 'Office', icon: <FileText size={14} /> },
  { id: 'browsers', label: 'Navegadores', icon: <Globe size={14} /> },
  { id: 'drivers', label: 'Drivers', icon: <Cpu size={14} /> },
  { id: 'utilities', label: 'Utilidades', icon: <Wrench size={14} /> },
  { id: 'network', label: 'Red', icon: <Network size={14} /> },
  { id: 'christitus', label: 'WinUtil', icon: <Terminal size={14} /> },
  { id: 'uninstaller', label: 'Desinstalador', icon: <Trash2 size={14} /> },
  { id: 'settings', label: 'Ajustes', icon: <Settings size={14} /> },
];

export function Header({ computerName, username, isAdmin, version, currentPage, onNavigate }: HeaderProps) {
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
    <header className="select-none z-10 border-b border-neutral-300 bg-neutral-100">
      {/* Fila 1: logo, tabs, estado, controles de ventana */}
      <div className="h-12 flex items-center gap-4 px-3">
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-7 h-7 rounded bg-neutral-800 flex items-center justify-center">
            <span className="text-[10px] font-bold text-white">ST</span>
          </div>
          <span className="text-sm font-bold text-neutral-800 hidden lg:block">
            SamirTech<span className="text-primary-600">Tools</span>
          </span>
        </div>

        {/* Tabs de navegación */}
        <nav className="flex-1 flex items-center gap-1 overflow-x-auto">
          {menuItems.map((item) => {
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap border transition-colors ${
                  active
                    ? 'bg-white border-neutral-400 text-neutral-900 shadow-sm font-semibold'
                    : 'bg-neutral-200 border-neutral-300 text-neutral-600 hover:bg-neutral-300/70 hover:text-neutral-900'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Estado */}
        <div className="hidden xl:flex items-center gap-3 text-[11px] text-neutral-500 flex-shrink-0">
          <span className="truncate max-w-[140px]">{computerName}</span>
          <span className="truncate max-w-[120px]">{username}</span>
          <span className={isAdmin ? 'text-green-600 font-semibold' : 'text-yellow-600 font-semibold'}>
            {isAdmin ? 'Admin' : 'Usuario'}
          </span>
          <span className="text-neutral-400">v{version}</span>
        </div>

        {/* Controles de ventana */}
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
      </div>
    </header>
  );
}
