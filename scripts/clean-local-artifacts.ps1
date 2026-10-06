# Planly — .gitignore / EAS ignore ile uyumlu yerel önbellek ve build artıklarını siler.
# Güvenli: .env, secrets/, node_modules (varsayılan) dokunulmaz.
#
#   cd DailyscheduleApp
#   .\scripts\clean-local-artifacts.ps1
#   .\scripts\clean-local-artifacts.ps1 -WhatIf
#   .\scripts\clean-local-artifacts.ps1 -IncludeNodeModules

[CmdletBinding(SupportsShouldProcess = $true)]
param(
  [switch] $IncludeNodeModules
)

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

if (-not (Test-Path (Join-Path $Root 'package.json'))) {
  Write-Error "package.json bulunamadi: $Root"
  exit 1
}

$relativeDirs = @(
  '.expo',
  'dist',
  'web-build',
  'exp-test-export',
  'exp-verify-export',
  'store-assets',
  '.expo-export-test',
  '.expo-export-test-eas',
  '.expo-export-verify',
  '.expo-healthcheck-export',
  '.expo-verify-export',
  '.expo-export-healthcheck',
  '.expo-export-quick',
  '.expo-export-verify2',
  '.expo-export-check',
  '.expo-export-temp',
  '.expo-smoke-export',
  '.expo-smoke-export-ios',
  '.expo-export-healthcheck-temp',
  '.expo-export-lint-temp',
  'android\.gradle',
  'android\build',
  'android\app\build',
  '.idea',
  '.vscode',
  '.kotlin'
)

$relativeFiles = @(
  'eas-build-log.txt',
  'eas-build-log-decoded.txt',
  'eas-build-log-url.txt',
  'eas-build-view.json',
  'expo-env.d.ts'
)

if ($IncludeNodeModules) {
  $relativeDirs = @('node_modules') + $relativeDirs
}

$removedDirs = 0
$removedFiles = 0
$skipped = 0

function Remove-IfExists {
  param([string] $Path, [string] $Kind)
  if (-not (Test-Path -LiteralPath $Path)) {
    $script:skipped++
    return
  }
  if ($PSCmdlet.ShouldProcess($Path, "Remove $Kind")) {
    Remove-Item -LiteralPath $Path -Recurse -Force -ErrorAction Stop
    if ($Kind -eq 'directory') { $script:removedDirs++ } else { $script:removedFiles++ }
    Write-Host "Silindi: $Path" -ForegroundColor Green
  }
}

Write-Host "Kök: $Root" -ForegroundColor Cyan

foreach ($rel in $relativeDirs) {
  Remove-IfExists -Path (Join-Path $Root $rel) -Kind 'directory'
}

foreach ($rel in $relativeFiles) {
  $full = Join-Path $Root $rel
  if (Test-Path -LiteralPath $full) {
    if ($PSCmdlet.ShouldProcess($full, 'Remove file')) {
      Remove-Item -LiteralPath $full -Force -ErrorAction Stop
      $removedFiles++
      Write-Host "Silindi: $full" -ForegroundColor Green
    }
  } else {
    $skipped++
  }
}

Get-ChildItem -Path $Root -Recurse -Force -File -ErrorAction SilentlyContinue |
  Where-Object {
    $_.FullName -notmatch '\\node_modules\\' -and
    (
      $_.Name -eq 'Thumbs.db' -or
      $_.Name -like '*Zone.Identifier' -or
      $_.Name -like '.metro-health-check*' -or
      $_.Name -eq '.DS_Store' -or
      $_.Extension -eq '.tsbuildinfo'
    )
  } |
  ForEach-Object {
    if ($PSCmdlet.ShouldProcess($_.FullName, 'Remove file')) {
      Remove-Item -LiteralPath $_.FullName -Force -ErrorAction Stop
      $removedFiles++
      Write-Host "Silindi: $($_.FullName)" -ForegroundColor Green
    }
  }

Get-ChildItem -Path (Join-Path $Root 'scripts') -Recurse -Force -Directory -Filter '__pycache__' -ErrorAction SilentlyContinue |
  ForEach-Object {
    Remove-IfExists -Path $_.FullName -Kind 'directory'
  }

Write-Host ""
Write-Host "Özet: $removedDirs klasör, $removedFiles dosya silindi ($skipped hedef zaten yoktu)." -ForegroundColor Cyan
if (-not $IncludeNodeModules) {
  Write-Host "Not: node_modules silinmedi. Gerekirse -IncludeNodeModules kullanın, ardından npm install." -ForegroundColor DarkGray
}
