import React from 'react';
import { Gauge, PackagePlus, Boxes, FileText, Monitor, Network, Wrench, Trash2, Settings, LucideIcon } from 'lucide-react';
import { Page } from '../types';
import { APPS } from '../data/apps';

export type NavItem = { id: Page; label: string; desc: string; icon: LucideIcon; tone: string };
export type NavGroup = { label: string; items: NavItem[] };

export const NAV: NavGroup[] = [
  {
    label: 'General',
    items: [{ id: 'dashboard', label: 'Diagnóstico', desc: 'Resumen del equipo', icon: Gauge, tone: 'indigo' }],
  },
  {
    label: 'Instalación',
    items: [
      { id: 'install', label: 'Instalar apps', desc: `${APPS.length} apps vía WinGet`, icon: PackagePlus, tone: 'violet' },
      { id: 'extra-apps', label: 'Otras apps', desc: 'Descargas directas', icon: Boxes, tone: 'pink' },
      { id: 'office', label: 'Office', desc: 'Instalar · activar · reparar', icon: FileText, tone: 'orange' },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { id: 'windows', label: 'Windows', desc: 'SFC · DISM · Defender', icon: Monitor, tone: 'sky' },
      { id: 'network', label: 'Red', desc: 'Ping · DNS · IP', icon: Network, tone: 'cyan' },
      { id: 'utilities', label: 'Utilidades', desc: 'Herramientas y limpieza', icon: Wrench, tone: 'amber' },
      { id: 'uninstaller', label: 'Desinstalador', desc: 'Limpieza profunda', icon: Trash2, tone: 'red' },
    ],
  },
];

export const NAV_FOOTER: NavItem = { id: 'settings', label: 'Ajustes', desc: 'Preferencias', icon: Settings, tone: 'slate' };

export const ALL_NAV: (NavItem & { group: string })[] = [
  ...NAV.flatMap(g => g.items.map(i => ({ ...i, group: g.label }))),
  { ...NAV_FOOTER, group: 'Config' },
];

export const findNav = (id: Page) => ALL_NAV.find(n => n.id === id);
