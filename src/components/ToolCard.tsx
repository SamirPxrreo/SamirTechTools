import React, { ReactNode } from 'react';

interface ToolCardProps {
  icon: ReactNode;
  title: string;
  description?: string;
  status?: 'ok' | 'warning' | 'error' | 'info';
  statusText?: string;
  accentColor?: string;
  primaryAction?: string;
  primaryOnClick?: () => void;
  secondaryAction?: string;
  secondaryOnClick?: () => void;
  loading?: boolean;
  children?: ReactNode;
}

const statusColors = {
  ok: 'bg-green-500/15 text-green-300 border border-green-500/25',
  warning: 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/25',
  error: 'bg-red-500/15 text-red-300 border border-red-500/25',
  info: 'bg-primary-500/15 text-primary-300 border border-primary-500/25',
};

const accentGlow: Record<string, string> = {
  blue: 'text-blue-400 bg-blue-500/10 ring-blue-500/20',
  green: 'text-green-400 bg-green-500/10 ring-green-500/20',
  yellow: 'text-yellow-400 bg-yellow-500/10 ring-yellow-500/20',
  red: 'text-red-400 bg-red-500/10 ring-red-500/20',
  purple: 'text-purple-400 bg-purple-500/10 ring-purple-500/20',
  cyan: 'text-cyan-400 bg-cyan-500/10 ring-cyan-500/20',
  orange: 'text-orange-400 bg-orange-500/10 ring-orange-500/20',
  pink: 'text-pink-400 bg-pink-500/10 ring-pink-500/20',
};

export function ToolCard({
  icon,
  title,
  description,
  status,
  statusText,
  accentColor = 'blue',
  primaryAction,
  primaryOnClick,
  secondaryAction,
  secondaryOnClick,
  loading = false,
  children,
}: ToolCardProps) {
  return (
    <div className="glass rounded-2xl p-5 card-hover flex flex-col">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`p-2.5 rounded-xl ring-1 flex-shrink-0 ${accentGlow[accentColor] || accentGlow.blue}`}>
            {icon}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-white leading-snug">{title}</h3>
            {description && <p className="text-[11px] text-dark-400 mt-1 leading-relaxed">{description}</p>}
          </div>
        </div>
        {status && statusText && (
          <span className={`text-[9px] px-2 py-1 rounded-full font-semibold tracking-wide uppercase flex-shrink-0 ${statusColors[status]}`}>
            {statusText}
          </span>
        )}
      </div>

      {children && <div className="mb-4">{children}</div>}

      {(primaryAction || secondaryAction) && (
        <div className="flex gap-2 mt-auto pt-2 flex-wrap">
          {primaryAction && (
            <button
              onClick={primaryOnClick}
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 active:opacity-90 text-white text-xs font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-glow"
            >
              {loading && (
                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {primaryAction}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryOnClick}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-dark-200 text-xs font-medium rounded-xl transition-all duration-200"
            >
              {secondaryAction}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
