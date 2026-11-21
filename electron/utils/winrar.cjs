// WinRAR: localizar la carpeta de instalación y copiar la licencia (rarreg.key).
// Módulo independiente de Electron para poder probarlo con `node` directamente.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFile } = require('child_process');
const { ps } = require('./ps.cjs');

const sha256 = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');

/** Carpeta donde está WinRAR.exe: registro (exe64/exe32) → Program Files → Program Files (x86). null si no está instalado. */
async function findWinrarDir() {
  const dirs = [];
  try {
    const r = await ps("$k = Get-ItemProperty 'HKLM:\\SOFTWARE\\WinRAR' -ErrorAction SilentlyContinue; if ($k) { $k.exe64; $k.exe32 }");
    for (const line of (r.output || '').split(/\r?\n/)) { const l = line.trim(); if (l) dirs.push(path.dirname(l)); }
  } catch {}
  dirs.push(path.join(process.env.ProgramFiles || 'C:\\Program Files', 'WinRAR'));
  dirs.push(path.join(process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)', 'WinRAR'));
  return dirs.find(d => fs.existsSync(path.join(d, 'WinRAR.exe'))) || null;
}

/**
 * Copia `src` (rarreg.key) a la carpeta de WinRAR. Origen y destino los decide quien llama (nunca la UI).
 * Primero copia directa; si Program Files exige permisos, copia con elevación (UAC).
 * Devuelve { success, output, dest? }.
 */
async function activateWinrar(src) {
  if (!fs.existsSync(src)) {
    return { success: false, output: 'La licencia rarreg.key no está incluida en esta copia de la herramienta.\nColócala en: ' + src };
  }
  const installDir = await findWinrarDir();
  if (!installDir) {
    return { success: false, output: 'WinRAR no está instalado en este equipo (no se encontró WinRAR.exe).\nSi la instalación con winget falló (mensaje de arriba), instálalo primero y vuelve a intentarlo.' };
  }

  const dest = path.join(installDir, 'rarreg.key');
  const srcHash = sha256(src);
  const done = () => { try { return fs.existsSync(dest) && sha256(dest) === srcHash; } catch { return false; } };

  // 1) Intento directo (funciona si la app ya corre como administrador)
  try { fs.copyFileSync(src, dest); } catch {}

  // 2) Si no se pudo (Program Files exige permisos): copiar con elevación (UAC)
  if (!done()) {
    const q = (s) => s.replace(/'/g, "''");
    const enc = Buffer.from(`Copy-Item -LiteralPath '${q(src)}' -Destination '${q(dest)}' -Force`, 'utf16le').toString('base64');
    await new Promise((resolve) => {
      execFile('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command',
        `Start-Process powershell -Verb RunAs -Wait -WindowStyle Hidden -ArgumentList '-NoProfile','-ExecutionPolicy','Bypass','-EncodedCommand','${enc}'`],
        { timeout: 180000, windowsHide: true }, () => resolve());
    });
  }

  if (done()) return { success: true, output: `Licencia copiada: ${src}\n→ ${dest}`, dest };
  return { success: false, output: `No se pudo copiar la licencia a ${installDir}.\nSi cancelaste el aviso de administrador (UAC), vuelve a intentarlo y acepta.` };
}

module.exports = { findWinrarDir, activateWinrar };
