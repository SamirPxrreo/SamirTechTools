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
# 1. Elige dónde guardarlo (ej: Escritorio, Documentos, D:\Proyectos, etc.)
# IMPORTANTE: No lo clones directo en C:\, usa tu carpeta de usuario
cd "D:\User\Desktop"  # <-- cambia por la ruta que prefieras

# 2. Clona el repositorio (descarga todo)
git clone https://github.com/SamirPxrreo/SamirTechTools.git

# 3. Entra a la carpeta
cd SamirTechTools

# 4. Instala dependencias
npm install

# 5. Ejecuta la app
npm run electron:dev
```

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
# 1. Entra a la carpeta del proyecto (usa tu ruta real)
cd "D:\User\Desktop\SamirTechTools"  # <-- ajusta a donde lo tengas

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
| **Subir TODO (cuando digas "sube a github")** | `git push` + `npm run electron:build` (admin) + `gh release upload v1.0.1 release\*.exe --clobber` |

> **Nota "sube a github":** acordado con el agente: no es solo `git push`, es publicar release completa (instalador + portable + código + MDs). Ver `docs/CONTEXTO.md` > Build y release.

---

## 3. Errores comunes

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
