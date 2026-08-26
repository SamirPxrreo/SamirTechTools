import React, { useState } from 'react';
import { Network, Globe, Search, RefreshCw, Wifi } from 'lucide-react';
import { ToolCard, ConsoleOutput, SystemCard } from '../components';
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Diagnóstico de Red</h1>
        <p className="text-xs text-dark-400 mt-1">Herramientas de diagnóstico y configuración de red</p>
      </div>

      {/* Network Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SystemCard title="IP Local" value={networkInfo?.ip || 'N/A'} color="text-blue-400" icon={<Network size={14} />} />
        <SystemCard title="Gateway" value={networkInfo?.gateway || 'N/A'} color="text-green-400" icon={<Globe size={14} />} />
        <SystemCard title="DNS" value={networkInfo?.dns || 'N/A'} color="text-yellow-400" icon={<Search size={14} />} />
        <SystemCard
          title="Internet"
          value={networkInfo?.internet ? 'Conectado' : 'Desconectado'}
          color={networkInfo?.internet ? 'text-green-400' : 'text-red-400'}
          icon={<Wifi size={14} />}
        />
      </div>

      {/* Target Input */}
      <div className="flex items-center gap-3">
        <label className="text-xs text-dark-300">Destino:</label>
        <input
          type="text"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="IP o dominio (ej: 8.8.8.8)"
          className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-sm text-neutral-900 placeholder-dark-500 focus:outline-none focus:border-primary-500 flex-1 max-w-xs"
        />
      </div>

      {/* Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <ToolCard
          icon={<Globe size={20} />}
          title="Ping"
          description={`Enviar paquetes ICMP a ${target}`}
          accentColor="green"
          primaryAction="Ejecutar"
          primaryOnClick={() => runTool('ping', 'Ping', target)}
          loading={loading && activeTool === 'Ping'}
        />
        <ToolCard
          icon={<Search size={20} />}
          title="Tracert"
          description={`Ruta de conexión a ${target}`}
          accentColor="blue"
          primaryAction="Ejecutar"
          primaryOnClick={() => runTool('tracert', 'Tracert', target)}
          loading={loading && activeTool === 'Tracert'}
        />
        <ToolCard
          icon={<Network size={20} />}
          title="NSLookup"
          description={`Resolución de DNS para ${target}`}
          accentColor="yellow"
          primaryAction="Ejecutar"
          primaryOnClick={() => runTool('nslookup', 'NSLookup', target)}
          loading={loading && activeTool === 'NSLookup'}
        />
        <ToolCard
          icon={<Wifi size={20} />}
          title="IPConfig"
          description="Configuración de red completa"
          accentColor="cyan"
          primaryAction="Ejecutar"
          primaryOnClick={() => runTool('ipconfig', 'IPConfig')}
          loading={loading && activeTool === 'IPConfig'}
        />
        <ToolCard
          icon={<RefreshCw size={20} />}
          title="Flush DNS"
          description="Limpiar caché de resolución DNS"
          accentColor="orange"
          primaryAction="Ejecutar"
          primaryOnClick={() => runTool('flush-dns', 'Flush DNS')}
          loading={loading && activeTool === 'Flush DNS'}
        />
        <ToolCard
          icon={<Network size={20} />}
          title="Tabla ARP"
          description="Mostrar tabla de direcciones ARP"
          accentColor="purple"
          primaryAction="Ejecutar"
          primaryOnClick={() => runTool('arp', 'ARP Table')}
          loading={loading && activeTool === 'ARP Table'}
        />
      </div>

      {(output || loading) && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-dark-300 mb-2">Consola - {activeTool}</h3>
          <ConsoleOutput output={output} loading={loading} />
        </div>
      )}
    </div>
  );
}
