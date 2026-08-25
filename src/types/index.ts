export interface CpuInfo {
  model: string;
  manufacturer: string;
  cores: number;
  logicalCores: number;
  speed: number;
  maxSpeed: number;
  usage: number;
  temperature: number | null;
}

export interface RamModule {
  capacity: number;
  speed: number;
  manufacturer: string;
  partNumber: string;
}

export interface RamInfo {
  total: number;
  used: number;
  free: number;
  percentage: number;
  modules: RamModule[];
  moduleCount: number | string;
}

export interface PhysicalDisk {
  model: string;
  size: number;
  mediaType: string;
  interfaceType: string;
  serialNumber: string;
}

export interface LogicalDisk {
  letter: string;
  total: number;
  free: number;
  fileSystem: string;
}

export interface DiskInfo {
  physical: PhysicalDisk[];
  logical: LogicalDisk[];
}

export interface GpuInfo {
  name: string;
  vram: number;
  driverVersion: string;
  driverDate: string;
}

export interface WindowsInfo {
  caption?: string;
  version?: string;
  build?: string;
  architecture?: string;
  installDate?: string;
  lastBoot?: string;
  serialNumber?: string;
  registeredUser?: string;
}

export interface NetworkInfo {
  ip?: string;
  gateway?: string;
  dns?: string;
  mac?: string;
  internet?: boolean;
}

export interface InstalledApp {
  name: string;
  version: string;
  installed: boolean;
  location: string;
}

export interface AllApp {
  name: string;
  version: string;
  location: string;
  uninstallString: string;
  systemComponent: boolean;
}

export interface DriverInfo {
  name: string;
  manufacturer: string;
  version: string;
  date: string;
  status: string;
}

export interface ProcessInfo {
  name: string;
  pid: string;
  memory: string;
}

export interface ServiceInfo {
  name: string;
  status: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  tool: string;
  action: string;
  result: string;
  level: 'info' | 'success' | 'warning' | 'error';
}

export type Page = 
  | 'dashboard' 
  | 'drivers' 
  | 'windows' 
  | 'office' 
  | 'adobe' 
  | 'browsers' 
  | 'utilities' 
  | 'network' 
  | 'christitus'
  | 'uninstaller'
  | 'settings';

export interface DownloadProgress {
  url: string;
  destPath: string;
  percent: number;
  downloaded: number;
  total: number;
}

export interface ElectronAPI {
  minimize: () => void;
  maximize: () => void;
  close: () => void;
  checkAdmin: () => Promise<boolean>;
  getComputerName: () => Promise<string>;
  getUsername: () => Promise<string>;
  getPlatform: () => Promise<string>;
  getArch: () => Promise<string>;
  getUptime: () => Promise<number>;
  getCpuInfo: () => Promise<CpuInfo>;
  getRamInfo: () => Promise<RamInfo>;
  getDiskInfo: () => Promise<DiskInfo>;
  getGpuInfo: () => Promise<GpuInfo[]>;
  getWindowsInfo: () => Promise<WindowsInfo>;
  getNetworkInfo: () => Promise<NetworkInfo>;
  getInstalledApps: (category: string) => Promise<InstalledApp[]>;
  getAllApps: () => Promise<AllApp[]>;
  uninstallApps: (apps: { name: string; uninstallString: string }[]) => Promise<{ success: boolean; output: string }>;
  runCommand: (command: string) => Promise<{ success: boolean; output: string; code: number }>;
  executeTool: (tool: string, args?: string) => Promise<{ success: boolean; output: string; code: number }>;
  downloadFile: (url: string, destPath: string) => Promise<{ success: boolean; size?: number; output?: string }>;
  writeFile: (path: string, content: string) => Promise<{ success: boolean; output?: string }>;
  appendLog: (entry: { timestamp: string; tool: string; action: string; result: string; level: string }) => Promise<{ success: boolean; output?: string }>;
  defenderTool: (action: 'open' | 'disable' | 'enable' | 'status') => Promise<{ success: boolean; output: string }>;
  onDownloadProgress: (callback: (data: DownloadProgress) => void) => void;
  mountIso: (isoPath: string) => Promise<{ success: boolean; driveLetter: string; output?: string }>;
  unmountIso: (isoPath: string) => Promise<{ success: boolean; output?: string }>;
  getDrivers: () => Promise<DriverInfo[]>;
  getProcesses: () => Promise<ProcessInfo[]>;
  getServices: () => Promise<ServiceInfo[]>;
  openExternal: (url: string) => void;
  openPath: (path: string) => void;
  showItemInFolder: (path: string) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
