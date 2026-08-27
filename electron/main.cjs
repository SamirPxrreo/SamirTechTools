const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const { exec, execFile } = require('child_process');
const os = require('os');
const https = require('https');
const http = require('http');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    backgroundColor: '#020617',
  });

  if (process.argv.includes('--dev')) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

ipcMain.on('window-minimize', () => mainWindow?.minimize());
ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize();
  else mainWindow?.maximize();
});
ipcMain.on('window-close', () => mainWindow?.close());

function runCommand(command) {
  return new Promise((resolve) => {
    exec(command, { encoding: 'utf-8', maxBuffer: 1024 * 1024 * 10, timeout: 60000 }, (error, stdout, stderr) => {
      if (error) {
        resolve({ success: false, output: stderr || error.message, code: error.code });
      } else {
        resolve({ success: true, output: stdout, code: 0 });
      }
    });
  });
}

function ps(script) {
  return new Promise((resolve) => {
    execFile('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', script],
      { encoding: 'utf-8', maxBuffer: 1024 * 1024 * 10, timeout: 60000 },
      (error, stdout, stderr) => {
        if (error) resolve({ success: false, output: stderr || error.message, code: error.code });
        else resolve({ success: true, output: stdout, code: 0 });
      });
  });
}

ipcMain.handle('check-admin', async () => {
  try { const r = await runCommand('net session'); return r.success; } catch { return false; }
});

ipcMain.handle('get-computer-name', () => os.hostname());
ipcMain.handle('get-username', () => os.userInfo().username);
ipcMain.handle('get-platform', () => os.platform() + ' ' + os.release());
ipcMain.handle('get-arch', () => os.arch());
ipcMain.handle('get-uptime', () => os.uptime());

// CPU
ipcMain.handle('get-cpu-info', async () => {
  const cpus = os.cpus();
  const cpu = cpus[0];
  let usage = 0;
  try {
    const r = await ps('Get-CimInstance Win32_Processor | Select-Object -First 1 -ExpandProperty LoadPercentage');
    const v = parseInt(r.output.trim());
    if (!isNaN(v)) usage = v;
  } catch {}
  let temp = null;
  try {
    const r = await ps('Get-CimInstance MSAcpi_ThermalZoneTemperature -Namespace root/wmi | Select-Object -First 1 -ExpandProperty CurrentTemperature');
    const v = parseInt(r.output.trim());
    if (!isNaN(v)) temp = Math.round((v - 2732) / 10);
  } catch {}
  return {
    model: cpu.model.trim(),
    manufacturer: cpu.model.includes('Intel') ? 'Intel' : cpu.model.includes('AMD') ? 'AMD' : 'Unknown',
    cores: cpus.length,
    logicalCores: cpus.length,
    speed: cpu.speed,
    maxSpeed: cpu.speed,
    usage,
    temperature: temp,
  };
});

// RAM
ipcMain.handle('get-ram-info', async () => {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  let modules = [];
  try {
    const r = await ps('Get-CimInstance Win32_PhysicalMemory | ForEach-Object { $_.Capacity + "|" + $_.Speed + "|" + $_.Manufacturer + "|" + $_.PartNumber }');
    for (const line of r.output.trim().split('\n')) {
      const p = line.split('|');
      if (p.length >= 4) {
        modules.push({ capacity: parseInt(p[0]) || 0, speed: parseInt(p[1]) || 0, manufacturer: (p[2] || '').trim(), partNumber: (p[3] || '').trim() });
      }
    }
  } catch {}
  return { total: totalMem, used: usedMem, free: freeMem, percentage: Math.round((usedMem / totalMem) * 100), modules, moduleCount: modules.length || 'N/A' };
});

// Disk
ipcMain.handle('get-disk-info', async () => {
  let physical = [];
  let logical = [];
  try {
    const r = await ps('Get-CimInstance Win32_DiskDrive | ForEach-Object { $_.Model + "|" + $_.Size + "|" + $_.MediaType + "|" + $_.InterfaceType + "|" + $_.SerialNumber }');
    for (const line of r.output.trim().split('\n')) {
      const p = line.split('|');
      if (p.length >= 5) {
        physical.push({ model: (p[0] || 'Unknown').trim(), size: parseInt(p[1]) || 0, mediaType: (p[2] || 'Unknown').trim(), interfaceType: (p[3] || 'Unknown').trim(), serialNumber: (p[4] || 'Unknown').trim() });
      }
    }
  } catch {}
  try {
    const r = await ps('Get-CimInstance Win32_LogicalDisk | ForEach-Object { $_.DeviceID + "|" + $_.Size + "|" + $_.FreeSpace + "|" + $_.FileSystem }');
    for (const line of r.output.trim().split('\n')) {
      const p = line.split('|');
      if (p.length >= 4 && p[1] && p[1].trim() !== '') {
        logical.push({ letter: (p[0] || '').trim(), total: parseInt(p[1]) || 0, free: parseInt(p[2]) || 0, fileSystem: (p[3] || 'Unknown').trim() });
      }
    }
  } catch {}
  return { physical, logical };
});

