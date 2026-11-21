# Prompt para IA - SamirTechTools

Copia y pega esto al iniciar un chat nuevo con cualquier IA (en cualquier PC) para que entienda el proyecto de inmediato:

---

**PROMPT:**

Hola, quiero continuar el proyecto **SamirTechTools** (app de escritorio Windows: Electron + React + TypeScript + Vite + Tailwind).

- **Repo:** https://github.com/SamirPxrreo/SamirTechTools (rama `main`). Si aún no está en esta PC, clónalo; si ya está, haz `git pull`.
- **Ubicación local:** PREGÚNTAME dónde alojarlo y usa exactamente esa ruta (no asumas `Desktop` ni `C:\`). Verifica con `Get-Location`.
- **Primero lee:** `AGENTS.md` (reglas cortas) y `docs/CONTEXTO.md` (arquitectura, funciones, build/release, problemas conocidos). Para Git entre PCs: `GUIA_SINCRONIZACION.md`.
- **Falta a propósito** `resources/winrar/rarreg.key` (licencia de WinRAR, no está en Git porque el repo es público). Pídemela si necesitas compilar.
- **Qué quiero hacer ahora:** [DESCRIBE AQUÍ TU CAMBIO, ej: "añadir una opción de limpieza de DNS", "cambiar los colores del tema claro"]

Por favor:
1. Lee `AGENTS.md` y `docs/CONTEXTO.md` antes de tocar código.
2. Mantén sincronizados `electron/main.cjs`, `electron/preload.cjs`, `src/types/index.ts` y `src/dev/mockElectron.ts` cuando añadas un IPC.
3. Usa los tokens de diseño (`bg-surface`, `text-fg`…) y `src/components/ui.tsx`; no mezcles paletas `slate/dark`.
4. Al terminar, actualiza `docs/CONTEXTO.md` y dime cómo probar (`npm run electron:dev`) y cómo subirlo (`git add -A; git commit; git push`; si cambió `src/`, `electron/`, `resources/` o `public/` también `.\scripts\build-admin.ps1` + `.\scripts\publish-release.ps1`).

---

### Prompt corto (si la IA ya conoce el proyecto)

> Continuemos SamirTechTools (`SamirPxrreo/SamirTechTools`). Pregúntame dónde alojarlo, lee `AGENTS.md` y `docs/CONTEXTO.md`, y haz: [TU TAREA].

### Qué debe hacer la IA al recibir el prompt
1. Preguntar la ruta local y clonar o `git pull`.
2. Leer `AGENTS.md` y `docs/CONTEXTO.md`.
3. `npm install` si hace falta y trabajar; al final, actualizar la documentación.
