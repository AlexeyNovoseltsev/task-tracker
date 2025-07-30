# TaskFlow Pro - Desktop Environment Check Script
# Checks system readiness for Tauri compilation

Write-Host "TaskFlow Pro - Desktop Environment Check" -ForegroundColor Cyan
Write-Host "=================================================="

# Check Rust installation
Write-Host "`nChecking Rust installation..." -ForegroundColor Yellow
try {
    $rustVersion = rustc --version 2>$null
    if ($rustVersion) {
        Write-Host "OK Rust: $rustVersion" -ForegroundColor Green
    } else {
        Write-Host "ERROR Rust not found" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "ERROR Rust not found" -ForegroundColor Red
    exit 1
}

# Check Cargo
Write-Host "`nChecking Cargo..." -ForegroundColor Yellow
try {
    $cargoVersion = cargo --version 2>$null
    if ($cargoVersion) {
        Write-Host "OK Cargo: $cargoVersion" -ForegroundColor Green
    } else {
        Write-Host "ERROR Cargo not found" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "ERROR Cargo not found" -ForegroundColor Red
    exit 1
}

# Check Node.js
Write-Host "`nChecking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "OK Node.js: $nodeVersion" -ForegroundColor Green
    } else {
        Write-Host "ERROR Node.js not found" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "ERROR Node.js not found" -ForegroundColor Red
    exit 1
}

# Check for Visual Studio Build Tools
Write-Host "`nChecking Visual Studio Build Tools..." -ForegroundColor Yellow

# Try to find link.exe in common locations
$linkPaths = @(
    "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Tools\MSVC\*\bin\Hostx64\x64\link.exe",
    "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Tools\MSVC\*\bin\Hostx64\x64\link.exe",
    "C:\Program Files\Microsoft Visual Studio\2022\Professional\VC\Tools\MSVC\*\bin\Hostx64\x64\link.exe",
    "C:\Program Files\Microsoft Visual Studio\2022\Enterprise\VC\Tools\MSVC\*\bin\Hostx64\x64\link.exe"
)

$linkFound = $false
foreach ($path in $linkPaths) {
    $resolvedPath = Get-ChildItem $path -ErrorAction SilentlyContinue
    if ($resolvedPath) {
        Write-Host "OK Found link.exe at: $($resolvedPath.FullName)" -ForegroundColor Green
        $linkFound = $true
        break
    }
}

if (-not $linkFound) {
    Write-Host "ERROR link.exe not found" -ForegroundColor Red
    Write-Host "`nTo fix this issue:" -ForegroundColor Yellow
    Write-Host "1. Open Visual Studio Installer" -ForegroundColor White
    Write-Host "2. Click Modify on your VS installation" -ForegroundColor White
    Write-Host "3. Select Desktop development with C++ workload" -ForegroundColor White
    Write-Host "4. Ensure MSVC v143 - VS 2022 C++ build tools is checked" -ForegroundColor White
    Write-Host "5. Install and restart your computer" -ForegroundColor White
    Write-Host "`nAlternative: Use Developer Command Prompt for VS 2022" -ForegroundColor Cyan
}

# Check project structure
Write-Host "`nChecking project structure..." -ForegroundColor Yellow
if (Test-Path "src-tauri/Cargo.toml") {
    Write-Host "OK Tauri project structure found" -ForegroundColor Green
} else {
    Write-Host "ERROR Tauri project structure not found" -ForegroundColor Red
    exit 1
}

if (Test-Path "package.json") {
    Write-Host "OK Frontend project structure found" -ForegroundColor Green
} else {
    Write-Host "ERROR Frontend project structure not found" -ForegroundColor Red
    exit 1
}

# Final status
Write-Host "`nEnvironment Check Complete!" -ForegroundColor Green
Write-Host "=================================================="

if ($linkFound) {
    Write-Host "`nREADY to build desktop app!" -ForegroundColor Green
    Write-Host "Run the following commands:" -ForegroundColor Cyan
    Write-Host "  npm run tauri:dev    # Development mode" -ForegroundColor White
    Write-Host "  npm run tauri:build  # Production build" -ForegroundColor White
} else {
    Write-Host "`nWARNING Desktop build not ready - please install Visual Studio Build Tools" -ForegroundColor Yellow
    Write-Host "Web version works perfectly: npm run dev" -ForegroundColor Cyan
}

Write-Host "`nFor more help, visit: https://tauri.app/guides/getting-started/prerequisites" -ForegroundColor Blue 