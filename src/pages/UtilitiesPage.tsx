import React, { useState } from 'react';
import {
  Wrench, Monitor, Activity, ListTodo, Server, HardDrive, Settings, Wifi, Disc, Globe, RefreshCw, Trash2, ShieldCheck,
  Zap, Route, ListTree, Network, DownloadCloud,
} from 'lucide-react';
import { ToolCard, ConsoleOutput, ConfirmModal, PageHeader, Section, Grid } from '../components';
import { useLogs } from '../context/LogContext';

export function UtilitiesPage() {
  const { addLog } = useLogs();
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTool, setActiveTool] = useState('');
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; title: string; message: string; danger: boolean; onConfirm: () => void }>({
    open: false, title: '', message: '', danger: false, onConfirm: () => {},
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

  const closeModal = () => setConfirmModal(m => ({ ...m, open: false }));
  const confirmAndRun = (title: string, message: string, fn: () => void, danger = false) => {
    setConfirmModal({ open: true, title, message, danger, onConfirm: () => { closeModal(); fn(); } });
  };

  const busy = (l: string) => loading && activeTool === l;

  return (
    <div className="space-y-8">
      <PageHeader
        icon={<Wrench size={20} />}
        tone="amber"
        title="Utilidades del sistema"
        description="Accesos rápidos de diagnóstico, mantenimiento y optimización"
      />

      <Section title="Mantenimiento" icon={<Zap size={14} />} description="Tareas que modifican el sistema: se pide confirmación">
        <Grid>
          <ToolCard
            icon={<Trash2 size={18} />}
            title="Limpiar archivos temporales"
            description="Elimina el contenido de %TEMP% y C:\Windows\Temp para liberar espacio."
            accentColor="amber"
            primaryAction="Limpiar"
            primaryOnClick={() => confirmAndRun(
              'Limpiar archivos temporales',
              '¿Eliminar los archivos temporales del sistema? Esto liberará espacio en disco. Los archivos en uso se omiten.',
              () => runPsTool('Limpieza', 'Remove-Item -Path "$env:TEMP\\*" -Recurse -Force -ErrorAction SilentlyContinue; Remove-Item -Path "C:\\Windows\\Temp\\*" -Recurse -Force -ErrorAction SilentlyContinue; Write-Output "Archivos temporales eliminados"'),
            )}
            loading={busy('Limpieza')}
            disabled={loading}
          />
          <ToolCard
            icon={<ShieldCheck size={18} />}
            title="Verificar integridad del sistema"
            description="Ejecuta SFC /SCANNOW para reparar archivos del sistema."
            status="warning"
            statusText="Admin"
            accentColor="indigo"
            primaryAction="Ejecutar"
            primaryOnClick={() => confirmAndRun(
              'Verificar integridad',
              '¿Ejecutar SFC /SCANNOW? Requiere permisos de administrador y puede tardar varios minutos.',
              () => runTool('sfc', 'SFC /SCANNOW', 'sfc /scannow'),
              true,
            )}
            loading={busy('SFC /SCANNOW')}
            disabled={loading}
          />
          <ToolCard
            icon={<RefreshCw size={18} />}
            title="Actualizar controladores"
            description="Abre Windows Update para buscar controladores y actualizaciones opcionales."
            accentColor="emerald"
            primaryAction="Abrir"
            primaryOnClick={() => openTool('ms-settings:windowsupdate', 'Windows Update')}
          />
        </Grid>
      </Section>

      <Section title="Sistema" icon={<Monitor size={14} />}>
        <Grid>
          <ToolCard icon={<Monitor size={18} />} title="Información del sistema" description="Informe detallado de hardware y software (systeminfo)." accentColor="indigo"
            primaryAction="Ejecutar" primaryOnClick={() => runTool('systeminfo', 'System Info', 'systeminfo')} loading={busy('System Info')} disabled={loading} />
          <ToolCard icon={<ListTodo size={18} />} title="Procesos activos" description="Lista los procesos en ejecución con su uso de memoria." accentColor="amber"
            primaryAction="Ejecutar" primaryOnClick={() => runTool('tasklist', 'Lista de procesos', 'tasklist /fo csv')} loading={busy('Lista de procesos')} disabled={loading} />
          <ToolCard icon={<Activity size={18} />} title="Administrador de tareas" description="Abre el Administrador de tareas de Windows." accentColor="emerald"
            primaryAction="Abrir" primaryOnClick={() => openTool('taskmgr', 'Admin. de tareas')} />
          <ToolCard icon={<Server size={18} />} title="Servicios" description="Gestiona los servicios de Windows (services.msc)." accentColor="violet"
            primaryAction="Abrir" primaryOnClick={() => openTool('services.msc', 'Servicios')} />
          <ToolCard icon={<HardDrive size={18} />} title="Administración de discos" description="Particiones y volúmenes (diskmgmt.msc)." accentColor="orange"
            primaryAction="Abrir" primaryOnClick={() => openTool('diskmgmt.msc', 'Admin. de discos')} />
          <ToolCard icon={<Settings size={18} />} title="Configuración de Windows" description="Abre la aplicación Configuración." accentColor="slate"
            primaryAction="Abrir" primaryOnClick={() => openTool('ms-settings:', 'Configuración')} />
        </Grid>
      </Section>

      <Section title="Red" icon={<Wifi size={14} />}>
        <Grid>
          <ToolCard icon={<Wifi size={18} />} title="IPConfig" description="Configuración completa de red (ipconfig /all)." accentColor="cyan"
            primaryAction="Ejecutar" primaryOnClick={() => runTool('ipconfig', 'IPConfig', 'ipconfig /all')} loading={busy('IPConfig')} disabled={loading} />
          <ToolCard icon={<Globe size={18} />} title="Ping" description="Prueba de conectividad a 8.8.8.8." accentColor="emerald"
            primaryAction="Ejecutar" primaryOnClick={() => runTool('ping', 'Ping', 'ping 8.8.8.8 -n 4')} loading={busy('Ping')} disabled={loading} />
          <ToolCard icon={<RefreshCw size={18} />} title="Vaciar caché DNS" description="Limpia la caché de resolución DNS." accentColor="orange"
            primaryAction="Ejecutar" primaryOnClick={() => runTool('flush-dns', 'Flush DNS', 'ipconfig /flushdns')} loading={busy('Flush DNS')} disabled={loading} />
          <ToolCard icon={<Route size={18} />} title="Tracert" description="Traza la ruta de conexión hasta 8.8.8.8." accentColor="indigo"
            primaryAction="Ejecutar" primaryOnClick={() => runTool('tracert', 'Tracert', 'tracert 8.8.8.8')} loading={busy('Tracert')} disabled={loading} />
          <ToolCard icon={<ListTree size={18} />} title="Tabla ARP" description="Direcciones vistas en la red local." accentColor="slate"
            primaryAction="Ejecutar" primaryOnClick={() => runTool('arp', 'ARP Table', 'arp -a')} loading={busy('ARP Table')} disabled={loading} />
          <ToolCard icon={<Network size={18} />} title="Adaptadores de red" description="Abre las conexiones de red (ncpa.cpl)." accentColor="violet"
            primaryAction="Abrir" primaryOnClick={() => openTool('ncpa.cpl', 'Adaptadores de red')} />
        </Grid>
      </Section>

      <Section title="Descargas ISO" icon={<Disc size={14} />}>
        <Grid>
          <ToolCard
            icon={<DownloadCloud size={18} />}
            title="UUP dump · ISOs de Windows"
            description="ISOs oficiales de Windows 10/11 en cualquier versión, build e idioma, directamente de los servidores de Microsoft."
            accentColor="sky"
            primaryAction="Abrir UUP dump"
            primaryOnClick={() => {
              window.electronAPI.openExternal('https://uupdump.net/known.php');
              addLog('Utilidades', 'UUP dump', 'Abriendo uupdump.net/known.php', 'info');
            }}
          />
        </Grid>
      </Section>

      {(output || loading) && <ConsoleOutput title={activeTool || 'Salida'} output={output} loading={loading} />}

      <ConfirmModal
        isOpen={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Continuar"
        danger={confirmModal.danger}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeModal}
      />
    </div>
  );
}
