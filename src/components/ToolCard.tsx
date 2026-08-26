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
  ok: 'bg-green-100 text-green-700 border border-green-300',
  warning: 'bg-yellow-100 text-yellow-700 border border-yellow-300',
  error: 'bg-red-100 text-red-700 border border-red-300',
  info: 'bg-blue-100 text-blue-700 border border-blue-300',
};

const accentColors: Record<string, string> = {
  blue: 'text-blue-600',
  green: 'text-green-600',
  yellow: 'text-yellow-600',
  red: 'text-red-600',
  purple: 'text-purple-600',
  cyan: 'text-cyan-600',
  orange: 'text-orange-600',
  pink: 'text-pink-600',
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
    <div className="bg-white border border-neutral-300 rounded-md p-3 flex flex-col hover:border-neutral-400 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`flex-shrink-0 ${accentColors[accentColor] || accentColors.blue}`}>{icon}</span>
          <h3 className="text-xs font-semibold text-neutral-800 leading-snug">{title}</h3>
        </div>
        {status && statusText && (
          <span className={`text-[9px] px-1.5 py-0.5 rounded-sm font-semibold uppercase tracking-wide flex-shrink-0 ${statusColors[status]}`}>
            {statusText}
          </span>
        )}
      </div>

      {description && <p className="text-[10px] text-neutral-500 mb-2 leading-relaxed">{description}</p>}
      {children && <div className="mb-2">{children}</div>}

      {(primaryAction || secondaryAction) && (
        <div className="flex gap-1.5 mt-auto pt-1 flex-wrap">
          {primaryAction && (
            <button
              onClick={primaryOnClick}
              disabled={loading}
              className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-900 text-white text-[11px] font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
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
              className="px-2.5 py-1.5 bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-700 text-[11px] font-medium rounded transition-colors"
            >
              {secondaryAction}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
