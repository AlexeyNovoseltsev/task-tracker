# TaskFlow Pro - Скрипт запуска
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root

Write-Host "🚀 Запуск TaskFlow Pro..." -ForegroundColor Green

if (-not (Test-Path "task-flow-api") -or -not (Test-Path "task-flow-pro")) {
    Write-Host "❌ Ошибка: Запустите скрипт из корневой директории task-tracker" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔑 Синхронизация .env..." -ForegroundColor Yellow
& "$Root\sync-supabase-env.ps1"
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host ""
Write-Host "📡 Тестируем подключение к Supabase..." -ForegroundColor Yellow
Set-Location "$Root\task-flow-api"
node test-connection.js

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка подключения к Supabase!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔧 Запускаем Backend API..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k", "cd /d `"$Root\task-flow-api`" && title TaskFlow Backend && npm run dev" -WindowStyle Normal

# Ждем запуска backend
Write-Host "⏳ Ждем запуска backend (5 секунд)..." -ForegroundColor Yellow
Start-Sleep 5

# Тестируем backend
Write-Host "🧪 Тестируем backend..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method Get
    Write-Host "✅ Backend запущен успешно!" -ForegroundColor Green
    Write-Host "   Ответ: $($response | ConvertTo-Json)" -ForegroundColor Gray
} catch {
    Write-Host "⚠️  Backend еще не готов, но продолжаем..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎨 Запускаем Frontend..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k", "cd /d `"$Root\task-flow-pro`" && title TaskFlow Frontend && npm run dev" -WindowStyle Normal
Start-Sleep 4
Start-Process "http://localhost:1420"

Write-Host ""
Write-Host "🎉 TaskFlow Pro запущен!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Адреса сервисов:" -ForegroundColor Cyan
Write-Host "   Frontend:  http://localhost:1420" -ForegroundColor White
Write-Host "   Backend:   http://localhost:3001" -ForegroundColor White
Write-Host "   API Test:  http://localhost:1420/api-test" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Для остановки сервисов:" -ForegroundColor Cyan
Write-Host "   Закройте окна TaskFlow Backend / Frontend или stop-taskflow.bat" -ForegroundColor White
Write-Host ""
Write-Host "Нажмите любую клавишу для выхода..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")