import React, { useState } from 'react';
import { Globe, Download, ExternalLink, Shield, CheckCircle } from 'lucide-react';
import { ToolCard, ConsoleOutput, ConfirmModal } from '../components';
import { useLogs } from '../context/LogContext';

const browsers = [
  {
    id: 'chrome',
    name: 'Google Chrome',
    description: 'Navegador web rápido y popular de Google',
    url: 'https://dl.google.com/chrome/install/latest/chrome_installer.exe',
    installArgs: '/silent /install',
    accentColor: 'blue',
    website: 'https://www.google.com/chrome/',
  },
  {
    id: 'edge',
    name: 'Microsoft Edge',
    description: 'Navegador moderno basado en Chromium de Microsoft',
    url: 'https://go.microsoft.com/fwlink/?linkid=2124703',
    installArgs: '/silent /install',
    accentColor: 'cyan',
    website: 'https://www.microsoft.com/edge',
  },
  {
    id: 'firefox',
    name: 'Mozilla Firefox',
    description: 'Navegador web libre y abierto por Mozilla',
    url: 'https://download.mozilla.org/?product=firefox-latest&os=win64&lang=es-MX',
    installArgs: '/S',
    accentColor: 'orange',
    website: 'https://www.mozilla.org/es-MX/firefox/',
  },
  {
    id: 'opera',
    name: 'Opera',
    description: 'Navegador con VPN integrada y acelerador de descargas',
    url: 'https://get.opera.com/autoupdate/stable/OperaStandaloneSetup.exe',
    installArgs: '/silent /install',
    accentColor: 'red',
    website: 'https://www.opera.com/',
  },
  {
    id: 'brave',
    name: 'Brave',
    description: 'Navegador enfocado en privacidad y bloqueo de anuncios',
    url: 'https://laptop-updates.brave.com/latest/brave-x64-installer.exe',
    installArgs: '/silent /install',
    accentColor: 'yellow',
    website: 'https://brave.com/',
  },
];

export function BrowsersPage() {
  const { addLog } = useLogs();
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeBrowser, setActiveBrowser] = useState('');
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void }>({
    open: false, title: '', message: '', onConfirm: () => {}
  });

  const downloadAndInstall = async (browser: typeof browsers[0]) => {
    setConfirmModal({
      open: true,
      title: `Descargar ${browser.name}`,
      message: `¿Desea descargar e instalar ${browser.name}? Se descargará desde la fuente oficial.`,
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, open: false });
        setLoading(true);
        setOutput('');
        setActiveBrowser(browser.name);
        addLog('Navegadores', `${browser.name} - Descargando`, browser.url, 'info');

        try {
          // Download
          const downloadDir = '$env:TEMP';
          const fileName = browser.id + '_installer.exe';
          const downloadCmd = `Invoke-WebRequest -Uri '${browser.url}' -OutFile "${downloadDir}\\${fileName}" -UseBasicParsing`;
          
          addLog('Navegadores', `${browser.name} - Descargando installer`, downloadCmd, 'info');
          const dlResult = await window.electronAPI.runCommand(`powershell -NoProfile -ExecutionPolicy Bypass -Command "${downloadCmd.replace(/"/g, '\\"')}"`);
          
          if (!dlResult.success) {
            setOutput(`Error al descargar: ${dlResult.output}`);
            addLog('Navegadores', `${browser.name} - Error descarga`, dlResult.output, 'error');
            setLoading(false);
            return;
          }

          setOutput(`Descarga completada. Instalando ${browser.name}...`);
          addLog('Navegadores', `${browser.name} - Descarga completada`, 'Archivo descargado', 'success');

          // Install
          const installCmd = `Start-Process -FilePath "${downloadDir}\\${fileName}" -ArgumentList '${browser.installArgs}' -Wait -NoNewWindow`;
          const instResult = await window.electronAPI.runCommand(`powershell -NoProfile -ExecutionPolicy Bypass -Command "${installCmd.replace(/"/g, '\\"')}"`);
          
          if (instResult.success) {
            setOutput(`✅ ${browser.name} instalado correctamente`);
            addLog('Navegadores', `${browser.name} - Instalado`, 'Instalación completada', 'success');
          } else {
            setOutput(`⚠️ ${browser.name} instalado (verifique manualmente)\n${instResult.output}`);
            addLog('Navegadores', `${browser.name} - Instalación`, 'Verificar resultado', 'warning');
          }
        } catch (err) {
          setOutput(`Error: ${err}`);
          addLog('Navegadores', `${browser.name} - Error`, String(err), 'error');
        }
        setLoading(false);
      }
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-white">Navegadores Web</h1>
        <p className="text-xs text-dark-400 mt-1">Descargar e instalar navegadores desde fuentes oficiales</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {browsers.map(browser => (
          <ToolCard
            key={browser.id}
            icon={<Globe size={20} />}
            title={browser.name}
            description={browser.description}
            status="info"
            statusText="Disponible"
            accentColor={browser.accentColor}
            primaryAction="Descargar e Instalar"
            primaryOnClick={() => downloadAndInstall(browser)}
            secondaryAction="Sitio oficial"
            secondaryOnClick={() => window.electronAPI.openExternal(browser.website)}
            loading={loading && activeBrowser === browser.name}
          />
        ))}
      </div>

      <div className="bg-dark-800/50 border border-dark-700 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-dark-200 font-medium">Descargas seguras</p>
            <p className="text-[11px] text-dark-400 mt-1">
              Todos los navegadores se descargan directamente desde las fuentes oficiales de cada fabricante.
              No se utilizan enlaces de terceros. Verifique siempre la integridad del software.
            </p>
          </div>
        </div>
      </div>

      {(output || loading) && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-dark-300 mb-2">Consola - {activeBrowser}</h3>
          <ConsoleOutput output={output} loading={loading} />
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Descargar"
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ ...confirmModal, open: false })}
      />
    </div>
  );
}