// GPU - VRAM real via registro en un solo PS (evita 5 spawns que causaban delay negro)
ipcMain.handle('get-gpu-info', async () => {
  let gpus = [];
  try {
    const script = `
$regBase='HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}'
$gpus=Get-CimInstance Win32_VideoController
foreach($g in $gpus){
  $name=$g.Name; $vram=[int64]$g.AdapterRAM; $dv=$g.DriverVersion; $dd=$g.DriverDate
  try{
    $keys=Get-ChildItem $regBase -ErrorAction SilentlyContinue | Select-Object -ExpandProperty PSChildName
    foreach($k in $keys){ if($k -notmatch '^\\d{4}$'){continue}
      $desc=(Get-ItemProperty "$regBase\\$k" -ErrorAction SilentlyContinue).DriverDesc
      if(-not $desc){continue}
      $nl=$name.ToLower(); $dl=$desc.ToLower()
      $match=$nl.Contains($dl) -or $dl.Contains($nl.Split('(')[0].Trim()) -or ($nl.Split(' ') | Where-Object{$_.Length -gt 3} | Where-Object{$dl.Contains($_)} | Measure-Object).Count -gt 0
      if($match){
        $qw=(Get-ItemProperty "$regBase\\$k" -Name 'HardwareInformation.qwMemorySize' -ErrorAction SilentlyContinue).'HardwareInformation.qwMemorySize'
        $qp=(Get-ItemProperty "$regBase\\$k" -Name 'HardwareInformation.qpmemorySize' -ErrorAction SilentlyContinue).'HardwareInformation.qpmemorySize'
        $ms=(Get-ItemProperty "$regBase\\$k" -Name 'HardwareInformation.memorySize' -ErrorAction SilentlyContinue).'HardwareInformation.memorySize'
        if($qw -gt 0){$vram=[int64]$qw; break}
        if($qp -gt 0){$vram=[int64]$qp; break}
        if($ms -gt 0){$vram=[int64]$ms; break}
      }
    }
    if($vram -eq $g.AdapterRAM){
      $qw0=(Get-ItemProperty "$regBase\\0000" -Name 'HardwareInformation.qwMemorySize' -ErrorAction SilentlyContinue).'HardwareInformation.qwMemorySize'
      if($qw0 -gt $vram){$vram=[int64]$qw0}
    }
  }catch{}
  "$name|$vram|$dv|$dd"
}
`;
    const r = await ps(script);
    for (const line of r.output.trim().split('\n')) {
      const p = line.split('|');
      if (p.length >= 4 && p[0].trim()) {
        gpus.push({ name: p[0].trim(), vram: parseInt(p[1])||0, driverVersion: (p[2]||'Unknown').trim(), driverDate: (p[3]||'Unknown').trim() });
      }
    }
  } catch {}
  return gpus;
});

// Windows
ipcMain.handle('get-windows-info', async () => {
  let info = {};
  try {
    const r = await ps('Get-CimInstance Win32_OperatingSystem | Select-Object Caption, Version, BuildNumber, OSArchitecture, InstallDate, LastBootUpTime, RegisteredUser | Format-List');
    const lines = r.output.trim().split('\n');
    for (const line of lines) {
      const eq = line.indexOf(':');
      if (eq > 0) {
        const key = line.substring(0, eq).trim();
        const val = line.substring(eq + 1).trim();
        if (key === 'Caption') info.caption = val;
        else if (key === 'Version') info.version = val;
        else if (key === 'BuildNumber') info.build = val;
        else if (key === 'OSArchitecture') info.architecture = val;
        else if (key === 'InstallDate') info.installDate = val;
        else if (key === 'LastBootUpTime') info.lastBoot = val;
        else if (key === 'RegisteredUser') info.registeredUser = val;
      }
    }
    // Motherboard info
    const mb = await ps('Get-CimInstance Win32_BaseBoard | Select-Object Manufacturer, Product, Version, SerialNumber | Format-List');
    const mbLines = mb.output.trim().split('\n');
    for (const line of mbLines) {
      const eq = line.indexOf(':');
      if (eq > 0) {
        const key = line.substring(0, eq).trim();
        const val = line.substring(eq + 1).trim();
        if (key === 'Manufacturer') info.boardManufacturer = val;
        else if (key === 'Product') info.boardProduct = val;
        else if (key === 'Version') info.boardVersion = val;
        else if (key === 'SerialNumber') info.boardSerial = val;
      }
    }
  } catch {}
  return info;
});

