# Contexto del Proyecto SamirTechTools (para cualquier IA que continúe)

## Nombre de la app
**SamirTechTools** (antes "M&M Informática" / "SamirTechFix")

## Descripción
Aplicación de escritorio para técnicos de soporte informático. Centro de diagnóstico, mantenimiento e instalación de programas para Windows. Inspirada en [ChrisTitus Tech's winutil](https://github.com/christitustech/winutil).

## Dónde está el proyecto
- **Repositorio local:** `C:\SamirTechTools`
- **GitHub:** https://github.com/SamirPxrreo/SamirTechTools (rama `main`)
- **Git ya configurado:** el token de GitHub está guardado en `%USERPROFILE%\.git-credentials` (credential.helper store). Usuario: `SamirPxrreo`. Solo hacer `git push origin main`.
- **Release v1.0.0:** los instaladores (`SamirTechTools-Setup-1.0.0.exe` y `SamirTechTools-Portable-1.0.0.exe`) se suben como assets de la release existente (id 376600075) vía API de GitHub con el token. Proceso: borrar assets viejos con DELETE y subir nuevos con POST a `https://uploads.github.com/repos/.../releases/376600075/assets?name=...`

## Stack tecnológico
- **Electron** (ventana frameless, `contextIsolation`, sin nodeIntegration)
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** con tema claro/oscuro conmutable
- **PowerShell** para comandos del sistema

## Arquitectura

### Comunicación Electron ↔ React
- `electron/main.cjs` → proceso principal (CJS). Todos los IPC handlers aquí.
- `electron/preload.cjs` → contextBridge expone `window.electronAPI`
- `src/types/index.ts` → interfaz `ElectronAPI` que debe mantenerse sincronizada con preload
- **NUNCA** usar `exec()` con scripts de PowerShell inline que contengan `$_` — usar la función `ps()` que usa `execFile`

### Tema claro/oscuro
- Botón luna/sol en `Header.tsx`. Guarda en `localStorage('stt-theme')` y pone `data-theme` en `<html>`
- `src/index.css` define variables CSS `--dk-*` para `:root` (claro) y `[data-theme='dark']`
- La paleta `dark` de `tailwind.config.js` apunta a esas variables
- Hay overrides CSS explícitos para clases usadas (`text-dark-*`, `bg-dark-*`, `border-dark-*`, neutrales) en ambos temas. **Al agregar clases nuevas de color, agregar overrides en index.css para el modo oscuro.**

### Navegación
- Sidebar izquierdo (`src/components/Sidebar.tsx`) con las secciones; Header arriba solo con logo/estado/tema/controles de ventana
- Las páginas se registran en 3 lugares: `src/types/index.ts` (unión `Page`), `src/components/Sidebar.tsx` (menú), `src/App.tsx` (switch de render)

### Encoding — IMPORTANTE
- Todos los archivos son **UTF-8 sin BOM**. Hubo un problema histórico de doble codificación (mojibake "Ã³"), ya corregido
- Al editar desde PowerShell, cuidado: la consola corrompe tildes/ñ. Para reemplazos con caracteres especiales usar scripts Node, no PowerShell inline

## Funcionalidades implementadas

### Diagnóstico (Dashboard)
- CPU/RAM/GPU/discos/red/Windows vía CIM/WMI
- **VRAM**: `Win32_VideoController.AdapterRAM` se limita a 4GB (uint32), así que la VRAM real se lee del registro `HKLM\SYSTEM\CurrentControlSet\Control\Class\{4d36e968-e325-11ce-bfc1-08002be10318}\00XX` → `HardwareInformation.qpmemorySize` (match por DriverDesc)
- **Liberar RAM**: IPC `clear-ram` que purga la standby list vía `NtSetSystemInformation` (C# embebido con Add-Type, ejecutado elevado desde temp). El método viejo (SetProcessWorkingSetSize) NO funcionaba
- Generador de reporte .txt al Escritorio

### Instalar Apps (página nueva, la estrella)
- **235 apps** catálogo en `src/data/apps.ts`, generado desde el `applications.json` de winutil + extras
- Instala vía **WinGet** (`winget install --id X -e --silent`), IPC `winget-install` con timeout de 15 min
- Iconos: favicons de `https://icons.duckduckgo.com/ip3/<dominio>.ico` (Google s2 no cargaba en Electron)
- Selección múltiple con instalación en cola + modal de confirmación antes de instalar
- Para agregar apps: editar `src/data/apps.ts`

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
- Lista todas las apps del registro (3 hive paths) con versión, editor, fecha de instalación (`InstallDate` formato `yyyyMMdd`), tamaño (`EstimatedSize` en KB)
- Filtros: búsqueda nombre/editor, rango de fecha (semana/mes/3 meses/año/más de un año), orden por nombre/fecha/tamaño
- Desinstalación profunda: script PS elevado que hace MSI/winget/desinstalador original + limpia carpetas, registro, Run keys, servicios y accesos directos

### Utilidades
- Herramientas de sistema y red, **Descargas ISO** con link a UUP dump (`https://uupdump.net/known.php`)

## Permisos de administrador
- El ejecutable lleva manifest `requestedExecutionLevel: 'highestAvailable'` (package.json → `build.win`). Requiere `"signAndEditExecutable": true`
- En dev (`npm run electron:dev`) NO pide admin; solo los builds

## Build y release
```powershell
npm run build            # solo compila frontend (tsc + vite)
npm run electron:build   # instalador NSIS + portable en release/
```
- **El build de electron-builder falla sin admin** (winCodeSign usa symlinks). Ejecutarlo desde una PowerShell elevada:
```powershell
Start-Process powershell -Verb RunAs -Wait -ArgumentList '-Command','Set-Location C:\SamirTechTools; npm run electron:build'
```
- Versión actual: **1.0.0** (el dueño quiere mantenerla en v1)

## Estado (agosto 2026)
- App funcional, probada en Windows 10/11 x64
- Instaladores publicados en la release v1.0.0 de GitHub
- dControl de Sordum incluido en `resources/defender-control/`

## Pendientes / ideas futuras
1. Firmar el código (code signing) para evitar SmartScreen
2. Actualizador automático (electron-updater)
3. Exportar reporte de diagnóstico a PDF
4. Verificar VRAM en más equipos (AMD/Intel integrada a veces reporta 0 en el registro)
5. El enlace de Mediafire de Office 2016 puede expirar — regenerarlo cuando el usuario lo pida
