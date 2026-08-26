const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),

  // System info
  checkAdmin: () => ipcRenderer.invoke('check-admin'),
  getComputerName: () => ipcRenderer.invoke('get-computer-name'),
  getUsername: () => ipcRenderer.invoke('get-username'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  getArch: () => ipcRenderer.invoke('get-arch'),
  getUptime: () => ipcRenderer.invoke('get-uptime'),

  // Hardware
  getCpuInfo: () => ipcRenderer.invoke('get-cpu-info'),
  getRamInfo: () => ipcRenderer.invoke('get-ram-info'),
  getDiskInfo: () => ipcRenderer.invoke('get-disk-info'),
  getGpuInfo: () => ipcRenderer.invoke('get-gpu-info'),

  // OS & Network
  getWindowsInfo: () => ipcRenderer.invoke('get-windows-info'),
  getNetworkInfo: () => ipcRenderer.invoke('get-network-info'),

  // Apps
  getInstalledApps: (category) => ipcRenderer.invoke('get-installed-apps', category),
  getAllApps: () => ipcRenderer.invoke('get-all-apps'),
  uninstallApps: (apps) => ipcRenderer.invoke('uninstall-apps', apps),

  // Tools
  runCommand: (command) => ipcRenderer.invoke('run-command', command),
  executeTool: (tool, args) => ipcRenderer.invoke('execute-tool', { tool, args }),

  // Download
  downloadFile: (url, destPath) => ipcRenderer.invoke('download-file', { url, destPath }),
  writeFile: (path, content) => ipcRenderer.invoke('write-file', { path, content }),
  appendLog: (entry) => ipcRenderer.invoke('append-log', entry),
  defenderTool: (action) => ipcRenderer.invoke('defender-tool', action),
  clearRam: () => ipcRenderer.invoke('clear-ram'),
  onDownloadProgress: (callback) => ipcRenderer.on('download-progress', (event, data) => callback(data)),

  // ISO
  mountIso: (isoPath) => ipcRenderer.invoke('mount-iso', isoPath),
  unmountIso: (isoPath) => ipcRenderer.invoke('unmount-iso', isoPath),

  // Drivers
  getDrivers: () => ipcRenderer.invoke('get-drivers'),
  getProcesses: () => ipcRenderer.invoke('get-processes'),
  getServices: () => ipcRenderer.invoke('get-services'),

  // External
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  openPath: (path) => ipcRenderer.invoke('open-path', path),
  showItemInFolder: (path) => ipcRenderer.invoke('show-item-in-folder', path),
});
