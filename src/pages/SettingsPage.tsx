import React, { ReactNode } from 'react';
import { Settings, Sun, Moon, Laptop, Gauge, PanelLeft, ScrollText, Github, Info, Check, FolderInput } from 'lucide-react';
import { PageHeader, Switch, IconTile, Button, Badge, cx } from '../components';
import { usePrefs, ThemePref } from '../context/PrefsContext';
import { APP_VERSION } from '../config/constants';
import appIcon from '/icon.png';

function Row({ icon, tone, title, description, control }: { icon: ReactNode; tone: string; title: string; description: string; control: ReactNode }) {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <IconTile tone={tone} size="sm">{icon}</IconTile>
      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] font-medium text-fg">{title}</p>
        <p className="text-[12.5px] text-muted mt-0.5">{description}</p>
      </div>
      {control}
    </div>
  );
}

const themes: { id: ThemePref; label: string; icon: ReactNode; preview: string }[] = [
  { id: 'light', label: 'Claro', icon: <Sun size={14} />, preview: 'bg-[#f5f6f8]' },
  { id: 'dark', label: 'Oscuro', icon: <Moon size={14} />, preview: 'bg-[#0a0c10]' },
  { id: 'system', label: 'Sistema', icon: <Laptop size={14} />, preview: 'bg-gradient-to-r from-[#f5f6f8] from-50% to-[#0a0c10] to-50%' },
];

export function SettingsPage() {
  const { theme, setTheme, autoDiagnose, setAutoDiagnose, sidebarCollapsed, setSidebarCollapsed, logOpen, setLogOpen, askLocation, setAskLocation } = usePrefs();

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader icon={<Settings size={20} />} tone="slate" title="Ajustes" description="Preferencias de la aplicación. Se guardan automáticamente en este equipo." />

      {/* Apariencia */}
      <section className="card">
        <div className="px-5 pt-5 pb-4">
          <h2 className="text-[13.5px] font-semibold text-fg">Apariencia</h2>
          <p className="text-[12.5px] text-muted mt-0.5">Elige el tema de la interfaz.</p>
          <div className="grid grid-cols-3 gap-3 mt-4">
            {themes.map(t => {
              const active = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={cx(
                    'relative rounded-xl border p-2 text-left transition-all',
                    active ? 'border-accent ring-4 ring-accent/15' : 'border-line hover:border-line-strong',
                  )}
                >
                  <div className={cx('h-16 rounded-lg border border-black/5 overflow-hidden relative', t.preview)}>
                    <div className="absolute left-2 top-2 bottom-2 w-6 rounded-md bg-white/10 ring-1 ring-black/10" />
                    <div className="absolute left-10 right-2 top-2 h-2.5 rounded bg-indigo-500/70" />
                    <div className="absolute left-10 right-8 top-6 h-2 rounded bg-slate-400/30" />
                    <div className="absolute left-10 right-12 top-9 h-2 rounded bg-slate-400/30" />
                  </div>
                  <div className="flex items-center justify-between mt-2 px-1">
                    <span className="flex items-center gap-1.5 text-[12.5px] font-medium text-fg">{t.icon}{t.label}</span>
                    {active && <span className="w-4 h-4 rounded-full bg-accent text-white grid place-items-center"><Check size={10} strokeWidth={3} /></span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comportamiento */}
      <section className="card divide-y divide-line">
        <div className="px-5 pt-5 pb-3">
          <h2 className="text-[13.5px] font-semibold text-fg">Comportamiento</h2>
        </div>
        <Row
          icon={<Gauge size={15} />} tone="indigo"
          title="Diagnóstico automático"
          description="Analizar el hardware al abrir la aplicación."
          control={<Switch checked={autoDiagnose} onChange={setAutoDiagnose} label="Diagnóstico automático" />}
        />
        <Row
          icon={<PanelLeft size={15} />} tone="violet"
          title="Menú lateral compacto"
          description="Mostrar solo los iconos en la barra lateral."
          control={<Switch checked={sidebarCollapsed} onChange={setSidebarCollapsed} label="Menú compacto" />}
        />
        <Row
          icon={<FolderInput size={15} />} tone="amber"
          title="Preguntar dónde guardar"
          description="Si está apagado, las descargas e instalaciones usan sus carpetas predeterminadas (C:\Office, C:\OfficeISO, C:\ExtraApps) y se crean solas."
          control={<Switch checked={askLocation} onChange={setAskLocation} label="Preguntar dónde guardar" />}
        />
        <Row
          icon={<ScrollText size={15} />} tone="emerald"
          title="Registro expandido"
          description="Mostrar el panel de registro abierto en la parte inferior."
          control={<Switch checked={logOpen} onChange={setLogOpen} label="Registro expandido" />}
        />
      </section>

      {/* Acerca de */}
      <section className="card p-5 flex items-center gap-4 flex-wrap">
        <img src={appIcon} alt="" className="w-12 h-12 rounded-2xl ring-1 ring-line" />
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2">
            <p className="text-[15px] font-semibold text-fg">SamirTech<span className="text-accent-fg">Tools</span></p>
            <Badge status="accent">v{APP_VERSION}</Badge>
          </div>
          <p className="text-[12.5px] text-muted mt-0.5 flex items-center gap-1.5">
            <Info size={12} /> Electron · React · TypeScript — Windows 10/11
          </p>
        </div>
        <Button icon={<Github size={14} />} onClick={() => window.electronAPI.openExternal('https://github.com/SamirPxrreo/SamirTechTools')}>
          Repositorio
        </Button>
      </section>
    </div>
  );
}
