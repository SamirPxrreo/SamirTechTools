# SamirTechTools - Instalación Rápida

## Requisitos
- **Node.js** v18+ (descargar desde https://nodejs.org/)
- **Windows 10/11**

## Pasos

### 1. Instalar Node.js
Si no tienes Node.js, descárgalo e instálalo desde:
https://nodejs.org/ (versión LTS recomendada)

### 2. Ejecutar instalador
Abre la carpeta `dependencias` y ejecuta `INSTALAR.bat` como administrador.

### 3. Ejecutar la app
Una vez instaladas las dependencias:
```powershell
cd D:\SamirTechFix
npm run electron:dev
```

## Estructura
```
SamirTechFix/
├── electron/          # Proceso principal de Electron
├── src/               # Código fuente React/TypeScript
├── dist/              # Build compilado (listo para usar)
├── dependencias/      # Scripts de instalación
│   ├── INSTALAR.bat   # Instalador automático
│   └── CONTEXTO.md    # Contexto del proyecto
├── package.json
└── README.md          # Este archivo
```

## Solución de problemas

### "Electron failed to install"
Ejecuta manualmente:
```powershell
npm install-scripts approve electron esbuild
node node_modules/electron/install.js
```

### "Command not found"
Asegúrate de que Node.js está en el PATH del sistema.

### Permisos de administrador
Algunas funciones (SFC, DISM, activación) requieren ejecutar como administrador.
Haz clic derecho en PowerShell → "Ejecutar como administrador".
