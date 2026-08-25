import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Download, Wrench, Key, Globe, HardDrive, Shield, CheckCircle, Loader } from 'lucide-react';
import { ToolCard, ConsoleOutput, ConfirmModal, ProgressBar } from '../components';
import { useLogs } from '../context/LogContext';
import { DownloadProgress } from '../types';
import { PATHS, OFFICE } from '../config/constants';

const OFFICE_DIR = PATHS.OFFICE_DIR;
const SETUP_URL = OFFICE.SETUP_URL;
const onlineVersions = [...OFFICE.ONLINE_VERSIONS];
const offlineVersions = [...OFFICE.OFFLINE_VERSIONS];

export function OfficePage() {
  const { addLog } = useLogs();
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'online' | 'offline' | 'activate' | 'repair'>('online');
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [downloadStatus, setDownloadStatus] = useState('');
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void }>({
    open: false, title: '', message: '', onConfirm: () => {}
  });

  useEffect(() => {
    if (window.electronAPI?.onDownloadProgress) {
      window.electronAPI.onDownloadProgress((data: DownloadProgress) => {
        setProgress(data);
      });
    }
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const log = (tool: string, action: string, result: string, level: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    addLog(tool, action, result, level);
    setOutput(prev => prev + `\n[${level.toUpperCase()}] ${action}: ${result}`);
  };

  // ONLINE INSTALL
  const startOnlineInstall = async (version: typeof onlineVersions[0]) => {
    setConfirmModal({
      open: true,
      title: `Instalar ${version.name} (Online)`,
      message: `Se descargarÃ¡ setup.exe, se generarÃ¡ el Configuration.xml para ${version.name} en ${OFFICE_DIR}\\ y luego se ejecutarÃ¡ la instalaciÃ³n.\n\nÂ¿Continuar?`,
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, open: false });
        setLoading(true);
        setOutput('');
        setProgress(null);

        try {
          // Create directory
          setDownloadStatus('Creando carpeta...');
          log('Office', 'Preparando', `Creando carpeta ${OFFICE_DIR}`, 'info');
          await window.electronAPI.runCommand(`if not exist "${OFFICE_DIR}" mkdir "${OFFICE_DIR}"`);

          // Download setup.exe
          setDownloadStatus('Descargando setup.exe...');
          log('Office', 'Descargando', 'setup.exe desde officecdn.microsoft.com', 'info');
          const setupResult = await window.electronAPI.downloadFile(SETUP_URL, `${OFFICE_DIR}\\setup.exe`);
          if (!setupResult.success) {
            log('Office', 'Error', `No se pudo descargar setup.exe: ${setupResult.output}`, 'error');
            setLoading(false);
            return;
          }
          log('Office', 'Descargado', `setup.exe (${formatBytes(setupResult.size || 0)})`, 'success');

          // Generate Configuration.xml locally
          setDownloadStatus('Generando Configuration.xml...');
          log('Office', 'Generando', `Configuration.xml (${version.name}, 64-bit, es-mx)`, 'info');
          const cfgResult = await window.electronAPI.writeFile(`${OFFICE_DIR}\\Configuration.xml`, version.xml);
          if (!cfgResult.success) {
            log('Office', 'Error', `No se pudo crear Configuration.xml: ${cfgResult.output}`, 'error');
            setLoading(false);
            return;
          }
          log('Office', 'Creado', 'Configuration.xml generado correctamente', 'success');

          // Run installer
          setDownloadStatus('Ejecutando instalador...');
          log('Office', 'Instalando', 'Ejecutando setup.exe /configure Configuration.xml', 'info');
          const installResult = await window.electronAPI.runCommand(
            `powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process cmd -ArgumentList '/k cd /d ${OFFICE_DIR} && setup.exe /configure Configuration.xml' -Verb RunAs"`
          );

          if (installResult.success) {
            log('Office', 'InstalaciÃ³n', 'Instalador ejecutado correctamente. Siga las instrucciones en pantalla.', 'success');
          } else {
            log('Office', 'InstalaciÃ³n', 'Verifique la ventana de Office que se abriÃ³', 'warning');
          }
        } catch (err) {
          log('Office', 'Error', String(err), 'error');
        }
        setLoading(false);
        setDownloadStatus('');
      }
    });
  };

  // OFFLINE INSTALL
  const startOfflineInstall = async (version: typeof offlineVersions[0]) => {
    setConfirmModal({
      open: true,
      title: `Descargar e Instalar ${version.name}`,
      message: `Se descargarÃ¡ la imagen ISO de ${version.name} (~3-5 GB). Esto puede tardar varios minutos.\n\nÂ¿Continuar?`,
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, open: false });
        setLoading(true);
        setOutput('');
        setProgress(null);

        const isoDir = 'C:\\OfficeISO';
        const isoPath = `${isoDir}\\Office_${version.id}.iso`;

        try {
          // Create directory
          setDownloadStatus('Creando carpeta...');
          log('Office', 'Preparando', `Creando carpeta ${isoDir}`, 'info');
          await window.electronAPI.runCommand(`if not exist "${isoDir}" mkdir "${isoDir}"`);

          // Download ISO
          setDownloadStatus(`Descargando Office ${version.id}...`);
          log('Office', 'Descargando', `ISO de ${version.name} desde Microsoft`, 'info');
          const dlResult = await window.electronAPI.downloadFile(version.url, isoPath);

          if (!dlResult.success) {
            log('Office', 'Error descarga', `No se pudo descargar: ${dlResult.output}`, 'error');
            setLoading(false);
            setDownloadStatus('');
            return;
          }

          log('Office', 'Descargado', `ISO: ${formatBytes(dlResult.size || 0)}`, 'success');

          // Mount ISO
          setDownloadStatus('Montando imagen ISO...');
          log('Office', 'Montando', 'Montando imagen ISO...', 'info');
          const mountResult = await window.electronAPI.mountIso(isoPath);

          if (!mountResult.success) {
            log('Office', 'Error', 'No se pudo montar la imagen ISO', 'error');
            setLoading(false);
            setDownloadStatus('');
            return;
          }

          const drive = mountResult.driveLetter;
          log('Office', 'Montado', `ISO montada en unidad ${drive}:`, 'success');

          // Run setup
          setDownloadStatus('Iniciando instalaciÃ³n...');
          log('Office', 'Instalando', `Ejecutando ${drive}:\\setup.exe`, 'info');
          const installResult = await window.electronAPI.runCommand(
            `powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process '${drive}:\\setup.exe' -Verb RunAs -Wait"`
          );

          if (installResult.success) {
            log('Office', 'InstalaciÃ³n', `${version.name} instalado correctamente`, 'success');
          } else {
            log('Office', 'InstalaciÃ³n', 'Verifique la ventana de Office que se abriÃ³', 'warning');
          }

          // Unmount ISO
          await window.electronAPI.unmountIso(isoPath);
          log('Office', 'Desmontado', 'ISO desmontada', 'info');

        } catch (err) {
          log('Office', 'Error', String(err), 'error');
        }
        setLoading(false);
        setDownloadStatus('');
      }
    });
  };

  // ACTIVAR WINDOWS + OFFICE (MAS unattended: HWID para Windows, Ohook para Office)
  const MAS_CMD = 'powershell -NoProfile -ExecutionPolicy Bypass -Command "& ([ScriptBlock]::Create((irm https://get.activated.win))) /HWID /Ohook"';

  const activateAll = (fromPage: string) => {
    setConfirmModal({
      open: true,
      title: 'Activar Windows y Office',
      message: 'Se ejecutarÃ¡ Microsoft Activation Scripts (MAS) en modo silencioso:\n\nâ€¢ Windows â†’ mÃ©todo HWID (licencia digital permanente)\nâ€¢ Office â†’ mÃ©todo Ohook\n\nRequiere internet. Â¿Continuar?',
      onConfirm: () => {
        setConfirmModal({ ...confirmModal, open: false });
        setLoading(true);
        setOutput('');
        log(fromPage, 'Activando', 'Ejecutando MAS (/HWID /Ohook) - Windows + Office', 'info');
        window.electronAPI.runCommand(MAS_CMD).then(r => {
          setOutput(r.output);
          log('ActivaciÃ³n', r.success ? 'Completado' : 'Error', r.success ? 'Windows y Office activados' : String(r.output), r.success ? 'success' : 'error');
          setLoading(false);
        });
      }
    });
  };

  // REPAIR
  const repairOffice = (type: string) => {
    setConfirmModal({
      open: true,
      title: `Reparar Office - ${type}`,
      message: `Â¿Desea ejecutar reparaciÃ³n ${type} de Office?`,
      onConfirm: () => {
        setConfirmModal({ ...confirmModal, open: false });
        setLoading(true);
        setOutput('');
        log('Office', 'Reparando', `ReparaciÃ³n ${type}`, 'info');
        if (type === 'RÃ¡pida') {
          window.electronAPI.runCommand('powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-CimInstance Win32_Product | Where-Object { $_.Name -like \'*Office*\' } | ForEach-Object { $_.InvokeRepair() }"').then(r => {
            setOutput(r.output);
            log('Office', 'ReparaciÃ³n', r.success ? 'Completado' : 'Error', r.success ? 'success' : 'error');
            setLoading(false);
          });
        } else {
          window.electronAPI.runCommand('control.exe appwiz.cpl');
          log('Office', 'ReparaciÃ³n', 'Panel de control abierto. Seleccione Office y haga clic en Cambiar', 'info');
          setLoading(false);
        }
      }
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-white">Microsoft Office</h1>
        <p className="text-xs text-dark-400 mt-1">Instalar, activar y reparar Microsoft Office</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'online' as const, label: 'Online', icon: <Globe size={16} /> },
          { id: 'offline' as const, label: 'Offline (ISO)', icon: <HardDrive size={16} /> },
          { id: 'activate' as const, label: 'Activar', icon: <Key size={16} /> },
          { id: 'repair' as const, label: 'Reparar', icon: <Wrench size={16} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id ? 'bg-primary-600 text-white' : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Download Progress Bar */}
      {progress && (
        <div className="bg-dark-800/80 border border-dark-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-dark-300 flex items-center gap-2">
              <Loader size={14} className="animate-spin text-primary-400" />
              Descargando...
            </span>
            <span className="text-xs text-dark-400">
              {formatBytes(progress.downloaded)} / {formatBytes(progress.total)}
            </span>
          </div>
          <div className="w-full bg-dark-700 rounded-full h-3">
            <div
              className="bg-primary-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          <div className="text-right mt-1">
            <span className="text-[11px] text-primary-400 font-medium">{progress.percent}%</span>
          </div>
        </div>
      )}

      {downloadStatus && !progress && (
        <div className="bg-dark-800/80 border border-dark-700 rounded-lg p-4 flex items-center gap-3">
          <Loader size={16} className="animate-spin text-primary-400" />
          <span className="text-sm text-dark-200">{downloadStatus}</span>
        </div>
      )}

      {/* ONLINE */}
      {activeTab === 'online' && (
        <div className="space-y-4">
          <div className="bg-dark-800/50 border border-dark-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Globe size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-dark-200 font-medium">InstalaciÃ³n Online (descarga automÃ¡tica)</p>
                <p className="text-[11px] text-dark-400 mt-1">
                  Se descargarÃ¡ automÃ¡ticamente <code className="bg-dark-700 px-1 rounded">setup.exe</code> y{' '}
                  <code className="bg-dark-700 px-1 rounded">Configuration.xml</code> a{' '}
                  <code className="bg-dark-700 px-1 rounded">{OFFICE_DIR}\</code>, luego se ejecutarÃ¡ el instalador con permisos de administrador.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {onlineVersions.map(ver => (
              <ToolCard
                key={ver.id}
                icon={<Globe size={20} />}
                title={ver.name}
                description="Descarga setup.exe + genera Configuration.xml + instala automÃ¡ticamente"
                status="info"
                statusText="Descarga automÃ¡tica"
                accentColor="blue"
                primaryAction="Instalar"
                primaryOnClick={() => startOnlineInstall(ver)}
                loading={loading}
              />
            ))}
          </div>
        </div>
      )}

      {/* OFFLINE */}
      {activeTab === 'offline' && (
        <div className="space-y-4">
          <div className="bg-dark-800/50 border border-dark-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <HardDrive size={16} className="text-orange-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-dark-200 font-medium">InstalaciÃ³n Offline (ISO automÃ¡tica)</p>
                <p className="text-[11px] text-dark-400 mt-1">
                  Se descargarÃ¡ la ISO directamente desde los servidores de Microsoft.
                  Una vez descargada se monta automÃ¡ticamente y se ejecuta <code className="bg-dark-700 px-1 rounded">setup.exe</code>.
                  <br />Requiere conexiÃ³n a internet para la descarga (~3-5 GB).
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {offlineVersions.map(ver => (
              <ToolCard
                key={ver.id}
                icon={<FileText size={20} />}
                title={ver.name}
                description={`Office ${ver.id} - 64-bit - EspaÃ±ol (MÃ©xico)`}
                status="info"
                statusText="ISO automÃ¡tica"
                accentColor="orange"
                primaryAction="Descargar e Instalar"
                primaryOnClick={() => startOfflineInstall(ver)}
                loading={loading}
              />
            ))}
          </div>
        </div>
      )}

      {/* ACTIVATE */}
      {activeTab === 'activate' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ToolCard
              icon={<Key size={20} />}
              title="Activar Windows y Office"
              description="MAS (Microsoft Activation Scripts): Windows por HWID + Office por Ohook, en un solo clic"
              status="ok" statusText="Recomendado" accentColor="green"
              primaryAction="Activar todo" primaryOnClick={() => activateAll('Office')}
              secondaryAction="Docs" secondaryOnClick={() => window.electronAPI.openExternal('https://massgrave.dev')}
              loading={loading}
            />
          </div>
        </div>
      )}

      {/* REPAIR */}
      {activeTab === 'repair' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ToolCard
              icon={<Wrench size={20} />}
              title="ReparaciÃ³n rÃ¡pida"
              description="Repara archivos daÃ±ados sin eliminar configuraciones"
              accentColor="blue" primaryAction="Reparar" primaryOnClick={() => repairOffice('RÃ¡pida')} loading={loading}
            />
            <ToolCard
              icon={<Wrench size={20} />}
              title="ReparaciÃ³n completa"
              description="Reinstala componentes. Abre Panel de Control"
              accentColor="yellow" primaryAction="Reparar" primaryOnClick={() => repairOffice('Completa')} loading={loading}
            />
          </div>
        </div>
      )}

      {/* Console */}
      {(output || loading) && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-dark-300 mb-2">Consola</h3>
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
