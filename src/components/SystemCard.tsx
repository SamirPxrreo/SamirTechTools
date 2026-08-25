import React, { ReactNode } from 'react';

interface SystemCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: ReactNode;
  color?: string;
}

export function SystemCard({ title, value, subtitle, icon, color = 'text-primary-400' }: SystemCardProps) {
  return (
    <div className="bg-dark-800/50 rounded-lg p-3 border border-dark-700/50">
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className={color}>{icon}</span>}
        <span className="text-[10px] text-dark-400 uppercase tracking-wider">{title}</span>
      </div>
      <div className={`text-sm font-semibold ${color}`}>{value}</div>
      {subtitle && <div className="text-[10px] text-dark-500 mt-0.5">{subtitle}</div>}
    </div>
  );
}
