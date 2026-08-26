import React, { useState, useEffect } from 'react';
import { Cpu, Monitor, Wifi, Bluetooth, Volume2, CircuitBoard, AlertTriangle } from 'lucide-react';
import { ToolCard, StatusBadge } from '../components';
import { DriverInfo } from '../types';
import { useLogs } from '../context/LogContext';

export function DriversPage() {
  const { addLog } = useLogs();
  const [drivers, setDrivers] = useState<DriverInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    setLoading(true);
    addLog('Drivers', 'Detectando drivers', 'Escaneando controladores del sistema...', 'info');
    try {
      const result = await window.electronAPI.getDrivers();
      setDrivers(result);
      addLog('Drivers', 'Detección completada', `${result.length} controladores encontrados`, 'success');
    } catch (err) {
      addLog('Drivers', 'Error', String(err), 'error');
    }
    setLoading(false);
  };

  const getDriverCategory = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower.includes('nvidia') || lower.includes('amd') || lower.includes('intel') && lower.includes('graphics')) return 'GPU';
    if (lower.includes('realtek') && lower.includes('audio')) return 'Audio';
    if (lower.includes('wifi') || lower.includes('wireless') || lower.includes('wi-fi')) return 'Wi-Fi';
    if (lower.includes('bluetooth')) return 'Bluetooth';
    if (lower.includes('ethernet') || lower.includes('network') || lower.includes('tcp')) return 'Red';
    if (lower.includes('chipset') || lower.includes('pci')) return 'Chipset';
    return 'Otro';
  };

  const categoryColors: Record<string, string> = {
    'GPU': 'purple',
    'Audio': 'green',
    'Wi-Fi': 'cyan',
    'Bluetooth': 'blue',
    'Red': 'orange',
    'Chipset': 'yellow',
    'Otro': 'blue',
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    'GPU': <Monitor size={20} />,
    'Audio': <Volume2 size={20} />,
    'Wi-Fi': <Wifi size={20} />,
    'Bluetooth': <Bluetooth size={20} />,
    'Red': <CircuitBoard size={20} />,
    'Chipset': <Cpu size={20} />,
    'Otro': <Cpu size={20} />,
  };

  const groupedDrivers = drivers.reduce((acc, driver) => {
    const cat = getDriverCategory(driver.name);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(driver);
    return acc;
  }, {} as Record<string, DriverInfo[]>);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Drivers / Controladores</h1>
          <p className="text-xs text-dark-400 mt-1">Información de controladores del sistema</p>
        </div>
        <button
          onClick={loadDrivers}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50"
        >
          <RefreshIcon spinning={loading} />
          Actualizar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Object.entries(groupedDrivers).map(([category, catDrivers]) => (
          <ToolCard
            key={category}
            icon={categoryIcons[category] || <Cpu size={20} />}
            title={category}
            description={`${catDrivers.length} controlador(es)`}
            status="ok"
            statusText={`${catDrivers.length} detectados`}
            accentColor={categoryColors[category] || 'blue'}
            primaryAction="Información"
          >
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {catDrivers.map((driver, i) => (
                <div key={i} className="bg-dark-700/50 rounded-lg p-2">
                  <div className="text-[11px] font-medium text-dark-200 truncate">{driver.name}</div>
                  <div className="text-[10px] text-dark-400">
                    {driver.manufacturer} - v{driver.version}
                  </div>
                </div>
              ))}
            </div>
          </ToolCard>
        ))}
      </div>

      {drivers.length === 0 && !loading && (
        <div className="text-center py-12 text-dark-400">
          <Cpu size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-sm">No se encontraron controladores</p>
        </div>
      )}
    </div>
  );
}

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12a9 9 0 11-6.219-8.56" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}
