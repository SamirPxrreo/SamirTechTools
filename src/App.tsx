import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, Header, LogPanel } from './components';
import {
  Dashboard,
  WindowsPage,
  OfficePage,
  ExtraAppsPage,
  UtilitiesPage,
  NetworkPage,
  SettingsPage,
  UninstallerPage,
  InstallPage,
} from './pages';
import { LogProvider, useLogs } from './context/LogContext';
import { InstallProvider } from './context/InstallContext';
import { Page, CpuInfo, RamInfo, DiskInfo, GpuInfo, WindowsInfo, NetworkInfo } from './types';

function AppContent() {
  const { addLog } = useLogs();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  // System state
  const [computerName, setComputerName] = useState('');
  const [username, setUsername] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [cpuInfo, setCpuInfo] = useState<CpuInfo | null>(null);
  const [ramInfo, setRamInfo] = useState<RamInfo | null>(null);
  const [diskInfo, setDiskInfo] = useState<DiskInfo | null>(null);
  const [gpuInfo, setGpuInfo] = useState<GpuInfo[]>([]);
  const [windowsInfo, setWindowsInfo] = useState<WindowsInfo | null>(null);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSystemInfo = useCallback(async () => {
    setLoading(true);
    addLog('Sistema', 'Iniciando diagnóstico', 'Obteniendo información del equipo...', 'info');
    try {
      // TIER 1 - rápido (CPU/RAM nativo sin PowerShell, datos básicos)
      const [name, user, admin, cpu, ram] = await Promise.all([
        window.electronAPI.getComputerName(),
        window.electronAPI.getUsername(),
        window.electronAPI.checkAdmin(),
        window.electronAPI.getCpuInfo(),
        window.electronAPI.getRamInfo(),
      ]);
      setComputerName(name);
      setUsername(user);
      setIsAdmin(admin);
      setCpuInfo(cpu);
      setRamInfo(ram);
      addLog('Sistema', 'CPU', `${cpu.model} detectado`, 'success');
      addLog('Sistema', 'RAM', `${(ram.total / (1024 * 1024 * 1024)).toFixed(1)} GB detectados`, 'success');
      setLoading(false);

      // TIER 2 - pesado en background (disco/GPU/Windows/red) sin bloquear UI
      Promise.all([
        window.electronAPI.getDiskInfo(),
        window.electronAPI.getGpuInfo(),
        window.electronAPI.getWindowsInfo(),
        window.electronAPI.getNetworkInfo(),
      ]).then(([disk, gpu, win, net]) => {
        setDiskInfo(disk);
        setGpuInfo(gpu);
        setWindowsInfo(win);
        setNetworkInfo(net);
        addLog('Sistema', 'GPU', gpu.length > 0 ? gpu[0].name : 'No detectada', gpu.length > 0 ? 'success' : 'warning');
        addLog('Sistema', 'Windows', win.caption || 'No detectado', 'success');
        addLog('Sistema', 'Red', net.ip ? `IP: ${net.ip}` : 'No detectada', net.ip ? 'success' : 'warning');
        addLog('Sistema', 'Diagnóstico completado', 'Todo el equipo analizado', 'success');
      }).catch((err) => {
        addLog('Sistema', 'Error en diagnóstico (tier 2)', String(err), 'warning');
      });
    } catch (err) {
      addLog('Sistema', 'Error en diagnóstico', String(err), 'error');
      setLoading(false);
    }
  }, [addLog]);

  useEffect(() => {
    loadSystemInfo();
  }, []);

  // Polling liviano CPU/RAM cada 3s via getLiveStats (0 PowerShell) - pausa si pestaña oculta o no está en dashboard
  useEffect(() => {
    if (currentPage !== 'dashboard') return;
    let alive = true;
    const tick = async () => {
      if (document.hidden) return;
      try {
        if (window.electronAPI.getLiveStats) {
          const stats = await window.electronAPI.getLiveStats();
          if (!alive) return;
          setCpuInfo(stats.cpu);
          setRamInfo((prev) => prev ? { ...prev, total: stats.ram.total, used: stats.ram.used, free: stats.ram.free, percentage: stats.ram.percentage } : { ...stats.ram, modules: [], moduleCount: 'N/A' });
        } else {
          const [cpu, ram] = await Promise.all([window.electronAPI.getCpuInfo(), window.electronAPI.getRamInfo()]);
          if (!alive) return;
          setCpuInfo(cpu);
          setRamInfo(ram);
        }
      } catch {}
    };
    const iv = setInterval(tick, 3000);
    return () => { alive = false; clearInterval(iv); };
  }, [currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            cpuInfo={cpuInfo}
            ramInfo={ramInfo}
            diskInfo={diskInfo}
            gpuInfo={gpuInfo}
            windowsInfo={windowsInfo}
            networkInfo={networkInfo}
            onRefresh={loadSystemInfo}
            loading={loading}
          />
        );
      case 'install':
        return <InstallPage />;
      case 'windows':
        return <WindowsPage />;
      case 'office':
        return <OfficePage />;
      case 'extra-apps':
        return <ExtraAppsPage />;
      case 'utilities':
        return <UtilitiesPage />;
      case 'network':
        return <NetworkPage networkInfo={networkInfo} />;
      case 'uninstaller':
        return <UninstallerPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 text-slate-900 overflow-hidden">
      <Header
        computerName={computerName}
        username={username}
        isAdmin={isAdmin}
        version="1.0.0"
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          computerName={computerName}
          username={username}
          isAdmin={isAdmin}
          loading={loading}
          onRefresh={loadSystemInfo}
        />
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {loading && currentPage === 'dashboard' ? (
            <div className="flex flex-col items-center justify-center h-full animate-fade-in">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-neutral-200 border-t-primary-600 rounded-full animate-spin" />
              </div>
              <p className="text-sm text-neutral-600 mt-4">Analizando equipo...</p>
              <p className="text-xs text-neutral-400 mt-1">Obteniendo información del sistema</p>
            </div>
          ) : (
            renderPage()
          )}
        </main>
      </div>
      <LogPanel />
    </div>
  );
}

export default function App() {
  return (
    <LogProvider>
      <InstallProvider>
        <AppContent />
      </InstallProvider>
    </LogProvider>
  );
}
