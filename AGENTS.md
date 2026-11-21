# AGENTS.md — SamirTechTools

App de escritorio Windows (Electron 31 + React 18 + TypeScript + Vite + Tailwind) para técnicos de soporte. **Lee `docs/CONTEXTO.md` antes de tocar código**: tiene arquitectura, funciones, decisiones y cómo se compila y publica. Este archivo solo resume las reglas que no se deben romper.

## Primero
- Pregunta al usuario **dónde alojar el proyecto** en esta PC; no asumas ninguna ruta. Verifica con `Get-Location`.
- `git pull` antes de editar; `npm install` si cambió `package.json`; `npm run electron:dev` para probar.
- **`resources/winrar/rarreg.key` no está en Git** (repo público). Si falta, pídeselo al usuario; sin él «WinRAR + Activación» falla.
- Habla con el usuario en **español**.

## Reglas del código
1. **IPC:** al añadir uno, tocar los tres: `electron/main.cjs`, `electron/preload.cjs`, `src/types/index.ts` (+ `src/dev/mockElectron.ts`, que tipa contra `ElectronAPI`).
2. PowerShell: usar `ps()` (`execFile`), nunca `exec()` con scripts inline que lleven `$_`.
3. **Diseño:** usar los tokens (`bg-surface`, `text-fg`, `text-muted`, `border-line`, `bg-accent`…) y el kit de `src/components/ui.tsx`. No usar `slate-*`/`neutral-*`/`dark-*` para superficies o texto.
4. Páginas nuevas: unión `Page` (`src/types/index.ts`), `src/config/nav.tsx` y `switch` de `src/App.tsx`.
5. Las rutas/URLs de la UI pasan por `sanitizePath`/`isValidUrl`/`isValidWingetId`; los IPC privilegiados fijan sus propias rutas.
6. Archivos **UTF-8 sin BOM** (los `.ps1` de `scripts/` llevan BOM). No editar tildes con PowerShell inline.
7. Opciones que guardan archivos: crear su carpeta con `resolveDir` / `ensure-dir`, no pedir al usuario que la cree.

## Publicar («sube todo a GitHub»)
```powershell
git add -A ; git commit -m "..." ; git push
.\scripts\build-admin.ps1          # compila con UAC (el usuario debe aceptar el aviso)
.\scripts\publish-release.ps1      # crea vX.Y.Z   (-Replace si esa versión ya existe)
```
- Versión en 3 sitios: `package.json`, `package-lock.json`, `APP_VERSION` en `src/config/constants.ts`. Descripción de la release en `docs/release-notes/vX.Y.Z.md`.
- Si solo cambian `*.md`/`docs`, basta `git push`.
- **Nunca** subir `rarreg.key` a Git ni imprimir tokens de GitHub.

## Al terminar un cambio
Actualiza `docs/CONTEXTO.md` (y el resto de `.md` si aplica) en el mismo commit, para que la siguiente IA sepa cómo quedó todo.
