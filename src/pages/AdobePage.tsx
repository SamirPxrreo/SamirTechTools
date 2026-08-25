import React, { useState } from 'react';
import { Palette, Download, ExternalLink, Shield, Trash2 } from 'lucide-react';
import { ToolCard, ConsoleOutput, ConfirmModal } from '../components';
import { useLogs } from '../context/LogContext';

const adobeApps = [
  {
    id: 'photoshop',
    name: 'Adobe Photoshop',
    description: 'Editor de imágenes y fotografía profesional',
    downloadUrl: 'https://creativecloud.adobe.com/apps/all/desktop',
    accentColor: 'blue',
  },
  {
    id: 'illustrator',
    name: 'Adobe Illustrator',
    description: 'Editor de gráficos vectoriales',
    downloadUrl: 'https://creativecloud.adobe.com/apps/all/desktop',
    accentColor: 'orange',
  },
  {
    id: 'premiere',
    name: 'Adobe Premiere Pro',
    description: 'Editor de video profesional',
    downloadUrl: 'https://creativecloud.adobe.com/apps/all/desktop',
    accentColor: 'purple',
  },
  {
    id: 'aftereffects',
    name: 'Adobe After Effects',
    description: 'Efectos visuales y motion graphics',
    downloadUrl: 'https://creativecloud.adobe.com/apps/all/desktop',
    accentColor: 'pink',
  },
  {
    id: 'acrobat',
    name: 'Adobe Acrobat Reader',
    description: 'Visor de archivos PDF gratuito',
    downloadUrl: 'https://get.adobe.com/reader/',
    accentColor: 'red',
  },
  {
    id: 'creativecloud',
    name: 'Adobe Creative Cloud',
    description: 'Gestor central de todas las apps de Adobe',
    downloadUrl: 'https://creativecloud.adobe.com/apps/all/desktop',
    accentColor: 'cyan',
  },
];

export function AdobePage() {
  const { addLog } = useLogs();
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeApp, setActiveApp] = useState('');
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void }>({
    open: false, title: '', message: '', onConfirm: () => {}
  });

  const downloadApp = (app: typeof adobeApps[0]) => {
    setConfirmModal({
      open: true,
      title: `Descargar ${app.name}`,
      message: `¿Desea descargar ${app.name}? Se abrirá la página oficial de descarga.`,
      onConfirm: () => {
        setConfirmModal({ ...confirmModal, open: false });
        addLog('Adobe', `${app.name} - Abriendo descarga`, app.downloadUrl, 'info');
        window.electronAPI.openExternal(app.downloadUrl);
      }
    });
  };

  const openCreativeCloud = () => {
    addLog('Adobe', 'Abriendo Creative Cloud', 'Abriendo Creative Cloud Desktop', 'info');
    window.electronAPI.runCommand('start "" "C:\\Program Files\\Adobe\\Adobe Creative Cloud\\ACC\\Creative Cloud.exe"');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-white">Adobe</h1>
        <p className="text-xs text-dark-400 mt-1">Descargar e instalar aplicaciones Adobe</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {adobeApps.map(app => (
          <ToolCard
            key={app.id}
            icon={<Palette size={20} />}
            title={app.name}
            description={app.description}
            status="info"
            statusText="Disponible"
            accentColor={app.accentColor}
            primaryAction="Descargar"
            primaryOnClick={() => downloadApp(app)}
            secondaryAction="Sitio oficial"
            secondaryOnClick={() => window.electronAPI.openExternal(app.downloadUrl)}
          />
        ))}
      </div>

      <div className="bg-dark-800/50 border border-dark-700 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-dark-200 font-medium">Adobe Creative Cloud</p>
            <p className="text-[11px] text-dark-400 mt-1">
              Para instalar aplicaciones Adobe, necesitas Adobe Creative Cloud.
              La mayoría de las apps de Adobe se instalan a través de Creative Cloud Desktop.
              Descarga oficial: <a href="https://creativecloud.adobe.com/" target="_blank" className="text-primary-400 hover:underline">creativecloud.adobe.com</a>
            </p>
          </div>
        </div>
      </div>

      {(output || loading) && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-dark-300 mb-2">Consola - {activeApp}</h3>
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
