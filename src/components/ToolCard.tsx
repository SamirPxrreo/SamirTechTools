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
  ok: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  error: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-sky-50 text-sky-700 border-sky-200',
};

const accentColors: Record<string, string> = {
  blue: 'text-indigo-600 bg-indigo-50',
  green: 'text-emerald-600 bg-emerald-50',
  yellow: 'text-amber-600 bg-amber-50',
  red: 'text-red-600 bg-red-50',
  purple: 'text-violet-600 bg-violet-50',
  cyan: 'text-cyan-600 bg-cyan-50',
  orange: 'text-orange-600 bg-orange-50',
  pink: 'text-pink-600 bg-pink-50',
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
    <div className="bg-white border border-slate-200 rounded-[20px] p-4 flex flex-col shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className={`w-9 h-9 grid place-items-center rounded-xl shrink-0 ${accentColors[accentColor] || accentColors.blue}`}>{icon}</span>
          <div className="min-w-0">
            <h3 className="text-[13px] font-semibold text-slate-900 leading-none">{title}</h3>
            {description && <p className="text-[11px] text-slate-500 leading-snug mt-1 line-clamp-2">{description}</p>}
          </div>
        </div>
        {status && statusText && (
          <span className={`text-[10px] px-2 py-1 rounded-full font-semibold tracking-wide border shrink-0 ${statusColors[status]}`}>
            {statusText}
          </span>
        )}
      </div>

      {children && <div className="mb-3">{children}</div>}

      {(primaryAction || secondaryAction) && (
        <div className="flex gap-2 mt-auto pt-3 border-t border-slate-100 flex-wrap">
          {primaryAction && (
            <button
              onClick={primaryOnClick}
              disabled={loading}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-[12px] font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
            >
              {loading && (
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
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
              className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-[12px] font-medium rounded-xl transition-colors"
            >
              {secondaryAction}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
