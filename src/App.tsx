import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, Header, LogPanel } from './components';
import {
  Dashboard,
  WindowsPage,
  OfficePage,
  AdobePage,
  BrowsersPage,
  DriversPage,
  UtilitiesPage,
  NetworkPage,
  SettingsPage,
  ChrisTitusPage,
  UninstallerPage,
} from './pages';
import { LogProvider, useLogs } from './context/LogContext';
import { Page, CpuInfo, RamInfo, DiskInfo, GpuInfo, WindowsInfo, NetworkInfo } from './types';

function AppContent() {
  const { addLog } = useLogs();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
      const [name, user, admin, cpu, ram, disk, gpu, win, net] = await Promise.all([
        window.electronAPI.getComputerName(),
        window.electronAPI.getUsername(),
        window.electronAPI.checkAdmin(),
        window.electronAPI.getCpuInfo(),
        window.electronAPI.getRamInfo(),
        window.electronAPI.getDiskInfo(),
        window.electronAPI.getGpuInfo(),
        window.electronAPI.getWindowsInfo(),
        window.electronAPI.getNetworkInfo(),
      ]);

      setComputerName(name);
      setUsername(user);
      setIsAdmin(admin);
      setCpuInfo(cpu);
      setRamInfo(ram);
      setDiskInfo(disk);
      setGpuInfo(gpu);
      setWindowsInfo(win);
      setNetworkInfo(net);

      addLog('Sistema', 'CPU', `${cpu.model} detectado`, 'success');
      addLog('Sistema', 'RAM', `${(ram.total / (1024 * 1024 * 1024)).toFixed(1)} GB detectados`, 'success');
      addLog('Sistema', 'GPU', gpu.length > 0 ? gpu[0].name : 'No detectada', gpu.length > 0 ? 'success' : 'warning');
      addLog('Sistema', 'Windows', win.caption || 'No detectado', 'success');
      addLog('Sistema', 'Red', net.ip ? `IP: ${net.ip}` : 'No detectada', net.ip ? 'success' : 'warning');
      addLog('Sistema', 'Diagnóstico completado', 'Todo el equipo analizado', 'success');
    } catch (err) {
      addLog('Sistema', 'Error en diagnóstico', String(err), 'error');
    }

    setLoading(false);
  }, [addLog]);

  useEffect(() => {
    loadSystemInfo();
  }, []);

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
      case 'windows':
        return <WindowsPage />;
      case 'office':
        return <OfficePage />;
      case 'adobe':
        return <AdobePage />;
      case 'browsers':
        return <BrowsersPage />;
      case 'drivers':
        return <DriversPage />;
      case 'utilities':
        return <UtilitiesPage />;
      case 'network':
        return <NetworkPage networkInfo={networkInfo} />;
      case 'christitus':
        return <ChrisTitusPage />;
      case 'uninstaller':
        return <UninstallerPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-dark-950 text-dark-50 overflow-hidden relative">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-24 w-[420px] h-[420px] rounded-full bg-primary-600/10 blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-24 w-[380px] h-[380px] rounded-full bg-purple-600/8 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>
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
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 relative z-[1]">
          {loading && currentPage === 'dashboard' ? (
            <div className="flex flex-col items-center justify-center h-full animate-fade-in">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-dark-700 border-t-primary-500 rounded-full animate-spin" />
              </div>
              <p className="text-sm text-dark-300 mt-4">Analizando equipo...</p>
              <p className="text-xs text-dark-500 mt-1">Obteniendo información del sistema</p>
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
      <AppContent />
    </LogProvider>
  );
}
