import React, { useState, useEffect } from 'react';
import { Download, FileText, StickyNote, Box, Globe, Terminal, Boxes, Archive, Bot } from 'lucide-react';
import { ToolCard, ConsoleOutput, ConfirmModal, PageHeader, Grid, Notice } from '../components';
import { useLogs } from '../context/LogContext';
import { usePrefs } from '../context/PrefsContext';
import { resolveDir } from '../utils/folders';

interface ExtraApp {
  id: string;
  name: string;
  description: string;
  type?: 'command' | 'opencode' | 'download' | 'winrar';
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
    description: 'MSI empresarial offline. Respaldo por si WinGet falla con el hash. También está en «Instalar apps».',
    url: 'https://dl.google.com/chrome/install/GoogleChromeStandaloneEnterprise64.msi',
    fileName: 'GoogleChromeStandaloneEnterprise64.msi',
    website: 'https://www.google.com/chrome/',
    accentColor: 'amber',
    icon: Globe,
  },
  {
    id: 'opencode',
    name: 'OpenCode (CLI)',
    description: 'Asistente de IA en terminal. Verifica/instala Node.js, configura la ejecución de scripts y ejecuta npm install -g @opencode/cli.',
    type: 'opencode',
    website: 'https://opencode.ai',
    accentColor: 'emerald',
    icon: Terminal,
  },
  {
    id: 'winrar',
    name: 'WinRAR + Activación',
    description: 'Instala WinRAR vía WinGet y copia la licencia rarreg.key a su carpeta de instalación (Windows pedirá permiso de administrador).',
    type: 'winrar',
    url: 'winget:RARLab.WinRAR', // winget distingue mayúsculas: el ID real es RARLab.WinRAR
    fileName: '',
    website: 'https://www.win-rar.com/',
    accentColor: 'orange',
    icon: Archive,
  },
  {
    id: 'jopdf',
    name: 'JO-PDF',
    description: 'Lector y editor de PDF gratuito: edita, convierte, comprime y anota sin marca de agua.',
    url: 'https://cdn.jopdf.com/download/jopdf/jopdf-win_installer.exe',
    fileName: 'jopdf-win_installer.exe',
    website: 'https://www.jopdf.com/',
    accentColor: 'red',
    icon: FileText,
  },
  {
    id: 'obsidian',
    name: 'Obsidian',
    description: 'Notas en Markdown con enlaces y plugins. Ideal como «segundo cerebro».',
    url: 'winget:Obsidian.Obsidian',
    fileName: '',
    website: 'https://obsidian.md/',
    accentColor: 'violet',
    icon: StickyNote,
  },
  {
    id: 'abdownload',
    name: 'AB Download Manager',
    description: 'Gestor de descargas rápido y gratuito. Instalación silenciosa vía WinGet.',
    url: 'winget:amir1376.ABDownloadManager',
    fileName: '',
    website: 'https://abdownloadmanager.com/',
    accentColor: 'teal',
    icon: Download,
  },
  {
    id: 'aionui',
    name: 'AionUi 2.1.44',
    description: 'Versión clásica 2.1.44. Descarga directa desde GitHub Releases.',
    url: 'https://github.com/SamirPxrreo/AionUi-Downloads/releases/download/v2.1.44/AionUi-2.1.44-win-x64.exe',
    fileName: 'AionUi-2.1.44-win-x64.exe',
    website: 'https://github.com/SamirPxrreo/AionUi-Downloads/releases/tag/v2.1.44',
    accentColor: 'cyan',
    icon: Bot,
  },
];

const kindLabel = (app: ExtraApp) =>
  app.type === 'opencode' || app.type === 'command' ? 'Terminal'
    : app.type === 'winrar' ? 'WinGet + licencia'
    : (app.url ?? '').startsWith('winget:') ? 'WinGet' : 'Descarga';

