Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Write-Host "START: TaskFlow Pro (backend + frontend)" -ForegroundColor Green

# Проверка директории
if (-not (Test-Path "task-flow-api") -or -not (Test-Path "task-flow-pro")) {
    Write-Host "ERROR: Запускайте скрипт из корня репозитория (есть папки task-flow-api и task-flow-pro)" -ForegroundColor Red
    exit 1
}

# Backend
Write-Host "BACKEND: старт http://localhost:3001" -ForegroundColor Yellow
Push-Location task-flow-api
try {
    if (Test-Path .\test-connection.js) { node .\test-connection.js | Out-Null }
} catch { }
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run start" -WindowStyle Normal | Out-Null
Pop-Location

# Ожидание health
$backendOk = $false
for ($i = 0; $i -lt 10; $i++) {
    try {
        $resp = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method Get -TimeoutSec 3
        if ($resp.success) { $backendOk = $true; break }
    } catch { }
    Start-Sleep 1
}
if ($backendOk) {
    Write-Host "BACKEND: OK" -ForegroundColor Green
} else {
    Write-Host "BACKEND: нет ответа, продолжаю" -ForegroundColor Yellow
}

# Frontend (dev)
Write-Host "FRONTEND: Vite dev http://localhost:1420" -ForegroundColor Yellow
Push-Location task-flow-pro
$env:VITE_API_URL = "http://localhost:3001/api"
$env:VITE_APP_VERSION = "0.1.0"
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; $env:VITE_API_URL='$env:VITE_API_URL'; $env:VITE_APP_VERSION='$env:VITE_APP_VERSION'; npm run dev" -WindowStyle Normal | Out-Null
Pop-Location

# Ожидание фронта
$frontendOk = $false
for ($i = 0; $i -lt 10; $i++) {
    try {
        Invoke-WebRequest -Uri "http://localhost:1420" -Method Head -TimeoutSec 3 | Out-Null
        $frontendOk = $true; break
    } catch { }
    Start-Sleep 1
}
if ($frontendOk) {
    Start-Process "http://localhost:1420" | Out-Null
    Write-Host "READY: Frontend http://localhost:1420, Backend http://localhost:3001" -ForegroundColor Green
} else {
    Write-Host "FRONTEND: не поднялся. Откройте вручную http://localhost:1420" -ForegroundColor Yellow
}

Write-Host "STOP: закройте окна PowerShell с серверами для остановки" -ForegroundColor DarkGray

