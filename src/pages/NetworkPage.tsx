import React, { useState } from 'react';
import { Network, Globe, Route, RefreshCw, Wifi, WifiOff, ListTree, Search, Router, Server } from 'lucide-react';
import { ToolCard, ConsoleOutput, PageHeader, Section, Grid, IconTile, Badge } from '../components';
import { NetworkInfo } from '../types';
import { useLogs } from '../context/LogContext';

interface NetworkPageProps {
  networkInfo: NetworkInfo | null;
}

export function NetworkPage({ networkInfo }: NetworkPageProps) {
  const { addLog } = useLogs();
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTool, setActiveTool] = useState('');
  const [target, setTarget] = useState('8.8.8.8');

  const runTool = async (tool: string, label: string, args?: string) => {
    setLoading(true);
    setOutput('');
    setActiveTool(label);
    addLog('Red', `${label} - Iniciado`, args || '', 'info');
    try {
      const result = await window.electronAPI.executeTool(tool, args);
      setOutput(result.output);
      addLog('Red', `${label} - Completado`, result.success ? 'Éxito' : 'Error', result.success ? 'success' : 'error');
    } catch (err) {
      setOutput(`Error: ${err}`);
      addLog('Red', `${label} - Error`, String(err), 'error');
    }
    setLoading(false);
  };

  const busy = (l: string) => loading && activeTool === l;
  const online = networkInfo?.internet;

  const info = [
    { label: 'IP local', value: networkInfo?.ip, icon: <Network size={15} />, tone: 'cyan' },
    { label: 'Puerta de enlace', value: networkInfo?.gateway, icon: <Router size={15} />, tone: 'indigo' },
    { label: 'DNS', value: networkInfo?.dns, icon: <Server size={15} />, tone: 'violet' },
    { label: 'MAC', value: networkInfo?.mac, icon: <ListTree size={15} />, tone: 'slate' },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        icon={<Network size={20} />}
        tone="cyan"
        title="Diagnóstico de red"
        description="Conectividad, resolución DNS y configuración de adaptadores"
        actions={
          networkInfo ? (
            <Badge status={online ? 'ok' : 'warning'} dot className="h-7 px-3 text-[12px]">
              {online ? <><Wifi size={12} /> Conectado a Internet</> : <><WifiOff size={12} /> Sin Internet</>}
            </Badge>
          ) : <Badge status="neutral">Sin datos — analiza el equipo</Badge>
        }
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {info.map(i => (
          <div key={i.label} className="card p-4 flex items-center gap-3 min-w-0">
            <IconTile tone={i.tone} size="sm">{i.icon}</IconTile>
            <div className="min-w-0">
              <p className="text-[11.5px] text-subtle">{i.label}</p>
              <p className="text-[13.5px] font-semibold font-mono text-fg truncate select-text" title={i.value}>{i.value || '—'}</p>
            </div>
          </div>
        ))}
      </div>

      <Section
        title="Pruebas de conectividad"
        icon={<Globe size={14} />}
        description="Se ejecutan contra el destino que indiques"
        right={
          <div className="flex items-center gap-2">
            <label htmlFor="net-target" className="text-[12px] text-muted">Destino</label>
            <div className="relative">
              <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle pointer-events-none" />
              <input
                id="net-target"
                value={target}
                onChange={e => setTarget(e.target.value)}
                placeholder="IP o dominio"
                className="field pl-8 w-56 font-mono text-[12.5px]"
              />
            </div>
          </div>
        }
      >
        <Grid>
          <ToolCard icon={<Globe size={18} />} title="Ping" description={`Envía 4 paquetes ICMP a ${target || '…'} y mide la latencia.`} accentColor="emerald"
            primaryAction="Ejecutar" primaryOnClick={() => runTool('ping', 'Ping', target)} loading={busy('Ping')} disabled={loading || !target} />
          <ToolCard icon={<Route size={18} />} title="Tracert" description={`Muestra cada salto de la ruta hasta ${target || '…'}.`} accentColor="indigo"
            primaryAction="Ejecutar" primaryOnClick={() => runTool('tracert', 'Tracert', target)} loading={busy('Tracert')} disabled={loading || !target} />
          <ToolCard icon={<Search size={18} />} title="NSLookup" description={`Resuelve el DNS de ${target || '…'}.`} accentColor="violet"
            primaryAction="Ejecutar" primaryOnClick={() => runTool('nslookup', 'NSLookup', target)} loading={busy('NSLookup')} disabled={loading || !target} />
        </Grid>
      </Section>

      <Section title="Configuración local" icon={<Wifi size={14} />}>
        <Grid>
          <ToolCard icon={<Wifi size={18} />} title="IPConfig" description="Configuración completa de todos los adaptadores (ipconfig /all)." accentColor="cyan"
            primaryAction="Ejecutar" primaryOnClick={() => runTool('ipconfig', 'IPConfig')} loading={busy('IPConfig')} disabled={loading} />
          <ToolCard icon={<RefreshCw size={18} />} title="Vaciar caché DNS" description="Limpia la caché de resolución DNS (ipconfig /flushdns)." accentColor="orange"
            primaryAction="Ejecutar" primaryOnClick={() => runTool('flush-dns', 'Flush DNS')} loading={busy('Flush DNS')} disabled={loading} />
          <ToolCard icon={<ListTree size={18} />} title="Tabla ARP" description="Dispositivos vistos en la red local (arp -a)." accentColor="slate"
            primaryAction="Ejecutar" primaryOnClick={() => runTool('arp', 'ARP Table')} loading={busy('ARP Table')} disabled={loading} />
        </Grid>
      </Section>

      {(output || loading) && <ConsoleOutput title={activeTool || 'Salida'} output={output} loading={loading} />}
    </div>
  );
}
