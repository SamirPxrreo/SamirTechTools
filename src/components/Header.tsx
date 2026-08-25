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
    <header className="h-11 glass-strong border-b border-white/5 flex items-center justify-between px-4 select-none z-10">
      <div className="flex items-center gap-5 min-w-0">
        <span className="text-sm font-bold tracking-wide text-white hidden sm:block">
          SamirTech<span className="gradient-text">Tools</span>
        </span>
        <div className="flex items-center gap-3 md:gap-4 text-[11px] text-dark-400 min-w-0 overflow-hidden">
          <span className="hidden md:flex items-center gap-1.5 min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-dark-500 flex-shrink-0" />
            <span className="truncate">{computerName}</span>
          </span>
          <span className="hidden lg:block truncate">{username}</span>
          <span className={`flex items-center gap-1.5 flex-shrink-0 ${isAdmin ? 'text-green-400' : 'text-yellow-400'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isAdmin ? 'bg-green-400' : 'bg-yellow-400'} shadow-glow`} />
            {isAdmin ? 'Admin' : 'Usuario'}
          </span>
          <span className="text-dark-600 hidden sm:block">v{version}</span>
        </div>
      </div>
      <div className="flex items-center -mr-2">
        <button
          onClick={() => window.electronAPI?.minimize()}
          className="p-2.5 hover:bg-white/10 transition-colors text-dark-400 hover:text-white rounded-lg"
        >
          <Minus size={14} />
        </button>
        <button
          onClick={() => window.electronAPI?.maximize()}
          className="p-2.5 hover:bg-white/10 transition-colors text-dark-400 hover:text-white rounded-lg"
        >
          <Square size={11} />
        </button>
        <button
          onClick={() => window.electronAPI?.close()}
          className="p-2.5 hover:bg-red-600 transition-colors text-dark-400 hover:text-white rounded-lg"
        >
          <X size={14} />
        </button>
      </div>
    </header>
  );
}
