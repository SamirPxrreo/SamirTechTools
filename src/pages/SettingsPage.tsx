import React from 'react';
import { Settings as SettingsIcon, Moon, Sun, Info, Code, Globe } from 'lucide-react';
import { ToolCard, SystemCard } from '../components';

export function SettingsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-white">Configuración</h1>
        <p className="text-xs text-dark-400 mt-1">Preferencias de la aplicación</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ToolCard
          icon={<Moon size={20} />}
          title="Tema"
          description="Tema oscuro (predeterminado)"
          accentColor="purple"
          primaryAction="Cambiar"
          primaryOnClick={() => {}}
        />

        <ToolCard
          icon={<Info size={20} />}
          title="Diagnóstico automático"
          description="Ejecutar diagnóstico al iniciar la aplicación"
          accentColor="green"
          primaryAction="Configurar"
          primaryOnClick={() => {}}
        />

        <ToolCard
          icon={<Code size={20} />}
          title="Acerca de"
          description="SamirTechTools v1.0.0"
          accentColor="blue"
        >
          <div className="space-y-1">
            <div className="text-[10px] text-dark-400">
              Versión: <span className="text-dark-200">1.0.0</span>
            </div>
            <div className="text-[10px] text-dark-400">
              Framework: <span className="text-dark-200">Electron + React + TypeScript</span>
            </div>
            <div className="text-[10px] text-dark-400">
              Plataforma: <span className="text-dark-200">Windows 10/11</span>
            </div>
          </div>
        </ToolCard>

        <ToolCard
          icon={<Globe size={20} />}
          title="Idioma"
          description="Español (predeterminado)"
          accentColor="cyan"
          primaryAction="Cambiar"
          primaryOnClick={() => {}}
        />
      </div>
    </div>
  );
}
