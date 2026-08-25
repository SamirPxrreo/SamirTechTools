# Contexto del Proyecto SamirTechTools

## Nombre de la app
**SamirTechTools** (antes "M&M Informática")

## Descripción
Aplicación de escritorio para técnicos de soporte informático. Centro de diagnóstico, mantenimiento y herramientas para Windows. Inspirada en [ChrisTitus Tech's winutil](https://github.com/christitustech/winutil).

## Stack tecnológico
- **Electron** (ventana frameless, sin nodeIntegration)
- **React 18** + **TypeScript**
- **Vite** (bundler)
- **Tailwind CSS** (estilos dark mode)
- **PowerShell** (comandos del sistema vía `execFile`)

## Arquitectura importante

### Comunicación Electron ↔ React
- `electron/main.cjs` → proceso principal (CJS, no ESM)
- `electron/preload.cjs` → contextBridge expone `window.electronAPI`
- **NO** se usa `nodeIntegration: true`
- **NO** se usa `exec()` con strings para PowerShell, se usa `execFile()` para evitar problemas de escaping con `$_`

### Función `ps()` en main.cjs
```javascript
function ps(script) {
  return new Promise((resolve) => {
    execFile('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', script],
      { encoding: 'utf-8', maxBuffer: 1024*1024*10, timeout: 60000 },
      (error, stdout, stderr) => {
        if (error) resolve({ success: false, output: stderr || error.message });
        else resolve({ success: true, output: stdout });
      });
  });
}
```
**IMPORTANTE**: Nunca usar `exec()` con scripts de PowerShell porque `$_` se interpreta como variable vacía. Siempre usar `execFile`.

### Detección del sistema
Se usa **PowerShell con CIM/WMI** (no wmic):
- CPU: `Get-CimInstance Win32_Processor`
- RAM: `Get-CimInstance Win32_PhysicalMemory`
- GPU: `Get-CimInstance Win32_VideoController`
- Discos: `Get-CimInstance Win32_DiskDrive` + `Win32_LogicalDisk`
- Windows: `Get-CimInstance Win32_OperatingSystem | Format-List`
- Red: `Get-NetAdapter` + `Get-NetIPAddress` + `Get-NetRoute`
- Drivers: `Get-CimInstance Win32_PnSignedDriver`
- Apps instaladas: Registry `HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*`

### Red - Adaptador correcto
Para obtener IP/Gateway/DNS, primero buscar el adaptador con gateway por defecto:
```powershell
Get-NetRoute -DestinationPrefix "0.0.0.0/0" | Select-Object -First 1 -ExpandProperty InterfaceIndex
```
Luego usar ese InterfaceIndex para `Get-NetIPAddress`, `Get-NetRoute`, `Get-DnsClientServerAddress`.

## Funcionalidades implementadas

### Dashboard (Diagnóstico)
- CPU: modelo, núcleos, uso, temperatura
- RAM: total, disponible, módulos, velocidad
- GPU: modelo, VRAM, driver version
- Discos: capacidad, espacio libre por unidad
- Windows: versión, build, arquitectura
- Red: IP, gateway, DNS, MAC, conectividad

### Office (4 pestañas)
1. **Online**: Descarga automática de `setup.exe` y `Configuration.xml` a `C:\Office\`, luego ejecuta `setup.exe /configure Configuration.xml`
   - setup.exe: `https://officecdn.microsoft.com/pr/wsus/setup.exe`
   - Configuration.xml: `https://www.mediafire.com/file/jkoenkjr3a64xso/configuration.xml/file`
2. **Offline (ISO)**: Descarga ISO desde `c2rsetup.officeapps.live.com`, monta, ejecuta setup, desmonta
   - URLs por versión en el código (365, 2024, 2021, 2019, 2016)
3. **Activar**: Usa `irm https://massgrave.dev/get | iex` (Ohhook, TSforge, KMS38, KMS)
4. **Reparar**: Rápida (InvokeRepair) y completa (Panel de Control)

### Navegadores
Descarga directa desde fuentes oficiales (Chrome, Edge, Firefox, Opera, Brave).

### Drivers
Detecta por categorías (GPU, Audio, Wi-Fi, Bluetooth, Red, Chipset).

### Utilidades
- Sistema: SystemInfo, TaskMgr, Services, DiskMgmt, Settings
- Red: IPConfig, Ping, Tracert, FlushDNS, ARP, Adaptadores
- Mantenimiento: Limpiar temporales, SFC

### Red (página dedicada)
- Ping, Tracert, NSLookup, IPConfig, FlushDNS, ARP con destino configurable.

## Descarga con progreso
El `main.cjs` tiene una función `downloadFile()` que usa módulos nativos de Node.js (`https`/`http`) con callback de progreso:
```javascript
downloadFile(url, destPath, (percent, downloaded, total) => {
  mainWindow.webContents.send('download-progress', data);
});
```
El preload expone `onDownloadProgress` para escuchar eventos desde React.

## Monte de ISO
```javascript
// Montar
const r = await ps("Mount-DiskImage -ImagePath '" + isoPath + "' -PassThru | Get-Volume | Select-Object -ExpandProperty DriveLetter");
// Desmontar
await ps("Dismount-DiskImage -ImagePath '" + isoPath + "'");
```

## Permisos de administrador
- Se detecta con `net session`
- Se muestra en el Header con indicador verde/amarillo
- Herramientas que requieren admin usan `-Verb RunAs` en PowerShell

## Archivos importantes
| Archivo | Función |
|---------|---------|
| `electron/main.cjs` | Proceso principal, IPC, detección del sistema |
| `electron/preload.cjs` | Context bridge para seguridad |
| `src/App.tsx` | Componente principal, routing de páginas |
| `src/context/LogContext.tsx` | Estado global del registro de actividad |
| `src/components/ToolCard.tsx` | Componente reutilizable de tarjeta |
| `src/pages/OfficePage.tsx` | Instalación/activación/reparación de Office |
| `src/types/index.ts` | Interfaces TypeScript |

## Notas conocidas
- El ícono SVG en `public/icon.svg` es placeholder
- `package.json` tiene `"type": "module"` por lo que los scripts de Electron usan `.cjs`
- El `electron/install.js` a veces falla la extracción. Solución: usar `Expand-Archive` de PowerShell manualmente o ejecutar `node node_modules/electron/install.js` después de aprobar scripts
- Para que `systeminformation` funcione, se aprobó con `npm install-scripts approve`

## Solución de problemas en nueva PC (ya resuelto, referencia)
- Si Electron no instala: descargar manualmente `electron-v{version}-win32-x64.zip` desde GitHub releases, extraer a `node_modules\electron\dist\`, y escribir `path.txt` **sin salto de línea** usando `[System.IO.File]::WriteAllText("ruta\path.txt", "electron.exe")`
- Si `concurrently` no se reconoce: falta ejecutar `npm install`
- El error `ENOENT ... electron.exe\r\n` es por el salto de línea en `path.txt`

## Cómo continuar el desarrollo
1. Ejecutar `cd D:\SamirTechFix && npm run electron:dev` (o `C:\MM-Informatica` en la PC original)
2. El Vite server corre en `localhost:5173`
3. Electron carga esa URL en modo dev
4. Los cambios en React se reflejan en hot-reload
5. Los cambios en `electron/main.cjs` requieren reiniciar Electron

## Estado actual (agosto 2026)
- App funcional y probada en Windows 10/11 x64
- Build de producción compilado en `dist/`
- **EJECUTABLE PORTABLE LISTO**: `release\SamirTechTools-Portable-1.0.0.exe` (~68 MB) — corre sin Node.js ni instalación, solo doble clic. Para regenerar: `npm run electron:portable`
- Copia portable en USB: `D:\SamirTechFix`

## Mejoras implementadas recientemente
1. **Configuration.xml generado localmente** — ya no se descarga de MediaFire; el XML (O365, 64-bit, es-mx) está embebido en OfficePage.tsx como constante `CONFIG_XML` y se escribe con el IPC `write-file`. Nunca fallará por hosting externo.
2. **URLs de ISO corregidas** — 2021 ahora usa `ProPlus2021Retail`; 2019 usa la imagen `.img` oficial de officecdn (`ProfessionalPlus2019.img`, montable igual que ISO); 2016 se eliminó por no tener URL directa confiable
3. **Logs persistentes** — cada acción se guarda en `%APPDATA%\SamirTechTools\logs\activity-{fecha}.log` vía IPC `append-log`
4. **Generador de reportes** — botón "Generar reporte" en Dashboard crea `Reporte_Diagnostico_{fecha}.txt` en el Escritorio con CPU/RAM/GPU/discos/red/Windows
5. **Nuevos IPC**: `write-file`, `append-log` (además de los existentes)

## Recomendaciones futuras (pendientes / ideas)
1. **Firmar el código** (code signing) para evitar alertas de SmartScreen/antivirus en el portable
2. **Actualizador automático** con `electron-updater`
3. **Soporte multi-idioma** (es/en) con i18n
4. **Tema claro/oscuro** configurable
5. **Backup del registro** antes de aplicar cambios de sistema
6. Reporte en PDF (actualmente es .txt)
