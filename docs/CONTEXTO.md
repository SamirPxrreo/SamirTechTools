# Contexto del Proyecto SamirTechTools (para cualquier IA que continúe)

## Nombre de la app
**SamirTechTools** (antes "M&M Informática" / "SamirTechFix")

## Descripción
Aplicación de escritorio para técnicos de soporte informático. Centro de diagnóstico, mantenimiento e instalación de programas para Windows. Inspirada en [ChrisTitus Tech's winutil](https://github.com/christitustech/winutil).

## Dónde está el proyecto
- **GitHub:** https://github.com/SamirPxrreo/SamirTechTools (rama `main`)
- **Repositorio local:** **NO hay ruta predeterminada.** Al iniciar un chat la IA **DEBE preguntar** al usuario *"¿Dónde quieres alojar/clonar el proyecto en esta PC?"* y usar **exactamente** esa ruta (verificar con `pwd`/`Get-Location`). Nunca asumir `Desktop`, `Documents` o `C:\` por defecto.
- **Flujo multi-PC (Casa / Trabajo):** ver `GUIA_SINCRONIZACION.md` en la raíz. Resumen: `git pull` al empezar, `git add . && git commit -m "..." && git push` al terminar.
- **Git ya configurado:** el token de GitHub está guardado en `%USERPROFILE%\.git-credentials` (credential.helper store). Usuario: `SamirPxrreo`. Solo hacer `git push origin main`.
 - **Release v1.0.0 (actual, única):** los instaladores (`SamirTechTools-Setup-1.0.0.exe` ~67MB y `SamirTechTools-Portable-1.0.0.exe` ~67MB) están en la release `v1.0.0`. Se suben con `gh release upload v1.0.0 release\*.exe --clobber` (usa `GH_TOKEN` del `.git-credentials`). Fallback: `curl -k` con token.

## Stack tecnológico
- **Electron** (ventana frameless, `contextIsolation`, sin nodeIntegration)
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** con tema claro/oscuro conmutable (Minimal Pro: `Outfit` + slate palette)
- **PowerShell** para comandos del sistema

## Arquitectura

### Comunicación Electron ↔ React
- `electron/main.cjs` → proceso principal (CJS). Todos los IPC handlers aquí.
- `electron/preload.cjs` → contextBridge expone `window.electronAPI`
- `src/types/index.ts` → interfaz `ElectronAPI` que debe mantenerse sincronizada con preload
- **NUNCA** usar `exec()` con scripts de PowerShell inline que contengan `$_` — usar la función `ps()` que usa `execFile`

### Sistema de diseño (rediseño noviembre 2026)
- **Tokens semánticos** en `src/index.css` como canales RGB (`--bg --surface --surface-2 --elevated --line --line-strong --fg --muted --subtle --accent --accent-fg --accent-soft --console`) para `:root` (claro) y `[data-theme='dark']` (oscuro, **predeterminado**). `tailwind.config.js` los expone como clases: `bg-surface`, `text-fg`, `text-muted`, `border-line`, `bg-accent/10`, etc. **Usar SIEMPRE estos tokens**, nunca `slate-*`/`neutral-*`/`dark-*` para superficies o texto (ya no hay overrides `!important`).
- `darkMode: ['class','[data-theme="dark"]']` → se puede usar `dark:` para colores de acento (p. ej. `text-emerald-600 dark:text-emerald-300`).
- **Fuentes locales** (sin internet): `@fontsource-variable/inter` (UI) y `@fontsource-variable/jetbrains-mono` (consola/IDs).
- **Componentes base** en `src/components/ui.tsx` (exportados desde `components/index.ts`): `Button`, `IconButton`, `Badge`, `IconTile`, `PageHeader`, `Section`, `Grid`, `Notice`, `EmptyState`, `SearchInput`, `Select`, `Checkbox`, `Switch`, `Tabs`, `Chip`, `Modal`, `KeyValue`, `Spinner`, `cx()`. Tonos: `indigo emerald amber red violet cyan orange pink teal sky slate` (alias antiguos `blue/green/yellow/purple` siguen funcionando).
- `ToolCard` solo pinta botones que tienen `onClick` (no más botones muertos); `accentColor="red"` = botón primario rojo.
- `ConsoleOutput` siempre oscura, con botón copiar; `ConfirmModal` usa `Modal` (Escape cierra, respeta saltos de línea).
- **Preferencias** en `src/context/PrefsContext.tsx` (localStorage): `stt-theme` (light/dark/system), `stt-sidebar-collapsed`, `stt-autodiag`, `stt-log-open`. Se editan en Ajustes.
- **Navegación** centralizada en `src/config/nav.tsx` (Sidebar + breadcrumb del Header).
- Header = barra de título **arrastrable** (`.drag` / `.no-drag`, `-webkit-app-region`) con controles estilo Windows 11.
- **Preview en navegador**: `npx vite` y abrir `http://127.0.0.1:5173` → `src/dev/mockElectron.ts` simula `window.electronAPI` (solo en DEV, no entra al build).
 - Logo circular ST: `public/icon.png` (512x512 12KB, slate-900/indigo) + `public/icon.ico` (32KB) + `public/logo.jpg` (35KB legacy). `Header.tsx` usa `import appIcon from '/icon.png'` (Vite, no titileo) y `BrowserWindow` usa `resources/icon.png/.ico` para ventana/taskbar.

### Navegación
- Sidebar izquierdo (`src/components/Sidebar.tsx`) con las secciones; Header arriba solo con logo/estado/tema/controles de ventana
- Las páginas se registran en 3 lugares: `src/types/index.ts` (unión `Page`), `src/components/Sidebar.tsx` (menú), `src/App.tsx` (switch de render)
- Orden actual (27/08/2026): `dashboard` -> `install` (235 apps) -> `extra-apps` (JO-PDF/Chrome MSI/Obsidian/AionUi) -> `office` -> `windows` -> `utilities` -> `network` -> `uninstaller` -> `settings` — `drivers` y `browsers` eliminados
- `InstallContext` (`src/context/InstallContext.tsx`): persiste `statuses/liveOutputs/selected` entre cambios de menú y expone `cancelApp/cancelBatch` vía `winget-cancel` IPC

### Encoding — IMPORTANTE
- Todos los archivos son **UTF-8 sin BOM**. Hubo un problema histórico de doble codificación (mojibake "Ã³"), ya corregido
- Al editar desde PowerShell, cuidado: la consola corrompe tildes/ñ. Para reemplazos con caracteres especiales usar scripts Node, no PowerShell inline

## Funcionalidades implementadas

### Diagnóstico (Dashboard)
- CPU/RAM/GPU/discos/red/Windows vía CIM/WMI + `os.cpus()`/`os.totalmem` — **estático, sin polling** (0% background), carga progresiva tier1 (cpu/ram rápido) + tier2 (disco/gpu/windows/red en background)
- **VRAM**: `Win32_VideoController.AdapterRAM` se limita a 4GB (uint32), así que la VRAM real se lee del registro `HKLM\...\0000` → `HardwareInformation.qwMemorySize` (Intel Arc 8GB), fallback `qpmemorySize`/`memorySize`. Optimizado a 1 solo `ps()` + cache 10min
- **Cache**: RAM módulos 10min, GPU/Windows 10min, disco/red 30s, Network 1 solo PS (antes 6), temp CPU 30s
- **SystemCard**: texto `select-text` para copiar con menú nativo (click derecho), `break-words` + `col-span-2` para placa base larga
- Generador de reporte .txt al Escritorio

### Instalar Apps (páginas `install` + `extra-apps`)
- **235 apps** catálogo en `src/data/apps.ts` (winutil + extras) — `Instalar Apps` usa WinGet con **progreso en vivo** (`spawn` + `winget-progress` → `InstallPage.tsx`)
- IPC `winget-install` resuelve `Get-Command winget` (fix para exe empaquetado), timeout 15 min, sin `--silent` para ver barra, `--source winget` evita `0x8a15005e`
- **Otras Apps** (`ExtraAppsPage.tsx`): JO-PDF (direct `jopdf.com`), Obsidian (`winget Obsidian.Obsidian`), AionUi 2.1.44 (MediaFire) → `C:\ExtraApps`
- **WinRAR + Activación**: `winget RARLAB.WinRAR` y luego IPC `winrar-activate` copia `rarreg.key` a la carpeta de WinRAR (registro `HKLM\SOFTWARE\WinRAR` → `Program Files\WinRAR` → `(x86)`). La licencia viaja con la herramienta: `resources/winrar/rarreg.key` (se empaqueta vía `extraResources` → `<app>/resources/winrar/`). **Está en `.gitignore` a propósito (repo público)**: hay que colocarla a mano en cada PC donde se compile. Origen/destino los fija `main.cjs` (la UI no pasa rutas); copia directa y, si falla por permisos, con UAC (`Start-Process -Verb RunAs`).
- **Carpetas locales automáticas**: las opciones que guardan archivos (Office online → `C:\Office`, Office offline → `C:\OfficeISO`, Otras apps → `C:\ExtraApps`) crean su carpeta solas con el IPC `ensure-dir` (`src/utils/folders.ts → resolveDir`). Por defecto NO preguntan dónde guardar; se activa en Ajustes → «Preguntar dónde guardar» (`stt-ask-location`). El reporte .txt usa el Escritorio real (`get-path`, puede ser `D:\...` u OneDrive).
- **OpenCode (CLI)**: IPC `install-opencode` = Node.js LTS (winget, si falta) → `Set-ExecutionPolicy` → `npm install -g @opencode/cli` (paquete oficial v2 según opencode.ai/docs; el antiguo `opencode-ai` es v1 y comparte el comando `opencode`, por eso se desinstala antes si existe).
- Iconos: favicons `https://icons.duckduckgo.com/ip3/<dominio>.ico` (Google s2 no cargaba), cards con click en toda la área (fix logo download)
- Selección múltiple con instalación en cola + modal de confirmación antes de instalar

### Windows
- SFC, DISM (check/scan/restore), CHKDSK, Windows Update
- **Defender Control (Sordum)**: `resources/defender-control/dControl.exe` + `dControl.ini` incluidos (se empaquetan vía `extraResources` en package.json). SOLO abre la GUI como admin. **NO usar los exe de comandos de pgkt04/defender-control — le dañaron un Defender a un cliente.** Sordum bloquea descargas automatizadas (anti-bot), por eso va incluido en el repo
- **MAS** (activación Windows/Office): `irm https://get.activated.win | iex` elevado

### Office
- **Online**: setup.exe de officecdn + Configuration.xml embebido en `src/config/constants.ts` (365, 2024, 2021, 2019)
- **Office 2016 Pro Plus 32-bit**: descarga ZIP de Mediafire (~720 MB, URL en `constants.ts` → `OFFICE.OFFICE_2016`), lo extrae a `Escritorio\Office2016` y abre setup.exe elevado. **OJO: los enlaces directos de Mediafire expiran** — si falla, pedir el link nuevo al usuario y actualizar `constants.ts`
- **Offline ISO**: descarga de c2rsetup, monta con `Mount-DiskImage`, instala, desmonta
- Activación (MAS), reparación rápida/completa, desinstalación total (Office Scrubber)

### Desinstalador
- Lista todas las apps del registro (3 hive paths) con versión, editor, fecha de instalación (`InstallDate` formato `yyyyMMdd`), tamaño (`EstimatedSize` en KB), **DisplayIcon**
- Iconos: IPC `get-app-icon` (usa `app.getFileIcon` con cache) - busca en `DisplayIcon` → `InstallLocation/*.exe` → `UninstallString`. `UninstallerPage.tsx` carga lazy con `<AppIcon>`
- Filtros: búsqueda nombre/editor, rango de fecha (semana/mes/3 meses/año/más de un año), orden por nombre/fecha/tamaño
- Desinstalación profunda: script PS elevado que hace MSI/winget/desinstalador original + limpia carpetas, registro, Run keys, servicios y accesos directos

### Utilidades
- Herramientas de sistema y red, **Descargas ISO** con link a UUP dump (`https://uupdump.net/known.php`)

## Permisos de administrador
- El ejecutable lleva manifest `requestedExecutionLevel: 'asInvoker'` (package.json → `build.win`, `signAndEditExecutable: false`) — **la app abre sin admin** como WinUtil, para que `winget --ignore-security-hash` no de `cannot be overridden when running as admin`. La elevación se pide solo donde hace falta (`SFC/DISM/Uninstall/clear-ram/Defender` usan `Start-Process -Verb RunAs`, `winget settings --enable InstallerHashOverride` también pide UAC una vez)
- En dev (`npm run electron:dev`) nunca pide admin

## Build y release
```powershell
npm run build            # solo compila frontend (tsc + vite)
npm run electron:build   # instalador NSIS + portable en release/
```
- **El build de electron-builder falla sin admin** (winCodeSign usa symlinks). Ejecutarlo desde una PowerShell elevada:
```powershell
Start-Process powershell -Verb RunAs -Wait -ArgumentList '-Command','Set-Location "<ruta-que-indique-el-usuario>"; npm run electron:build'
```
 - **GitHub CLI (`gh` 2.98+):** instalado en `C:\Program Files\GitHub CLI\gh.exe` y en PATH. Token `gho_...` con scopes `repo,workflow` (en credencial `git:https://github.com`). Para subir release: `gh release upload v1.0.0 release\*.exe --clobber` o `gh release create v1.0.0 release\*.exe --title v1.0.0`. Fallback: `curl -k` con token.
- **Comando "sube todo a github" = SUBIR LO NECESARIO PARA QUE LOS EXES FUNCIONEN COMO EN EL CHAT:** cuando el usuario diga "sube todo a github" subir `git add` + `commit` + `push` de lo cambiado, y si cambió `src/`/`electron/`/`resources/` además `npm run electron:build` + `gh release upload v1.0.0 release\*.exe --clobber`. Si solo `*.md`/`docs`, basta `git push`. Versionado (semver): `1.0.1` = solo arreglos, `1.1.0` = funciones nuevas compatibles, `2.0.0` = cambio grande/incompatible. Al subir versión cambiar `package.json` (+ `package-lock.json`) y `APP_VERSION` en `src/config/constants.ts`, y crear una release nueva `vX.Y.Z` con los `.exe` **y `latest.yml`** (lo necesita el actualizador automático).
- Versión actual: **1.1.0** (rediseño completo "pro dark" + WinRAR+Activación + OpenCode `@opencode/cli` + carpetas automáticas + Ajustes funcionales). Compilada 21/11/2026 (`Setup-1.1.0.exe` ~65.9MB, `Portable-1.1.0.exe` ~65.7MB). La v1.0.0 fue: Minimal Pro + logo ST circular + dControl + asInvoker + winget hash fix + InstallContext persistente.
- **Compilar**: `npm run electron:build` falla sin admin (symlinks de winCodeSign, `signAndEditExecutable: true` para incrustar el icono). Se lanzó con un `.ps1` elevado que escribe un log; con UAC aceptado termina con `EXIT=0`.

## Sincronización y entorno de desarrollo
- Ver `GUIA_SINCRONIZACION.md` para el flujo completo entre PCs.
- **Node.js requerido:** 18+ pero recomendado **20 LTS**. Node 26 bloquea el postinstall de Electron (`install scripts blocked`) y requiere descarga manual del binario.
- **Ubicación:** preguntar al usuario dónde quiere alojar/clonar el proyecto. No asumir ninguna ruta.
- **Script dev:** `npm run electron:dev` debe ser `concurrently "vite" "wait-on http://localhost:5173 && electron . --dev"` — el flag `--dev` hace que `electron/main.cjs` cargue `http://localhost:5173` en lugar de `dist/index.html`.
- Si `node_modules/electron/dist` solo contiene `locales`, descargar manualmente:
```powershell
Invoke-WebRequest -Uri "https://github.com/electron/electron/releases/download/v31.7.7/electron-v31.7.7-win32-x64.zip" -OutFile "$env:TEMP\electron.zip"
Expand-Archive -Path "$env:TEMP\electron.zip" -DestinationPath "node_modules\electron\dist" -Force
Set-Content -Path "node_modules\electron\path.txt" -Value "electron.exe" -NoNewline
```

## Diseño (noviembre 2026) — rediseño completo
- Estilo "pro dark" (Linear/Raycast) con tema claro pulido. Acento índigo (logo ST). Tipografía Inter.
- Sidebar plegable (232px / 68px) con tarjeta del equipo; registro inferior plegable con última entrada visible.
- Dashboard: hero con nombre del equipo + 4 indicadores + 6 paneles con skeletons. Instalar/Desinstalador con barra flotante de selección.
- Se corrigieron: frecuencia CPU (×1000), unidades del reporte .txt (×1024³ y "C::"), modal invisible en tema claro, Ajustes sin función, ventana no arrastrable, restos de marca "M&M".

## Estado (02/09/2026)
- App funcional, probada en Windows 11 x64 - dashboard estático 0% background, carga progresiva tier1/tier2, CPU nativo sin PowerShell
- Instaladores **v1.0.0** actualizados 02/09/2026 en GitHub (Setup ~64.6MB + Portable ~64.4MB, bundle 315KB) — `gh release upload v1.0.0 --clobber` — incluye perf 02/09 (cache 30s-10min, Network 1 PS, polling eliminado, LogContext 300)
- dControl de Sordum incluido en `resources/defender-control/` (ya no ignorado, se versiona con `git add -f`)

## Pendientes / ideas futuras
1. Firmar el código (code signing) para evitar SmartScreen
2. Actualizador automático (electron-updater)
3. Exportar reporte de diagnóstico a PDF
4. Verificar VRAM en más equipos (AMD/Intel integrada a veces reporta 0 en el registro)
5. El enlace de Mediafire de Office 2016 puede expirar — regenerarlo cuando el usuario lo pida
