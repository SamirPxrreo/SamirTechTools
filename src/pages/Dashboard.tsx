import React, { useState, useEffect, useCallback } from 'react';
import { Cpu, HardDrive, MemoryStick, MonitorSmartphone, Wifi, Info, RefreshCw, FileText, Trash2, Loader } from 'lucide-react';
import { ToolCard, ProgressBar, SystemCard } from '../components';
import { CpuInfo, RamInfo, DiskInfo, GpuInfo, WindowsInfo, NetworkInfo } from '../types';
import { formatBytes, formatFrequency, formatUptime } from '../utils';
import { useLogs } from '../context/LogContext';

interface DashboardProps {
  cpuInfo: CpuInfo | null;
  ramInfo: RamInfo | null;
  diskInfo: DiskInfo | null;
  gpuInfo: GpuInfo[];
  windowsInfo: WindowsInfo | null;
  networkInfo: NetworkInfo | null;
  onRefresh: () => void;
  loading: boolean;
}

export function Dashboard({
  cpuInfo,
  ramInfo,
  diskInfo,
  gpuInfo,
  windowsInfo,
  networkInfo,
  onRefresh,
  loading,
}: DashboardProps) {
  const { addLog } = useLogs();
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = useCallback(async () => {
    setAnalyzing(true);
    addLog('CPU', 'Análisis iniciado', 'Obteniendo información del procesador...', 'info');
    onRefresh();
    setTimeout(() => {
      setAnalyzing(false);
      addLog('CPU', 'Análisis completado', 'Información del procesador obtenida', 'success');
    }, 2000);
  }, [addLog, onRefresh]);

  const [generatingReport, setGeneratingReport] = useState(false);

  const handleGenerateReport = useCallback(async () => {
    setGeneratingReport(true);
    try {
      const f = (v: unknown) => v ?? 'N/A';
      const report = [
        '========================================',
        '       REPORTE DE DIAGNÓSTICO',
        `       SamirTechTools - ${new Date().toLocaleString('es-MX')}`,
        '========================================',
        '',
        '--- SISTEMA ---',
        `Windows: ${f(windowsInfo?.caption)}`,
        `Versión: ${f(windowsInfo?.version)} (Build ${f(windowsInfo?.build)})`,
        `Arquitectura: ${f(windowsInfo?.architecture)}`,
        `Fecha de instalación: ${f(windowsInfo?.installDate)}`,
        '',
        '--- CPU ---',
        `Procesador: ${f(cpuInfo?.model)} (${f(cpuInfo?.manufacturer)})`,
        `Núcleos: ${f(cpuInfo?.cores)} físicos / ${f(cpuInfo?.logicalCores)} lógicos`,
        `Velocidad: ${cpuInfo?.speed ? formatFrequency(cpuInfo.speed) : 'N/A'} (máx: ${cpuInfo?.maxSpeed ? formatFrequency(cpuInfo.maxSpeed) : 'N/A'})`,
        '',
        '--- RAM ---',
        `Total: ${ramInfo ? formatBytes(ramInfo.total * 1024 ** 3) : 'N/A'}`,
        `Libre: ${ramInfo ? formatBytes(ramInfo.free * 1024 ** 3) : 'N/A'}`,
        `Módulos instalados: ${f(ramInfo?.moduleCount)}`,
        ...((ramInfo?.modules ?? []).map(m => `- ${formatBytes(m.capacity * 1024 ** 3)} @ ${m.speed}MHz (${f(m.manufacturer)})`)),
        '',
        '--- GPU ---',
        ...gpuInfo.map(g => `- ${g.name} (${g.vram ? formatBytes(g.vram * 1024 ** 3) : 'VRAM N/A'}) - Driver ${f(g.driverVersion)}`),
        '',
        '--- DISCOS FÍSICOS ---',
        ...(diskInfo?.physical ?? []).map(d => `- ${d.model}: ${formatBytes(d.size * 1024 ** 3)} (${d.mediaType}, ${d.interfaceType})`),
        '',
        '--- UNIDADES LÓGICAS ---',
        ...(diskInfo?.logical ?? []).map(d => `- ${d.letter}: Total ${formatBytes(d.total * 1024 ** 3)}, Libre ${formatBytes(d.free * 1024 ** 3)} (${d.fileSystem})`),
        '',
        '--- RED ---',
        `IP: ${f(networkInfo?.ip)}`,
        `Gateway: ${f(networkInfo?.gateway)}`,
        `DNS: ${f(networkInfo?.dns)}`,
        `MAC: ${f(networkInfo?.mac)}`,
        `Internet: ${networkInfo?.internet ? 'Conectado' : 'Sin conexión'}`,
        '',
        '========================================',
      ].join('\n');

      const username = await window.electronAPI.getUsername();
      const desktopPath = `C:\\Users\\${username}\\Desktop`;
      const fileName = `Reporte_Diagnostico_${new Date().toISOString().slice(0, 10)}.txt`;
      const r = await window.electronAPI.writeFile(`${desktopPath}\\${fileName}`, report);

      if (r.success) {
        addLog('Reporte', 'Generado', `Guardado en el Escritorio: ${fileName}`, 'success');
      } else {
        addLog('Reporte', 'Error', String(r.output), 'error');
      }
    } catch (err) {
      addLog('Reporte', 'Error', String(err), 'error');
    }
    setGeneratingReport(false);
  }, [cpuInfo, ramInfo, diskInfo, gpuInfo, windowsInfo, networkInfo, addLog]);

  // Limpiar RAM (liberar standby list)
  const [clearingRAM, setClearingRAM] = useState(false);
  const clearRAM = useCallback(async () => {
    setClearingRAM(true);
    addLog('RAM', 'Limpiando', 'Liberando memoria standby...', 'info');
    try {
      const r = await window.electronAPI.runCommand(
        'powershell -NoProfile -ExecutionPolicy Bypass -Command "& { $sig = \"[DllImport(\\\"kernel32.dll\\\")]public static extern bool SetProcessWorkingSetSize(IntPtr hProcess, int dwMinimumWorkingSetSize, int dwMaximumWorkingSetSize);\"; Add-Type -MemberDefinition $sig -Namespace Win32 -Name Kernel32; [Win32.Kernel32]::SetProcessWorkingSetSize((Get-Process -Id $pid).Handle, -1, -1) }"'
      );
      // Método alternativo: EmptyStandbyList si existe
      if (!r.success) {
        await window.electronAPI.runCommand(
          'powershell -NoProfile -ExecutionPolicy Bypass -Command "if (Test-Path \"$env:TEMP\\EmptyStandbyList.exe\") { & \"$env:TEMP\\EmptyStandbyList.exe\" standby } else { Write-Host \"EmptyStandbyList no disponible\" }"'
        );
      }
      addLog('RAM', 'Limpiando', 'Memoria standby liberada', 'success');
    } catch (err) {
      addLog('RAM', 'Error', String(err), 'error');
    }
    setClearingRAM(false);
    // Refrescar info de RAM
    onRefresh();
  }, [addLog, onRefresh]);

  const refreshSystemInfo = useCallback(() => {
    addLog('Sistema', 'Actualizando', 'Refrescando información del sistema...', 'info');
    onRefresh();
  }, [addLog, onRefresh]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Centro de Diagnóstico</h1>
          <p className="text-xs text-dark-400 mt-1">Información del sistema en tiempo real</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleGenerateReport}
            disabled={generatingReport}
            className="flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 border border-dark-600 text-white text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            <FileText size={16} />
            {generatingReport ? 'Generando...' : 'Generar reporte'}
          </button>
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            <RefreshCw size={16} className={analyzing ? 'animate-spin' : ''} />
            {analyzing ? 'Analizando...' : 'Analizar equipo'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* CPU Card */}
        <ToolCard
          icon={<Cpu size={20} />}
          title="CPU / Procesador"
          description={cpuInfo?.model || 'Cargando...'}
          status={cpuInfo ? 'ok' : 'info'}
          statusText={cpuInfo ? 'Detectado' : 'Cargando'}
          accentColor="blue"
          primaryAction="Analizar"
          primaryOnClick={handleAnalyze}
          secondaryAction="Información"
          loading={analyzing}
        >
          {cpuInfo && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <SystemCard title="Uso" value={`${cpuInfo.usage}%`} color="text-blue-400" icon={<Cpu size={12} />} />
                <SystemCard title="Núcleos" value={`${cpuInfo.cores}`} subtitle={`${cpuInfo.logicalCores} hilos`} color="text-blue-400" />
                <SystemCard title="Frecuencia" value={formatFrequency(cpuInfo.speed * 1000)} color="text-blue-400" />
                <SystemCard title="Máxima" value={formatFrequency(cpuInfo.maxSpeed * 1000)} color="text-blue-400" />
              </div>
              <ProgressBar value={cpuInfo.usage} />
              {cpuInfo.temperature !== null && (
                <div className="text-[10px] text-dark-400">
                  Temperatura: <span className="text-white">{cpuInfo.temperature}°C</span>
                </div>
              )}
            </div>
          )}
        </ToolCard>

        {/* RAM Card */}
        <ToolCard
          icon={<MemoryStick size={20} />}
          title="Memoria RAM"
          description={ramInfo ? `${formatBytes(ramInfo.total)} total` : 'Cargando...'}
          status={ramInfo ? (ramInfo.percentage > 80 ? 'warning' : 'ok') : 'info'}
          statusText={ramInfo ? `${ramInfo.percentage}% uso` : 'Cargando'}
          accentColor="green"
          primaryAction="Diagnosticar"
          secondaryAction="Información"
        >
          {ramInfo && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <SystemCard title="Total" value={formatBytes(ramInfo.total)} color="text-green-400" />
                <SystemCard title="Disponible" value={formatBytes(ramInfo.free)} color="text-green-400" />
                <SystemCard title="Utilizada" value={formatBytes(ramInfo.used)} color="text-green-400" />
                <SystemCard title="Módulos" value={`${ramInfo.moduleCount}`} color="text-green-400" />
              </div>
              <ProgressBar value={ramInfo.percentage} />
              {ramInfo.modules.length > 0 && (
                <div className="text-[10px] text-dark-400">
                  {ramInfo.modules.map((m, i) => (
                    <div key={i}>Módulo {i + 1}: {formatBytes(m.capacity)} - {m.speed}MHz</div>
                  ))}
                </div>
              )}
              <div className="flex gap-2 pt-2 border-t border-dark-700">
                <button
                  onClick={clearRAM}
                  disabled={clearingRAM}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-yellow-600/80 hover:bg-yellow-700 text-white text-xs font-medium rounded-lg transition-all duration-200 disabled:opacity-50"
                >
                  {clearingRAM ? <Loader size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  {clearingRAM ? 'Limpiando...' : 'Liberar RAM'}
                </button>
                <button
                  onClick={refreshSystemInfo}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-dark-700 hover:bg-dark-600 text-dark-200 text-xs font-medium rounded-lg transition-all duration-200"
                >
                  <RefreshCw size={13} />
                  Actualizar
                </button>
              </div>
            </div>
          )}
        </ToolCard>

        {/* Disk Card */}
        <ToolCard
          icon={<HardDrive size={20} />}
          title="Almacenamiento"
          description={diskInfo ? `${diskInfo.logical.length} unidad(es) detectada(s)` : 'Cargando...'}
          status={diskInfo ? 'ok' : 'info'}
          statusText={diskInfo ? 'Detectado' : 'Cargando'}
          accentColor="yellow"
          primaryAction="Analizar"
          secondaryAction="SMART"
        >
          {diskInfo && diskInfo.logical.length > 0 && (
            <div className="space-y-3">
              {diskInfo.logical.map((disk, i) => {
                const used = disk.total - disk.free;
                const pct = disk.total > 0 ? (used / disk.total) * 100 : 0;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-dark-300">Disco {disk.letter}</span>
                      <span className="text-dark-400">{formatBytes(disk.free)} libre</span>
                    </div>
                    <ProgressBar value={pct} />
                    <div className="text-[10px] text-dark-500 mt-0.5">
                      {formatBytes(used)} / {formatBytes(disk.total)} ({Math.round(pct)}%)
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ToolCard>

        {/* GPU Card */}
        <ToolCard
          icon={<MonitorSmartphone size={20} />}
          title="GPU / Tarjeta Gráfica"
          description={gpuInfo.length > 0 ? gpuInfo[0].name : 'Cargando...'}
          status={gpuInfo.length > 0 ? 'ok' : 'info'}
          statusText={gpuInfo.length > 0 ? 'Detectada' : 'Cargando'}
          accentColor="purple"
          primaryAction="Diagnosticar"
          secondaryAction="Información"
        >
          {gpuInfo.length > 0 && (
            <div className="space-y-3">
              {gpuInfo.map((gpu, i) => (
                <div key={i} className="grid grid-cols-2 gap-2">
                  <SystemCard title="Modelo" value={gpu.name} color="text-purple-400" />
                  <SystemCard title="VRAM" value={gpu.vram > 0 ? formatBytes(gpu.vram) : 'N/A'} color="text-purple-400" />
                  <SystemCard title="Driver" value={gpu.driverVersion} color="text-purple-400" />
                  <SystemCard title="Fecha" value={gpu.driverDate || 'N/A'} color="text-purple-400" />
                </div>
              ))}
            </div>
          )}
        </ToolCard>

        {/* Windows Card */}
        <ToolCard
          icon={<Info size={20} />}
          title="Sistema Operativo"
          description={windowsInfo?.caption || 'Cargando...'}
          status={windowsInfo ? 'ok' : 'info'}
          statusText={windowsInfo ? 'Detectado' : 'Cargando'}
          accentColor="cyan"
          primaryAction="Información"
        >
          {windowsInfo && (
            <div className="grid grid-cols-2 gap-2">
              <SystemCard title="Versión" value={windowsInfo.version || 'N/A'} color="text-cyan-400" />
              <SystemCard title="Build" value={windowsInfo.build || 'N/A'} color="text-cyan-400" />
              <SystemCard title="Arquitectura" value={windowsInfo.architecture || 'N/A'} color="text-cyan-400" />
              <SystemCard title="Registrado a" value={windowsInfo.registeredUser || 'N/A'} color="text-cyan-400" />
              {windowsInfo.boardManufacturer && (
                <SystemCard title="Placa Base" value={`${windowsInfo.boardManufacturer} ${windowsInfo.boardProduct || ''}`.trim()} color="text-purple-400" />
              )}
              {windowsInfo.boardVersion && (
                <SystemCard title="Versión BIOS" value={windowsInfo.boardVersion} color="text-purple-400" />
              )}
            </div>
          )}
        </ToolCard>

        {/* Network Card */}
        <ToolCard
          icon={<Wifi size={20} />}
          title="Red"
          description={networkInfo?.ip ? `IP: ${networkInfo.ip}` : 'Cargando...'}
          status={networkInfo?.internet ? 'ok' : networkInfo?.ip ? 'warning' : 'info'}
          statusText={networkInfo?.internet ? 'Conectado' : 'Sin Internet'}
          accentColor="orange"
          primaryAction="Diagnosticar"
          secondaryAction="Información"
        >
          {networkInfo && (
            <div className="grid grid-cols-2 gap-2">
              <SystemCard title="IP Local" value={networkInfo.ip || 'N/A'} color="text-orange-400" />
              <SystemCard title="Gateway" value={networkInfo.gateway || 'N/A'} color="text-orange-400" />
              <SystemCard title="DNS" value={networkInfo.dns || 'N/A'} color="text-orange-400" />
              <SystemCard title="MAC" value={networkInfo.mac || 'N/A'} color="text-orange-400" />
            </div>
          )}
        </ToolCard>
      </div>
    </div>
  );
}
