import React, { useState, useEffect, useCallback } from 'react';
import { Shield, ShieldOff, ScanSearch, RefreshCw, HardDrive, KeyRound, Wrench, Monitor, DownloadCloud, ShieldQuestion, Stethoscope } from 'lucide-react';
import { ToolCard, ConsoleOutput, ConfirmModal, PageHeader, Section, Grid, Button, Badge, IconTile } from '../components';
import { useLogs } from '../context/LogContext';
import { TOOLS } from '../config/constants';

export function WindowsPage() {
  const { addLog } = useLogs();
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTool, setActiveTool] = useState('');
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; tool: string; title: string; message: string }>({
    open: false, tool: '', title: '', message: '',
  });

  const { MAS_CMD } = TOOLS;

  // Windows Defender (via defender-control: TrustedInstaller + rename de drivers)
  const [defenderEnabled, setDefenderEnabled] = useState<boolean | null>(null);
  const [tamperProtected, setTamperProtected] = useState<boolean | null>(null);
  const [defenderLoading, setDefenderLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  const checkDefender = useCallback(async () => {
    setChecking(true);
    try {
      // Usar solo métodos de detección del sistema (dControl.exe no tiene CLI de status)
      // Fallback 1: servicio WinDefend + proceso MsMpEng + binarios renombrados
      const s = await window.electronAPI.runCommand(
        'powershell -NoProfile -Command "' +
        '$svc = Get-Service -Name WinDefend -ErrorAction SilentlyContinue; ' +
        '$proc = Get-Process -Name MsMpEng -ErrorAction SilentlyContinue; ' +
        '$old = Test-Path "C:\\Program Files\\Windows Defender\\MsMpEng.exe.OLD"; ' +
        'Write-Output "$($svc.Status)|$($svc.StartType)|$(if($proc){\'running\'}else{\'stopped\'})|$old"' +
        '"'
      );
      const [status, startType, proc, oldFile] = s.output.trim().toLowerCase().split('|');
      if (oldFile === 'true' || proc === 'stopped' || status === 'stopped' || status === '' || startType === 'disabled') {
        setDefenderEnabled(false);
        setChecking(false);
        return;
      }
      if (status === 'running' && proc === 'running') {
        setDefenderEnabled(true);
        setChecking(false);
        return;
      }
    } catch { /* continuar con fallback */ }

    try {
      // Fallback 2: cmdlet nativo
      const s2 = await window.electronAPI.runCommand(
        'powershell -NoProfile -Command "$s=Get-MpComputerStatus -ErrorAction SilentlyContinue; Write-Output \"$($s.RealTimeProtectionEnabled)|$($s.IsTamperProtected)\""'
      );
      const [rt, tp] = s2.output.trim().split('|');
      if (rt && (rt.toLowerCase() === 'true' || rt.toLowerCase() === 'false')) {
        setDefenderEnabled(rt.toLowerCase() === 'true');
        setTamperProtected(tp?.trim().toLowerCase() === 'true');
      } else {
        setDefenderEnabled(null);
      }
    } catch {
      setDefenderEnabled(null);
    }
    setChecking(false);
  }, []);

  useEffect(() => { checkDefender(); }, [checkDefender]);

  const toggleDefender = (action: 'disable' | 'enable' | 'open') => {
    setDefenderLoading(true);
    addLog('Windows', 'Defender', action === 'disable' ? 'Desactivando...' : action === 'open' ? 'Abriendo Defender Control...' : 'Activando...', 'info');
    window.electronAPI.defenderTool(action).then(r => {
      if (r.success) {
        addLog('Windows', 'Defender', r.output, 'success');
        setTimeout(checkDefender, 5000);
        setTimeout(checkDefender, 12000);
      } else {
        addLog('Windows', 'Defender', String(r.output), 'error');
      }
      setDefenderLoading(false);
    });
  };

  const repairDefender = () => {
    setConfirmModal({
      open: true,
      tool: 'defender-repair',
      title: 'Reparar Windows Defender',
      message: 'Se ejecutará DISM RestoreHealth + SFC /scannow como administrador para reparar los componentes dañados de Defender.\n\nPuede tardar 15-30 minutos. Reinicia después.',
    });
  };

  const activateAll = () => {
    setConfirmModal({
      open: true,
      tool: 'mas',
      title: 'Abrir Massgrave (MAS)',
      message: 'Se abrirá Microsoft Activation Scripts en una ventana de PowerShell como administrador.\n\nDentro del menú podrás elegir el método de activación (HWID, Ohook, TSforge, KMS...).\n\nRequiere internet.',
    });
  };

  const confirmExecute = async () => {
    const { tool } = confirmModal;
    setConfirmModal({ ...confirmModal, open: false });
    if (tool === 'defender-repair') {
      setLoading(true);
      setActiveTool('Reparar Defender');
      setOutput('');
      addLog('Windows', 'Reparación Defender', 'DISM RestoreHealth + SFC', 'info');
      try {
        const r = await window.electronAPI.runCommand(
          'powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process cmd -Verb RunAs -ArgumentList \'/k DISM /Online /Cleanup-Image /RestoreHealth && sfc /scannow\'"'
        );
        setOutput(r.output || 'Ventana de reparación abierta. Espera a que termine (15-30 min) y reinicia.');
        addLog('Windows', 'Reparación Defender', 'Proceso lanzado. Reinicia al terminar.', r.success ? 'success' : 'error');
      } catch (err) {
        addLog('Windows', 'Reparación Defender - Error', String(err), 'error');
      }
      setLoading(false);
      return;
    }
    if (tool === 'mas') {
      setLoading(true);
      setActiveTool('MAS');
      setOutput('');
      addLog('Windows', 'MAS', 'Abriendo menú interactivo (get.activated.win)', 'info');
      try {
        const result = await window.electronAPI.runCommand(MAS_CMD);
        setOutput(result.output);
        addLog('Windows', 'MAS', result.success ? 'Ventana abierta. Elige el método en el menú.' : String(result.output), result.success ? 'success' : 'error');
      } catch (err) {
        setOutput(`Error: ${err}`);
        addLog('Windows', 'MAS - Error', String(err), 'error');
      }
      setLoading(false);
      return;
    }
    const commands: Record<string, string> = {
      'sfc': 'sfc /scannow',
      'dism-check': 'DISM /Online /Cleanup-Image /CheckHealth',
      'dism-scan': 'DISM /Online /Cleanup-Image /ScanHealth',
      'dism-restore': 'DISM /Online /Cleanup-Image /RestoreHealth',
      'chkdsk': 'chkdsk C: /f /r',
    };
    await runTool(tool, confirmModal.title.replace('Ejecutar ', ''), commands[tool] || '');
  };

  const executeTool = async (tool: string, label: string, command: string, needsConfirm = true) => {
    if (needsConfirm) {
      setConfirmModal({
        open: true,
        tool,
        title: `Ejecutar ${label}`,
        message: `¿Seguro que quieres ejecutar ${label}? Esta operación puede requerir permisos de administrador y tardar varios minutos.`,
      });
      return;
    }
    await runTool(tool, label, command);
  };

  const runTool = async (tool: string, label: string, command: string) => {
    setLoading(true);
    setActiveTool(label);
    setOutput('');
    addLog('Windows', `${label} - Iniciado`, command, 'info');
    try {
      const result = await window.electronAPI.executeTool(tool);
      setOutput(result.output);
      addLog('Windows', `${label} - Completado`, result.success ? 'Éxito' : 'Error', result.success ? 'success' : 'error');
    } catch (err) {
      setOutput(`Error: ${err}`);
      addLog('Windows', `${label} - Error`, String(err), 'error');
    }
    setLoading(false);
  };

  const isBusy = (label: string) => loading && activeTool === label;

  const defenderState = defenderEnabled === true ? 'on' : defenderEnabled === false ? 'off' : 'unknown';

  return (
    <div className="space-y-8">
      <PageHeader
        icon={<Monitor size={20} />}
        tone="sky"
        title="Herramientas de Windows"
        description="Reparación, mantenimiento, seguridad y activación del sistema"
      />

      {/* Defender destacado */}
      <div className="card relative overflow-hidden p-5">
        <div className={`pointer-events-none absolute -top-20 -left-10 w-72 h-72 rounded-full blur-3xl ${defenderState === 'on' ? 'bg-emerald-500/10' : defenderState === 'off' ? 'bg-orange-500/10' : 'bg-slate-500/5'}`} />
        <div className="relative flex items-center gap-5 flex-wrap">
          <IconTile tone={defenderState === 'on' ? 'emerald' : defenderState === 'off' ? 'orange' : 'slate'} size="lg">
            {defenderState === 'on' ? <Shield size={20} /> : defenderState === 'off' ? <ShieldOff size={20} /> : <ShieldQuestion size={20} />}
          </IconTile>
          <div className="flex-1 min-w-[260px]">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-[15px] font-semibold text-fg">Windows Defender</h3>
              {checking ? (
                <Badge status="neutral">Comprobando…</Badge>
              ) : (
                <Badge status={defenderState === 'on' ? 'ok' : defenderState === 'off' ? 'warning' : 'neutral'} dot>
                  {defenderState === 'on' ? 'Activo' : defenderState === 'off' ? 'Desactivado' : 'Desconocido'}
                </Badge>
              )}
              {tamperProtected && <Badge status="info">Protección contra alteraciones</Badge>}
            </div>
            <p className="text-[12.5px] text-muted mt-1 max-w-2xl">
              Incluye Defender Control (Sordum). Ábrelo y usa el botón grande del programa para activar o desactivar la protección.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="primary" icon={<Shield size={14} />} onClick={() => toggleDefender('open')} loading={defenderLoading}>Abrir Defender Control</Button>
            <Button icon={<RefreshCw size={14} className={checking ? 'animate-spin' : ''} />} onClick={checkDefender} disabled={checking}>Comprobar</Button>
            <Button variant="ghost" icon={<Wrench size={14} />} onClick={repairDefender}>Reparar</Button>
          </div>
        </div>
      </div>

      <Section title="Reparación del sistema" icon={<Stethoscope size={14} />} description="Comprueban y reparan archivos e imagen de Windows">
        <Grid>
          <ToolCard
            icon={<Shield size={18} />}
            title="Comprobar archivos del sistema"
            description="SFC /SCANNOW busca y repara archivos protegidos de Windows dañados."
            accentColor="indigo"
            primaryAction="Ejecutar"
            primaryOnClick={() => executeTool('sfc', 'SFC /SCANNOW', 'sfc /scannow')}
            loading={isBusy('SFC /SCANNOW')}
            disabled={loading}
          />
          <ToolCard
            icon={<ScanSearch size={18} />}
            title="DISM · Verificar imagen"
            description="Comprobación rápida del estado de la imagen de Windows (CheckHealth)."
            accentColor="emerald"
            primaryAction="Ejecutar"
            primaryOnClick={() => executeTool('dism-check', 'DISM CheckHealth', 'DISM /Online /Cleanup-Image /CheckHealth')}
            loading={isBusy('DISM CheckHealth')}
            disabled={loading}
          />
          <ToolCard
            icon={<ScanSearch size={18} />}
            title="DISM · Escanear imagen"
            description="Análisis profundo de la imagen en busca de corrupción (ScanHealth)."
            accentColor="teal"
            primaryAction="Ejecutar"
            primaryOnClick={() => executeTool('dism-scan', 'DISM ScanHealth', 'DISM /Online /Cleanup-Image /ScanHealth')}
            loading={isBusy('DISM ScanHealth')}
            disabled={loading}
          />
          <ToolCard
            icon={<RefreshCw size={18} />}
            title="DISM · Restaurar imagen"
            description="Repara la imagen descargando componentes limpios de Windows Update."
            status="warning"
            statusText="Admin"
            accentColor="amber"
            primaryAction="Ejecutar"
            primaryOnClick={() => executeTool('dism-restore', 'DISM RestoreHealth', 'DISM /Online /Cleanup-Image /RestoreHealth')}
            loading={isBusy('DISM RestoreHealth')}
            disabled={loading}
          />
          <ToolCard
            icon={<HardDrive size={18} />}
            title="CHKDSK · Revisar disco"
            description="Comprueba el sistema de archivos de C: y repara sectores. Puede pedir reinicio."
            status="warning"
            statusText="Admin"
            accentColor="orange"
            primaryAction="Ejecutar"
            primaryOnClick={() => executeTool('chkdsk', 'CHKDSK', 'chkdsk C: /f /r')}
            loading={isBusy('CHKDSK')}
            disabled={loading}
          />
          <ToolCard
            icon={<DownloadCloud size={18} />}
            title="Windows Update"
            description="Abre la configuración de Windows Update para buscar actualizaciones."
            accentColor="cyan"
            primaryAction="Abrir"
            primaryOnClick={() => window.electronAPI.runCommand('start ms-settings:windowsupdate')}
          />
        </Grid>
      </Section>

      <Section title="Activación" icon={<KeyRound size={14} />}>
        <Grid>
          <ToolCard
            icon={<KeyRound size={18} />}
            title="Activar Windows y Office"
            description="MAS: Windows por HWID y Office por Ohook desde un menú interactivo."
            status="ok"
            statusText="Recomendado"
            accentColor="violet"
            primaryAction="Abrir MAS"
            primaryOnClick={activateAll}
            secondaryAction="Documentación"
            secondaryOnClick={() => window.electronAPI.openExternal('https://massgrave.dev')}
            loading={isBusy('MAS')}
            disabled={loading}
          />
        </Grid>
      </Section>

      {(output || loading) && <ConsoleOutput title={activeTool || 'Salida'} output={output} loading={loading} />}

      <ConfirmModal
        isOpen={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Ejecutar"
        danger={confirmModal.tool === 'dism-restore' || confirmModal.tool === 'chkdsk'}
        onConfirm={confirmExecute}
        onCancel={() => setConfirmModal({ ...confirmModal, open: false })}
      />
    </div>
  );
}
