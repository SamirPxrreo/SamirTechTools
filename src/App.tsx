import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { PrefsProvider, usePrefs } from './context/PrefsContext';
import { APP_VERSION } from './config/constants';
import { Page, CpuInfo, RamInfo, DiskInfo, GpuInfo, WindowsInfo, NetworkInfo } from './types';

function AppContent() {
  const { addLog } = useLogs();
  const { autoDiagnose } = usePrefs();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const mainRef = useRef<HTMLElement>(null);

  // Estado del sistema
  const [computerName, setComputerName] = useState('');
  const [username, setUsername] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [cpuInfo, setCpuInfo] = useState<CpuInfo | null>(null);
  const [ramInfo, setRamInfo] = useState<RamInfo | null>(null);
  const [diskInfo, setDiskInfo] = useState<DiskInfo | null>(null);
  const [gpuInfo, setGpuInfo] = useState<GpuInfo[] | null>(null);
  const [windowsInfo, setWindowsInfo] = useState<WindowsInfo | null>(null);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [lastScan, setLastScan] = useState<Date | null>(null);

  const loadSystemInfo = useCallback(async () => {
    setLoading(true);
    setLoadingDetails(true);
    addLog('Sistema', 'Iniciando diagnóstico', 'Obteniendo información del equipo...', 'info');
    try {
      // TIER 1 - rápido (CPU/RAM nativo sin PowerShell, datos básicos)
      const [cpu, ram] = await Promise.all([
        window.electronAPI.getCpuInfo(),
        window.electronAPI.getRamInfo(),
      ]);
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
        setLastScan(new Date());
        addLog('Sistema', 'GPU', gpu.length > 0 ? gpu[0].name : 'No detectada', gpu.length > 0 ? 'success' : 'warning');
        addLog('Sistema', 'Windows', win.caption || 'No detectado', 'success');
        addLog('Sistema', 'Red', net.ip ? `IP: ${net.ip}` : 'No detectada', net.ip ? 'success' : 'warning');
        addLog('Sistema', 'Diagnóstico completado', 'Todo el equipo analizado', 'success');
      }).catch((err) => {
        addLog('Sistema', 'Error en diagnóstico (tier 2)', String(err), 'warning');
      }).finally(() => setLoadingDetails(false));
    } catch (err) {
      addLog('Sistema', 'Error en diagnóstico', String(err), 'error');
      setLoading(false);
      setLoadingDetails(false);
    }
  }, [addLog]);

  useEffect(() => {
    // Datos de identidad: siempre (son instantáneos)
    Promise.all([
      window.electronAPI.getComputerName(),
      window.electronAPI.getUsername(),
      window.electronAPI.checkAdmin(),
    ]).then(([name, user, admin]) => {
      setComputerName(name);
      setUsername(user);
      setIsAdmin(admin);
    }).catch(() => {});
    if (autoDiagnose) loadSystemInfo();
  }, []);

  const navigate = (page: Page) => {
    setCurrentPage(page);
    mainRef.current?.scrollTo({ top: 0 });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            computerName={computerName}
            username={username}
            cpuInfo={cpuInfo}
            ramInfo={ramInfo}
            diskInfo={diskInfo}
            gpuInfo={gpuInfo}
            windowsInfo={windowsInfo}
            networkInfo={networkInfo}
            onRefresh={loadSystemInfo}
            loading={loading}
            loadingDetails={loadingDetails}
            lastScan={lastScan}
          />
        );
      case 'install': return <InstallPage />;
      case 'windows': return <WindowsPage />;
      case 'office': return <OfficePage />;
      case 'extra-apps': return <ExtraAppsPage />;
      case 'utilities': return <UtilitiesPage />;
      case 'network': return <NetworkPage networkInfo={networkInfo} />;
      case 'uninstaller': return <UninstallerPage />;
      case 'settings': return <SettingsPage />;
      default: return null;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-bg text-fg overflow-hidden">
      <Header
        computerName={computerName}
        username={username}
        isAdmin={isAdmin}
        version={APP_VERSION}
        currentPage={currentPage}
      />
      <div className="flex flex-1 min-h-0">
        <Sidebar
          currentPage={currentPage}
          onNavigate={navigate}
          computerName={computerName}
          username={username}
          isAdmin={isAdmin}
          loading={loading || loadingDetails}
          onRefresh={loadSystemInfo}
        />
        <main ref={mainRef} className="flex-1 min-w-0 overflow-y-auto bg-grid">
          <div key={currentPage} className="max-w-[1320px] mx-auto px-8 py-7 animate-fade-in">
            {renderPage()}
          </div>
        </main>
      </div>
      <LogPanel />
    </div>
  );
}

export default function App() {
  return (
    <PrefsProvider>
      <LogProvider>
        <InstallProvider>
          <AppContent />
        </InstallProvider>
      </LogProvider>
    </PrefsProvider>
  );
}
