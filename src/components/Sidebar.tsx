import React from 'react';
import { Page } from '../types';
import {
  LayoutDashboard,
  Download,
  Monitor,
  FileText,
  AppWindow,
  Wrench,
  Trash2,
  Settings,
  Network,
  RefreshCw,
} from 'lucide-react';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  computerName: string;
  username: string;
  isAdmin: boolean;
  loading: boolean;
  onRefresh: () => void;
}

type MenuItem = { id: Page; label: string; icon: React.ReactNode; desc: string };
type MenuGroup = { label: string; items: MenuItem[] };

const menuGroups: MenuGroup[] = [
  {
    label: 'Diagnóstico',
    items: [
      { id: 'dashboard', label: 'Diagnóstico', icon: <LayoutDashboard size={16} />, desc: 'Vista general' },
    ],
  },
  {
    label: 'Instalación',
    items: [
      { id: 'install', label: 'Instalar Apps', icon: <Download size={16} />, desc: '235 apps' },
      { id: 'extra-apps', label: 'Otras Apps', icon: <AppWindow size={16} />, desc: 'JO-PDF, Chrome...' },
      { id: 'office', label: 'Office', icon: <FileText size={16} />, desc: 'Suite' },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { id: 'windows', label: 'Windows', icon: <Monitor size={16} />, desc: 'SFC / DISM' },
      { id: 'network', label: 'Red', icon: <Network size={16} />, desc: 'IP / DNS' },
      { id: 'utilities', label: 'Utilidades', icon: <Wrench size={16} />, desc: 'Limpieza' },
      { id: 'uninstaller', label: 'Desinstalador', icon: <Trash2 size={16} />, desc: 'Limpieza profunda' },
    ],
  },
  {
    label: 'Config',
    items: [
      { id: 'settings', label: 'Ajustes', icon: <Settings size={16} />, desc: 'Preferencias' },
    ],
  },
];

export function Sidebar({ currentPage, onNavigate, loading, onRefresh }: SidebarProps) {
  return (
    <aside className="w-[238px] shrink-0 bg-white border-r border-slate-200 flex flex-col">
      {/* Nav agrupado */}
      <nav className="flex-1 py-3 px-3 space-y-4 overflow-y-auto">
        {menuGroups.map(group => (
          <div key={group.label} className="space-y-1">
            <p className="px-2 py-1 text-[9px] font-semibold tracking-widest text-slate-400 uppercase font-mono">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map(item => {
                const active = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all border ${
                      active
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white text-slate-700 border-transparent hover:bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 grid place-items-center rounded-lg shrink-0 ${
                        active ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block text-[13px] font-medium leading-none ${
                          active ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {item.label}
                      </span>
                      <span
                        className={`block text-[11px] leading-none mt-1 ${
                          active ? 'text-white/60' : 'text-slate-500'
                        }`}
                      >
                        {item.desc}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer minimal */}
      <div className="p-3 border-t border-slate-200 space-y-2">
        <button
          onClick={onRefresh}
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-[12px] font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-50 shadow-sm"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Analizando...' : 'Actualizar diagnóstico'}
        </button>
        <p className="text-center text-[10px] text-slate-400">SamirTechTools · v1.0.0</p>
      </div>
    </aside>
  );
}
