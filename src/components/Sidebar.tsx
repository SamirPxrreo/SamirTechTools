import React from 'react';
import { Page } from '../types';
import {
  LayoutDashboard,
  Download,
  Monitor,
  FileText,
  Globe,
  Wrench,
  Trash2,
  Settings,
  Network,
  Cpu,
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

const menuItems: { id: Page; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'dashboard', label: 'Diagnóstico', icon: <LayoutDashboard size={16} />, desc: 'Vista general' },
  { id: 'install', label: 'Instalar Apps', icon: <Download size={16} />, desc: '235 apps' },
  { id: 'windows', label: 'Windows', icon: <Monitor size={16} />, desc: 'SFC / DISM' },
  { id: 'office', label: 'Office', icon: <FileText size={16} />, desc: 'Suite' },
  { id: 'browsers', label: 'Navegadores', icon: <Globe size={16} />, desc: 'Chrome, Edge...' },
  { id: 'drivers', label: 'Drivers', icon: <Cpu size={16} />, desc: 'Hardware' },
  { id: 'utilities', label: 'Utilidades', icon: <Wrench size={16} />, desc: 'Limpieza' },
  { id: 'network', label: 'Red', icon: <Network size={16} />, desc: 'IP / DNS' },
  { id: 'uninstaller', label: 'Desinstalador', icon: <Trash2 size={16} />, desc: 'Limpieza profunda' },
  { id: 'settings', label: 'Ajustes', icon: <Settings size={16} />, desc: 'Preferencias' },
];

export function Sidebar({ currentPage, onNavigate, loading, onRefresh }: SidebarProps) {
  return (
    <aside className="w-[252px] shrink-0 bg-white border-r border-slate-200 flex flex-col">
      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <p className="px-2 mb-2 text-[10px] font-semibold tracking-widest text-slate-400 uppercase">Navegación</p>
        {menuItems.map(item => {
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-left transition-all border ${
                active
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-700 border-transparent hover:bg-slate-50 hover:border-slate-200'
              }`}
            >
              <span className={`w-7 h-7 grid place-items-center rounded-xl shrink-0 ${active ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-600'}`}>{item.icon}</span>
              <span className="min-w-0 flex-1">
                <span className={`block text-[13px] font-medium leading-none ${active ? 'text-white' : 'text-slate-900'}`}>{item.label}</span>
                <span className={`block text-[11px] leading-none mt-1 ${active ? 'text-white/60' : 'text-slate-500'}`}>{item.desc}</span>
              </span>
            </button>
          );
        })}
      </nav>

      {/* Footer minimal - sin info repetida (ya está en Header) */}
      <div className="p-3 border-t border-slate-200 space-y-2">
        <button
          onClick={onRefresh}
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl bg-white border border-slate-200 text-[12px] font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-50 shadow-sm"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Analizando...' : 'Actualizar diagnóstico'}
        </button>
        <p className="text-center text-[10px] text-slate-400">SamirTechTools · v1.0.0</p>
      </div>
    </aside>
  );
}
