import React from 'react';
import { Badge, cx } from './ui';

interface StatusBadgeProps {
  status: 'ok' | 'warning' | 'error' | 'info';
  children: React.ReactNode;
}

export function StatusBadge({ status, children }: StatusBadgeProps) {
  return <Badge status={status} dot>{children}</Badge>;
}

interface ProgressBarProps {
  value: number;
  /** Clase de color opcional (bg-*). Si no se pasa, se elige por umbral. */
  color?: string;
  height?: string;
  showLabel?: boolean;
  indeterminate?: boolean;
}

export function ProgressBar({ value, color, height = 'h-1.5', showLabel = false, indeterminate = false }: ProgressBarProps) {
  const auto = value < 70 ? 'bg-accent' : value < 90 ? 'bg-amber-500' : 'bg-red-500';
  const pct = Math.max(0, Math.min(value, 100));
  return (
    <div className="w-full">
      <div className={cx('w-full rounded-full bg-line/70 overflow-hidden', height)}>
        {indeterminate ? (
          <div className="h-full w-full skeleton" />
        ) : (
          <div className={cx('h-full rounded-full transition-[width] duration-500 ease-out', color || auto)} style={{ width: `${pct}%` }} />
        )}
      </div>
      {showLabel && <span className="text-[11px] text-muted mt-1 block tabular-nums">{Math.round(value)}%</span>}
    </div>
  );
}
