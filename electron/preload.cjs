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
  getAppIcon: (displayIcon, location, uninstallString) => ipcRenderer.invoke('get-app-icon', { displayIcon, location, uninstallString }),
  uninstallApps: (apps) => ipcRenderer.invoke('uninstall-apps', apps),
  wingetCancel: (wingetId) => ipcRenderer.invoke('winget-cancel', wingetId),

  // Tools
  runCommand: (command) => ipcRenderer.invoke('run-command', command),
  wingetInstall: (wingetId) => ipcRenderer.invoke('winget-install', wingetId),
  wingetList: () => ipcRenderer.invoke('winget-list'),
  executeTool: (tool, args) => ipcRenderer.invoke('execute-tool', { tool, args }),
  onWingetProgress: (cb) => {
    const l = (e, data) => cb(data);
    ipcRenderer.on('winget-progress', l);
    return () => ipcRenderer.removeListener('winget-progress', l);
  },
  onWingetProgressPct: (cb) => {
    const l = (e, data) => cb(data);
    ipcRenderer.on('winget-progress-pct', l);
    return () => ipcRenderer.removeListener('winget-progress-pct', l);
  },
  onCommandProgress: (cb) => {
    const l = (e, data) => cb(data);
    ipcRenderer.on('command-progress', l);
    return () => ipcRenderer.removeListener('command-progress', l);
  },
  installOpencode: () => ipcRenderer.invoke('install-opencode'),

  // Download
  downloadFile: (url, destPath) => ipcRenderer.invoke('download-file', { url, destPath }),
  writeFile: (path, content) => ipcRenderer.invoke('write-file', { path, content }),
  appendLog: (entry) => ipcRenderer.invoke('append-log', entry),
  defenderTool: (action) => ipcRenderer.invoke('defender-tool', action),
  clearRam: () => ipcRenderer.invoke('clear-ram'),
  onDownloadProgress: (callback) => {
    const l = (event, data) => callback(data);
    ipcRenderer.on('download-progress', l);
    return () => ipcRenderer.removeListener('download-progress', l);
  },

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
