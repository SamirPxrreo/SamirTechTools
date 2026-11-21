// Mock de window.electronAPI SOLO para previsualizar la UI en un navegador (npm run dev).
// Nunca se incluye en el build de producción: main.tsx lo importa bajo import.meta.env.DEV.
import type { ElectronAPI } from '../types';

const wait = <T,>(v: T, ms = 400) => new Promise<T>(r => setTimeout(() => r(v), ms));
const GB = 1024 ** 3;
const ok = (output = 'OK (simulado)') => wait({ success: true, output, code: 0 }, 600);
const noop = () => () => {};

const mock: ElectronAPI = {
  minimize: () => {}, maximize: () => {}, close: () => {},
  checkAdmin: () => wait(false, 50),
  getComputerName: () => wait('DESKTOP-0HLN5HH', 50),
  getUsername: () => wait('Samir', 50),
  getPlatform: () => wait('win32'), getArch: () => wait('x64'), getUptime: () => wait(86400),
  getCpuInfo: () => wait({ model: '13th Gen Intel(R) Core(TM) i7-13700H', manufacturer: 'Intel', cores: 20, logicalCores: 20, speed: 2918, maxSpeed: 2918, usage: 12, temperature: 54 }, 500),
  getRamInfo: () => wait({ total: 32 * GB, used: 13.4 * GB, free: 18.6 * GB, percentage: 42, moduleCount: 2, modules: [
    { capacity: 16 * GB, speed: 5200, manufacturer: 'Samsung', partNumber: 'M425R2GA3BB0' },
    { capacity: 16 * GB, speed: 5200, manufacturer: 'Samsung', partNumber: 'M425R2GA3BB0' },
  ] }, 500),
  getDiskInfo: () => wait({
    physical: [{ model: 'Samsung SSD 980 PRO 1TB', size: 1000 * GB, mediaType: 'Fixed hard disk media', interfaceType: 'NVMe', serialNumber: 'S5' }],
    logical: [
      { letter: 'C:', total: 476 * GB, free: 142 * GB, fileSystem: 'NTFS' },
      { letter: 'D:', total: 455 * GB, free: 61 * GB, fileSystem: 'NTFS' },
    ],
  }, 1400),
  getGpuInfo: () => wait([{ name: 'Intel(R) Arc(TM) A370M Graphics', vram: 8 * GB, driverVersion: '32.0.101.6078', driverDate: '2025-08-14' }], 1500),
  getLiveStats: () => wait({} as never),
  getWindowsInfo: () => wait({ caption: 'Microsoft Windows 11 Pro', version: '10.0.26300', build: '26300', architecture: '64 bits', installDate: '12/03/2026', registeredUser: 'Samir', boardManufacturer: 'ASUSTeK COMPUTER INC.', boardProduct: 'ROG Zephyrus G14', boardVersion: '1.0' }, 1500),
  getNetworkInfo: () => wait({ ip: '192.168.1.42', gateway: '192.168.1.1', dns: '1.1.1.1', mac: 'A4:5E:60:C1:22:9F', internet: true }, 1500),
  getInstalledApps: () => wait([]),
  getAllApps: () => wait([
    { name: 'Google Chrome', version: '131.0.6778.86', location: '', uninstallString: 'x', systemComponent: false, installDate: '20261102', publisher: 'Google LLC', sizeKB: 512000 },
    { name: 'Visual Studio Code', version: '1.96.0', location: '', uninstallString: 'x', systemComponent: false, installDate: '20261015', publisher: 'Microsoft Corporation', sizeKB: 389000 },
    { name: 'Discord', version: '1.0.9175', location: '', uninstallString: 'x', systemComponent: false, installDate: '20260520', publisher: 'Discord Inc.', sizeKB: 254000 },
    { name: 'Steam', version: '2.10.91.91', location: '', uninstallString: 'x', systemComponent: false, installDate: '20250211', publisher: 'Valve Corporation', sizeKB: 1240000 },
    { name: '7-Zip 24.08 (x64)', version: '24.08', location: '', uninstallString: 'x', systemComponent: false, installDate: '20261118', publisher: 'Igor Pavlov', sizeKB: 5800 },
    { name: 'Herramienta antigua', version: '2.1', location: '', uninstallString: '', systemComponent: false, installDate: '20230101', publisher: 'Desconocido', sizeKB: 0 },
  ], 900),
  getAppIcon: () => wait(null, 50),
  uninstallApps: () => ok('Desinstalación simulada'),
  wingetCancel: () => wait({ success: true }),
  runCommand: () => ok(),
  wingetInstall: () => ok('Instalación simulada'),
  wingetList: () => wait({ success: true, output: '' }),
  executeTool: (tool) => ok(`> ${tool}\n\nSalida simulada de ${tool}.\nTodo correcto.`),
  downloadFile: () => wait({ success: true, size: 1024 }),
  writeFile: () => wait({ success: true }),
  appendLog: () => wait({ success: true }, 0),
  defenderTool: () => ok('Abierto'),
  clearRam: () => ok(),
  selectDirectory: () => wait({ canceled: false, path: 'C:\\Office' }),
  createRestorePoint: () => ok(),
  onDownloadProgress: noop, onWingetProgress: noop, onWingetProgressPct: noop,
  runCommands: () => ok(), onCommandProgress: noop,
  installOpencode: () => ok(),
  winrarActivate: () => ok('Licencia copiada (simulado)'),
  ensureDir: (dir) => wait({ success: true, path: dir }, 50),
  getPath: (name) => wait(`D:\\User\\${name[0].toUpperCase()}${name.slice(1)}`, 20),
  mountIso: () => wait({ success: true, driveLetter: 'E' }), unmountIso: () => wait({ success: true }),
  getDrivers: () => wait([]), getProcesses: () => wait([]), getServices: () => wait([]),
  openExternal: () => {}, openPath: () => {}, showItemInFolder: () => {},
};

window.electronAPI = mock;
