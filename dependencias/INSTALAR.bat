@echo off
chcp 65001 >nul
title SamirTechTools - Instalador
color 0A

echo ============================================
echo    SamirTechTools - Instalador
echo ============================================
echo.

:: Verificar Node.js
echo [1/4] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [!] Node.js NO esta instalado.
    echo     Descargalo desde: https://nodejs.org/
    echo     Selecciona la version LTS (recomendada).
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
echo     Node.js encontrado: %NODE_VER%

:: Verificar npm
echo.
echo [2/4] Verificando npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [!] npm NO esta disponible.
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm --version') do set NPM_VER=%%i
echo     npm encontrado: v%NPM_VER%

:: Instalar dependencias
echo.
echo [3/4] Instalando dependencias (esto puede tardar)...
echo.
call npm install
if %errorlevel% neq 0 (
    echo.
    echo [!] Error al instalar dependencias.
    echo.
    pause
    exit /b 1
)

:: Instalar scripts de Electron
echo.
echo [4/4] Configurando Electron...
call npm install-scripts approve electron esbuild

echo.
echo ============================================
echo    ¡Instalacion completada!
echo ============================================
echo.
echo Para ejecutar la app, ejecuta:
echo   npm run electron:dev
echo.
pause
