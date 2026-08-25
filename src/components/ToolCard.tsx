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
  ok: 'bg-green-500/10 text-green-400 border-green-500/20',
  warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  error: 'bg-red-500/10 text-red-400 border-red-500/20',
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

const accentBorders: Record<string, string> = {
  blue: 'border-l-blue-500',
  green: 'border-l-green-500',
  yellow: 'border-l-yellow-500',
  red: 'border-l-red-500',
  purple: 'border-l-purple-500',
  cyan: 'border-l-cyan-500',
  orange: 'border-l-orange-500',
  pink: 'border-l-pink-500',
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
    <div
      className={`bg-dark-800/80 border border-dark-700 rounded-xl p-5 hover:border-dark-600 transition-all duration-300 hover:shadow-lg hover:shadow-black/20 border-l-4 ${accentBorders[accentColor] || 'border-l-blue-500'}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-dark-700/50 text-${accentColor}-400`}>
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            {description && <p className="text-xs text-dark-400 mt-0.5">{description}</p>}
          </div>
        </div>
        {status && statusText && (
          <span className={`text-[10px] px-2 py-1 rounded-full border ${statusColors[status]}`}>
            {statusText}
          </span>
        )}
      </div>

      {children && <div className="mb-4">{children}</div>}

      {(primaryAction || secondaryAction) && (
        <div className="flex gap-2 mt-auto">
          {primaryAction && (
            <button
              onClick={primaryOnClick}
              disabled={loading}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white text-xs font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
              className="px-4 py-2 bg-dark-700 hover:bg-dark-600 active:bg-dark-500 text-dark-200 text-xs font-medium rounded-lg transition-all duration-200"
            >
              {secondaryAction}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
