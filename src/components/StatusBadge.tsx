import React from 'react';

interface StatusBadgeProps {
  status: 'ok' | 'warning' | 'error' | 'info';
  children: React.ReactNode;
}

const colors = {
  ok: 'bg-green-500/10 text-green-400 border-green-500/20',
  warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  error: 'bg-red-500/10 text-red-400 border-red-500/20',
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
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
    if (value < 50) return 'bg-green-500';
    if (value < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full">
      <div className={`w-full bg-dark-700 rounded-full ${height}`}>
        <div
          className={`${getColor()} ${height} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-[10px] text-dark-400 mt-1 block">{Math.round(value)}%</span>
      )}
    </div>
  );
}
