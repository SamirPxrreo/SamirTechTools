# Guía de Sincronización - SamirTechTools

Cómo trabajar en tu proyecto desde varias PCs (Casa / Trabajo) usando Git y GitHub.

Repositorio: **https://github.com/SamirPxrreo/SamirTechTools**

---

## 1. Primera vez: descargar el proyecto en una PC nueva

Solo se hace **una vez por PC**.

### Requisitos
- Git: https://git-scm.com/downloads
- Node.js 20 LTS: https://nodejs.org (NO uses Node 26, da error con Electron)

### Pasos
```powershell
# 1. Decide dónde alojarlo — PREGUNTA AL USUARIO, no asumas ruta
# Ej: C:\SamirTechTools, D:\Proyectos\SamirTechTools, %USERPROFILE%\Desktop\SamirTechTools, etc.
cd "C:\ruta\que\elija\el\usuario"  # <-- usar exactamente lo que indique el usuario

# 2. Clona el repositorio (descarga todo)
git clone https://github.com/SamirPxrreo/SamirTechTools.git

# 3. Entra a la carpeta
cd SamirTechTools

# 4. Instala dependencias
npm install

# 5. (Solo si vas a COMPILAR) copia la licencia de WinRAR a resources\winrar\rarreg.key
#    No está en Git a propósito (el repo es público). Sin ella el instalador sale sin licencia.

# 6. Ejecuta la app
npm run electron:dev
```

> **Atajo con una IA:** abre un chat nuevo, pega el contenido de `PROMPT_IA.md` (o escribe «clona `SamirPxrreo/SamirTechTools`, pregúntame dónde y lee `AGENTS.md` y `docs/CONTEXTO.md`») y la IA tendrá todo el contexto del proyecto.

> Si te sale `Electron failed to install correctly`, es porque el proxy/antivirus bloqueó la descarga. Ejecuta:
> ```powershell
> Invoke-WebRequest -Uri "https://github.com/electron/electron/releases/download/v31.7.7/electron-v31.7.7-win32-x64.zip" -OutFile "$env:TEMP\electron.zip"
> Expand-Archive -Path "$env:TEMP\electron.zip" -DestinationPath "node_modules\electron\dist" -Force
> Set-Content -Path "node_modules\electron\path.txt" -Value "electron.exe" -NoNewline
> npm run electron:dev
> ```

---

## 2. Flujo de trabajo diario (2 PCs)

Regla de oro: **Al terminar -> PUSH, al empezar -> PULL**

### Escenario real: Trabajaste en el PC del Trabajo y quieres continuar en el PC Personal

**En el PC del Trabajo (al terminar de trabajar):**
```powershell
# 1. Ver qué cambiaste
git status

# 2. Guardar todo
git add .

# 3. Crear commit con mensaje descriptivo
git commit -m "ej: arreglado modulo de drivers y actualizada UI"

# 4. Subirlo a GitHub
git push
```

**En el PC Personal (al llegar a casa y querer continuar):**
```powershell
# 1. Entra a la carpeta del proyecto (usa la ruta que elegiste en esa PC)
cd "C:\ruta\que\elegiste"  # <-- la que indicaste al clonar

# 2. Bajar lo nuevo del trabajo
git pull

# 3. Si se agregaron nuevas librerías, reinstalar
npm install

# 4. Seguir trabajando
npm run electron:dev
```

Y viceversa: cuando termines en casa haces `add + commit + push`, y al llegar al trabajo haces `pull`.

### Resumen de comandos

| Situación | Comando |
|---|---|
| Descargar por primera vez | `git clone https://github.com/SamirPxrreo/SamirTechTools.git` |
| Ver qué archivos cambiaste | `git status` |
| Guardar cambios localmente | `git add .` + `git commit -m "mensaje"` |
| Subir cambios a GitHub | `git push` |
| Bajar cambios de la otra PC | `git pull` |
| Ver historial | `git log --oneline` |
| **"Sube todo a github" = SUBIR LO NECESARIO PARA QUE LOS EXES TENGAN LO ÚLTIMO DEL CHAT** | `git add -A` + `commit` + `push`; si cambió `src/`/`electron/`/`resources/`/`public/` → `.\scripts\build-admin.ps1` (pide aviso de administrador) + `.\scripts\publish-release.ps1` (`-Replace` si esa versión ya existe) |

> **⚠️ "Sube todo a github" = que los EXEs descargables funcionen tal cual se dejó en el chat.** Si solo son `*.md`/`docs`, basta con `git push`. Ver `docs/CONTEXTO.md` > Build y release.
>
> **Versión:** `1.0.1` = arreglos pequeños · `1.1.0` = funciones nuevas · `2.0.0` = cambio grande. Se cambia en `package.json`, `package-lock.json` y `src/config/constants.ts`.

---

## 3. Errores comunes

**`concurrently no se reconoce como comando`:** No hiciste `npm install` después de clonar. Solución: `cd SamirTechTools` y luego `npm install`, espera a que termine y vuelve a intentar `npm run electron:dev`.

**`git pull` da conflicto:** Significa que editaste el mismo archivo en ambas PCs sin hacer pull/push. Solución: haz `git pull` siempre antes de empezar a editar.

**`npm run electron:dev` muestra `ERR_FILE_NOT_FOUND dist/index.html`:** Te falta el flag `--dev`. Verifica en `package.json` que el script sea: `electron . --dev`

**Olvidé hacer `git pull` y ya edité:** Haz `git stash`, luego `git pull`, luego `git stash pop`.

---

## 4. Alternativa visual (sin comandos)

Si no quieres usar terminal, instala **GitHub Desktop**: https://desktop.github.com

- `Clone repository` = `git clone`
- `Commit` = `git add + commit`
- `Push` / `Fetch` = `git push` / `git pull`

Es lo mismo pero con botones.
