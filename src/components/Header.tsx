import React from 'react';
import { Minus, Square, X } from 'lucide-react';

interface HeaderProps {
  computerName: string;
  username: string;
  isAdmin: boolean;
  version: string;
}

export function Header({ computerName, username, isAdmin, version }: HeaderProps) {
  return (
    <header className="h-10 bg-dark-900 border-b border-dark-700 flex items-center justify-between px-4 select-none">
      <div className="flex items-center gap-6">
        <span className="text-sm font-semibold text-white tracking-wide">SamirTechTools</span>
        <div className="flex items-center gap-4 text-xs text-dark-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-dark-500" />
            {computerName}
          </span>
          <span>{username}</span>
          <span className={`flex items-center gap-1 ${isAdmin ? 'text-green-400' : 'text-yellow-400'}`}>
            <span className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-green-400' : 'bg-yellow-400'}`} />
            {isAdmin ? 'Administrador' : 'Usuario estándar'}
          </span>
          <span className="text-dark-500">v{version}</span>
        </div>
      </div>
      <div className="flex items-center">
        <button
          onClick={() => window.electronAPI?.minimize()}
          className="p-2 hover:bg-dark-700 transition-colors text-dark-400 hover:text-white"
        >
          <Minus size={14} />
        </button>
        <button
          onClick={() => window.electronAPI?.maximize()}
          className="p-2 hover:bg-dark-700 transition-colors text-dark-400 hover:text-white"
        >
          <Square size={12} />
        </button>
        <button
          onClick={() => window.electronAPI?.close()}
          className="p-2 hover:bg-red-600 transition-colors text-dark-400 hover:text-white"
        >
          <X size={14} />
        </button>
      </div>
    </header>
  );
}
