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
  { id: 'dashboard', label: 'Diagnóstico', icon: <LayoutDashboard size={19} /> },
  { id: 'drivers', label: 'Drivers', icon: <Cpu size={19} /> },
  { id: 'windows', label: 'Windows', icon: <Monitor size={19} /> },
  { id: 'office', label: 'Office', icon: <FileText size={19} /> },
  { id: 'adobe', label: 'Adobe', icon: <Palette size={19} /> },
  { id: 'browsers', label: 'Navegadores', icon: <Globe size={19} /> },
  { id: 'utilities', label: 'Utilidades', icon: <Wrench size={19} /> },
  { id: 'network', label: 'Red', icon: <Network size={19} /> },
  { id: 'christitus', label: 'ChrisTitusTech', icon: <Terminal size={19} /> },
  { id: 'uninstaller', label: 'Desinstalador', icon: <Trash2 size={19} /> },
  { id: 'settings', label: 'Configuración', icon: <Settings size={19} /> },
];

export function Sidebar({ currentPage, onNavigate, collapsed, onToggleCollapse }: SidebarProps) {
  return (
    <aside
      className={`glass-strong flex flex-col transition-all duration-300 border-r border-white/5 ${
        collapsed ? 'w-[68px]' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div className="p-4 border-b border-white/5">
        {collapsed ? (
          <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center shadow-glow">
            <span className="text-sm font-bold text-white">ST</span>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center shadow-glow flex-shrink-0">
              <span className="text-sm font-bold text-white">ST</span>
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-base font-bold text-white leading-tight">SamirTech<span className="gradient-text">Tools</span></span>
              <span className="text-[9px] text-dark-500 tracking-[0.2em] uppercase">Diagnóstico PC</span>
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto overflow-x-hidden">
        {menuItems.map((item) => {
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`group w-full flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                collapsed ? 'justify-center p-3' : 'px-3 py-2.5'
              } ${
                active
                  ? 'bg-gradient-to-r from-primary-600/30 to-purple-600/20 text-white shadow-glow'
                  : 'text-dark-400 hover:bg-white/5 hover:text-dark-100'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <span className={`flex-shrink-0 relative ${active ? 'text-primary-300' : 'group-hover:text-primary-400'} transition-colors`}>
                {item.icon}
                {active && <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-gradient-to-b from-primary-400 to-purple-400" />}
              </span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Collapse */}
      <button
        onClick={onToggleCollapse}
        className="p-4 border-t border-white/5 text-dark-500 hover:text-white hover:bg-white/5 transition-colors"
      >
        {collapsed ? <ChevronRight size={17} className="mx-auto" /> : (
          <span className="flex items-center gap-2 text-xs"><ChevronLeft size={15} /> Contraer</span>
        )}
      </button>
    </aside>
  );
}