// Network
ipcMain.handle('get-network-info', async () => {
  let info = {};
  try {
    // Find adapter with default route (gateway)
    const rGate = await ps('Get-NetRoute -DestinationPrefix "0.0.0.0/0" -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty InterfaceIndex');
    let ifIndex = rGate.output.trim();
    if (!ifIndex) {
      const rUp = await ps('Get-NetAdapter | Where-Object {$_.Status -eq "Up"} | Select-Object -First 1 -ExpandProperty InterfaceIndex');
      ifIndex = rUp.output.trim();
    }
    if (ifIndex) {
      const rMac = await ps('Get-NetAdapter -InterfaceIndex ' + ifIndex + ' -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty MacAddress');
      if (rMac.output.trim()) info.mac = rMac.output.trim();
      const rIp = await ps('Get-NetIPAddress -InterfaceIndex ' + ifIndex + ' -AddressFamily IPv4 -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty IPAddress');
      if (rIp.output.trim()) info.ip = rIp.output.trim();
      const rGw = await ps('Get-NetRoute -InterfaceIndex ' + ifIndex + ' -DestinationPrefix "0.0.0.0/0" -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty NextHop');
      if (rGw.output.trim()) info.gateway = rGw.output.trim();
      const rDns = await ps('Get-DnsClientServerAddress -InterfaceIndex ' + ifIndex + ' -AddressFamily IPv4 | Select-Object -First 1 -ExpandProperty ServerAddresses');
      if (rDns.output.trim()) info.dns = rDns.output.trim();
    }
    const ping = await runCommand('ping -n 1 8.8.8.8');
    info.internet = ping.success;
  } catch {}
  return info;
});

// Apps
ipcMain.handle('get-installed-apps', async (event, category) => {
  const officeApps = ['Microsoft Word', 'Microsoft Excel', 'Microsoft PowerPoint', 'Microsoft Outlook', 'Microsoft Teams'];
  const adobeApps = ['Adobe Photoshop', 'Adobe Illustrator', 'Adobe Premiere', 'Adobe After Effects', 'Adobe Acrobat', 'Adobe Creative Cloud'];
  const browserApps = ['Google Chrome', 'Microsoft Edge', 'Mozilla Firefox', 'Opera', 'Brave'];
  let searchTerms = [];
  if (category === 'office') searchTerms = officeApps;
  else if (category === 'adobe') searchTerms = adobeApps;
  else if (category === 'browsers') searchTerms = browserApps;
  else searchTerms = [...officeApps, ...adobeApps, ...browserApps];

  let apps = [];
  try {
    const r = await ps('Get-ItemProperty HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*, HKLM:\\Software\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* -ErrorAction SilentlyContinue | ForEach-Object { $_.DisplayName + "|" + $_.DisplayVersion + "|" + $_.InstallLocation }');
    const lines = r.output.trim().split('\n').filter(l => l.trim());
    for (const term of searchTerms) {
      const found = lines.find(line => line.toLowerCase().includes(term.toLowerCase()));
      if (found) {
        const p = found.split('|');
        apps.push({ name: (p[0] || term).trim(), version: (p[1] || 'Unknown').trim(), installed: true, location: (p[2] || 'N/A').trim() });
      } else {
        apps.push({ name: term, version: 'N/A', installed: false, location: 'N/A' });
      }
    }
  } catch {
    for (const term of searchTerms) apps.push({ name: term, version: 'Unknown', installed: false, location: 'N/A' });
  }
  return apps;
});

