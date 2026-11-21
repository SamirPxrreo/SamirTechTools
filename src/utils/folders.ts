/**
 * Resuelve y CREA la carpeta donde una opción guardará archivos.
 *  - ask = false (por defecto): usa `defaultDir` y la crea si no existe. Sin diálogos.
 *  - ask = true: abre el selector (ya abre en `defaultDir`, que se crea antes) y crea la carpeta elegida.
 * Devuelve la ruta lista para usar, o null si el usuario canceló. Lanza Error si no se pudo crear.
 */
export async function resolveDir(opts: { title: string; defaultDir: string; ask: boolean }): Promise<string | null> {
  let dir = opts.defaultDir;
  if (opts.ask) {
    const res = await window.electronAPI.selectDirectory({ title: opts.title, defaultPath: opts.defaultDir });
    if (res.canceled || !res.path) return null;
    dir = res.path;
  }
  const made = await window.electronAPI.ensureDir(dir);
  if (!made.success) throw new Error(made.output || `No se pudo crear la carpeta ${dir}`);
  return made.path || dir;
}
