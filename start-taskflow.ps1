# TaskFlow Pro - Скрипт запуска
Write-Host "🚀 Запуск TaskFlow Pro..." -ForegroundColor Green

# Проверяем, что мы в правильной директории
if (-not (Test-Path "task-flow-api") -or -not (Test-Path "task-flow-pro")) {
    Write-Host "❌ Ошибка: Запустите скрипт из корневой директории task-tracker" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📡 Тестируем подключение к Supabase..." -ForegroundColor Yellow
cd task-flow-api
node test-connection.js

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка подключения к Supabase!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔧 Запускаем Backend API..." -ForegroundColor Yellow
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev" -WindowStyle Normal

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
cd ..\task-flow-pro
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "🎉 TaskFlow Pro запущен!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Адреса сервисов:" -ForegroundColor Cyan
Write-Host "   Frontend:  http://localhost:1420" -ForegroundColor White
Write-Host "   Backend:   http://localhost:3001" -ForegroundColor White
Write-Host "   API Test:  http://localhost:1420/api-test" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Для остановки сервисов:" -ForegroundColor Cyan
Write-Host "   Закройте окна PowerShell с серверами" -ForegroundColor White
Write-Host ""
Write-Host "Нажмите любую клавишу для выхода..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")