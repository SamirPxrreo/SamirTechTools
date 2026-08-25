import React, { useState } from 'react';
import { Terminal, Shield, Package, Wrench, Info } from 'lucide-react';
import { ToolCard, ConsoleOutput, ConfirmModal } from '../components';
import { useLogs } from '../context/LogContext';

const CTT_CMD =
  'powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process powershell -Verb RunAs -ArgumentList \'-NoProfile -ExecutionPolicy Bypass -Command irm https://christitus.com/win | iex\'"';

export function ChrisTitusPage() {
  const { addLog } = useLogs();
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const launchCTT = () => {
    setConfirmOpen(true);
  };

  const confirmLaunch = () => {
    setConfirmOpen(false);
    setLoading(true);
    setOutput('');
    addLog('ChrisTitusTech', 'Lanzando', 'irm https://christitus.com/win | iex', 'info');
    window.electronAPI.runCommand(CTT_CMD).then(r => {
      setOutput(r.output || 'Ventana de PowerShell lanzada. Usa la herramienta en la ventana que se abrió.');
      log(r.success ? 'success' : 'error');
      setLoading(false);
    });
  };

  const log = (level: 'success' | 'error') => {
    addLog('ChrisTitusTech', level === 'success' ? 'Lanzado' : 'Error', level === 'success' ? 'Winutil abierto en ventana de administrador' : 'Falló el lanzamiento', level);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-white">ChrisTitus Tech - Winutil</h1>
        <p className="text-xs text-dark-400 mt-1">Utilidad todo-en-uno para configurar, debloat y reparar Windows</p>
      </div>

      <div className="bg-dark-800/50 border border-dark-700 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-dark-200 font-medium">¿Qué es Winutil?</p>
            <p className="text-[11px] text-dark-400 mt-1">
              Herramienta de Chris Titus Tech con: Tweaks (quitar bloatware), Configuración de Windows,
              Actualizaciones de seguridad, Instalación de programas clásicos y más.
              Se descarga y ejecuta directamente desde los servidores de christitus.com.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ToolCard
          icon={<Terminal size={20} />}
          title="Abrir Winutil"
          description="Descarga y ejecuta la última versión de winutil en una ventana de PowerShell como administrador"
          status="ok"
          statusText="Oficial"
          accentColor="blue"
          primaryAction="Ejecutar"
          primaryOnClick={launchCTT}
          secondaryAction="Sitio web"
          secondaryOnClick={() => window.electronAPI.openExternal('https://christitus.com')}
          loading={loading}
        />

        <ToolCard
          icon={<Package size={20} />}
          title="GitHub del proyecto"
          description="Código fuente, documentación y releases de winutil"
          accentColor="cyan"
          primaryAction="Abrir GitHub"
          primaryOnClick={() => window.electronAPI.openExternal('https://github.com/ChrisTitusTech/winutil')}
        />
      </div>

      {(output || loading) && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-dark-300 mb-2">Consola</h3>
          <ConsoleOutput output={output} loading={loading} />
        </div>
      )}

      <ConfirmModal
        isOpen={confirmOpen}
        title="Ejecutar Winutil"
        message={'Se abrirá una ventana de PowerShell como administrador y se ejecutará:\n\nirm https://christitus.com/win | iex\n\nRequiere internet. ¿Continuar?'}
        confirmText="Ejecutar"
        onConfirm={confirmLaunch}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
