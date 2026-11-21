import React, { ReactNode } from 'react';
import { cx } from './ui';

interface SystemCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: ReactNode;
  /** Clase de color opcional para el valor (p. ej. 'text-emerald-500') */
  color?: string;
  className?: string;
}

/** Celda compacta de dato (label + valor) usada dentro de tarjetas. */
export function SystemCard({ title, value, subtitle, icon, color, className }: SystemCardProps) {
  return (
    <div className={cx('rounded-xl bg-surface-2/70 border border-line/70 px-3 py-2.5 min-w-0', className)}>
      <div className="flex items-center gap-1.5">
        {icon && <span className="text-subtle shrink-0">{icon}</span>}
        <span className="text-[11px] text-subtle truncate">{title}</span>
      </div>
      <div className={cx('text-[13px] font-semibold mt-0.5 break-words leading-snug select-text', color && color.startsWith('text-') && !color.includes('slate') ? color : 'text-fg')} title={value}>
        {value}
      </div>
      {subtitle && <div className="text-[11px] text-muted mt-0.5 select-text">{subtitle}</div>}
    </div>
  );
}