// Listar TODAS las apps instaladas con su desinstalador
ipcMain.handle('get-all-apps', async () => {
  try {
    const r = await ps(
      'Get-ItemProperty HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*, HKLM:\\Software\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*, HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* -ErrorAction SilentlyContinue | Where-Object { $_.DisplayName } | Sort-Object DisplayName -Unique | ForEach-Object { ($_.DisplayName -replace "\\|"," ") + "|" + ($_.DisplayVersion) + "|" + ($_.InstallLocation -replace "\\|"," ") + "|" + ($_.UninstallString -replace "\\|"," ") + "|" + ($_.SystemComponent) + "|" + ($_.InstallDate) + "|" + ($(if ($_.Publisher) { $_.Publisher } else { "" }) -replace "\\|"," ") + "|" + ($_.EstimatedSize) + "|" + ($(if ($_.DisplayIcon) { $_.DisplayIcon } else { "" }) -replace "\\|"," ") }'
    );
    const lines = r.output.trim().split('\n').filter(l => l.trim());
    const apps = [];
    for (const line of lines) {
      const p = line.split('|');
      const name = (p[0] || '').trim();
      // Filtrar entradas del sistema y actualizaciones
      if (!name || /^(KB\d+|Update for|Security Update)/i.test(name)) continue;
      apps.push({
        name,
        version: (p[1] || '').trim() || '-',
        location: (p[2] || '').trim(),
        uninstallString: (p[3] || '').trim(),
        systemComponent: (p[4] || '0').trim() === '1',
        installDate: (p[5] || '').trim(),
        publisher: (p[6] || '').trim(),
        sizeKB: parseInt(p[7]) || 0,
        displayIcon: (p[8] || '').trim(),
      });
    }
    return apps;
  } catch {
    return [];
  }
});

// Icono de app: extrae icono del exe (DisplayIcon o InstallLocation) - cache en memoria
const _iconCache = new Map();
ipcMain.handle('get-app-icon', async (event, { displayIcon, location, uninstallString }) => {
  const key = (displayIcon || '') + '|' + (location || '') + '|' + (uninstallString || '');
  if (_iconCache.has(key)) return _iconCache.get(key);
  let iconPath = '';
  try {
    // 1. DisplayIcon (puede traer ",0" o "%ProgramFiles%")
    if (displayIcon) {
      let p = displayIcon.split(',')[0].trim().replace(/^"/, '').replace(/"$/, '');
      // Expandir variables de entorno %ProgramFiles% etc
      p = p.replace(/%([^%]+)%/g, (_, n) => process.env[n] || process.env[n.toUpperCase()] || `%${n}%`);
      if (p && fs.existsSync(p)) iconPath = p;
      else if (p && !path.isExtname(p) && fs.existsSync(p + '.exe')) iconPath = p + '.exe';
    }
    // 2. InstallLocation
    if (!iconPath && location && fs.existsSync(location)) {
      try {
        const files = fs.readdirSync(location).filter(f => f.toLowerCase().endsWith('.exe'));
        // Filtrar uninstallers para preferir el exe principal
        const filtered = files.filter(f => !/uninstall|unins|setup/i.test(f));
        const candidates = filtered.length ? filtered : files;
        let best = '';
        let bestSize = 0;
        for (const f of candidates.slice(0, 8)) {
          const fp = path.join(location, f);
          try { const s = fs.statSync(fp).size; if (s > bestSize) { bestSize = s; best = fp; } } catch {}
        }
        if (best) iconPath = best;
      } catch {}
    }
    // 3. UninstallString (a veces apunta al exe principal o desinstalador)
    if (!iconPath && uninstallString) {
      const m = uninstallString.match(/"([^"]+\.exe)"/i) || uninstallString.match(/([A-Za-z]:\\[^\s"']+\.exe)/i);
      if (m && m[1] && fs.existsSync(m[1])) {
        // Si es uninstaller, intentar buscar exe hermano en la misma carpeta
        const dir = path.dirname(m[1]);
        if (/uninstall|unins/i.test(path.basename(m[1])) && fs.existsSync(dir)) {
          try {
            const siblings = fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith('.exe') && !/uninstall|unins/i.test(f));
            if (siblings.length) {
              let best = ''; let bestSize = 0;
              for (const f of siblings.slice(0, 5)) {
                const fp = path.join(dir, f);
                try { const s = fs.statSync(fp).size; if (s > bestSize) { bestSize = s; best = fp; } } catch {}
              }
              if (best) iconPath = best; else iconPath = m[1];
            } else iconPath = m[1];
          } catch { iconPath = m[1]; }
        } else iconPath = m[1];
      }
    }
    if (!iconPath) { _iconCache.set(key, null); return null; }
    const img = await app.getFileIcon(iconPath, { size: 'small' });
    // getFileIcon devuelve icono genérico transparente si falla -> detectar vacío
    if (img.isEmpty()) { _iconCache.set(key, null); return null; }
    const dataUrl = img.toDataURL();
    _iconCache.set(key, dataUrl);
    return dataUrl;
  } catch {
    _iconCache.set(key, null);
    return null;
  }
});