export function ExtraAppsPage() {
  const { addLog } = useLogs();
  const { askLocation } = usePrefs();
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

  const closeConfirm = () => setConfirm(c => ({ ...c, open: false }));

  const doDownload = (app: ExtraApp) => {
    setConfirm({
      open: true,
      title: `${kindLabel(app) === 'Descarga' ? 'Descargar' : 'Instalar'} ${app.name}`,
      message: app.type === 'command' || app.type === 'opencode'
        ? app.type === 'opencode'
          ? `Se verificará/instalará Node.js si es necesario (vía WinGet) y luego se ejecutará en terminal:\nSet-ExecutionPolicy Bypass -Scope Process\nnpm install -g @opencode/cli\n\nSi tienes instalado el paquete antiguo (opencode-ai), se reemplazará.`
          : `Se ejecutará en terminal:\n${app.commands!.join('\n')}`
        : app.type === 'winrar'
        ? 'Se instalará WinRAR vía WinGet (RARLab.WinRAR) y después se copiará la licencia rarreg.key (incluida en esta herramienta) a su carpeta de instalación.\n\nDestino: carpeta de WinRAR (normalmente C:\\Program Files\\WinRAR)\n\nWindows pedirá permiso de administrador (UAC) para copiar el archivo.'
        : (app.url ?? '').startsWith('winget:') ? `Se instalará vía WinGet: ${(app.url ?? '').replace('winget:', '')}` : `Se descargará desde:\n${app.url}\n\n${askLocation ? 'Te preguntaremos dónde guardarlo.' : 'Se guardará en C:\\ExtraApps (la carpeta se crea sola si no existe).'}`,
      onConfirm: async () => {
        closeConfirm();
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
          } else if (app.type === 'winrar') {
            const wingetId = app.url!.replace('winget:', '');
            addLog('Extra Apps', app.name, `winget install ${wingetId}`, 'info');
            const r = await window.electronAPI.wingetInstall(wingetId);
            setOutput(r.output || '');
            addLog('Extra Apps', app.name, r.success ? 'WinRAR instalado' : 'winget terminó con aviso (¿ya estaba instalado?)', r.success ? 'success' : 'warning');
            // Se intenta activar aunque winget avise: si WinRAR ya estaba instalado, solo falta la licencia
            setOutput(prev => prev + '\n\n--- Activación (rarreg.key) ---\n');
            const a = await window.electronAPI.winrarActivate();
            setOutput(prev => prev + a.output);
            addLog('Extra Apps', app.name, a.success ? 'Licencia copiada' : 'No se pudo activar', a.success ? 'success' : 'error');
          } else if (app.url!.startsWith('winget:')) {
            const wingetId = app.url!.replace('winget:', '');
            addLog('Extra Apps', app.name, `winget install ${wingetId}`, 'info');
            const r = await window.electronAPI.wingetInstall(wingetId);
            setOutput(r.output || '');
            addLog('Extra Apps', app.name, r.success ? 'Instalado' : 'Error', r.success ? 'success' : 'error');
            if (!r.success && /hash does not match|no se reconoce/i.test(r.output || '') && app.id === 'obsidian') {
              setOutput((r.output || '') + '\n\nTip: si es un error de hash, reintenta winget con --ignore-security-hash en una terminal sin admin.');
            }
          } else {
            // La carpeta se crea sola si no existe; solo se pregunta si está activado en Ajustes
            const dlDir = await resolveDir({ title: `¿Dónde guardar ${app.name}?`, defaultDir: 'C:\\ExtraApps', ask: askLocation });
            if (!dlDir) { setLoading(false); return; }
            const dest = `${dlDir}\\${app.fileName!}`;
            addLog('Extra Apps', app.name, `Descargando a ${dest}`, 'info');
            const r = await window.electronAPI.downloadFile(app.url!, dest);
            if (!r.success) {
              const msg = String(r.output || '');
              const isMediaFire = app.url!.includes('mediafire.com') || msg.toLowerCase().includes('mediafire') || msg.toLowerCase().includes('pagina html');
              if (isMediaFire) {
                setOutput(`Error: ${msg}\n\nMediaFire no permite descarga directa automática (requiere clic en "Download" dentro de la página).\nPara descarga automática: sube el archivo a un host con link directo (catbox.moe, pixeldrain.com, archive.org, GitHub Releases...) y actualiza la URL.\nPor ahora se abrirá el navegador para descarga manual — coloca el archivo en ${dlDir}.`);
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
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Boxes size={20} />}
        tone="pink"
        title="Otras apps"
        description="Apps fuera del catálogo principal: descargas directas, instaladores especiales y herramientas de terminal"
      />
      <Grid>
        {extraApps.map(app => {
          const Icon = app.icon;
          const kind = kindLabel(app);
          return (
            <ToolCard
              key={app.id}
              icon={<Icon size={18} />}
              title={app.name}
              description={app.description}
              status={kind === 'Terminal' ? 'warning' : kind === 'Descarga' ? 'info' : 'ok'}
              statusText={kind}
              accentColor={app.accentColor === 'red' ? 'pink' : app.accentColor}
              primaryAction={app.type === 'winrar' ? 'Instalar y activar' : kind === 'Descarga' ? 'Descargar' : 'Instalar'}
              primaryOnClick={() => doDownload(app)}
              secondaryAction="Sitio oficial"
              secondaryOnClick={() => window.electronAPI.openExternal(app.website)}
              loading={loading && active === app.name}
              disabled={loading}
            />
          );
        })}
      </Grid>
      <Notice tone="info" icon={<Box size={15} />} title="¿Falta alguna app?">
        Las apps con «Descarga» se guardan en <code className="font-mono">C:\ExtraApps</code> (se crea sola; puedes activar «Preguntar dónde guardar» en Ajustes) y se abre su instalador como administrador.
      </Notice>
      {(output || loading) && <ConsoleOutput title={active || 'Salida'} output={output} loading={loading} />}
      <ConfirmModal isOpen={confirm.open} title={confirm.title} message={confirm.message} confirmText="Continuar" onConfirm={confirm.onConfirm} onCancel={closeConfirm} />
    </div>
  );
}
