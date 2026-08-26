import React, { useState, useEffect, useCallback } from 'react';
import { Shield, ShieldOff, Search, RefreshCw, HardDrive, AlertTriangle, KeyRound, Wrench } from 'lucide-react';
import { ToolCard, ConsoleOutput, ConfirmModal } from '../components';
import { useLogs } from '../context/LogContext';
import { TOOLS } from '../config/constants';

export function WindowsPage() {
  const { addLog } = useLogs();
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; tool: string; title: string; message: string }>({
    open: false, tool: '', title: '', message: '',
  });

  const { MAS_CMD } = TOOLS;

  // Windows Defender (via defender-control: TrustedInstaller + rename de drivers)
  const [defenderEnabled, setDefenderEnabled] = useState<boolean | null>(null);
  const [tamperProtected, setTamperProtected] = useState<boolean | null>(null);
  const [defenderLoading, setDefenderLoading] = useState(false);

const checkDefender = useCallback(async () => {
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
      // Si el servicio está parado/deshabilitado o MsMpEng no corre → deshabilitado
      if (oldFile === 'true' || proc === 'stopped' || status === 'stopped' || status === '' || startType === 'disabled') {
        setDefenderEnabled(false);
        return;
      }
      if (status === 'running' && proc === 'running') {
        setDefenderEnabled(true);
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
        return;
      }
      setDefenderEnabled(null);
    } catch {
      setDefenderEnabled(null);
    }
  }, []);

  useEffect(() => { checkDefender(); }, [checkDefender]);

  const openDefenderControl = () => {
    setDefenderLoading(true);
    addLog('Windows', 'Defender Control', 'Abriendo dControl.exe (Sordum)', 'info');
    window.electronAPI.defenderTool('open').then(r => {
      if (r.success) {
        addLog('Windows', 'Defender Control', 'Abierto. Dentro del programa presiona el botón para Activar o Desactivar.', 'success');
        // Refrescar estado cuando el usuario cierre el programa
        setTimeout(checkDefender, 8000);
      } else {
        addLog('Windows', 'Defender Control', String(r.output), 'error');
      }
      setDefenderLoading(false);
    });
  };

  const repairDefender = () => {
    setConfirmModal({
      open: true,
      tool: 'defender-repair',
      title: 'Reparar Windows Defender',
      message: 'Se ejecutará DISM RestoreHealth + SFC /scannow como administrador para reparar los componentes dañados de Defender.\n\nâ±ï¸ Puede tardar 15-30 minutos. Reinicia después.\n\n¿Continuar?',
    });
  };

  const activateAll = () => {
    setConfirmModal({
      open: true,
      tool: 'mas',
      title: 'Abrir Massgrave (MAS)',
      message: 'Se abrirá Microsoft Activation Scripts en una ventana de PowerShell como administrador.\n\nDentro del menú podrás elegir el método de activación (HWID, Ohook, TSforge, KMS...).\n\nRequiere internet. ¿Continuar?',
    });
  };

  const confirmExecute = async () => {
    const { tool } = confirmModal;
    setConfirmModal({ ...confirmModal, open: false });
    if (tool === 'defender-repair') {
      setLoading(true);
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
    await runTool(tool, confirmModal.title, commands[tool] || '');
  };

  const executeTool = async (tool: string, label: string, command: string, needsConfirm = true) => {
    if (needsConfirm) {
      setConfirmModal({
        open: true,
        tool,
        title: `Ejecutar ${label}`,
        message: `¿Está seguro de ejecutar ${label}? Esta operación puede requerir permisos de administrador.`,
      });
      return;
    }
    await runTool(tool, label, command);
  };

  const runTool = async (tool: string, label: string, command: string) => {
    setLoading(true);
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Herramientas de Windows</h1>
        <p className="text-xs text-dark-400 mt-1">Reparación, mantenimiento y configuración del sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* SFC */}
        <ToolCard
          icon={<Shield size={20} />}
          title="Comprobar archivos del sistema"
          description="Ejecuta SFC /SCANNOW para reparar archivos del sistema Windows"
          status="info"
          statusText="Disponible"
          accentColor="blue"
          primaryAction="Ejecutar"
          primaryOnClick={() => executeTool('sfc', 'SFC /SCANNOW', 'sfc /scannow')}
          loading={loading}
        />

        {/* DISM Check */}
        <ToolCard
          icon={<Search size={20} />}
          title="DISM - Verificar imagen"
          description="Verifica el estado de la imagen de Windows en busca de corrupción"
          status="info"
          statusText="Disponible"
          accentColor="green"
          primaryAction="Ejecutar"
          primaryOnClick={() => executeTool('dism-check', 'DISM CheckHealth', 'DISM /Online /Cleanup-Image /CheckHealth')}
          loading={loading}
        />

        {/* DISM Scan */}
        <ToolCard
          icon={<Search size={20} />}
          title="DISM - Escanear imagen"
          description="Escanea la imagen de Windows en busca de errores"
          status="info"
          statusText="Disponible"
          accentColor="green"
          primaryAction="Ejecutar"
          primaryOnClick={() => executeTool('dism-scan', 'DISM ScanHealth', 'DISM /Online /Cleanup-Image /ScanHealth')}
          loading={loading}
        />

        {/* DISM Restore */}
        <ToolCard
          icon={<RefreshCw size={20} />}
          title="DISM - Restaurar imagen"
          description="Repara la imagen de Windows usando archivos de referencia"
          status="warning"
          statusText="Requiere Admin"
          accentColor="yellow"
          primaryAction="Ejecutar"
          primaryOnClick={() => executeTool('dism-restore', 'DISM RestoreHealth', 'DISM /Online /Cleanup-Image /RestoreHealth')}
          loading={loading}
        />

        {/* CHKDSK */}
        <ToolCard
          icon={<HardDrive size={20} />}
          title="CHKDSK - Revisar disco"
          description="Comprueba la integridad del sistema de archivos y repara errores"
          status="warning"
          statusText="Requiere Admin"
          accentColor="orange"
          primaryAction="Ejecutar"
          primaryOnClick={() => executeTool('chkdsk', 'CHKDSK', 'chkdsk C: /f /r')}
          loading={loading}
        />

        {/* Windows Update */}
        <ToolCard
          icon={<AlertTriangle size={20} />}
          title="Windows Update"
          description="Abrir la configuración de Windows Update"
          status="info"
          statusText="Disponible"
          accentColor="cyan"
          primaryAction="Abrir"
          primaryOnClick={() => window.electronAPI.runCommand('start ms-settings:windowsupdate')}
        />

        {/* Activar Windows y Office */}
        <ToolCard
          icon={<KeyRound size={20} />}
          title="Activar Windows y Office"
          description="MAS: Windows por HWID + Office por Ohook, en un solo clic"
          status="ok"
          statusText="Recomendado"
          accentColor="green"
          primaryAction="Activar todo"
          primaryOnClick={activateAll}
          loading={loading}
        />

        {/* Windows Defender - Defender Control (Sordum) */}
        <div className="bg-dark-800/50 border border-dark-700 rounded-lg p-4 border-t-2 border-t-orange-500/60 hover:border-dark-600 transition-colors">
          <div className="flex items-start gap-3">
            <span className={`mt-0.5 ${defenderEnabled ? 'text-green-400' : 'text-orange-400'}`}>
              {defenderEnabled === true ? <Shield size={20} /> : <ShieldOff size={20} />}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-semibold text-neutral-900">Windows Defender</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  defenderEnabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {defenderEnabled ? 'ACTIVO' : 'DESACTIVADO'}
                </span>
                {tamperProtected && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-yellow-500/20 text-yellow-400">
                    Tamper ON
                  </span>
                )}
              </div>
              <p className="text-[11px] text-dark-400 mt-1">
                Panel de Defender Control integrado. Dentro del programa, presiona el botón grande para Activar o Desactivar.
              </p>
              <div className="flex gap-2 mt-3 flex-wrap">
                <button
                  onClick={openDefenderControl}
                  disabled={defenderLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-neutral-900 text-xs font-medium rounded-lg transition-all duration-200 disabled:opacity-50"
                >
                  <Shield size={13} />
                  Abrir panel de control
                </button>
                <button
                  onClick={checkDefender}
                  disabled={defenderLoading}
                  className="px-3 py-1.5 bg-dark-800 hover:bg-dark-700 border border-dark-600 text-dark-300 text-xs font-medium rounded-lg transition-all duration-200"
                >
                  Actualizar estado
                </button>
                <button
                  onClick={repairDefender}
                  disabled={defenderLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/80 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-all duration-200 disabled:opacity-50"
                >
                  <Wrench size={13} />
                  Reparar Defender
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Console Output */}
      {(output || loading) && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-dark-300 mb-2">Consola de salida</h3>
          <ConsoleOutput output={output} loading={loading} />
        </div>
      )}

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