// Desinstalar apps seleccionadas con limpieza profunda de rastros
ipcMain.handle('uninstall-apps', async (event, appList) => {
  const os = require('os');
  const path = require('path');
  const tmpScript = path.join(os.tmpdir(), 'stt-uninstall.ps1');
  const tmpResult = path.join(os.tmpdir(), 'stt-uninstall-result.txt');

  const esc = (s) => String(s).replace(/'/g, "''");

  let body = `
$ErrorActionPreference = 'SilentlyContinue'
$log = @()
function Log($m) { $script:log += $m }
`;

  for (const app of appList) {
    const name = esc(app.name);
    const us = esc(app.uninstallString || '');
    body += `
Log "===== ${name} ====="
# --- 1. Desinstalacion silenciosa ---
$done = $false
if ('${us}' -match '\\{[0-9A-Fa-f\\-]{36}\\}') {
  $guid = ([regex]::Match('${us}', '\\{[0-9A-Fa-f\\-]{36}\\}')).Value
  Log "MSI detectado: $guid"
  Start-Process msiexec.exe -ArgumentList "/x $guid /qn /norestart" -Wait
  $done = $true
}
if (-not $done -and (Get-Command winget -ErrorAction SilentlyContinue)) {
  Log "Intentando winget..."
  $out = winget uninstall --name "${name.replace(/"/g, '')}" --silent --force --purge --disable-interactivity --accept-source-agreements 2>&1 | Out-String
  Log ($out.Trim())
  if ($LASTEXITCODE -eq 0) { $done = $true }
}
if (-not $done -and '${us}' -ne '') {
  Log "Ejecutando desinstalador original..."
  $exeEnd = 0
  if ('${us}'.StartsWith('"')) { $exeEnd = '${us}'.IndexOf('"',1) + 1 }
  else { $sp = '${us}'.IndexOf(' '); if ($sp -gt 0) { $exeEnd = $sp } else { $exeEnd = '${us}'.Length } }
  $exePath = '${us}'.Substring(0, $exeEnd).Trim('"')
  $extraArgs = '${us}'.Substring($exeEnd).Trim()
  $silentArgs = "$extraArgs /S /s /silent /quiet /verysilent /qn /norestart"
  if (Test-Path $exePath) {
    Start-Process $exePath -ArgumentList $silentArgs -Wait
    $done = $true
  } else {
    Log "Desinstalador no encontrado: $exePath"
  }
}

# --- 2. Limpieza de rastros ---
$pattern = "*${'*' + name.slice(0, Math.min(name.length, 40))}*"
Log "Limpiando rastros: $pattern"

$dirs = @(
  "$env:ProgramFiles",
  "\u0024{env:ProgramFiles(x86)}",
  "$env:ProgramData",
  "$env:LOCALAPPDATA",
  "$env:LOCALAPPDATA\\Programs",
  "$env:APPDATA",
  "$env:USERPROFILE\\.nuget\\packages"
)
foreach ($d in $dirs) {
  if (Test-Path $d) {
    Get-ChildItem $d -Directory -ErrorAction SilentlyContinue | Where-Object { $_.Name -like $pattern } | ForEach-Object {
      Log "  Carpeta eliminada: $($_.FullName)"
      Remove-Item $_.FullName -Recurse -Force
    }
  }
}

# --- 3. Registro: claves de desinstalacion restantes ---
$regPaths = @(
  'HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
  'HKLM:\\Software\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
  'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall'
)
foreach ($rp in $regPaths) {
  Get-ChildItem $rp -ErrorAction SilentlyContinue | Where-Object { $_.GetValue('DisplayName') -like $pattern } | ForEach-Object {
    Log "  Registro eliminado: $($_.PSPath)"
    Remove-Item $_.PSPath -Recurse -Force
  }
}

# --- 4. Ejecucion automatica (Run keys) ---
foreach ($rk in @('HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run','HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run')) {
  $props = Get-Item $rk -ErrorAction SilentlyContinue
  if ($props) {
    foreach ($pn in $props.GetValueNames()) {
      if ($pn -like $pattern -or ($props.GetValue($pn) -like $pattern)) {
        Log "  Run key eliminada: $pn"
        Remove-ItemProperty -Path $rk -Name $pn -Force
      }
    }
  }
}

# --- 5. Servicios y procesos restantes ---
$svcName = '${name.split(' ')[0].toLowerCase()}'
Get-Service | Where-Object { $_.Name -like $pattern -or $_.DisplayName -like $pattern } | ForEach-Object {
  Log "  Servicio eliminado: $($_.Name)"
  Stop-Service $_.Name -Force
  sc.exe delete $_.Name | Out-Null
}

# --- 6. Accesos directos ---
$shortcutDirs = @(
  "$env:APPDATA\\Microsoft\\Windows\\Start Menu",
  "$env:ProgramData\\Microsoft\\Windows\\Start Menu",
  "$env:USERPROFILE\\Desktop",
  "$env:PUBLIC\\Desktop"
)
foreach ($sd in $shortcutDirs) {
  Get-ChildItem $sd -Filter *.lnk -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.BaseName -like $pattern } | ForEach-Object {
    Log "  Acceso directo eliminado: $($_.FullName)"
    Remove-Item $_.FullName -Force
  }
}
`;
  }

  body += `
$log | Out-File -FilePath '${esc(tmpResult)}' -Encoding UTF8
`;

  fs.writeFileSync(tmpScript, body, 'utf-8');
  try { fs.unlinkSync(tmpResult); } catch {}

  try {
    await ps(`Start-Process powershell -Verb RunAs -Wait -ArgumentList '-NoProfile','-ExecutionPolicy','Bypass','-File','${esc(tmpScript)}'`);
    // Esperar resultado
    let out = '';
    for (let i = 0; i < 10; i++) {
      if (fs.existsSync(tmpResult)) { out = fs.readFileSync(tmpResult, 'utf-8'); break; }
      await new Promise(r => setTimeout(r, 1000));
    }
    try { fs.unlinkSync(tmpScript); } catch {}
    try { fs.unlinkSync(tmpResult); } catch {}
    return { success: true, output: out || 'Proceso completado (sin detalles)' };
  } catch (err) {
    return { success: false, output: String(err) };
  }
});

// Tools
ipcMain.handle('execute-tool', async (event, { tool, args }) => {
  const commands = {
    'sfc': 'sfc /scannow',
    'dism-check': 'DISM /Online /Cleanup-Image /CheckHealth',
    'dism-scan': 'DISM /Online /Cleanup-Image /ScanHealth',
    'dism-restore': 'DISM /Online /Cleanup-Image /RestoreHealth',
    'chkdsk': 'chkdsk C: /f /r',
    'flush-dns': 'ipconfig /flushdns',
    'ping': 'ping ' + (args || '8.8.8.8') + ' -n 4',
    'tracert': 'tracert ' + (args || '8.8.8.8'),
    'nslookup': 'nslookup ' + (args || 'google.com'),
    'ipconfig': 'ipconfig /all',
    'arp': 'arp -a',
    'tasklist': 'tasklist /fo csv',
    'systeminfo': 'systeminfo',
  };
  const cmd = commands[tool];
  if (!cmd) return { success: false, output: 'Unknown tool', code: -1 };
  return await runCommand(cmd);
});

ipcMain.handle('run-command', async (event, command) => await runCommand(command));

// Instalar app via winget con progreso en tiempo real (stream stdout -> winget-progress)
ipcMain.handle('winget-install', async (event, wingetId) => {
  let wingetCmd = 'winget';
  try {
    const r = await ps('(Get-Command winget -ErrorAction SilentlyContinue).Source');
    const p = r.output.trim();
    if (p && fs.existsSync(p)) wingetCmd = `"${p}"`;
  } catch {}
  // winget con --silent no muestra progreso; quitamos --silent para ver barra, mantenemos --disable-interactivity
  const cmd = `${wingetCmd} install --id "${wingetId}" -e --source winget --accept-source-agreements --accept-package-agreements --disable-interactivity`;
  return new Promise((resolve) => {
    const { spawn } = require('child_process');
    const child = spawn(cmd, { shell: true, windowsHide: true });
    let out = '';
    const send = (chunk, isErr=false) => {
      const text = chunk.toString();
      out += text;
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('winget-progress', { wingetId, chunk: text, isErr });
      }
    };
    child.stdout.on('data', (d) => send(d, false));
    child.stderr.on('data', (d) => send(d, true));
    const t = setTimeout(() => { try{ child.kill(); }catch{}; resolve({ success: false, output: out + '\nTimeout: la instalacion tardo demasiado', code: -1 }); }, 900000);
    child.on('close', (code) => {
      clearTimeout(t);
      if (code === 0 || /instalado|successfully installed/i.test(out)) resolve({ success: true, output: out, code: code||0 });
      else resolve({ success: false, output: out || `Exit code ${code}`, code: code||-1 });
    });
    child.on('error', (err) => { clearTimeout(t); resolve({ success: false, output: out + String(err), code: -1 }); });
  });
});

