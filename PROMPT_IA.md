# Prompt para IA - SamirTechTools

Copia y pega esto al iniciar un nuevo chat con cualquier IA para que entienda el proyecto inmediatamente:

---

**PROMPT:**

Hola, quiero continuar desarrollando mi proyecto **SamirTechTools**.

- **Repo:** https://github.com/SamirPxrreo/SamirTechTools (rama `main`)
- **Ubicación local en esta PC:** PREGUNTAR al usuario dónde quiere alojarlo — no asumir `Desktop` ni ninguna ruta por defecto. Verificar con `pwd`.
- **Stack:** Electron 31 + React 18 + TypeScript + Vite + Tailwind CSS. PowerShell para comandos del sistema.
- **Contexto completo:** Lee primero `docs/CONTEXTO.md` y `GUIA_SINCRONIZACION.md` — ahí está toda la arquitectura, decisiones técnicas y cómo sincronizar entre PCs.
- **Sincronización:** Este proyecto lo muevo entre PC del trabajo y PC personal con Git. Si es la primera vez en esta PC hice `git clone`, si no, antes de editar haz `git pull` y al terminar haré `git push`.
- **Qué quiero hacer ahora:** [DESCRIBE AQUÍ TU CAMBIO, ej: "agregar un módulo de limpieza de DNS", "arreglar el desinstalador", "cambiar colores del tema claro"]

Por favor:
1. Lee `docs/CONTEXTO.md` y `package.json` antes de tocar código
2. Mantén `electron/main.cjs` (IPC con `ps()`/execFile), `electron/preload.cjs` y `src/types/index.ts` sincronizados
3. Verifica `src/index.css` si tocas colores del tema claro/oscuro
4. Después de editar, dime cómo probar con `npm run electron:dev` y cómo subir con `git add . && git commit -m "..." && git push`

---

### Prompt corto (si la IA ya conoce el proyecto):

> Continuemos SamirTechTools. Repo `SamirPxrreo/SamirTechTools`. Pregúntame dónde alojarlo y lee `docs/CONTEXTO.md` para [TU TAREA].

### Qué debe hacer la IA al recibir el prompt:
1. `read docs/CONTEXTO.md` y `read GUIA_SINCRONIZACION.md`
2. `git pull` si detecta que la rama local está atrasada
3. Luego editar lo que pidas
