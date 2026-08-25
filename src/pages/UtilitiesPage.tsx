import React, { useState } from 'react';
import { Wrench, Monitor, Activity, ListTodo, Server, HardDrive, Settings, Wifi, Globe, RefreshCw, Trash2, Shield, Zap } from 'lucide-react';
import { ToolCard, ConsoleOutput, ConfirmModal } from '../components';
import { useLogs } from '../context/LogContext';

export function UtilitiesPage() {
  const { addLog } = useLogs();
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTool, setActiveTool] = useState('');
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void }>({
    open: false, title: '', message: '', onConfirm: () => {}
  });

  const runTool = async (tool: string, label: string, command: string) => {
    setLoading(true);
    setOutput('');
    setActiveTool(label);
    addLog('Utilidades', `${label} - Iniciado`, command, 'info');
    try {
      const result = await window.electronAPI.executeTool(tool);
      setOutput(result.output);
      addLog('Utilidades', `${label} - Completado`, result.success ? 'Éxito' : 'Error', result.success ? 'success' : 'error');
    } catch (err) {
      setOutput(`Error: ${err}`);
      addLog('Utilidades', `${label} - Error`, String(err), 'error');
    }
    setLoading(false);
  };

  const openTool = (command: string, label: string) => {
    addLog('Utilidades', `Abriendo ${label}`, command, 'info');
    window.electronAPI.runCommand(command);
  };

  const runPsTool = async (label: string, script: string) => {
    setLoading(true);
    setOutput('');
    setActiveTool(label);
    addLog('Utilidades', `${label} - Iniciado`, script, 'info');
    try {
      const result = await window.electronAPI.runCommand(`powershell -NoProfile -ExecutionPolicy Bypass -Command "${script.replace(/"/g, '\\"')}"`);
      setOutput(result.output);
      addLog('Utilidades', `${label} - Completado`, result.success ? 'Éxito' : 'Error', result.success ? 'success' : 'error');
    } catch (err) {
      setOutput(`Error: ${err}`);
      addLog('Utilidades', `${label} - Error`, String(err), 'error');
    }
    setLoading(false);
  };

  const confirmAndRun = (title: string, message: string, fn: () => void, danger = false) => {
    setConfirmModal({ open: true, title, message, onConfirm: () => { setConfirmModal({ open: false, title: '', message: '', onConfirm: () => {} }); fn(); } });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-white">Utilidades del Sistema</h1>
        <p className="text-xs text-dark-400 mt-1">Herramientas de diagnóstico, mantenimiento y optimización</p>
      </div>

      {/* System Tools */}
      <div>
        <h2 className="text-sm font-semibold text-dark-200 mb-3 flex items-center gap-2">
          <Monitor size={14} /> Sistema
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <ToolCard
            icon={<Monitor size={20} />}
            title="Información del sistema"
            description="Muestra información detallada del hardware y software"
            accentColor="blue"
            primaryAction="Ejecutar"
            primaryOnClick={() => runTool('systeminfo', 'System Info', 'systeminfo')}
            loading={loading && activeTool === 'System Info'}
          />
          <ToolCard
            icon={<Activity size={20} />}
            title="Administrador de tareas"
            description="Abre el Administrador de tareas de Windows"
            accentColor="green"
            primaryAction="Abrir"
            primaryOnClick={() => openTool('taskmgr', 'Admin. de tareas')}
          />
          <ToolCard
            icon={<ListTodo size={20} />}
            title="Procesos activos"
            description="Lista todos los procesos en ejecución con uso de memoria"
            accentColor="yellow"
            primaryAction="Ejecutar"
            primaryOnClick={() => runTool('tasklist', 'Lista de procesos', 'tasklist /fo csv')}
            loading={loading && activeTool === 'Lista de procesos'}
          />
          <ToolCard
            icon={<Server size={20} />}
            title="Servicios"
            description="Gestiona los servicios del sistema Windows"
            accentColor="purple"
            primaryAction="Abrir"
            primaryOnClick={() => openTool('services.msc', 'Servicios')}
          />
          <ToolCard
            icon={<HardDrive size={20} />}
            title="Administración de discos"
            description="Administra particiones y volúmenes de disco"
            accentColor="orange"
            primaryAction="Abrir"
            primaryOnClick={() => openTool('diskmgmt.msc', 'Admin. de discos')}
          />
          <ToolCard
            icon={<Settings size={20} />}
            title="Configuración de Windows"
            description="Abre la configuración del sistema"
            accentColor="cyan"
            primaryAction="Abrir"
            primaryOnClick={() => openTool('ms-settings:', 'Configuración')}
          />
        </div>
      </div>

      {/* Network Tools */}
      <div>
        <h2 className="text-sm font-semibold text-dark-200 mb-3 flex items-center gap-2">
          <Wifi size={14} /> Red
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <ToolCard
            icon={<Wifi size={20} />}
            title="IPConfig"
            description="Muestra la configuración completa de red"
            accentColor="blue"
            primaryAction="Ejecutar"
            primaryOnClick={() => runTool('ipconfig', 'IPConfig', 'ipconfig /all')}
            loading={loading && activeTool === 'IPConfig'}
          />
          <ToolCard
            icon={<Globe size={20} />}
            title="Ping"
            description="Prueba de conectividad a 8.8.8.8"
            accentColor="green"
            primaryAction="Ejecutar"
            primaryOnClick={() => runTool('ping', 'Ping', 'ping 8.8.8.8 -n 4')}
            loading={loading && activeTool === 'Ping'}
          />
          <ToolCard
            icon={<RefreshCw size={20} />}
            title="Flush DNS"
            description="Limpia la caché de resolución DNS"
            accentColor="yellow"
            primaryAction="Ejecutar"
            primaryOnClick={() => runTool('flush-dns', 'Flush DNS', 'ipconfig /flushdns')}
            loading={loading && activeTool === 'Flush DNS'}
          />
          <ToolCard
            icon={<Globe size={20} />}
            title="Tracert"
            description="Traza la ruta de conexión a un host"
            accentColor="purple"
            primaryAction="Ejecutar"
            primaryOnClick={() => runTool('tracert', 'Tracert', 'tracert 8.8.8.8')}
            loading={loading && activeTool === 'Tracert'}
          />
          <ToolCard
            icon={<Wifi size={20} />}
            title="Tabla ARP"
            description="Muestra la tabla de direcciones ARP"
            accentColor="orange"
            primaryAction="Ejecutar"
            primaryOnClick={() => runTool('arp', 'ARP Table', 'arp -a')}
            loading={loading && activeTool === 'ARP Table'}
          />
          <ToolCard
            icon={<Wifi size={20} />}
            title="Adaptadores de red"
            description="Abre la configuración de adaptadores"
            accentColor="cyan"
            primaryAction="Abrir"
            primaryOnClick={() => openTool('ncpa.cpl', 'Adaptadores de red')}
          />
        </div>
      </div>

      {/* Maintenance */}
      <div>
        <h2 className="text-sm font-semibold text-dark-200 mb-3 flex items-center gap-2">
          <Zap size={14} /> Mantenimiento
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <ToolCard
            icon={<Trash2 size={20} />}
            title="Limpiar archivos temporales"
            description="Elimina archivos temporales del sistema para liberar espacio"
            accentColor="yellow"
            primaryAction="Ejecutar"
            primaryOnClick={() => confirmAndRun(
              'Limpiar archivos temporales',
              '¿Desea eliminar los archivos temporales del sistema? Esto liberará espacio en disco.',
              () => runPsTool('Limpieza', 'Remove-Item -Path "$env:TEMP\\*" -Recurse -Force -ErrorAction SilentlyContinue; Remove-Item -Path "C:\\Windows\\Temp\\*" -Recurse -Force -ErrorAction SilentlyContinue; Write-Output "Archivos temporales eliminados"')
            )}
            loading={loading && activeTool === 'Limpieza'}
          />
          <ToolCard
            icon={<Shield size={20} />}
            title="Verificar integridad del sistema"
            description="Ejecuta SFC para verificar archivos del sistema"
            accentColor="blue"
            primaryAction="Ejecutar"
            primaryOnClick={() => confirmAndRun(
              'Verificar integridad',
              '¿Desea ejecutar SFC /SCANNOW? Requiere permisos de administrador.',
              () => runTool('sfc', 'SFC /SCANNOW', 'sfc /scannow'),
              true
            )}
            loading={loading && activeTool === 'SFC /SCANNOW'}
          />
          <ToolCard
            icon={<RefreshCw size={20} />}
            title="Actualizar controladores"
            description="Busca actualizaciones de controladores"
            accentColor="green"
            primaryAction="Abrir"
            primaryOnClick={() => openTool('ms-settings:windowsupdate', 'Windows Update')}
          />
        </div>
      </div>

      {(output || loading) && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-dark-300 mb-2">Consola - {activeTool}</h3>
          <ConsoleOutput output={output} loading={loading} />
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Continuar"
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ ...confirmModal, open: false })}
      />
    </div>
  );
}
