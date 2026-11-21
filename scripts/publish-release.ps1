<#
  Publica (o actualiza) la Release de GitHub de la version actual de package.json con los archivos de release\.
  No necesita gh: usa la credencial de GitHub que Git ya tiene guardada (nunca se imprime).

  Antes: 1) git commit + git push   2) .\scripts\build-admin.ps1
  Uso:
    .\scripts\publish-release.ps1             # crea la release vX.Y.Z (falla si ya existe)
    .\scripts\publish-release.ps1 -Replace    # la release ya existe: reemplaza sus archivos, mueve la etiqueta
                                              # al commit actual y actualiza la descripcion (misma version)

  Descripcion de la release: docs\release-notes\vX.Y.Z.md (UTF-8). Sube: Setup, Portable y latest.yml
  (latest.yml lo necesita el actualizador automatico de la app).
#>
param([switch]$Replace, [string]$Repo = 'SamirPxrreo/SamirTechTools')
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $root
$env:Path = [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [Environment]::GetEnvironmentVariable('Path', 'User')
$env:GIT_TERMINAL_PROMPT = '0'

$ver = (Get-Content package.json -Raw | ConvertFrom-Json).version
$tag = "v$ver"
$rel = Join-Path $root 'release'
$assets = @("SamirTechTools-Setup-$ver.exe", "SamirTechTools-Portable-$ver.exe", 'latest.yml')
foreach ($a in $assets) { if (-not (Test-Path (Join-Path $rel $a))) { throw "Falta release\$a. Compila primero con scripts\build-admin.ps1" } }
if ((Get-Content (Join-Path $rel 'latest.yml') -Raw) -notmatch "version:\s*$([regex]::Escape($ver))") { throw "release\latest.yml no es de la version $ver" }

# El codigo debe estar ya en GitHub para que la etiqueta apunte a algo real
$head = (git rev-parse HEAD).Trim()
$remote = ((git ls-remote origin refs/heads/main) -split '\s+')[0]
if ($head -ne $remote) { throw "HEAD ($head) no esta en origin/main ($remote). Haz git push primero." }
if (git status --porcelain) { Write-Warning 'Hay cambios sin commit: la release apunta al ultimo commit subido.' }

# Credencial que Git ya tiene guardada (no se imprime)
$cred = "protocol=https`nhost=github.com`n`n" | git credential fill
$token = (($cred | Where-Object { $_ -like 'password=*' } | Select-Object -First 1) -replace '^password=', '')
if (-not $token) { throw 'No hay credencial de GitHub guardada en Git (haz un git push manual para iniciar sesion).' }
$h = @{ Authorization = "Bearer $token"; Accept = 'application/vnd.github+json'; 'X-GitHub-Api-Version' = '2022-11-28'; 'User-Agent' = 'samirtechtools-release' }
$api = "https://api.github.com/repos/$Repo"
"Autenticado como: $((Invoke-RestMethod 'https://api.github.com/user' -Headers $h).login)   release: $tag   commit: $($head.Substring(0,7))"

$notesFile = Join-Path $root "docs\release-notes\$tag.md"
$notes = if (Test-Path $notesFile) { [IO.File]::ReadAllText($notesFile, [Text.Encoding]::UTF8) } else { "SamirTechTools $tag" }

function Send-Json($method, $url, $obj) {
  $json = $obj | ConvertTo-Json -Depth 5
  Invoke-RestMethod -Method $method $url -Headers $h -ContentType 'application/json; charset=utf-8' -Body ([Text.Encoding]::UTF8.GetBytes($json))
}

$existing = $null
try { $existing = Invoke-RestMethod "$api/releases/tags/$tag" -Headers $h } catch { $existing = $null }
if ($existing -and -not $Replace) { throw "La release $tag ya existe. Usa -Replace para reemplazar sus archivos." }

if ($existing) {
  foreach ($x in $existing.assets) { Invoke-RestMethod -Method Delete "$api/releases/assets/$($x.id)" -Headers $h | Out-Null; "borrado: $($x.name)" }
  Send-Json 'Patch' "$api/git/refs/tags/$tag" @{ sha = $head; force = $true } | Out-Null
  "etiqueta $tag movida a $($head.Substring(0,7))"
  $r = Send-Json 'Patch' "$api/releases/$($existing.id)" @{ name = "SamirTechTools $tag"; body = $notes; make_latest = 'true' }
} else {
  $r = Send-Json 'Post' "$api/releases" @{ tag_name = $tag; target_commitish = $head; name = "SamirTechTools $tag"; body = $notes; draft = $false; prerelease = $false; make_latest = 'true' }
  "release creada: $($r.html_url)"
}

# Subida con curl (archivos grandes); la cabecera con el token va en un archivo temporal que se borra
$hdr = Join-Path $env:TEMP 'stt-gh-hdr.tmp'
"Authorization: Bearer $token" | Set-Content -Encoding ascii $hdr
try {
  foreach ($a in $assets) {
    $path = Join-Path $rel $a
    "subiendo $a ($([math]::Round((Get-Item $path).Length / 1MB, 1)) MB)..."
    $ct = if ($a -like '*.yml') { 'text/yaml' } else { 'application/octet-stream' }
    $out = curl.exe -sS --fail-with-body -X POST -H "@$hdr" -H 'Accept: application/vnd.github+json' -H "Content-Type: $ct" --data-binary "@$path" "https://uploads.github.com/repos/$Repo/releases/$($r.id)/assets?name=$a" 2>&1
    if ($LASTEXITCODE -ne 0) { throw "Fallo al subir ${a}: $out" }
  }
} finally { Remove-Item $hdr -Force -ErrorAction SilentlyContinue }

# Verificacion final
$check = Invoke-RestMethod "$api/releases/$($r.id)" -Headers $h
$ok = $true
foreach ($x in $check.assets) {
  $match = ($x.size -eq (Get-Item (Join-Path $rel $x.name)).Length) -and ($x.state -eq 'uploaded')
  if (-not $match) { $ok = $false }
  '{0,-38} {1,12:N0} bytes  estado={2}  coincide={3}' -f $x.name, $x.size, $x.state, $match
}
$tagSha = (Invoke-RestMethod "$api/git/ref/tags/$tag" -Headers $h).object.sha
"etiqueta apunta a: $($tagSha.Substring(0,7))  (HEAD: $($head.Substring(0,7)))"
"URL: $($check.html_url)   draft=$($check.draft) prerelease=$($check.prerelease)"
if (-not $ok -or $check.assets.Count -ne $assets.Count) { throw 'La verificacion de archivos fallo.' }
Write-Host 'Publicado y verificado.' -ForegroundColor Green
