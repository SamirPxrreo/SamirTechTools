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

const menuItems: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Diagnóstico', icon: <LayoutDashboard size={17} /> },
  { id: 'install', label: 'Instalar Apps', icon: <Download size={17} /> },
  { id: 'windows', label: 'Windows', icon: <Monitor size={17} /> },
  { id: 'office', label: 'Office', icon: <FileText size={17} /> },
  { id: 'browsers', label: 'Navegadores', icon: <Globe size={17} /> },
  { id: 'drivers', label: 'Drivers', icon: <Cpu size={17} /> },
  { id: 'utilities', label: 'Utilidades', icon: <Wrench size={17} /> },
  { id: 'network', label: 'Red', icon: <Network size={17} /> },
  { id: 'uninstaller', label: 'Desinstalador', icon: <Trash2 size={17} /> },
  { id: 'settings', label: 'Ajustes', icon: <Settings size={17} /> },
];

export function Sidebar({ currentPage, onNavigate, computerName, username, isAdmin, loading, onRefresh }: SidebarProps) {
  return (
    <aside className="w-56 flex-shrink-0 border-r border-neutral-300 bg-neutral-50 flex flex-col">
      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {menuItems.map(item => {
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                active
                  ? 'bg-primary-600 text-white font-semibold'
                  : 'text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Sistema */}
      <div className="px-3 pb-3 pt-3 border-t border-neutral-200">
        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide mb-1.5">Sistema</p>
        <div className="space-y-1 text-[10px] text-neutral-600">
          <p className="truncate">{computerName || '...'}</p>
          <p className="truncate">{username || '...'}</p>
          <p className={isAdmin ? 'text-green-700 font-semibold' : 'text-yellow-700 font-semibold'}>
            {isAdmin ? 'Administrador' : 'Sin privilegios'}
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="w-full mt-2 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-white border border-neutral-300 rounded text-[10px] font-medium text-neutral-700 hover:bg-neutral-100 transition-colors disabled:opacity-50"
        >
          {loading ? 'Analizando...' : 'Actualizar diagnóstico'}
        </button>
      </div>
    </aside>
  );
}
