# SamirTechTools

Aplicación de escritorio para técnicos de soporte informático. Centro de diagnóstico, mantenimiento y herramientas para Windows.

![Stack](https://img.shields.io/badge/Electron-React-TypeScript-blue)
![Release](https://img.shields.io/github/v/release/SamirPxrreo/SamirTechTools)

---

## 🚀 Instalación rápida (un solo comando)

Abre PowerShell y pega esto — descarga la última versión y ejecuta la app automáticamente:

```powershell
irm https://raw.githubusercontent.com/SamirPxrreo/SamirTechTools/main/get.ps1 | iex
```

**¿Qué hace exactamente?**
1. Consulta la última versión publicada en [Releases](https://github.com/SamirPxrreo/SamirTechTools/releases)
2. Descarga el portable (si ya lo descargó antes, usa el cache y no re-descarga)
3. Lo extrae y ejecuta SamirTechTools

> Requiere internet solo la primera vez. La app en sí funciona offline.

---

## 📦 Descargas manuales

Ve a la sección [Releases](https://github.com/SamirPxrreo/SamirTechTools/releases) y elige:

| Archivo | Qué es | Cuándo usarlo |
|---|---|---|
| `SamirTechTools-Setup-x.x.x.exe` | **Instalador** — se instala en el equipo con accesos directos (Escritorio + Menú Inicio) y aparece en "Agregar o quitar programas" | Para tu PC o PCs de clientes que usarán la app seguido |
| `SamirTechTools-x.x.x-Portable.zip` | **Portable** — solo descomprime y ejecuta, no instala nada | Para llevar en USB y usar en cualquier PC sin dejar rastro |

---

## 🛠️ Funciones

| Módulo | Descripción |
|---|---|
| **Diagnóstico** | CPU, RAM, GPU, discos, red y Windows (info estática, 0% en segundo plano, sin polling) + reporte en TXT |
| **Windows** | SFC, DISM, CHKDSK, Windows Defender (panel integrado), reparación de Defender |
| **Activación** | Abre Massgrave (MAS) — Windows y Office, eliges el método en su menú |
| **Office** | Instalación **Online** (365/2024/2021/2019 con XML generado automáticamente) y **Offline** (ISO descargada y montada automáticamente), activación y reparación |
| **Navegadores** | Chrome, Edge, Firefox, Opera, Brave — descarga e instalación |
| **Drivers** | Detección por categoría (GPU, audio, red, chipset...) |
| **Utilidades** | Limpieza de temporales, info del sistema, servicios, red |
| **ChrisTitusTech** | Ejecuta Winutil al vuelo o descarga `winutil.ps1` para usarlo offline |
| **Desinstalador** | Multi-selección + iconos reales (DisplayIcon/app.getFileIcon), eliminación total de rastros |
| **Logs** | Registro de actividad en pantalla + guardado en `%APPDATA%\SamirTechTools\logs` |

---

## 💻 Desarrollo

### Requisitos
- Node.js 20 LTS recomendado ([nodejs.org](https://nodejs.org)) — Node 18+ mínimo, evitar Node 26
- Git: https://git-scm.com/downloads

### Primera vez en una PC nueva
```powershell
git clone https://github.com/SamirPxrreo/SamirTechTools.git
cd SamirTechTools
npm install
npm run electron:dev
```
> No clonar en `C:\` directo (da problemas de permisos con Electron). Usar `Desktop` o `Documents`. Guía completa en `GUIA_SINCRONIZACION.md`.

### Trabajo diario entre 2 PCs
```powershell
# Al empezar en la PC: bajar lo nuevo
git pull

# Al terminar: subir lo que hiciste
git add .
git commit -m "describe tu cambio"
git push
```

### Ejecutar en modo desarrollo
```powershell
npm install           # una sola vez por PC
npm run electron:dev  # abre la app con hot-reload (requiere --dev flag en package.json)
```

### Compilar
```powershell
npm run electron:installer  # Instalador NSIS
npm run electron:portable   # Portable
npm run electron:build      # Ambos
```

Los ejecutables quedan en `release/`.

---

## 📁 Estructura del proyecto

```
SamirTechTools/
├── electron/               # Proceso principal de Electron
│   ├── main.cjs            #   IPC, PowerShell, descargas con progreso, ISOs
│   └── preload.cjs         #   Context bridge (seguridad)
├── src/                    # Interfaz (React + TypeScript)
│   ├── config/
│   │   └── constants.ts    # ★ URLs, rutas y XML de Office centralizados
│   ├── components/         # Componentes reutilizables (ToolCard, Sidebar...)
│   ├── pages/              # Una página por sección (11 páginas)
│   ├── context/            # Estado global (logs)
│   ├── types/              # Interfaces TypeScript
│   └── utils/              # Helpers de formato
├── resources/              # Binarios externos incluidos en el instalador
│   └── defender-control/   #   dControl.exe (Sordum v2.1)
├── docs/                   # Documentación
│   ├── CONTEXTO.md         # ★ Contexto técnico completo (leer antes de modificar)
│   └── README.md           # Este archivo
├── get.ps1                 # Lanzador web (instalación con un comando)
├── dist/                   # Build compilado (generado, no editar)
└── release/                # Ejecutables finales (generado)
```

> **★ Para IAs / nuevos desarrolladores:** leer `docs/CONTEXTO.md` antes de modificar el código —
> contiene la arquitectura, decisiones técnicas importantes y solución de problemas conocidos.

---

## 📝 Publicar una nueva versión

1. Compilar: `npm run electron:build`
2. Subir código: `git add -A && git commit -m "..." && git push`
3. Crear release en GitHub con los nuevos `.exe` adjuntos

---

## ⚠️ Notas

- Algunas funciones requieren **ejecutar como administrador** (SFC, DISM, Defender, activación)
- La activación usa herramientas de terceros ([Massgrave](https://massgrave.dev), [ChrisTitus Tech](https://christitus.com)) que se descargan al vuelo — siempre la última versión
- Windows Defender puede marcar falsos positivos con las herramientas de activación/Defender Control; son herramientas conocidas de código abierto

## 📄 Licencia

Uso personal del autor.
