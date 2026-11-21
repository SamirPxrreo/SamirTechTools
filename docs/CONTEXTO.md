# Contexto del Proyecto SamirTechTools (para cualquier IA que continúe)

> **Léeme primero.** Este archivo es la fuente de verdad del proyecto. Si algo del código contradice este documento, el código manda: corrige el documento en el mismo cambio.
> Última actualización: **21/11/2026 — versión 1.1.0**.

## 1. Qué es
**SamirTechTools** (antes «M&M Informática» / «SamirTechFix»): app de escritorio para técnicos de soporte informático. Centro de diagnóstico, mantenimiento e instalación de programas para **Windows 10/11**. Inspirada en [winutil de ChrisTitusTech](https://github.com/christitustech/winutil).

- **Repo (público):** https://github.com/SamirPxrreo/SamirTechTools — rama `main`
- **Releases:** https://github.com/SamirPxrreo/SamirTechTools/releases (la última es `v1.1.0`)
- **Lanzador de una línea:** `irm https://raw.githubusercontent.com/SamirPxrreo/SamirTechTools/main/get.ps1 | iex` (descarga el portable de la última release y lo ejecuta)
- **Dueño:** usuario de GitHub `SamirPxrreo`. Trabaja en 2 PCs (casa/trabajo) sincronizadas con Git.

## 2. Si estás en una PC nueva (guía rápida para una IA)
1. **Pregunta al usuario dónde quiere el proyecto** y usa exactamente esa ruta (no asumas `Desktop`, `C:\`, etc.). No clones en la raíz de `C:\` (problemas de permisos con Electron).
2. Requisitos: **Git** y **Node.js** (20 LTS recomendado; con Node 26 se pudo compilar pero el `postinstall` de Electron puede bloquearse, ver §12).
3. `git clone https://github.com/SamirPxrreo/SamirTechTools.git` → `cd SamirTechTools` → `npm install` → `npm run electron:dev`.
4. **Falta un archivo a propósito:** `resources/winrar/rarreg.key` (licencia de WinRAR) **no está en Git**. Sin él la app funciona, pero «WinRAR + Activación» falla y el instalador sale sin licencia. Pídeselo al usuario y cópialo ahí (ver §9).
5. Para ver cómo funciona todo: lee este archivo; para el flujo Git entre PCs, `GUIA_SINCRONIZACION.md`; reglas cortas para IAs en `AGENTS.md`.
6. Opcional: un mapa del código con [graphify](https://github.com/Graphify-Labs/graphify) (`uv tool install --python 3.12 graphifyy`, luego `/graphify .`). Genera `graphify-out/`, que está en `.gitignore` (se regenera por PC).

## 3. Stack
- **Electron 31** (ventana sin marco `frame:false`, `contextIsolation`, sin `nodeIntegration`) + `electron-updater` (actualizador automático vía GitHub Releases)
- **React 18 + TypeScript + Vite 5**
- **Tailwind CSS 3** con tokens de diseño propios (§6) · iconos `lucide-react` · fuentes `@fontsource-variable/inter` y `jetbrains-mono` (locales)
- **PowerShell** para casi todo lo del sistema (CIM/WMI, winget, registro)
- Empaquetado: **electron-builder** → NSIS (instalador) + portable, en `release/`

## 4. Estructura de carpetas
```
SamirTechTools/
├── AGENTS.md                 # Reglas cortas para IAs (se carga solo en OpenCode/Claude/Codex)
├── GUIA_SINCRONIZACION.md    # Flujo Git entre 2 PCs
├── PROMPT_IA.md              # Prompt listo para pegar en un chat nuevo con una IA
├── PROMPT_LOGO.md            # Prompts históricos de logo (el actual es vectorial, ver §7)
├── get.ps1                   # Lanzador web de una línea
├── index.html · vite.config.ts · tailwind.config.js · tsconfig*.json · postcss.config.js
├── package.json              # versión, scripts y config de electron-builder ("build")
├── docs/
│   ├── CONTEXTO.md           # ESTE archivo
│   ├── README.md             # Presentación pública (la que ve GitHub)
│   ├── release-notes/vX.Y.Z.md   # Descripción de cada release (UTF-8)
│   └── DESIGN_BACKUP_20250902.md # Histórico, obsoleto
├── electron/
│   ├── main.cjs              # Proceso principal: TODOS los IPC (≈1440 líneas)
│   ├── preload.cjs           # contextBridge → window.electronAPI
│   ├── utils/ps.cjs · validation.cjs   # Helpers ya extraídos (el resto sigue inline en main.cjs)
│   └── handlers/README.md    # Plan de modularización (sin ejecutar)
├── src/
│   ├── main.tsx · App.tsx    # Entrada y layout (Header + Sidebar + página + LogPanel)
│   ├── index.css             # Tokens de color claro/oscuro + utilidades
│   ├── components/           # ui.tsx (kit base), ToolCard, SystemCard, Sidebar, Header, LogPanel, ConsoleOutput, ConfirmModal, StatusBadge/ProgressBar
│   ├── pages/                # Dashboard, InstallPage, ExtraAppsPage, OfficePage, WindowsPage, NetworkPage, UtilitiesPage, UninstallerPage, SettingsPage
│   ├── context/              # LogContext, InstallContext, PrefsContext
│   ├── config/               # constants.ts (URLs/rutas/XML de Office/APP_VERSION) · nav.tsx (menú)
│   ├── data/apps.ts          # Catálogo de apps de winget
│   ├── types/index.ts        # Tipos + interfaz ElectronAPI (sincronizar con preload)
│   ├── utils/                # index.ts (formatos) · folders.ts (resolveDir)
│   └── dev/mockElectron.ts   # Simula window.electronAPI SOLO en navegador (DEV)
├── public/                   # icon.svg (fuente), icon.png (512), icon.ico (16–256), logo.jpg (legacy sin uso)
├── resources/
│   ├── defender-control/     # dControl.exe + .ini de Sordum (versionado con git add -f)
│   └── winrar/               # rarreg.key (NO en Git) + README.txt
├── scripts/                  # build-admin.ps1 · publish-release.ps1 · build-icons.cjs (§10)
├── dist/ · release/ · node_modules/ · graphify-out/   # generados, ignorados por Git
```
> `src/pages/BrowsersPage.tsx` y `DriversPage.tsx` son **código muerto** (no se exportan ni están en el menú; usan clases antiguas). Se pueden borrar.

## 5. Arquitectura Electron ↔ React
- `electron/main.cjs` registra los `ipcMain.handle/on`; `electron/preload.cjs` los expone como `window.electronAPI`; `src/types/index.ts` declara la interfaz `ElectronAPI`. **Al añadir un IPC hay que tocar los TRES archivos** (y `src/dev/mockElectron.ts`, que tipa contra `ElectronAPI` y no compila si falta).
- **Nunca** ejecutar PowerShell inline con `$_` usando `exec()`: usar `ps()` (`execFile`, en `utils/ps.cjs`).
- IPC actuales (47): `append-log, check-admin, check-for-updates, clear-ram, create-restore-point, defender-tool, download-file, download-update, ensure-dir, execute-tool, get-all-apps, get-app-icon, get-arch, get-computer-name, get-cpu-info, get-disk-info, get-drivers, get-gpu-info, get-installed-apps, get-live-stats, get-network-info, get-path, get-platform, get-processes, get-ram-info, get-services, get-uptime, get-username, get-windows-info, install-opencode, mount-iso, open-external, open-path, run-command, run-commands, select-directory, show-item-in-folder, uninstall-apps, unmount-iso, window-close/maximize/minimize, winget-cancel, winget-install, winget-list, winrar-activate, write-file`.
- Eventos hacia la UI: `winget-progress`, `winget-progress-pct`, `command-progress`, `download-progress`.
- **Seguridad:** las rutas/URLs que llegan de la UI pasan por `sanitizePath`/`isValidUrl`/`isValidWingetId`. Los IPC privilegiados (p. ej. `winrar-activate`) fijan ellos mismos origen y destino; la UI no pasa rutas.

## 6. Sistema de diseño (rediseño de noviembre 2026)
- Estilo «pro dark» (tipo Linear/Raycast) + tema claro pulido. Oscuro por defecto. Acento índigo (`#4f46e5`/`#6d6af5`), tipografía Inter.
- **Tokens** en `src/index.css` como canales RGB: `--bg --surface --surface-2 --elevated --line --line-strong --fg --muted --subtle --accent --accent-fg --accent-soft --console`, definidos para `:root` (claro) y `[data-theme='dark']`. `tailwind.config.js` los expone: `bg-surface`, `text-fg`, `text-muted`, `border-line`, `bg-accent/10`…
- **Regla:** usar SIEMPRE estos tokens. No usar `slate-*`, `neutral-*` ni `dark-*` para superficies/texto (ya no hay overrides `!important`; `dark-*`/`primary-*` solo existen como alias de compatibilidad). Para colores de acento sí: `text-emerald-600 dark:text-emerald-300`.
- **Kit base** `src/components/ui.tsx` (reexportado en `components/index.ts`): `Button, IconButton, Badge, IconTile, PageHeader, Section, Grid, Notice, EmptyState, SearchInput, Select, Checkbox, Switch, Tabs, Chip, Modal, KeyValue, Spinner, cx`. Tonos: `indigo emerald amber red violet cyan orange pink teal sky slate` (alias `blue/green/yellow/purple`).
- `ToolCard` solo pinta botones con `onClick`; `accentColor="red"` = botón primario rojo. `ConsoleOutput` siempre oscura, con botón copiar. `ConfirmModal` usa `Modal` (Esc cierra, respeta saltos de línea).
- **Layout:** `Header` = barra de título **arrastrable** (`.drag`/`.no-drag`) con controles estilo Windows 11 y breadcrumb; `Sidebar` plegable (232 px / 68 px) con tarjeta del equipo; `LogPanel` plegable que muestra la última entrada.
- **Navegación centralizada** en `src/config/nav.tsx`. Una página nueva se registra en 3 sitios: unión `Page` en `src/types/index.ts`, `nav.tsx` y el `switch` de `App.tsx` (+ export en `pages/index.ts`).
- **Preferencias** (`PrefsContext`, localStorage): `stt-theme` (light/dark/system), `stt-sidebar-collapsed`, `stt-autodiag`, `stt-log-open`, `stt-ask-location`. Se editan en Ajustes.
- **Preview en navegador sin Electron:** `npx vite --host 127.0.0.1` → `http://127.0.0.1:5173` (usa `mockElectron.ts` con datos falsos; no entra al build). Ojo: Vite se cae si vigila `release/` mientras se compila.

## 7. Logo e iconos
- Logo «ST»: cuadrado redondeado, degradado índigo→violeta, monograma blanco, **fondo 100 % transparente** (el anterior tenía cuadrado blanco y se veía mal en la barra de tareas). Fuente vectorial: `public/icon.svg`.
- `public/icon.png` (512) y `public/icon.ico` (10 tamaños 16–256, PNG con alfa) se generan con `node scripts/build-icons.cjs` (requiere `npm install --no-save sharp`). El ICO **debe** incluir 256 px (electron-builder).
- Uso: `Header`/`SettingsPage` importan `/icon.png`; `BrowserWindow` usa `icon.png` (en el paquete: `resources/icon.png` vía `extraResources`); el `.exe`/instalador usan `icon.ico` (`build.win.icon`, requiere `signAndEditExecutable: true`).
- Windows cachea iconos: tras cambiar el logo puede seguir viéndose el viejo en accesos directos hasta reiniciar el Explorador.

## 8. Funcionalidades

### Diagnóstico (`Dashboard`)
- CPU/RAM/GPU/discos/red/Windows por CIM/WMI + `os.cpus()`/`os.totalmem`. **Estático, sin polling (0 % en segundo plano).** Carga progresiva: tier 1 (CPU/RAM, rápido) y tier 2 (disco/GPU/Windows/red en segundo plano). «Diagnóstico automático» se puede apagar en Ajustes.
- **VRAM:** `AdapterRAM` se capa a 4 GB (uint32), así que se lee del registro (`HKLM\…\0000` → `HardwareInformation.qwMemorySize`, respaldo `qpmemorySize`/`memorySize`).
- **Caché:** módulos RAM 10 min, GPU/Windows 10 min, disco/red 30 s, temperatura CPU 30 s; red en 1 solo PowerShell.
- **Reporte .txt** al Escritorio **real** (IPC `get-path`; puede estar en `D:\…` u OneDrive, no asumir `C:\Users\<u>\Desktop`).

### Instalar apps (`InstallPage`)
- Catálogo `src/data/apps.ts` (≈235 apps de winutil + extras) vía **winget con progreso en vivo** (`spawn` → `winget-progress`).
- IPC `winget-install` resuelve `winget` (fix del exe empaquetado), timeout 15 min, sin `--silent` (para ver la barra), `--source winget` evita `0x8a15005e`; reintento con `--ignore-security-hash` si falla el hash.
- Selección múltiple con cola y confirmación; `InstallContext` persiste estados/salidas al cambiar de menú y expone `cancelApp/cancelBatch` (`winget-cancel`). Iconos por favicon de DuckDuckGo (si no existe, la inicial).

### Otras apps (`ExtraAppsPage`)
- Google Chrome (MSI offline), **OpenCode CLI**, **WinRAR + Activación**, JO-PDF, Obsidian, AB Download Manager, AionUi 2.1.44. Las «Descarga» van a `C:\ExtraApps` y se abren como administrador.
- **OpenCode (CLI)** — IPC `install-opencode`: Node.js LTS por winget (si falta) → `Set-ExecutionPolicy` (RemoteSigned usuario + Bypass proceso) → `npm install -g @opencode/cli`. Es el paquete **oficial v2** según opencode.ai/docs; el antiguo `opencode-ai` (v1) comparte el comando `opencode`, por eso se desinstala antes si existe (si no, npm da EEXIST).
- **WinRAR + Activación** — `winget RARLAB.WinRAR` y luego IPC `winrar-activate`: copia `rarreg.key` a la carpeta de WinRAR (registro `HKLM\SOFTWARE\WinRAR` → `Program Files\WinRAR` → `(x86)`). Primero copia directa; si falla por permisos, copia **con UAC** (`Start-Process -Verb RunAs`). Se intenta activar aunque winget avise (WinRAR ya instalado).

### Office (`OfficePage`)
- **Online:** `setup.exe` de officecdn + `Configuration.xml` embebido en `constants.ts` (365, 2024, 2021, 2019), carpeta `C:\Office`. **Office 2019 directo** (c2rsetup sin XML). **Office 2016 Pro Plus 32-bit**: ZIP (~720 MB, URL en `constants.ts → OFFICE.OFFICE_2016`), se extrae a `Escritorio\Office2016`; **los enlaces de Mediafire/descarga directa pueden expirar**: pedir el nuevo y actualizar `constants.ts`.
- **Offline (ISO):** descarga a `C:\OfficeISO`, `Mount-DiskImage`, instala, desmonta.
- Activar (MAS), reparar rápida/completa, desinstalación total (Office Scrubber).

### Windows (`WindowsPage`)
- SFC, DISM (check/scan/restore), CHKDSK, Windows Update, **MAS** (`irm https://get.activated.win | iex` elevado) y **Defender Control (Sordum)**: `resources/defender-control/dControl.exe` (+ `.ini`) se empaqueta vía `extraResources`; SOLO abre su GUI como admin. **No usar los exe de línea de comandos de pgkt04/defender-control: le dañaron un Defender a un cliente.** Sordum bloquea descargas automatizadas, por eso el binario va en el repo.

### Red, Utilidades, Desinstalador, Ajustes
- **Red:** ping/tracert/nslookup contra un destino, ipconfig, flush DNS, ARP. **Utilidades:** herramientas del sistema/red, limpieza de temporales, SFC, enlace a UUP dump (ISOs de Windows).
- **Desinstalador:** lista apps de los 3 hives del registro (versión, editor, fecha `yyyyMMdd`, tamaño KB, `DisplayIcon`), filtros y orden, **punto de restauración opcional**, desinstalación profunda (MSI/winget/original + limpia carpetas, registro, Run keys, servicios y accesos directos). Iconos por `get-app-icon` (`app.getFileIcon` con caché).
- **Ajustes (funcionales):** tema claro/oscuro/sistema, diagnóstico automático, menú compacto, registro expandido, «Preguntar dónde guardar».

## 9. Archivos y carpetas que usa la app
| Qué | Dónde | Notas |
|---|---|---|
| Registro de actividad | `%APPDATA%\SamirTechTools\logs\activity-AAAA-MM-DD.log` | Lo crea `append-log` |
| Office online | `C:\Office` | Se crea sola |
| Office ISO | `C:\OfficeISO` | Se crea sola |
| Descargas de «Otras apps» | `C:\ExtraApps` | Se crea sola |
| Office 2016 (ZIP extraído) | `<Escritorio>\Office2016` | Escritorio real vía `get-path` |
| Reporte de diagnóstico | `<Escritorio>\Reporte_Diagnostico_AAAA-MM-DD.txt` | |
| Licencia de WinRAR | `resources/winrar/rarreg.key` → (instalado) `<app>/resources/winrar/` | **No está en Git** |

- **Carpetas automáticas:** las opciones que guardan archivos crean su carpeta solas con el IPC `ensure-dir` (`src/utils/folders.ts → resolveDir`). Por defecto **no preguntan** dónde guardar; con Ajustes → «Preguntar dónde guardar» abren el selector (que ya abre en la carpeta sugerida porque se crea antes).
- **`rarreg.key` y Git:** está en `.gitignore` porque el repo es público. Se incluye en el instalador desde `resources/winrar/` (`extraResources`). En una PC nueva hay que copiarla a mano antes de compilar. **Decisión del dueño:** acepta que quede dentro de los instaladores publicados en Releases (cualquiera que los descargue puede extraerla); no se sube al repositorio.

## 10. Build y release (cómo se publica)
**Versionado (semver):** `1.0.1` = solo arreglos · `1.1.0` = funciones nuevas compatibles · `2.0.0` = cambio grande. La versión vive en **tres sitios**: `package.json`, `package-lock.json` (dos líneas al inicio) y `APP_VERSION` en `src/config/constants.ts`.

**Flujo completo (lo que se hizo para v1.1.0):**
```powershell
git add -A ; git commit -m "..." ; git push                 # 1) código a GitHub
.\scripts\build-admin.ps1                                    # 2) compila con UAC → release\*.exe + latest.yml
.\scripts\publish-release.ps1                                # 3) crea la release vX.Y.Z y sube los 3 archivos
.\scripts\publish-release.ps1 -Replace                       #    (misma versión ya publicada: reemplaza archivos y mueve la etiqueta)
```
- **Por qué admin:** `electron-builder` crea symlinks (winCodeSign) y Windows los permite solo elevado; `signAndEditExecutable` está en `true` para incrustar el icono. Sin admin falla con «Cannot create symbolic link».
- `publish-release.ps1` **no necesita `gh`**: usa la credencial que Git ya guarda (`git credential fill`) y la API de GitHub; verifica nombre/tamaño/estado de cada archivo y que la etiqueta apunte al HEAD. La descripción sale de `docs/release-notes/vX.Y.Z.md` (UTF-8; **no** pasar texto con tildes desde un `.ps1` sin BOM: PowerShell 5.1 lo corrompe).
- **`latest.yml` es obligatorio en la release:** el actualizador automático de las apps instaladas lo lee. Si se republica la **misma** versión, las instalaciones que ya tengan esa versión no verán actualización.
- Los `.exe` no van a Git (`*.exe` ignorado): solo a Releases. `get.ps1` toma el asset `*Portable*.exe` de la última release.
- **«Sube todo a GitHub» = que los EXE descargables funcionen como quedó en el chat:** commit + push de lo cambiado y, si cambió `src/`, `electron/`, `resources/` o `public/`, compilar y publicar release. Si solo son `*.md`/`docs`, basta `git push`.
- La app corre como `asInvoker` (**sin admin**, como WinUtil) para que `winget --ignore-security-hash` no falle con «cannot be overridden when running as admin». La elevación se pide solo donde hace falta (`Start-Process -Verb RunAs`: SFC, DISM, desinstalador, clear-ram, Defender, copia de licencia, `winget settings --enable InstallerHashOverride`).

## 11. Encoding (IMPORTANTE)
- Todos los archivos son **UTF-8 sin BOM**. **Excepción:** los `.ps1` de `scripts/` llevan **BOM** (PowerShell 5.1 los lee como ANSI si no).
- La consola de PowerShell corrompe tildes/ñ al editar con comandos inline: para reemplazos con caracteres especiales usar scripts Node o las herramientas de edición, no PowerShell inline.

## 12. Entorno y problemas conocidos
- **Node:** 18+ requerido, **20 LTS recomendado**. Con Node 26 se compiló bien (v26.12.1), pero se ha visto que su `postinstall` bloquea la descarga de Electron («install scripts blocked»). Si `node_modules/electron/dist` solo tiene `locales`:
  ```powershell
  Invoke-WebRequest -Uri "https://github.com/electron/electron/releases/download/v31.7.7/electron-v31.7.7-win32-x64.zip" -OutFile "$env:TEMP\electron.zip"
  Expand-Archive -Path "$env:TEMP\electron.zip" -DestinationPath "node_modules\electron\dist" -Force
  Set-Content -Path "node_modules\electron\path.txt" -Value "electron.exe" -NoNewline
  ```
- `npm run electron:dev` = `concurrently "vite" "wait-on http://localhost:5173 && electron . --dev"`; el flag `--dev` hace que `main.cjs` cargue `http://localhost:5173` en vez de `dist/index.html`.
- **Git «dubious ownership»** si la carpeta viene de otro usuario/PC: `git config --global --add safe.directory <ruta>`.
- Si Git/Node no se reconocen tras instalarlos con winget, reabrir la terminal (PATH).
- Windows Defender/SmartScreen puede marcar falsos positivos (activación, Defender Control); el ejecutable no está firmado (ver pendientes).

## 13. Estado actual (21/11/2026)
- **v1.1.0 publicada.** Instaladores: `Setup-1.1.0.exe` (~66 MB) y `Portable-1.1.0.exe` (~66 MB) + `latest.yml`. Incluye: rediseño completo, logo ST transparente, WinRAR + Activación, OpenCode `@opencode/cli`, carpetas automáticas, Ajustes funcionales y arreglos (reporte al Escritorio real, frecuencia de CPU, unidades del reporte, modal en tema claro).
- Verificado: `tsc` limpio, build de Vite, app empaquetada arranca y diagnostica con datos reales, las 9 páginas renderizan sin errores en el navegador (con mock). **No verificado en profundidad:** el flujo real de instalar WinRAR + copiar la licencia con UAC, y las instalaciones de Office de extremo a extremo.
- Historial: v1.0.0 (02/09/2026) = Minimal Pro + logo circular + dControl + asInvoker + fix hash de winget + InstallContext persistente.

## 14. Pendientes / ideas
1. **Migrar de Electron a Tauri v2** (Rust + WebView2): instalador ~5–10 MB y RAM ~40–90 MB frente a ~66 MB / ~150–300 MB. Esfuerzo estimado 1–2 semanas: la UI React se mantiene; hay que reescribir `main.cjs` (47 IPC; los scripts PowerShell se reutilizan). Lo difícil: progreso en vivo de winget/descargas, iconos del desinstalador (`app.getFileIcon`), actualizador (firma de updates) y la ventana. Requiere Rust + Visual Studio Build Tools (no instalados en la PC del dueño). Hacerlo en una rama aparte.
2. Firmar el código (code signing) para evitar SmartScreen.
3. Exportar el reporte de diagnóstico a PDF.
4. Verificar VRAM en más equipos (AMD/Intel integrada a veces reporta 0 en el registro).
5. Borrar el código muerto (`BrowsersPage.tsx`, `DriversPage.tsx`, `public/logo.jpg`) y terminar la modularización de `main.cjs` (`electron/handlers/README.md`).
6. Los enlaces de descarga de Office 2016 / AionUi pueden expirar: regenerar cuando falle.
