# SamirTechTools

Aplicación de escritorio para técnicos de soporte informático. Centro de diagnóstico, mantenimiento y herramientas para Windows.

![Stack](https://img.shields.io/badge/Electron-React-TypeScript-blue)

## Estructura del proyecto

```
SamirTechTools/
├── electron/               # Proceso principal de Electron
│   ├── main.cjs            #   IPC, PowerShell, descargas, ISOs
│   └── preload.cjs         #   Context bridge (seguridad)
├── src/                    # Interfaz (React + TypeScript)
│   ├── config/
│   │   └── constants.ts    # ★ URLs, rutas y XML de Office centralizados
│   ├── components/         # Componentes reutilizables
│   │   ├── ToolCard.tsx        # Tarjeta de herramienta
│   │   ├── Sidebar.tsx         # Navegación lateral
│   │   ├── Header.tsx          # Barra superior
│   │   └── ...
│   ├── pages/              # Una página por sección
│   │   ├── Dashboard.tsx       # Diagnóstico del equipo
│   │   ├── WindowsPage.tsx     # SFC/DISM/Defender/Activación
│   │   ├── OfficePage.tsx      # Instalar/activar/reparar Office
│   │   ├── BrowsersPage.tsx    # Navegadores
│   │   ├── AdobePage.tsx       # Adobe
│   │   ├── DriversPage.tsx     # Drivers
│   │   ├── UtilitiesPage.tsx   # Utilidades
│   │   ├── NetworkPage.tsx     # Red
│   │   ├── ChrisTitusPage.tsx  # Winutil de ChrisTitusTech
│   │   ├── UninstallerPage.tsx # Desinstalador con limpieza profunda
│   │   └── SettingsPage.tsx    # Configuración
│   ├── context/            # Estado global (logs)
│   ├── types/              # Interfaces TypeScript
│   └── utils/              # Helpers de formato
├── resources/              # Binarios externos incluidos en el instalador
│   └── defender-control/   #   dControl.exe (Sordum v2.1)
├── docs/                   # Documentación
│   ├── CONTEXTO.md         # ★ Contexto completo para IA (leer primero)
│   └── README.md           # Este archivo
├── dist/                   # Build compilado (generado)
└── release/                # Ejecutables finales (generado)
```

> **★ Para IAs:** leer `docs/CONTEXTO.md` antes de modificar el código — contiene arquitectura,
> decisiones técnicas importantes y solución de problemas conocidos.

## Desarrollo

```powershell
npm install          # una sola vez
npm run electron:dev # desarrollo con hot-reload
```

## Compilación

```powershell
npm run electron:installer  # Instalador NSIS (release\SamirTechTools-Setup-x.x.x.exe)
npm run electron:portable   # Portable (release\SamirTechTools-Portable-x.x.x.exe)
npm run electron:build      # Ambos
```

## Funciones

| Módulo | Descripción |
|---|---|
| Diagnóstico | CPU, RAM, GPU, discos, red y Windows en tiempo real |
| Windows | SFC, DISM, CHKDSK, Defender Control, activación MAS |
| Office | Instalación Online (4 versiones) / Offline ISO / activación / reparación |
| Navegadores | Chrome, Edge, Firefox, Opera, Brave |
| Drivers | Detección por categoría |
| Utilidades | Limpieza, sistema, red |
| ChrisTitusTech | Winutil integrado |
| Desinstalador | Multi-selección + eliminación de rastros (registro, carpetas, servicios) |

## Licencia

Uso personal del autor.
