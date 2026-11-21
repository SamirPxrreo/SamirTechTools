# SamirTechTools

Aplicación de escritorio para técnicos de soporte informático. Centro de diagnóstico, mantenimiento e instalación de programas para Windows 10/11.

![Stack](https://img.shields.io/badge/Electron-React-TypeScript-blue)
![Release](https://img.shields.io/github/v/release/SamirPxrreo/SamirTechTools)

---

## 🚀 Instalación rápida (un solo comando)

Abre PowerShell y pega esto — descarga la última versión y ejecuta la app automáticamente:

```powershell
irm https://raw.githubusercontent.com/SamirPxrreo/SamirTechTools/main/get.ps1 | iex
```

1. Consulta la última versión publicada en [Releases](https://github.com/SamirPxrreo/SamirTechTools/releases)
2. Descarga el portable (si ya lo tenía, usa la caché)
3. Lo ejecuta

> Requiere internet solo la primera vez. La app en sí funciona offline (salvo las descargas).

## 📦 Descargas manuales

En [Releases](https://github.com/SamirPxrreo/SamirTechTools/releases):

| Archivo | Qué es | Cuándo usarlo |
|---|---|---|
| `SamirTechTools-Setup-x.x.x.exe` | **Instalador**: accesos directos, aparece en «Agregar o quitar programas» y **se actualiza solo** | Tu PC o PCs de clientes que la usarán seguido |
| `SamirTechTools-Portable-x.x.x.exe` | **Portable**: ejecuta sin instalar | USB / cualquier PC sin dejar rastro |

---

## 🛠️ Funciones

| Módulo | Descripción |
|---|---|
| **Diagnóstico** | CPU, RAM, GPU, discos, red y Windows (info estática, 0 % en segundo plano) + reporte .txt al Escritorio |
| **Instalar apps** | Catálogo de ~235 apps vía WinGet con progreso en vivo, selección múltiple y cola |
| **Otras apps** | Chrome (MSI), **OpenCode CLI**, **WinRAR + Activación**, JO-PDF, Obsidian, AB Download Manager, AionUi |
| **Office** | Instalación online (365/2024/2021/2019/2016) y offline (ISO automática), activación y reparación |
| **Windows** | SFC, DISM, CHKDSK, Windows Update, Defender (panel integrado), activación con MAS |
| **Red** | Ping, tracert, nslookup, ipconfig, DNS, ARP |
| **Utilidades** | Limpieza de temporales, herramientas del sistema, enlaces de ISOs |
| **Desinstalador** | Multi-selección, iconos reales, punto de restauración y eliminación de rastros |
| **Ajustes** | Tema claro/oscuro/sistema, diagnóstico automático, menú compacto, «Preguntar dónde guardar» |

Las opciones que guardan archivos crean sus carpetas solas (`C:\Office`, `C:\OfficeISO`, `C:\ExtraApps`). El registro de actividad se guarda en `%APPDATA%\SamirTechTools\logs`.

---

## 💻 Desarrollo

### Requisitos
- Git y Node.js 20 LTS ([nodejs.org](https://nodejs.org)); con Node 26 puede fallar el `postinstall` de Electron.

### Primera vez en una PC nueva
```powershell
git clone https://github.com/SamirPxrreo/SamirTechTools.git
cd SamirTechTools
npm install
npm run electron:dev
```
> No clonar en la raíz de `C:\`. Falta a propósito `resources\winrar\rarreg.key` (licencia, no está en Git): cópiala ahí para compilar con «WinRAR + Activación». Guía completa de sincronización en [`GUIA_SINCRONIZACION.md`](../GUIA_SINCRONIZACION.md).

### Comandos
| Comando | Qué hace |
|---|---|
| `npm run electron:dev` | App en modo desarrollo (hot reload) |
| `npx vite --host 127.0.0.1` | Solo la interfaz en el navegador, con datos simulados |
| `npm run typecheck` | Revisa tipos |
| `.\scripts\build-admin.ps1` | Compila instalador + portable (pide aviso de administrador) → `release\` |
| `.\scripts\publish-release.ps1` | Publica la release de la versión de `package.json` en GitHub |

### Publicar una versión
1. Subir versión en `package.json`, `package-lock.json` y `src/config/constants.ts`; escribir `docs/release-notes/vX.Y.Z.md`
2. `git add -A; git commit; git push`
3. `.\scripts\build-admin.ps1` y después `.\scripts\publish-release.ps1`

---

## 📁 Estructura
```
SamirTechTools/
├── electron/      # main.cjs (IPC, PowerShell, descargas), preload.cjs
├── src/           # Interfaz React + TypeScript (pages, components, context, config, utils)
├── public/        # Logo (icon.svg → icon.png / icon.ico, fondo transparente)
├── resources/     # defender-control/ (Sordum) · winrar/ (licencia local, no en Git)
├── scripts/       # build-admin.ps1 · publish-release.ps1 · build-icons.cjs
├── docs/          # CONTEXTO.md (★ leer antes de modificar) · README.md · release-notes/
├── AGENTS.md      # Reglas para IAs
└── get.ps1        # Lanzador web de una línea
```

> **★ Para IAs / nuevos desarrolladores:** leer [`docs/CONTEXTO.md`](CONTEXTO.md) y [`AGENTS.md`](../AGENTS.md) antes de modificar el código.

---

## ⚠️ Notas
- Algunas funciones piden **permisos de administrador** (SFC, DISM, Defender, activación): la app abre sin admin y solo eleva donde hace falta.
- La activación usa herramientas de terceros ([Massgrave](https://massgrave.dev)) que se descargan al vuelo.
- Windows Defender/SmartScreen puede dar falsos positivos con las herramientas de activación y Defender Control; el ejecutable no está firmado.

## 📄 Licencia
Uso personal del autor.
