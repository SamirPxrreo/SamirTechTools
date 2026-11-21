import React from 'react';
import { RefreshCw, PanelLeftClose, PanelLeftOpen, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Page } from '../types';
import { NAV, NAV_FOOTER, NavItem } from '../config/nav';
import { usePrefs } from '../context/PrefsContext';
import { useInstall } from '../context/InstallContext';
import { cx } from './ui';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  computerName: string;
  username: string;
  isAdmin: boolean;
  loading: boolean;
  onRefresh: () => void;
}

export function Sidebar({ currentPage, onNavigate, computerName, username, isAdmin, loading, onRefresh }: SidebarProps) {
  const { sidebarCollapsed: collapsed, setSidebarCollapsed } = usePrefs();
  const { installingCount } = useInstall();

  const renderItem = (item: NavItem) => {
    const active = currentPage === item.id;
    const Icon = item.icon;
    const badge = item.id === 'install' && installingCount > 0 ? installingCount : null;
    return (
      <button
        key={item.id}
        onClick={() => onNavigate(item.id)}
        title={collapsed ? item.label : undefined}
        className={cx(
          'group relative w-full flex items-center gap-3 rounded-xl text-left transition-all duration-150',
          collapsed ? 'h-10 justify-center' : 'h-10 px-2.5',
          active ? 'bg-surface text-fg shadow-card ring-1 ring-line' : 'text-muted hover:text-fg hover:bg-surface/60',
        )}
      >
        {active && <span className="absolute -left-3 top-2.5 bottom-2.5 w-[3px] rounded-r-full bg-accent" />}
        <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
        {!collapsed && (
          <span className="flex-1 min-w-0">
            <span className={cx('block text-[13px] leading-4 truncate', active ? 'font-semibold' : 'font-medium')}>{item.label}</span>
          </span>
        )}
        {badge !== null && (
          <span className={cx(
            'grid place-items-center min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-white text-[10px] font-semibold tabular-nums',
            collapsed && 'absolute top-1 right-1',
          )}>
            {badge}
          </span>
        )}
      </button>
    );
  };

  const initials = (computerName || 'PC').replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase() || 'PC';

  return (
    <aside
      className={cx(
        'shrink-0 flex flex-col bg-surface-2/50 border-r border-line transition-[width] duration-200',
        collapsed ? 'w-[68px]' : 'w-[232px]',
      )}
    >
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-5">
        {NAV.map(group => (
          <div key={group.label} className="space-y-1">
            {collapsed ? (
              <div className="mx-auto w-5 h-px bg-line mb-2" />
            ) : (
              <p className="eyebrow px-2.5 pb-1.5">{group.label}</p>
            )}
            {group.items.map(renderItem)}
          </div>
        ))}
      </nav>

      <div className="p-3 space-y-2 border-t border-line">
        {renderItem(NAV_FOOTER)}

        {/* Tarjeta del equipo */}
        {!collapsed ? (
          <div className="rounded-xl bg-surface border border-line p-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white grid place-items-center text-[11px] font-bold shrink-0">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-semibold text-fg truncate">{computerName || 'Equipo'}</p>
                <p className="text-[11px] text-muted truncate flex items-center gap-1">
                  {isAdmin ? <ShieldCheck size={11} className="text-emerald-500" /> : <ShieldAlert size={11} className="text-amber-500" />}
                  {username || '—'}
                </p>
              </div>
              <button
                onClick={onRefresh}
                disabled={loading}
                title="Volver a analizar el equipo"
                className="w-7 h-7 grid place-items-center rounded-lg text-muted hover:text-fg hover:bg-surface-2 disabled:opacity-50"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={onRefresh}
            disabled={loading}
            title="Volver a analizar el equipo"
            className="w-full h-10 grid place-items-center rounded-xl text-muted hover:text-fg hover:bg-surface/60 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        )}

        <button
          onClick={() => setSidebarCollapsed(!collapsed)}
          className={cx('w-full h-8 flex items-center gap-2 rounded-lg text-[12px] text-subtle hover:text-fg hover:bg-surface/60 transition-colors', collapsed ? 'justify-center' : 'px-2.5')}
          title={collapsed ? 'Expandir menú' : 'Contraer menú'}
        >
          {collapsed ? <PanelLeftOpen size={15} /> : <><PanelLeftClose size={15} /> Contraer</>}
        </button>
      </div>
    </aside>
  );
}
