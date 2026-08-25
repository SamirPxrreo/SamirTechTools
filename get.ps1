# ============================================
#  SamirTechTools - Lanzador web
#  Uso:  irm https://raw.githubusercontent.com/SamirPxrreo/SamirTechTools/main/get.ps1 | iex
# ============================================

$ErrorActionPreference = 'Stop'
$repo = 'SamirPxrreo/SamirTechTools'
$cacheDir = Join-Path $env:TEMP 'SamirTechTools'

Write-Host ''
Write-Host '  ========================================' -ForegroundColor Cyan
Write-Host '   SamirTechTools - Lanzador' -ForegroundColor Cyan
Write-Host '  ========================================' -ForegroundColor Cyan
Write-Host ''

try {
    # Obtener el release más reciente
    Write-Host '  [*] Buscando la ultima version...' -ForegroundColor Yellow
    $rel = Invoke-RestMethod "https://api.github.com/repos/$repo/releases/latest"
    $tag = $rel.tag_name
    Write-Host "  [+] Version encontrada: $tag" -ForegroundColor Green

    # Buscar el asset portable (zip o exe)
    $asset = $rel.assets | Where-Object { $_.name -like '*Portable*.zip' } | Select-Object -First 1
    if (-not $asset) { $asset = $rel.assets | Where-Object { $_.name -like '*Portable*.exe' } | Select-Object -First 1 }
    if (-not $asset) { throw 'No se encontro el portable en el release' }

    $dest = Join-Path $cacheDir $asset.name

    # Usar cache si es la misma version ya descargada
    if (Test-Path $dest) {
        Write-Host '  [+] Ya descargado (cache). Omitiendo descarga.' -ForegroundColor Green
    } else {
        Write-Host "  [*] Descargando $($asset.name) ($([math]::Round($asset.size/1MB,1)) MB)..." -ForegroundColor Yellow
        New-Item -ItemType Directory -Path $cacheDir -Force | Out-Null
        Invoke-WebRequest $asset.browser_download_url -OutFile $dest -UseBasicParsing
        Write-Host '  [+] Descarga completada' -ForegroundColor Green
    }

    # Si es zip, extraer
    $exePath = $dest
    if ($dest.EndsWith('.zip')) {
        $extractDir = Join-Path $cacheDir "v$tag"
        if (-not (Test-Path $extractDir)) {
            Write-Host '  [*] Extrayendo...' -ForegroundColor Yellow
            Expand-Archive $dest -DestinationPath $extractDir -Force
        }
        $exePath = (Get-ChildItem $extractDir -Filter '*.exe' | Select-Object -First 1).FullName
    }

    # Ejecutar
    Write-Host '  [*] Iniciando SamirTechTools...' -ForegroundColor Yellow
    Start-Process $exePath
    Write-Host '  [+] Listo!' -ForegroundColor Green
    Write-Host ''
}
catch {
    Write-Host "  [X] Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ''
}
