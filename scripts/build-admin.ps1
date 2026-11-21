<#
  Compila los instaladores (NSIS + portable) con permisos de administrador.

  Por que: electron-builder necesita crear symlinks (winCodeSign) y Windows solo lo permite elevado.
  Uso (PowerShell normal, desde cualquier carpeta):   .\scripts\build-admin.ps1
  Windows mostrara un aviso UAC: hay que aceptarlo.
  Salida: release\SamirTechTools-Setup-X.Y.Z.exe, release\SamirTechTools-Portable-X.Y.Z.exe, release\latest.yml
  Log:    release\build.log   (release\ esta en .gitignore)
#>
param([string]$Project = (Split-Path -Parent $PSScriptRoot))
$ErrorActionPreference = 'Stop'

$key = Join-Path $Project 'resources\winrar\rarreg.key'
if (-not (Test-Path $key)) {
  Write-Warning 'Falta resources\winrar\rarreg.key (no esta en git). El instalador saldra SIN licencia y "WinRAR + Activacion" fallara.'
}

$log  = Join-Path $Project 'release\build.log'
$exit = Join-Path $Project 'release\build.exit'
New-Item -ItemType Directory -Force (Split-Path $log) | Out-Null
Remove-Item $log, $exit -ErrorAction SilentlyContinue

$inner = @"
`$env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')
Set-Location -LiteralPath '$Project'
npm run electron:build *> '$log'
Set-Content -Path '$exit' -Value `$LASTEXITCODE
"@
$tmp = Join-Path $env:TEMP 'stt-build-admin.ps1'
Set-Content -Path $tmp -Value $inner -Encoding UTF8

Write-Host 'Compilando (acepta el aviso de administrador)...'
Start-Process powershell -Verb RunAs -Wait -ArgumentList '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', $tmp
Remove-Item $tmp -Force -ErrorAction SilentlyContinue

$code = if (Test-Path $exit) { (Get-Content $exit -Raw).Trim() } else { 'sin-resultado' }
if ($code -ne '0') { throw "La compilacion fallo (codigo $code). Revisa release\build.log" }
Write-Host 'OK. Instaladores en release\' -ForegroundColor Green
Get-ChildItem (Join-Path $Project 'release') -File | Where-Object { $_.Extension -in '.exe', '.yml' } | Sort-Object LastWriteTime -Descending | Select-Object -First 3 Name, @{ n = 'MB'; e = { [math]::Round($_.Length / 1MB, 1) } }, LastWriteTime
