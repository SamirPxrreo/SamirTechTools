import React, { useState, useCallback, ReactNode } from 'react';
import {
  Cpu, HardDrive, MemoryStick, MonitorSmartphone, Wifi, WifiOff, RefreshCw, FileDown, Monitor,
  CircuitBoard, Clock, Gauge, Sparkles,
} from 'lucide-react';
import { ProgressBar, Badge, Button, IconTile, KeyValue, EmptyState, cx } from '../components';
import { CpuInfo, RamInfo, DiskInfo, GpuInfo, WindowsInfo, NetworkInfo } from '../types';
import { formatBytes, formatFrequency } from '../utils';
import { useLogs } from '../context/LogContext';

interface DashboardProps {
  computerName: string;
  username: string;
  cpuInfo: CpuInfo | null;
  ramInfo: RamInfo | null;
  diskInfo: DiskInfo | null;
  gpuInfo: GpuInfo[] | null;
  windowsInfo: WindowsInfo | null;
  networkInfo: NetworkInfo | null;
  onRefresh: () => void;
  loading: boolean;
  loadingDetails: boolean;
  lastScan: Date | null;
}

const shortCpu = (m: string) =>
  m.replace(/\(R\)|\(TM\)|CPU|Processor|with Radeon Graphics|\d+-Core/gi, '').replace(/@.*$/, '').replace(/\s+/g, ' ').trim();

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
}

