// Descarga de archivos con curl, pensada para instaladores grandes e ISOs de ~5 GB.
// - Sin tope fijo de 10 minutos: tolera descargas lentas mientras haya avance.
// - Reanuda las descargas cortadas (curl -C -) con reintentos.
// - Emite progreso real leyendo el tamaño del archivo mientras crece.
// - Rechaza páginas HTML (links expirados) y archivos vacíos.
const fs = require('fs');
const path = require('path');
const { spawn, execFile } = require('child_process');

const STALL_MS = 5 * 60 * 1000;   // sin bytes nuevos en 5 min => abortar
const RETRIES = 3;

function sizeOf(url, redirects = 0) {
  return new Promise((resolve) => {
    let done = false;
    const finish = (n) => { if (!done) { done = true; resolve(n); } };
    let mod;
    try { mod = url.startsWith('https') ? require('https') : require('http'); } catch { return finish(0); }
    const req = mod.get(url, { headers: { 'User-Agent': 'Mozilla/5.0', Range: 'bytes=0-0' }, timeout: 15000 }, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location && redirects < 8) {
        res.resume();
        return finish(sizeOf(new URL(res.headers.location, url).toString(), redirects + 1));
      }
      const cr = res.headers['content-range'] || '';
      const total = Number(cr.includes('/') ? cr.split('/')[1] : res.headers['content-length']);
      res.resume();
      finish(Number.isFinite(total) && total > 0 ? total : 0);
    });
    req.on('error', () => finish(0));
    req.on('timeout', () => { req.destroy(); finish(0); });
  });
}

function curlOnce(url, dest, resume, total) {
  return new Promise((resolve) => {
    const args = ['-L', '-o', dest, '--create-dirs', '-A', 'Mozilla/5.0', '--connect-timeout', '30', '--speed-time', '300', '--speed-limit', '100'];
    if (resume) args.push('-C', '-');
    args.push(url);
    const child = spawn('curl.exe', args, { windowsHide: true });
    let stderr = '';
    child.stderr.on('data', (d) => { stderr += d.toString(); });
    let lastSize = -1, lastChange = Date.now();
    const timer = setInterval(() => {
      try {
        const sz = fs.statSync(dest).size;
        if (sz !== lastSize) { lastSize = sz; lastChange = Date.now(); }
        if (typeof total === 'number' && total > 0 && onProgressRef) onProgressRef(Math.min(100, Math.round((sz / total) * 100)), sz, total);
        if (Date.now() - lastChange > STALL_MS) { try { child.kill(); } catch {} }
      } catch {}
    }, 2000);
    child.on('close', (code) => {
      clearInterval(timer);
      const exists = fs.existsSync(dest);
      const size = exists ? fs.statSync(dest).size : 0;
      const complete = !total || size >= total;
      if (code === 0 && size > 0 && complete) return resolve({ ok: true, size, stderr });
      // 33 = curl "range error": el servidor no aceptó reanudar
      resolve({ ok: false, size, stderr: stderr.slice(-800) || `curl exit ${code}`, rangeError: code === 33 });
    });
    child.on('error', (e) => { clearInterval(timer); resolve({ ok: false, size: 0, stderr: String(e) }); });
  });
}

let onProgressRef = null;

async function downloadFile(url, destPath, onProgress) {
  onProgressRef = onProgress || null;
  try { fs.mkdirSync(path.dirname(destPath), { recursive: true }); } catch {}

  const total = await sizeOf(url);
  // Comprobar espacio libre antes de lanzar una descarga de varios GB
  if (total > 0 && fs.statfsSync) {
    try {
      const st = fs.statfsSync(path.dirname(destPath));
      const free = st.bavail * st.bsize;
      if (free < total * 1.05) throw new Error(`No hay espacio suficiente: se necesitan ~${(total / 1073741824).toFixed(1)} GB, libres ${(free / 1073741824).toFixed(1)} GB`);
    } catch (e) { if (/espacio suficiente/i.test(e.message)) throw e; }
  }

  let lastErr = '';
  for (let attempt = 0; attempt < RETRIES; attempt++) {
    const partial = fs.existsSync(destPath) ? fs.statSync(destPath).size : 0;
    const resume = partial > 0 && !!total && partial < total;
    const r = await curlOnce(url, destPath, resume, total);
    if (r.ok) {
      // HTML con página de error / link expirado
      if (r.size < 300000) {
        try {
          const head = fs.readFileSync(destPath, 'utf8').slice(0, 2000).toLowerCase();
          if (/<!doctype|<html|mediafire|<title>file sharing/.test(head)) {
            try { fs.unlinkSync(destPath); } catch {}
            throw new Error('El link expiró o devolvió una página HTML. Abre el enlace en el navegador manualmente.');
          }
        } catch (e) { if (/expiró/i.test(e.message)) throw e; }
      }
      if (r.size === 0) throw new Error('Archivo vacío (0 bytes). ' + r.stderr);
      try { if (onProgressRef) onProgressRef(100, r.size, r.size); } catch {}
      return { success: true, size: r.size };
    }
    lastErr = r.stderr;
    if (r.rangeError) { try { fs.unlinkSync(destPath); } catch {} }
  }

  // Último recurso: Node https (por si no hay curl.exe)
  try {
    const protocol = url.startsWith('https') ? require('https') : require('http');
    const file = fs.createWriteStream(destPath);
    const response = await new Promise((resolve, reject) => {
      let n = 0;
      const go = (u) => {
        const req = protocol.get(u, { headers: { 'User-Agent': 'Mozilla/5.0', Accept: '*/*' }, timeout: 30000 }, (res) => {
          if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location && n++ < 8) { res.resume(); return go(new URL(res.headers.location, u).toString()); }
          resolve(res);
        });
        req.on('error', reject);
        req.on('timeout', () => req.destroy());
      };
      go(url);
    });
    if (response.statusCode !== 200) throw new Error('HTTP ' + response.statusCode + ' (fallback)');
    const bytes = await new Promise((resolve, reject) => {
      let downloaded = 0;
      response.on('data', (c) => { downloaded += c.length; if (onProgressRef && total) onProgressRef(Math.min(100, Math.round(downloaded / total * 100)), downloaded, total); });
      response.pipe(file);
      file.on('finish', () => { file.close(); resolve(downloaded); });
      file.on('error', reject);
      response.on('error', reject);
    });
    return { success: true, size: bytes };
  } catch (e) {
    throw new Error(String(e.message || e) + ' | curl: ' + lastErr);
  }
}

module.exports = { downloadFile };
