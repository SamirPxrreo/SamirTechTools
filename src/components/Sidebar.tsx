import React from 'react';
import { Page } from '../types';
import {
  LayoutDashboard,
  Cpu,
  Monitor,
  FileText,
  Palette,
  Globe,
  Wrench,
  Terminal,
  Trash2,
  Settings,
  Network,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const menuItems: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Diagnóstico', icon: <LayoutDashboard size={20} /> },
  { id: 'drivers', label: 'Drivers', icon: <Cpu size={20} /> },
  { id: 'windows', label: 'Windows', icon: <Monitor size={20} /> },
  { id: 'office', label: 'Office', icon: <FileText size={20} /> },
  { id: 'adobe', label: 'Adobe', icon: <Palette size={20} /> },
  { id: 'browsers', label: 'Navegadores', icon: <Globe size={20} /> },
  { id: 'utilities', label: 'Utilidades', icon: <Wrench size={20} /> },
  { id: 'network', label: 'Red', icon: <Network size={20} /> },
  { id: 'christitus', label: 'ChrisTitusTech', icon: <Terminal size={20} /> },
  { id: 'uninstaller', label: 'Desinstalador', icon: <Trash2 size={20} /> },
  { id: 'settings', label: 'Configuración', icon: <Settings size={20} /> },
];

export function Sidebar({ currentPage, onNavigate, collapsed, onToggleCollapse }: SidebarProps) {
  return (
    <aside
      className={`bg-dark-900 border-r border-dark-700 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      <div className="p-4 border-b border-dark-700 flex items-center gap-3">
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-lg font-bold text-white">ST</span>
            <span className="text-[10px] text-dark-400 tracking-widest">TOOLS</span>
          </div>
        )}
        {collapsed && <span className="text-lg font-bold text-white mx-auto">ST</span>}
      </div>

      <nav className="flex-1 py-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 ${
              currentPage === item.id
                ? 'bg-primary-600/20 text-primary-400 border-r-2 border-primary-500'
                : 'text-dark-300 hover:bg-dark-800 hover:text-white'
            } ${collapsed ? 'justify-center px-2' : ''}`}
            title={collapsed ? item.label : undefined}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      <button
        onClick={onToggleCollapse}
        className="p-3 border-t border-dark-700 text-dark-400 hover:text-white hover:bg-dark-800 transition-colors"
      >
        {collapsed ? <ChevronRight size={18} className="mx-auto" /> : <ChevronLeft size={18} />}
      </button>
    </aside>
  );
}
