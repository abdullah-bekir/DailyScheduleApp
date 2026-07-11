# Planly - EAS kotasi dolunca yerel APK (C:\dev\Planly, OneDrive kilidi yok)
# Kullanim: .\scripts\build-apk-local.ps1

$ErrorActionPreference = "Stop"
$srcRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$buildRoot = "C:\dev\Planly"

function Invoke-External {
    param(
        [scriptblock]$Command,
        [string]$FailMessage
    )
    $prev = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        & $Command
    } finally {
        $ErrorActionPreference = $prev
    }
    if ($LASTEXITCODE -ne 0) {
        throw $FailMessage
    }
}

function Clear-NativeBuildCaches {
    param([string]$ProjectRoot)
    Write-Host "Native build onbellegi temizleniyor..." -ForegroundColor Yellow
    $paths = @(
        "$ProjectRoot\android\build",
        "$ProjectRoot\android\app\build",
        "$ProjectRoot\android\.gradle"
    )
    foreach ($p in $paths) {
        if (Test-Path $p) {
            Remove-Item $p -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
    $nm = "$ProjectRoot\node_modules"
    if (-not (Test-Path $nm)) { return }
    Get-ChildItem $nm -Recurse -Directory -ErrorAction SilentlyContinue | ForEach-Object {
        if ($_.Name -eq ".cxx" -or ($_.Name -eq "build" -and $_.Parent.Name -eq "android")) {
            Remove-Item $_.FullName -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
}

function Test-AutolinkingUsesOneDrive {
    param([string]$ProjectRoot)
    $auto = "$ProjectRoot\android\build\generated\autolinking\autolinking.json"
    if (-not (Test-Path $auto)) { return $false }
    $raw = Get-Content $auto -Raw -ErrorAction SilentlyContinue
    return $raw -match "OneDrive"
}

Write-Host ""
Write-Host "=== Planly yerel APK ===" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path "C:\dev")) {
    New-Item -ItemType Directory -Path "C:\dev" | Out-Null
}

Write-Host "Proje kopyalaniyor -> $buildRoot ..." -ForegroundColor Yellow
if (Test-Path $buildRoot) {
    Remove-Item $buildRoot -Recurse -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 3
}

$ErrorActionPreference = "Continue"
robocopy $srcRoot $buildRoot /E /XD node_modules "android\app\build" "android\build" "android\.gradle" .expo /NFL /NDL /NJH /NJS | Out-Null
$robocopyExit = $LASTEXITCODE
$ErrorActionPreference = "Stop"
if ($robocopyExit -ge 8) {
    throw "robocopy basarisiz (kod $robocopyExit)"
}

if (Test-Path "$srcRoot\.env") {
    Copy-Item "$srcRoot\.env" "$buildRoot\.env" -Force
}

Set-Location $buildRoot
Write-Host "npm install..." -ForegroundColor Yellow
Invoke-External -FailMessage "npm install basarisiz" -Command {
    npm install --no-audit --no-fund --loglevel=error
}

Clear-NativeBuildCaches -ProjectRoot $buildRoot

$env:NODE_ENV = "production"
Set-Location "$buildRoot\android"

Write-Host "Gradle release (15-30 dk)..." -ForegroundColor Yellow
$ErrorActionPreference = "Continue"
.\gradlew.bat --stop 2>$null | Out-Null
Start-Sleep -Seconds 3
$ErrorActionPreference = "Stop"

$gradleOk = $false
$prevEap = $ErrorActionPreference
$ErrorActionPreference = "Continue"
Set-Location "$buildRoot\android"
.\gradlew.bat clean assembleRelease --no-daemon 2>&1 | Tee-Object -Variable gradleLog | Out-Host
$gradleOk = ($LASTEXITCODE -eq 0)
$ErrorActionPreference = $prevEap

if (-not $gradleOk) {
    if (Test-AutolinkingUsesOneDrive -ProjectRoot $buildRoot) {
        Write-Host "UYARI: autolinking hala OneDrive yolunu gosteriyor." -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "DERLEME BASARISIZ. Son satirlar:" -ForegroundColor Red
    $gradleLog | Select-Object -Last 25 | ForEach-Object { Write-Host $_ }
    Write-Host ""
    Write-Host "Cozum:" -ForegroundColor Yellow
    Write-Host "  1) OneDrive: Bu cihazda duraklat"
    Write-Host "  2) Cursor / expo start kapali olsun"
    Write-Host "  3) Tekrar: .\scripts\build-apk-local.ps1"
    exit 1
}

$apk = Join-Path $buildRoot "android\app\build\outputs\apk\release\app-release.apk"
$dest = Join-Path $env:USERPROFILE "Desktop\Planly-yeni-logo.apk"

if (-not (Test-Path $apk)) {
    Write-Host "APK bulunamadi: $apk" -ForegroundColor Red
    exit 1
}

Copy-Item -Path $apk -Destination $dest -Force

Write-Host ""
Write-Host "TAMAM - APK masaustunde:" -ForegroundColor Green
Write-Host $dest
Start-Process -FilePath "explorer.exe" -ArgumentList @("/select,", $dest)
