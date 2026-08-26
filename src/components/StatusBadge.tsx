import React from 'react';

interface StatusBadgeProps {
  status: 'ok' | 'warning' | 'error' | 'info';
  children: React.ReactNode;
}

const colors = {
  ok: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  error: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-sky-50 text-sky-700 border-sky-200',
};

export function StatusBadge({ status, children }: StatusBadgeProps) {
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${colors[status]}`}>
      {children}
    </span>
  );
}

interface ProgressBarProps {
  value: number;
  color?: string;
  height?: string;
  showLabel?: boolean;
}

export function ProgressBar({ value, color, height = 'h-2', showLabel = false }: ProgressBarProps) {
  const getColor = () => {
    if (color) return color;
    if (value < 50) return 'bg-emerald-500';
    if (value < 80) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full">
      <div className={`w-full bg-slate-200 rounded-full ${height}`}>
        <div
          className={`${getColor()} ${height} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-[10px] text-slate-500 mt-1 block">{Math.round(value)}%</span>
      )}
    </div>
  );
}
