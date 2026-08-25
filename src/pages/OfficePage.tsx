import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Download, Wrench, Key, Globe, HardDrive, Shield, CheckCircle, Loader } from 'lucide-react';
import { ToolCard, ConsoleOutput, ConfirmModal, ProgressBar } from '../components';
import { useLogs } from '../context/LogContext';
import { DownloadProgress } from '../types';

const OFFICE_DIR = 'C:\\Office';
const SETUP_URL = 'https://officecdn.microsoft.com/pr/wsus/setup.exe';

// Configuraciones XML por versión (64-bit, es-mx, con clave KMS incorporada)
const onlineVersions = [
  {
    id: '365',
    name: 'Microsoft 365 Apps',
    xml: `<Configuration>
  <Add OfficeClientEdition="64" Channel="Current">
    <Product ID="O365ProPlusRetail">
      <Language ID="es-mx" />
    </Product>
  </Add>
  <Display Level="Full" AcceptEULA="TRUE" />
  <Property Name="AUTOACTIVATE" Value="1" />
</Configuration>`,
  },
  {
    id: '2024',
    name: 'Office LTSC 2024 Perpetual Enterprise',
    xml: `<Configuration ID="a206ca65-3341-4e3c-98f7-cf8ed6bc11e9">
  <Add OfficeClientEdition="64" Channel="PerpetualVL2024">
    <Product ID="ProPlus2024Volume" PIDKEY="XJ2XN-FW8RK-P4HMP-DKDBV-GCVGB">
      <Language ID="es-mx" />
      <ExcludeApp ID="Lync" />
    </Product>
  </Add>
  <Property Name="SharedComputerLicensing" Value="0" />
  <Property Name="FORCEAPPSHUTDOWN" Value="FALSE" />
  <Property Name="DeviceBasedLicensing" Value="0" />
  <Property Name="SCLCacheOverride" Value="0" />
  <Property Name="AUTOACTIVATE" Value="1" />
  <Updates Enabled="TRUE" />
  <RemoveMSI />
</Configuration>`,
  },
  {
    id: '2021',
    name: 'Office LTSC 2021 Perpetual Enterprise',
    xml: `<Configuration ID="ee1dc980-bb74-4ca7-bb04-8ec42f6aec1f">
  <Add OfficeClientEdition="64" Channel="PerpetualVL2021">
    <Product ID="ProPlus2021Volume" PIDKEY="FXYTK-NJJ8C-GB6DW-3DYQT-6F7TH">
      <Language ID="es-mx" />
      <ExcludeApp ID="Lync" />
    </Product>
  </Add>
  <Property Name="SharedComputerLicensing" Value="0" />
  <Property Name="FORCEAPPSHUTDOWN" Value="FALSE" />
  <Property Name="DeviceBasedLicensing" Value="0" />
  <Property Name="SCLCacheOverride" Value="0" />
  <Property Name="AUTOACTIVATE" Value="1" />
  <Updates Enabled="TRUE" />
  <RemoveMSI />
</Configuration>`,
  },
  {
    id: '2019',
    name: 'Office 2019 Perpetual Enterprise',
    xml: `<Configuration ID="4f0bc6ac-9932-4b5e-9495-003a7649d0eb">
  <Add OfficeClientEdition="64" Channel="PerpetualVL2019">
    <Product ID="ProPlus2019Volume" PIDKEY="NMMKJ-6RK4F-KMJVX-8D9MJ-6MWKP">
      <Language ID="es-mx" />
      <ExcludeApp ID="Groove" />
      <ExcludeApp ID="Lync" />
    </Product>
  </Add>
  <Property Name="SharedComputerLicensing" Value="0" />
  <Property Name="FORCEAPPSHUTDOWN" Value="FALSE" />
  <Property Name="DeviceBasedLicensing" Value="0" />
  <Property Name="SCLCacheOverride" Value="0" />
  <Property Name="AUTOACTIVATE" Value="1" />
  <Updates Enabled="TRUE" />
  <RemoveMSI />
</Configuration>`,
  },
];

