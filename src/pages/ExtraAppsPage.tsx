import React, { useState } from 'react';
import { AppWindow, Download, ExternalLink, Loader, FileText, StickyNote, Box } from 'lucide-react';
import { ToolCard, ConsoleOutput, ConfirmModal } from '../components';
import { useLogs } from '../context/LogContext';

const extraApps = [
  {
    id: 'jopdf',
    name: 'JO-PDF',
    description: 'Lector y editor de PDF gratuito, todo en uno. Edita, convierte, comprime y anota PDFs sin marca de agua.',
    url: 'https://www.jopdf.com/download/jopdf_setup.exe',
    fileName: 'JO-PDF-Setup.exe',
    website: 'https://www.jopdf.com/',
    accentColor: 'blue',
    icon: FileText,
  },
  {
    id: 'obsidian',
    name: 'Obsidian',
    description: 'Gestor de conocimiento y notas con enlaces, markdown y plugins. Ideal para notas y segundo cerebro.',
    url: 'winget:Obsidian.Obsidian',
    fileName: '',
    website: 'https://obsidian.md/',
    accentColor: 'purple',
    icon: StickyNote,
  },
  {
    id: 'aionui',
    name: 'AionUi 2.1.44',
    description: 'Versión 2.1.44 clásica (MediaFire). La nueva quitó opciones, esta es la que te gusta.',
    url: 'https://download1587.mediafire.com/3jf23j9r3rxgKJHWyyx_spUYY7HiHDzRizm0ONKOVDPkyk_8haWHxKXoL2BkzXbYn42VYPTpfdQeAtWFrV3jcqlcH-J5K1ODhz1ArLKnCd_JdVSxXT4aCf4PwX55WuXRFn17vR2YNK9X0Ibfufym7v7xtyKGDdQ2KL6_eYJQsfKBY3E/iaq4v6j4eucftwq/AionUi-2.1.44-win-x64.exe',
    fileName: 'AionUi-2.1.44-win-x64.exe',
    website: 'https://github.com/aionui/aionui',
    accentColor: 'cyan',
    icon: Box,
  },
];

export function ExtraAppsPage() {
  const { addLog } = useLogs();
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState('');
  const [confirm, setConfirm] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void }>({ open: false, title: '', message: '', onConfirm: () => {} });

  const doDownload = (app: typeof extraApps[0]) => {
    setConfirm({
      open: true,
      title: `Descargar ${app.name}`,
      message: app.url.startsWith('winget:') ? `Se instalará vía WinGet: ${app.url.replace('winget:', '')}` : `Se descargará desde: ${app.url}\n\n¿Continuar?`,
      onConfirm: async () => {
        setConfirm({ ...confirm, open: false });
        setLoading(true); setOutput(''); setActive(app.name);
        try {
          if (app.url.startsWith('winget:')) {
            const wingetId = app.url.replace('winget:', '');
            addLog('Extra Apps', app.name, `winget install ${wingetId}`, 'info');
            const r = await window.electronAPI.wingetInstall(wingetId);
            setOutput(r.output || '');
            addLog('Extra Apps', app.name, r.success ? 'Instalado' : 'Error', r.success ? 'success' : 'error');
          } else {
            const dlDir = 'C:\\ExtraApps';
            await window.electronAPI.runCommand(`if not exist "${dlDir}" mkdir "${dlDir}"`);
            const dest = `${dlDir}\\${app.fileName}`;
            addLog('Extra Apps', app.name, `Descargando a ${dest}`, 'info');
            const r = await window.electronAPI.downloadFile(app.url, dest);
            if (!r.success) { setOutput(`Error: ${r.output}`); addLog('Extra Apps', app.name, String(r.output), 'error'); setLoading(false); return; }
            setOutput(`Descargado: ${dest} (${r.size} bytes). Abriendo...`);
            addLog('Extra Apps', app.name, `Descargado ${app.fileName}`, 'success');
            await window.electronAPI.runCommand(`powershell -Command "Start-Process -FilePath '${dest}' -Verb RunAs"`);
            window.electronAPI.showItemInFolder(dest);
          }
        } catch (e) { setOutput(String(e)); }
        setLoading(false);
      }
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Otras Apps</h1>
        <p className="text-xs text-slate-500 mt-1">Apps extra no incluidas en el catálogo principal</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {extraApps.map(app => {
          const Icon = app.icon;
          return (
            <ToolCard
              key={app.id}
              icon={<Icon size={20} />}
              title={app.name}
              description={app.description}
              status="info"
              statusText="Disponible"
              accentColor={app.accentColor}
              primaryAction="Descargar"
              primaryOnClick={() => doDownload(app)}
              secondaryAction="Sitio oficial"
              secondaryOnClick={() => window.electronAPI.openExternal(app.website)}
              loading={loading && active === app.name}
            />
          );
        })}
      </div>
      {(output || loading) && <div><h3 className="text-sm font-semibold text-slate-700 mb-2">Consola — {active}</h3><ConsoleOutput output={output} loading={loading} /></div>}
      <ConfirmModal isOpen={confirm.open} title={confirm.title} message={confirm.message} confirmText="Continuar" onConfirm={confirm.onConfirm} onCancel={() => setConfirm({ ...confirm, open: false })} />
    </div>
  );
}
