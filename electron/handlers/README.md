// Handlers modulares - extraídos de main.cjs para facilitar mantenimiento
// Cada archivo registra sus ipcMain.handle y exporta una función register(win)
//
// Estructura propuesta (ya preparada):
//   utils/ps.cjs         -> runCommand, ps
//   utils/validation.cjs -> sanitizePath, isValidWingetId, isValidUrl
//   handlers/system.cjs  -> get-cpu-info, get-ram-info, get-disk-info, get-gpu-info, get-windows-info, get-network-info
//   handlers/apps.cjs    -> get-all-apps, get-app-icon, uninstall-apps, winget-*, get-drivers
//   handlers/tools.cjs   -> execute-tool, run-command, defender-tool, clear-ram
//   handlers/io.cjs      -> download-file, write-file, append-log, mount-iso
//
// Para activar la modularización completa, en main.cjs reemplazar las definiciones inline por:
//   const { ps, runCommand } = require('./utils/ps.cjs');
//   const { sanitizePath, isValidWingetId, isValidUrl } = require('./utils/validation.cjs');
//   require('./handlers/system.cjs').register(mainWindow, ps);
// etc.
//
// Por ahora main.cjs sigue funcionando standalone para no romper compatibilidad.
// Este archivo es documentación del plan de refactor.

module.exports = {};
