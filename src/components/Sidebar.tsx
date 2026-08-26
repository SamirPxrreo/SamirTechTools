import React from 'react';
import { RefreshCw, ShieldCheck, ShieldAlert, User, Monitor, ScrollText } from 'lucide-react';

interface SidebarProps {
  computerName: string;
  username: string;
  isAdmin: boolean;
  loading: boolean;
  onRefresh: () => void;
}

export function Sidebar({ computerName, username, isAdmin, loading, onRefresh }: SidebarProps) {
  return (
    <aside className="w-56 flex-shrink-0 border-r border-neutral-300 bg-neutral-50 flex flex-col">
      <div className="p-3">
        <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-2">Acciones</p>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="w-full mb-2 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-neutral-300 rounded text-xs font-medium text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Actualizar diagnóstico
        </button>
      </div>

      <div className="px-3 pb-3 border-b border-neutral-200">
        <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-2">Sistema</p>
        <div className="space-y-1.5 text-[11px] text-neutral-600">
          <div className="flex items-center gap-2">
            <Monitor size={13} className="text-neutral-400 flex-shrink-0" />
            <span className="truncate">{computerName || '...'}</span>
          </div>
          <div className="flex items-center gap-2">
            <User size={13} className="text-neutral-400 flex-shrink-0" />
            <span className="truncate">{username || '...'}</span>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin ? (
              <ShieldCheck size={13} className="text-green-600 flex-shrink-0" />
            ) : (
              <ShieldAlert size={13} className="text-yellow-600 flex-shrink-0" />
            )}
            <span className={isAdmin ? 'text-green-700 font-semibold' : 'text-yellow-700 font-semibold'}>
              {isAdmin ? 'Administrador' : 'Sin privilegios'}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-auto p-3">
        <p className="text-[10px] text-neutral-400 leading-relaxed">
          SamirTechTools v1.0.0<br />
          Diagnóstico y mantenimiento
        </p>
      </div>
    </aside>
  );
}
