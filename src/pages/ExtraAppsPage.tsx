import React, { useState, useEffect } from 'react';
import { AppWindow, Download, ExternalLink, Loader, FileText, StickyNote, Box, Globe, Terminal } from 'lucide-react';
import { ToolCard, ConsoleOutput, ConfirmModal } from '../components';
import { useLogs } from '../context/LogContext';

interface ExtraApp {
  id: string;
  name: string;
  description: string;
  type?: 'command' | 'opencode' | 'download';
  commands?: string[];
  url?: string;
  fileName?: string;
  website: string;
  accentColor: string;
  icon: React.ComponentType<{ size?: number | string }>;
}

const extraApps: ExtraApp[] = [
  {
    id: 'chrome',
    name: 'Google Chrome',
    description: 'Navegador esencial. Respaldo directo offline (por si falla winget con hash). También disponible vía winget en "Instalar Aplicaciones".',
    url: 'https://dl.google.com/chrome/install/GoogleChromeStandaloneEnterprise64.msi',
    fileName: 'GoogleChromeStandaloneEnterprise64.msi',
    website: 'https://www.google.com/chrome/',
    accentColor: 'yellow',
    icon: Globe,
  },
  {
    id: 'opencode',
    name: 'OpenCode (CLI)',
    description: 'Asistente de IA en terminal. Instala automáticamente: verifica Node.js (lo instala vía winget si falta), configura la ejecución de scripts y luego npm i -g opencode-ai. Luego ejecuta "opencode" en cualquier carpeta.',
    type: 'opencode',
    website: 'https://opencode.ai',
    accentColor: 'green',
    icon: Terminal,
  },
  {
    id: 'winrar',
    name: 'WinRAR',
    description: 'Compresor de archivos clásico. Se instala vía WinGet de forma silenciosa (acepta todos los términos automáticamente, sin ventanas emergentes).',
    url: 'winget:RARLAB.WinRAR',
    fileName: '',
    website: 'https://www.win-rar.com/',
    accentColor: 'orange',
    icon: Box,
  },
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
    description: 'Versión 2.1.44 clásica (MediaFire). Si la descarga queda congelada/30KB es porque el link directo expiro: usa "Sitio oficial" o abre el link en el navegador.',
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

  useEffect(() => {
    if (!window.electronAPI?.onCommandProgress) return;
    const handler = (data: { chunk: string; isErr?: boolean }) => {
      setOutput(prev => prev + data.chunk);
    };
    const off = window.electronAPI.onCommandProgress(handler);
    return off;
  }, []);

  const doDownload = (app: typeof extraApps[0]) => {
    setConfirm({
      open: true,
      title: `Descargar ${app.name}`,
      message: app.type === 'command' || app.type === 'opencode'
        ? app.type === 'opencode'
          ? `Se verificará/instalará Node.js si es necesario (vía winget) y luego se ejecutará en terminal:\nSet-ExecutionPolicy Bypass -Scope Process\nnpm i -g opencode-ai\n\n¿Continuar?`
          : `Se ejecutará en terminal:\n${app.commands!.join('\n')}\n\n¿Continuar?`
        : (app.url ?? '').startsWith('winget:') ? `Se instalará vía WinGet: ${(app.url ?? '').replace('winget:', '')}` : `Se descargará desde: ${app.url}\n\n¿Continuar?`,
      onConfirm: async () => {
        setConfirm({ ...confirm, open: false });
        setLoading(true); setOutput(''); setActive(app.name);
        try {
          if (app.type === 'opencode') {
            addLog('Extra Apps', app.name, 'Instalando OpenCode CLI (con verificación de Node.js)', 'info');
            const r = await window.electronAPI.installOpencode();
            setOutput(prev => prev + (r.output || ''));
            addLog('Extra Apps', app.name, r.success ? 'OpenCode instalado' : 'Error', r.success ? 'success' : 'error');
          } else if (app.type === 'command' && app.commands) {
            addLog('Extra Apps', app.name, `comandos: ${app.commands.join(' && ')}`, 'info');
            const r = await window.electronAPI.runCommands(app.commands);
            setOutput(prev => prev + (r.output || ''));
            addLog('Extra Apps', app.name, 'Comandos ejecutados', 'success');
          } else if (app.url!.startsWith('winget:')) {
            const wingetId = app.url!.replace('winget:', '');
            addLog('Extra Apps', app.name, `winget install ${wingetId}`, 'info');
            const r = await window.electronAPI.wingetInstall(wingetId);
            setOutput(r.output || '');
            addLog('Extra Apps', app.name, r.success ? 'Instalado' : 'Error', r.success ? 'success' : 'error');
            // Fallback Chrome: si winget falla por hash, ofrecer descarga directa
            if (!r.success && /hash does not match|no se reconoce/i.test(r.output || '') && app.id === 'obsidian') {
              setOutput((r.output || '') + '\n\nTip: Si es error de hash, prueba el Chrome directo de esta misma seccion o reintenta winget con --ignore-security-hash en terminal sin admin.');
            }
          } else {
            const dlDir = 'C:\\ExtraApps';
            await window.electronAPI.runCommand(`if not exist "${dlDir}" mkdir "${dlDir}"`);
            const dest = `${dlDir}\\${app.fileName!}`;
            addLog('Extra Apps', app.name, `Descargando a ${dest}`, 'info');
            const r = await window.electronAPI.downloadFile(app.url!, dest);
            if (!r.success) {
              const msg = String(r.output || '');
              const isMediaFire = app.url!.includes('mediafire.com') || msg.toLowerCase().includes('mediafire') || msg.toLowerCase().includes('pagina html');
              if (isMediaFire) {
                setOutput(`Error: ${msg}\n\nEl link directo de MediaFire expiro (devuelve pagina HTML de 34KB, sin icono). Solucion: se abrira el navegador con el link y la carpeta C:\\ExtraApps. Descargalo manualmente desde MediaFire y colocalo en C:\\ExtraApps.`);
                addLog('Extra Apps', app.name, 'Link MediaFire expirado - abriendo navegador', 'error');
                window.electronAPI.openExternal(app.url!);
                window.electronAPI.openPath(dlDir);
              } else {
                setOutput(`Error: ${msg}`);
                addLog('Extra Apps', app.name, msg, 'error');
              }
              setLoading(false); return;
            }
            setOutput(`Descargado: ${dest} (${r.size} bytes). Abriendo...`);
            addLog('Extra Apps', app.name, `Descargado ${app.fileName}`, 'success');
            // MSI necesita msiexec /i, EXE directo con RunAs
            if (dest.toLowerCase().endsWith('.msi')) {
              await window.electronAPI.runCommand(`powershell -Command "Start-Process msiexec.exe -ArgumentList '/i \\"${dest}\\"' -Verb RunAs -Wait"`);
            } else {
              await window.electronAPI.runCommand(`powershell -Command "Start-Process -FilePath '${dest}' -Verb RunAs"`);
            }
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
              primaryAction={app.type === 'command' || app.type === 'opencode' ? 'Instalar' : 'Descargar'}
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
