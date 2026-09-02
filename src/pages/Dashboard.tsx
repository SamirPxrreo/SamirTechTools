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

  // Limpiar RAM (purga la standby list del sistema via NtSetSystemInformation)
  const [clearingRAM, setClearingRAM] = useState(false);
  const clearRAM = useCallback(async () => {
    setClearingRAM(true);
    addLog('RAM', 'Limpiando', 'Liberando memoria standby (requiere admin)...', 'info');
    try {
      const r = await window.electronAPI.clearRam();
      if (r.success) {
        addLog('RAM', 'Limpiando', 'Memoria standby liberada correctamente', 'success');
      } else {
        addLog('RAM', 'Error', r.output || 'No se pudo liberar la memoria', 'error');
      }
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
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-bold tracking-tight text-slate-900">Centro de Diagnóstico</h1>
          <p className="text-[13px] text-slate-500 mt-1">Información del sistema en tiempo real · CPU/RAM en vivo cada 3s</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleGenerateReport}
            disabled={generatingReport}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-[13px] font-medium rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-50 shadow-sm"
          >
            <FileText size={15} />
            {generatingReport ? 'Generando...' : 'Reporte'}
          </button>
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-[13px] font-medium rounded-xl transition-colors disabled:opacity-50 shadow-sm"
          >
            <RefreshCw size={15} className={analyzing ? 'animate-spin' : ''} />
            {analyzing ? 'Analizando...' : 'Analizar'}
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
                <SystemCard title="Uso" value={`${cpuInfo.usage}%`} icon={<Cpu size={12} />} />
                <SystemCard title="Núcleos" value={`${cpuInfo.cores}`} subtitle={`${cpuInfo.logicalCores} hilos`} />
                <SystemCard title="Frecuencia" value={formatFrequency(cpuInfo.speed * 1000)} />
                <SystemCard title="Máxima" value={formatFrequency(cpuInfo.maxSpeed * 1000)} />
              </div>
              <ProgressBar value={cpuInfo.usage} />
              {cpuInfo.temperature !== null && (
                <div className="text-[10px] text-slate-500">
                  Temperatura: <span className="text-slate-900">{cpuInfo.temperature}°C</span>
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
                <SystemCard title="Total" value={formatBytes(ramInfo.total)} />
                <SystemCard title="Disponible" value={formatBytes(ramInfo.free)} />
                <SystemCard title="Utilizada" value={formatBytes(ramInfo.used)} />
                <SystemCard title="Módulos" value={`${ramInfo.moduleCount}`} />
              </div>
              <ProgressBar value={ramInfo.percentage} />
              {ramInfo.modules.length > 0 && (
                <div className="text-[10px] text-slate-500">
                  {ramInfo.modules.map((m, i) => (
                    <div key={i}>Módulo {i + 1}: {formatBytes(m.capacity)} - {m.speed}MHz</div>
                  ))}
                </div>
              )}
              <div className="flex gap-2 pt-2 border-t border-slate-200">
                <button
                  onClick={clearRAM}
                  disabled={clearingRAM}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-white text-xs font-medium rounded-lg transition-all duration-200 disabled:opacity-50"
                >
                  {clearingRAM ? <Loader size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  {clearingRAM ? 'Limpiando...' : 'Liberar RAM'}
                </button>
                <button
                  onClick={refreshSystemInfo}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-all duration-200"
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
                      <span className="text-slate-600">Disco {disk.letter}</span>
                      <span className="text-slate-500">{formatBytes(disk.free)} libre</span>
                    </div>
                    <ProgressBar value={pct} />
                    <div className="text-[10px] text-slate-500 mt-0.5">
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
                  <SystemCard title="Modelo" value={gpu.name} />
                  <SystemCard title="VRAM" value={gpu.vram > 0 ? formatBytes(gpu.vram) : 'N/A'} />
                  <SystemCard title="Driver" value={gpu.driverVersion} />
                  <SystemCard title="Fecha" value={gpu.driverDate || 'N/A'} />
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
              <SystemCard title="Versión" value={windowsInfo.version || 'N/A'} />
              <SystemCard title="Build" value={windowsInfo.build || 'N/A'} />
              <SystemCard title="Arquitectura" value={windowsInfo.architecture || 'N/A'} />
              <SystemCard title="Registrado a" value={windowsInfo.registeredUser || 'N/A'} />
              {windowsInfo.boardManufacturer && (
                <div className="col-span-2">
                  <SystemCard title="Placa Base" value={`${windowsInfo.boardManufacturer} ${windowsInfo.boardProduct || ''}`.trim()} />
                </div>
              )}
              {windowsInfo.boardVersion && (
                <SystemCard title="Versión BIOS" value={windowsInfo.boardVersion} />
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
              <SystemCard title="IP Local" value={networkInfo.ip || 'N/A'} />
              <SystemCard title="Gateway" value={networkInfo.gateway || 'N/A'} />
              <SystemCard title="DNS" value={networkInfo.dns || 'N/A'} />
              <SystemCard title="MAC" value={networkInfo.mac || 'N/A'} />
            </div>
          )}
        </ToolCard>
      </div>
    </div>
  );
}