export function Dashboard({
  computerName, username, cpuInfo, ramInfo, diskInfo, gpuInfo, windowsInfo, networkInfo,
  onRefresh, loading, loadingDetails, lastScan,
}: DashboardProps) {
  const { addLog } = useLogs();
  const [generatingReport, setGeneratingReport] = useState(false);
  const busy = loading || loadingDetails;
  const neverScanned = !cpuInfo && !busy;

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
        `Equipo: ${f(computerName)}   Usuario: ${f(username)}`,
        '',
        '--- SISTEMA ---',
        `Windows: ${f(windowsInfo?.caption)}`,
        `Versión: ${f(windowsInfo?.version)} (Build ${f(windowsInfo?.build)})`,
        `Arquitectura: ${f(windowsInfo?.architecture)}`,
        `Fecha de instalación: ${f(windowsInfo?.installDate)}`,
        `Placa base: ${f(windowsInfo?.boardManufacturer)} ${windowsInfo?.boardProduct ?? ''}`,
        '',
        '--- CPU ---',
        `Procesador: ${f(cpuInfo?.model)} (${f(cpuInfo?.manufacturer)})`,
        `Hilos: ${f(cpuInfo?.logicalCores)}`,
        `Velocidad: ${cpuInfo?.speed ? formatFrequency(cpuInfo.speed) : 'N/A'}`,
        '',
        '--- RAM ---',
        `Total: ${ramInfo ? formatBytes(ramInfo.total) : 'N/A'}`,
        `Libre: ${ramInfo ? formatBytes(ramInfo.free) : 'N/A'}`,
        `Módulos instalados: ${f(ramInfo?.moduleCount)}`,
        ...(ramInfo?.modules ?? []).map(m => `- ${formatBytes(m.capacity)} @ ${m.speed}MHz (${f(m.manufacturer)})`),
        '',
        '--- GPU ---',
        ...(gpuInfo ?? []).map(g => `- ${g.name} (${g.vram ? formatBytes(g.vram) : 'VRAM N/A'}) - Driver ${f(g.driverVersion)}`),
        '',
        '--- DISCOS FÍSICOS ---',
        ...(diskInfo?.physical ?? []).map(d => `- ${d.model}: ${formatBytes(d.size)} (${d.mediaType}, ${d.interfaceType})`),
        '',
        '--- UNIDADES LÓGICAS ---',
        ...(diskInfo?.logical ?? []).map(d => `- ${d.letter} Total ${formatBytes(d.total)}, Libre ${formatBytes(d.free)} (${d.fileSystem})`),
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

      // Escritorio real del sistema (puede estar en D:\ u OneDrive); respaldo al clásico si no se puede resolver
      const user = await window.electronAPI.getUsername();
      const desktopPath = (await window.electronAPI.getPath('desktop')) || `C:\\Users\\${user}\\Desktop`;
      const fileName = `Reporte_Diagnostico_${new Date().toISOString().slice(0, 10)}.txt`;
      const r = await window.electronAPI.writeFile(`${desktopPath}\\${fileName}`, report);
      if (r.success) addLog('Reporte', 'Generado', `Guardado en el Escritorio: ${fileName}`, 'success');
      else addLog('Reporte', 'Error', String(r.output), 'error');
    } catch (err) {
      addLog('Reporte', 'Error', String(err), 'error');
    }
    setGeneratingReport(false);
  }, [computerName, username, cpuInfo, ramInfo, diskInfo, gpuInfo, windowsInfo, networkInfo, addLog]);

  // Agregados de almacenamiento
  const totalDisk = diskInfo?.logical.reduce((s, d) => s + d.total, 0) ?? 0;
  const freeDisk = diskInfo?.logical.reduce((s, d) => s + d.free, 0) ?? 0;
  const diskPct = totalDisk ? ((totalDisk - freeDisk) / totalDisk) * 100 : 0;
  const ramPct = ramInfo ? ramInfo.percentage : 0;
  const mainGpu = gpuInfo?.[0];

  if (neverScanned) {
    return (
      <div className="card">
        <EmptyState
          icon={<Gauge size={22} />}
          title="Aún no se ha analizado este equipo"
          description="El diagnóstico automático está desactivado en Ajustes. Ejecuta un análisis para ver el hardware y el sistema."
          action={<Button variant="primary" icon={<RefreshCw size={15} />} onClick={onRefresh}>Analizar equipo</Button>}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="card relative overflow-hidden p-6">
        <div className="pointer-events-none absolute -top-24 -right-16 w-80 h-80 rounded-full bg-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-40 w-72 h-72 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="relative flex items-end justify-between gap-6 flex-wrap">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[12.5px] text-muted">
              <Sparkles size={13} className="text-accent-fg" />
              {greeting()}{username ? `, ${username}` : ''}
            </p>
            <h1 className="text-[28px] leading-9 font-semibold tracking-[-0.025em] text-fg mt-1 truncate">
              {computerName || 'Centro de diagnóstico'}
            </h1>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {windowsInfo?.caption ? (
                <Badge status="neutral"><Monitor size={11} />{windowsInfo.caption.replace('Microsoft ', '')}</Badge>
              ) : busy && <div className="skeleton h-[22px] w-40 rounded-full" />}
              {windowsInfo?.build && <Badge status="neutral">Build {windowsInfo.build}</Badge>}
              {windowsInfo?.architecture && <Badge status="neutral">{windowsInfo.architecture}</Badge>}
              {networkInfo && (
                <Badge status={networkInfo.internet ? 'ok' : 'warning'} dot>{networkInfo.internet ? 'En línea' : 'Sin Internet'}</Badge>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2.5">
            <div className="flex gap-2">
              <Button icon={<FileDown size={15} />} onClick={handleGenerateReport} loading={generatingReport} disabled={busy}>
                Exportar reporte
              </Button>
              <Button variant="primary" icon={<RefreshCw size={15} className={busy ? 'animate-spin' : ''} />} onClick={onRefresh} disabled={busy}>
                {busy ? 'Analizando…' : 'Analizar de nuevo'}
              </Button>
            </div>
            <p className="text-[11.5px] text-subtle flex items-center gap-1.5">
              <Clock size={12} />
              {busy ? 'Leyendo hardware…' : lastScan ? `Último análisis ${lastScan.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}` : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Indicadores */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <Stat busy={busy}
          icon={<Cpu size={18} />} tone="indigo" label="Procesador"
          value={cpuInfo ? shortCpu(cpuInfo.model) : null}
          sub={cpuInfo ? `${cpuInfo.logicalCores} hilos · ${formatFrequency(cpuInfo.speed)}` : undefined}
        />
        <Stat busy={busy}
          icon={<MemoryStick size={18} />} tone="emerald" label="Memoria"
          value={ramInfo ? formatBytes(ramInfo.total) : null}
          sub={ramInfo ? `${ramPct}% en uso · ${ramInfo.moduleCount} módulo(s)` : undefined}
          progress={ramInfo ? ramPct : undefined}
        />
        <Stat busy={busy}
          icon={<HardDrive size={18} />} tone="amber" label="Almacenamiento"
          value={diskInfo ? formatBytes(totalDisk) : null}
          sub={diskInfo ? `${formatBytes(freeDisk)} libres` : undefined}
          progress={diskInfo ? diskPct : undefined}
        />
        <Stat busy={busy}
          icon={<MonitorSmartphone size={18} />} tone="violet" label="Gráficos"
          value={gpuInfo ? (mainGpu?.name ?? 'No detectada') : null}
          sub={mainGpu ? (mainGpu.vram > 0 ? `${formatBytes(mainGpu.vram)} VRAM` : 'VRAM N/A') : undefined}
        />
      </div>

      {/* Detalle */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        <Panel icon={<Cpu size={16} />} tone="indigo" title="Procesador" loading={!cpuInfo && busy}>
          {cpuInfo && (
            <div className="grid grid-cols-2 gap-x-6 gap-y-3.5">
              <KeyValue label="Modelo" value={cpuInfo.model} span />
              <KeyValue label="Fabricante" value={cpuInfo.manufacturer} />
              <KeyValue label="Hilos lógicos" value={cpuInfo.logicalCores} />
              <KeyValue label="Frecuencia" value={formatFrequency(cpuInfo.speed)} />
              <KeyValue label="Temperatura" value={cpuInfo.temperature ? `${Math.round(cpuInfo.temperature)} °C` : 'No disponible'} />
            </div>
          )}
        </Panel>

        <Panel
          icon={<MemoryStick size={16} />} tone="emerald" title="Memoria RAM" loading={!ramInfo && busy}
          right={ramInfo && <Badge status="neutral">{ramInfo.moduleCount} módulo(s)</Badge>}
        >
          {ramInfo && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[12px] mb-1.5">
                  <span className="text-muted">En uso <span className="text-fg font-medium">{formatBytes(ramInfo.used)}</span></span>
                  <span className="text-subtle tabular-nums">{ramPct}% de {formatBytes(ramInfo.total)}</span>
                </div>
                <ProgressBar value={ramPct} height="h-2" />
              </div>
              {ramInfo.modules.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {ramInfo.modules.map((m, i) => (
                    <div key={i} className="rounded-xl bg-surface-2/70 border border-line/70 px-3 py-2">
                      <p className="text-[11px] text-subtle">Ranura {i + 1}</p>
                      <p className="text-[13px] font-semibold text-fg">{formatBytes(m.capacity)} <span className="font-normal text-muted">· {m.speed} MHz</span></p>
                      {m.manufacturer && <p className="text-[11px] text-muted truncate">{m.manufacturer}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Panel>

        <Panel icon={<HardDrive size={16} />} tone="amber" title="Almacenamiento" loading={!diskInfo && busy}>
          {diskInfo && (
            <div className="space-y-4">
              {diskInfo.logical.map((d, i) => {
                const used = d.total - d.free;
                const pct = d.total > 0 ? (used / d.total) * 100 : 0;
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between text-[12px] mb-1.5">
                      <span className="flex items-center gap-2">
                        <span className="font-semibold text-fg">{d.letter}</span>
                        <span className="text-subtle">{d.fileSystem}</span>
                      </span>
                      <span className="text-muted tabular-nums">
                        <span className="text-fg font-medium">{formatBytes(d.free)}</span> libres de {formatBytes(d.total)}
                      </span>
                    </div>
                    <ProgressBar value={pct} height="h-2" />
                  </div>
                );
              })}
              {diskInfo.physical.length > 0 && (
                <div className="pt-3 border-t border-line space-y-2">
                  {diskInfo.physical.map((p, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 text-[12px]">
                      <span className="text-fg truncate">{p.model}</span>
                      <span className="flex items-center gap-2 shrink-0">
                        <Badge status="neutral">{p.interfaceType}</Badge>
                        <span className="text-muted tabular-nums">{formatBytes(p.size)}</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {diskInfo.logical.length === 0 && <p className="text-[12.5px] text-muted">No se detectaron unidades.</p>}
            </div>
          )}
        </Panel>

        <Panel icon={<MonitorSmartphone size={16} />} tone="violet" title="Tarjeta gráfica" loading={!gpuInfo && busy}>
          {gpuInfo && (gpuInfo.length === 0 ? (
            <p className="text-[12.5px] text-muted">No se detectó ninguna GPU.</p>
          ) : (
            <div className="space-y-4 divide-y divide-line">
              {gpuInfo.map((g, i) => (
                <div key={i} className={cx('grid grid-cols-2 gap-x-6 gap-y-3.5', i > 0 && 'pt-4')}>
                  <KeyValue label="Modelo" value={g.name} span />
                  <KeyValue label="VRAM" value={g.vram > 0 ? formatBytes(g.vram) : 'N/A'} />
                  <KeyValue label="Driver" value={g.driverVersion} mono />
                  <KeyValue label="Fecha del driver" value={g.driverDate || 'N/A'} />
                </div>
              ))}
            </div>
          ))}
        </Panel>

        <Panel icon={<CircuitBoard size={16} />} tone="sky" title="Sistema y placa base" loading={!windowsInfo && busy}>
          {windowsInfo && (
            <div className="grid grid-cols-2 gap-x-6 gap-y-3.5">
              <KeyValue label="Sistema operativo" value={windowsInfo.caption || 'N/A'} span />
              <KeyValue label="Versión" value={windowsInfo.version || 'N/A'} />
              <KeyValue label="Build" value={windowsInfo.build || 'N/A'} />
              <KeyValue label="Registrado a" value={windowsInfo.registeredUser || 'N/A'} />
              <KeyValue label="Instalado" value={windowsInfo.installDate || 'N/A'} />
              {windowsInfo.boardManufacturer && (
                <KeyValue label="Placa base" value={`${windowsInfo.boardManufacturer} ${windowsInfo.boardProduct || ''}`.trim()} span />
              )}
              {windowsInfo.boardVersion && <KeyValue label="Versión BIOS / placa" value={windowsInfo.boardVersion} />}
            </div>
          )}
        </Panel>

        <Panel
          icon={networkInfo?.internet === false ? <WifiOff size={16} /> : <Wifi size={16} />} tone="cyan" title="Red" loading={!networkInfo && busy}
          right={networkInfo && <Badge status={networkInfo.internet ? 'ok' : 'warning'} dot>{networkInfo.internet ? 'Conectado' : 'Sin Internet'}</Badge>}
        >
          {networkInfo && (
            <div className="grid grid-cols-2 gap-x-6 gap-y-3.5">
              <KeyValue label="IP local" value={networkInfo.ip || 'N/A'} mono />
              <KeyValue label="Puerta de enlace" value={networkInfo.gateway || 'N/A'} mono />
              <KeyValue label="DNS" value={networkInfo.dns || 'N/A'} mono />
              <KeyValue label="MAC" value={networkInfo.mac || 'N/A'} mono />
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

function Stat({ icon, tone, label, value, sub, progress, busy }: {
  icon: ReactNode; tone: string; label: string; value: string | null; sub?: string; progress?: number; busy: boolean;
}) {
  return (
    <div className="card p-4 min-w-0">
      <div className="flex items-center gap-2.5">
        <IconTile tone={tone} size="sm">{icon}</IconTile>
        <span className="text-[12px] font-medium text-muted">{label}</span>
      </div>
      {value === null && !busy ? (
        <p className="mt-3 text-[17px] font-semibold text-subtle">—</p>
      ) : value === null ? (
        <div className="mt-3.5 space-y-2">
          <div className="skeleton h-5 w-3/4" />
          <div className="skeleton h-3 w-1/2" />
        </div>
      ) : (
        <>
          <p className="mt-3 text-[17px] font-semibold tracking-tight text-fg truncate" title={value}>{value}</p>
          {sub && <p className="text-[12px] text-muted mt-0.5 truncate">{sub}</p>}
          {typeof progress === 'number' && <div className="mt-3"><ProgressBar value={progress} /></div>}
        </>
      )}
    </div>
  );
}

function Panel({ icon, tone, title, right, loading, children }: {
  icon: ReactNode; tone: string; title: string; right?: ReactNode; loading?: boolean; children?: ReactNode;
}) {
  return (
    <div className="card p-5 min-w-0">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <IconTile tone={tone} size="sm">{icon}</IconTile>
          <h3 className="text-[13.5px] font-semibold text-fg">{title}</h3>
        </div>
        {right}
      </div>
      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="space-y-1.5">
              <div className="skeleton h-3 w-16" />
              <div className="skeleton h-4 w-28" />
            </div>
          ))}
        </div>
      ) : (children || <p className="text-[12.5px] text-muted">No disponible. Pulsa «Analizar de nuevo».</p>)}
    </div>
  );
}