// Verificar si una app esta instalada via winget
ipcMain.handle('winget-list', async () => {
  return new Promise((resolve) => {
    exec('winget list --disable-interactivity',
      { encoding: 'utf-8', maxBuffer: 1024 * 1024 * 20, timeout: 120000 },
      (error, stdout) => {
        resolve({ success: !error, output: stdout || '' });
      });
  });
});
ipcMain.handle('open-external', (event, url) => shell.openExternal(url));
ipcMain.handle('open-path', (event, p) => shell.openPath(p));
ipcMain.handle('show-item-in-folder', (event, p) => shell.showItemInFolder(p));

// Download file with progress
function downloadFile(url, destPath, onProgress) {
  return new Promise((resolve, reject) => {
    // Asegurar carpeta destino existe (en exe empaquetado C:\Office puede requerir admin, pero lo intentamos)
    try { fs.mkdirSync(path.dirname(destPath), { recursive: true }); } catch {}
    const file = fs.createWriteStream(destPath);
    const protocol = url.startsWith('https') ? https : http;
    const request = protocol.get(url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': '*/*' } }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        file.close();
        try { fs.unlinkSync(destPath); } catch {}
        downloadFile(response.headers.location, destPath, onProgress).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode !== 200) {
        file.close();
        try { fs.unlinkSync(destPath); } catch {}
        reject(new Error('HTTP ' + response.statusCode));
        return;
      }
      const totalBytes = parseInt(response.headers['content-length'], 10);
      let downloadedBytes = 0;
      response.on('data', (chunk) => {
        downloadedBytes += chunk.length;
        if (onProgress && totalBytes) {
          onProgress(Math.round((downloadedBytes / totalBytes) * 100), downloadedBytes, totalBytes);
        }
      });
      response.pipe(file);
      file.on('finish', () => { file.close(); resolve({ success: true, size: downloadedBytes }); });
    });
    request.on('error', (err) => { file.close(); try { fs.unlinkSync(destPath); } catch {} reject(err); });
    request.setTimeout(300000, () => { request.destroy(); reject(new Error('Timeout')); });
  });
}

// Write text file (UTF-8)
ipcMain.handle('write-file', async (event, { path, content }) => {
  try {
    fs.mkdirSync(require('path').dirname(path), { recursive: true });
    fs.writeFileSync(path, content, 'utf-8');
    return { success: true };
  } catch (err) {
    return { success: false, output: String(err) };
  }
});

// Windows Defender: GUI de Defender Control (Sordum) incluida en resources
ipcMain.handle('defender-tool', async (event, action) => {
  const path = require('path');
  let dir;
  if (app.isPackaged) {
    dir = path.join(process.resourcesPath, 'defender-control');
  } else {
    dir = path.join(__dirname, '..', 'resources', 'defender-control');
  }
  const exe = path.join(dir, 'dControl.exe');
  try {
    if (!fs.existsSync(exe)) {
      fs.mkdirSync(dir, { recursive: true });
      shell.openPath(dir);
      shell.openExternal('https://www.sordum.org/9480/defender-control-v2-1/');
      return { success: false, output: 'No se encontro dControl.exe. Se abrio la carpeta y la pagina de descarga de Sordum. Coloca dControl.exe y dControl.ini ahi.' };
    }
    await ps(`Start-Process -FilePath '${exe}' -Verb RunAs`);
    return { success: true, output: 'Defender Control abierto. Presiona el boton grande para Activar o Desactivar.' };
  } catch (err) {
    return { success: false, output: String(err) };
  }
});

// Liberar RAM real: purga la lista standby del sistema (requiere admin)
ipcMain.handle('clear-ram', async () => {
  const path = require('path');
  const scriptPath = path.join(os.tmpdir(), 'stt-clear-ram.ps1');
  const script = `
$sig = @'
using System;
using System.Runtime.InteropServices;
public class MemPurge {
  [DllImport("ntdll.dll")] public static extern int RtlAdjustPrivilege(int p, bool e, bool t, ref bool prev);
  [DllImport("ntdll.dll")] public static extern int NtSetSystemInformation(int cls, ref int info, int len);
  public static void Purge() {
    bool prev = false;
    RtlAdjustPrivilege(15, true, false, ref prev);
    int cmd = 4;
    NtSetSystemInformation(80, ref cmd, 4);
    cmd = 3;
    NtSetSystemInformation(80, ref cmd, 4);
  }
}
'@
Add-Type -TypeDefinition $sig
[MemPurge]::Purge()
Write-Host 'OK'
`;
  fs.writeFileSync(scriptPath, script, 'utf-8');
  try {
    const r = await ps(`Start-Process powershell -Verb RunAs -Wait -WindowStyle Hidden -ArgumentList '-NoProfile','-ExecutionPolicy','Bypass','-File','${scriptPath}'`);
    try { fs.unlinkSync(scriptPath); } catch {}
    if (!r.success) return { success: false, output: r.output || 'Se requieren permisos de administrador' };
    return { success: true, output: 'Memoria standby liberada' };
  } catch (err) {
    try { fs.unlinkSync(scriptPath); } catch {}
    return { success: false, output: String(err) };
  }
});

// Persistent activity log
const logDir = require('path').join(process.env.APPDATA || '.', 'SamirTechTools', 'logs');
ipcMain.handle('append-log', async (event, entry) => {
  try {
    fs.mkdirSync(logDir, { recursive: true });
    const date = new Date().toISOString().slice(0, 10);
    const line = `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.tool} | ${entry.action}: ${entry.result}\n`;
    fs.appendFileSync(require('path').join(logDir, `activity-${date}.log`), line, 'utf-8');
    return { success: true };
  } catch (err) {
    return { success: false, output: String(err) };
  }
});

ipcMain.handle('download-file', async (event, { url, destPath }) => {
  try {
    const result = await downloadFile(url, destPath, (pct, downloaded, total) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('download-progress', { url, destPath, percent: pct, downloaded, total });
      }
    });
    return { success: true, size: result.size };
  } catch (err) {
    return { success: false, output: String(err) };
  }
});

// Mount ISO and return drive letter
ipcMain.handle('mount-iso', async (event, isoPath) => {
  try {
    const r = await ps("Mount-DiskImage -ImagePath '" + isoPath + "' -PassThru | Get-Volume | Select-Object -ExpandProperty DriveLetter");
    const letter = r.output.trim();
    return { success: !!letter, driveLetter: letter };
  } catch (err) {
    return { success: false, driveLetter: '', output: String(err) };
  }
});

// Unmount ISO
ipcMain.handle('unmount-iso', async (event, isoPath) => {
  try {
    await ps("Dismount-DiskImage -ImagePath '" + isoPath + "'");
    return { success: true };
  } catch (err) {
    return { success: false, output: String(err) };
  }
});

// Drivers
ipcMain.handle('get-drivers', async () => {
  let drivers = [];
  try {
    const r = await ps('Get-CimInstance Win32_PnPSignedDriver | Where-Object {$_.DeviceName -and $_.DeviceName -notlike "Unknown"} | Sort-Object DeviceName -Unique | ForEach-Object { $_.DeviceName + "|" + $_.Manufacturer + "|" + $_.DriverVersion + "|" + $_.DriverDate + "|" + $_.InfName }');
    for (const line of r.output.trim().split('\n')) {
      const p = line.split('|');
      if (p.length >= 4) {
        drivers.push({ name: (p[0] || 'Unknown').trim(), manufacturer: (p[1] || 'Unknown').trim(), version: (p[2] || 'Unknown').trim(), date: (p[3] || 'Unknown').trim(), inf: (p[4] || '').trim(), status: 'OK' });
      }
    }
  } catch {}
  return drivers;
});

ipcMain.handle('get-processes', async () => {
  let processes = [];
  try {
    const r = await ps('Get-Process | ForEach-Object { $_.Name + "|" + $_.Id + "|" + [math]::Round($_.WorkingSet64/1MB,1) + "MB" }');
    for (const line of r.output.trim().split('\n')) {
      const p = line.split('|');
      if (p.length >= 3) processes.push({ name: p[0].trim(), pid: p[1].trim(), memory: p[2].trim() });
    }
  } catch {}
  return processes;
});

ipcMain.handle('get-services', async () => {
  let services = [];
  try {
    const r = await ps('Get-Service | ForEach-Object { $_.Name + "|" + $_.Status }');
    for (const line of r.output.trim().split('\n')) {
      const p = line.split('|');
      if (p.length >= 2) services.push({ name: p[0].trim(), status: p[1].trim() });
    }
  } catch {}
  return services;
});