const offlineVersions = [
  { id: '365', name: 'Microsoft 365 Apps', url: 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=O365ProPlusRetail&platform=x64&language=es-mx&version=O16GA' },
  { id: '2024', name: 'Office LTSC 2024 Plus', url: 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=ProPlus2024Retail&platform=x64&language=es-mx&version=O16GA' },
  { id: '2021', name: 'Office LTSC 2021 Plus', url: 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=ProPlus2021Retail&platform=x64&language=es-mx&version=O16GA' },
  { id: '2019', name: 'Office 2019 Plus', url: 'https://officecdn.microsoft.com/db/492350f6-3a01-4f97-b9c0-c7c6ddf67d60/media/ProfessionalPlus2019.img' },
];

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
      message: `Se descargará setup.exe, se generará el Configuration.xml para ${version.name} en ${OFFICE_DIR}\\ y luego se ejecutará la instalación.\n\n¿Continuar?`,
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
            log('Office', 'Instalación', 'Instalador ejecutado correctamente. Siga las instrucciones en pantalla.', 'success');
          } else {
            log('Office', 'Instalación', 'Verifique la ventana de Office que se abrió', 'warning');
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
      message: `Se descargará la imagen ISO de ${version.name} (~3-5 GB). Esto puede tardar varios minutos.\n\n¿Continuar?`,
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
          setDownloadStatus('Iniciando instalación...');
          log('Office', 'Instalando', `Ejecutando ${drive}:\\setup.exe`, 'info');
          const installResult = await window.electronAPI.runCommand(
            `powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process '${drive}:\\setup.exe' -Verb RunAs -Wait"`
          );

          if (installResult.success) {
            log('Office', 'Instalación', `${version.name} instalado correctamente`, 'success');
          } else {
            log('Office', 'Instalación', 'Verifique la ventana de Office que se abrió', 'warning');
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
      message: 'Se ejecutará Microsoft Activation Scripts (MAS) en modo silencioso:\n\n• Windows → método HWID (licencia digital permanente)\n• Office → método Ohook\n\nRequiere internet. ¿Continuar?',
      onConfirm: () => {
        setConfirmModal({ ...confirmModal, open: false });
        setLoading(true);
        setOutput('');
        log(fromPage, 'Activando', 'Ejecutando MAS (/HWID /Ohook) - Windows + Office', 'info');
        window.electronAPI.runCommand(MAS_CMD).then(r => {
          setOutput(r.output);
          log('Activación', r.success ? 'Completado' : 'Error', r.success ? 'Windows y Office activados' : String(r.output), r.success ? 'success' : 'error');
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
      message: `¿Desea ejecutar reparación ${type} de Office?`,
      onConfirm: () => {
        setConfirmModal({ ...confirmModal, open: false });
        setLoading(true);
        setOutput('');
        log('Office', 'Reparando', `Reparación ${type}`, 'info');
        if (type === 'Rápida') {
          window.electronAPI.runCommand('powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-CimInstance Win32_Product | Where-Object { $_.Name -like \'*Office*\' } | ForEach-Object { $_.InvokeRepair() }"').then(r => {
            setOutput(r.output);
            log('Office', 'Reparación', r.success ? 'Completado' : 'Error', r.success ? 'success' : 'error');
            setLoading(false);
          });
        } else {
          window.electronAPI.runCommand('control.exe appwiz.cpl');
          log('Office', 'Reparación', 'Panel de control abierto. Seleccione Office y haga clic en Cambiar', 'info');
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
                <p className="text-xs text-dark-200 font-medium">Instalación Online (descarga automática)</p>
                <p className="text-[11px] text-dark-400 mt-1">
                  Se descargará automáticamente <code className="bg-dark-700 px-1 rounded">setup.exe</code> y{' '}
                  <code className="bg-dark-700 px-1 rounded">Configuration.xml</code> a{' '}
                  <code className="bg-dark-700 px-1 rounded">{OFFICE_DIR}\</code>, luego se ejecutará el instalador con permisos de administrador.
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
                description="Descarga setup.exe + genera Configuration.xml + instala automáticamente"
                status="info"
                statusText="Descarga automática"
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
                <p className="text-xs text-dark-200 font-medium">Instalación Offline (ISO automática)</p>
                <p className="text-[11px] text-dark-400 mt-1">
                  Se descargará la ISO directamente desde los servidores de Microsoft.
                  Una vez descargada se monta automáticamente y se ejecuta <code className="bg-dark-700 px-1 rounded">setup.exe</code>.
                  <br />Requiere conexión a internet para la descarga (~3-5 GB).
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
                description={`Office ${ver.id} - 64-bit - Español (México)`}
                status="info"
                statusText="ISO automática"
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
              title="Reparación rápida"
              description="Repara archivos dañados sin eliminar configuraciones"
              accentColor="blue" primaryAction="Reparar" primaryOnClick={() => repairOffice('Rápida')} loading={loading}
            />
            <ToolCard
              icon={<Wrench size={20} />}
              title="Reparación completa"
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
