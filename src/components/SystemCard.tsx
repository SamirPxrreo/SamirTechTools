import React, { ReactNode } from 'react';

interface SystemCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: ReactNode;
  color?: string;
}

export function SystemCard({ title, value, subtitle, icon, color = 'text-slate-900' }: SystemCardProps) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
      <div className="flex items-center gap-1.5 mb-1">
        {icon && <span className="text-slate-500">{icon}</span>}
        <span className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">{title}</span>
      </div>
      <div className="text-[13px] font-semibold text-slate-900 truncate" title={value}>{value}</div>
      {subtitle && <div className="text-[11px] text-slate-500 mt-0.5">{subtitle}</div>}
    </div>
  );
}
