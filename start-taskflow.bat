@echo off
chcp 65001 >nul
title TaskFlow Pro — запуск
setlocal EnableDelayedExpansion

cd /d "%~dp0"

echo.
echo  ========================================
echo   TaskFlow Pro — локальный запуск
echo  ========================================
echo.

:: Синхронизация Supabase ключей из корневого .env
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0sync-supabase-env.ps1"
if errorlevel 1 (
    echo.
    echo [ОШИБКА] Не удалось синхронизировать .env
    pause
    exit /b 1
)

:: Проверка Node.js
where node >nul 2>&1
if errorlevel 1 (
    echo [ОШИБКА] Node.js не найден. Установи: https://nodejs.org/
    pause
    exit /b 1
)

:: Установка зависимостей при первом запуске
if not exist "task-flow-api\node_modules\" (
    echo [INFO] Установка зависимостей backend...
    pushd "task-flow-api"
    call npm install
    if errorlevel 1 popd & pause & exit /b 1
    popd
)

if not exist "task-flow-pro\node_modules\" (
    echo [INFO] Установка зависимостей frontend...
    pushd "task-flow-pro"
    call npm install
    if errorlevel 1 popd & pause & exit /b 1
    popd
)

:: Проверка Supabase
echo [INFO] Проверка подключения к Supabase...
pushd "task-flow-api"
call node test-connection.js
if errorlevel 1 (
    popd
    echo.
    echo [ОШИБКА] Supabase недоступен. Проверь SUPABASE_SERVICE_KEY в .env
    pause
    exit /b 1
)
popd

:: Запуск backend
echo [INFO] Запуск Backend (порт 3001)...
start "TaskFlow Backend" cmd /k "cd /d "%~dp0task-flow-api" && title TaskFlow Backend && npm run dev"

:: Ждём backend
echo [INFO] Ожидание backend (6 сек)...
timeout /t 6 /nobreak >nul

:: Запуск frontend
echo [INFO] Запуск Frontend (порт 1420)...
start "TaskFlow Frontend" cmd /k "cd /d "%~dp0task-flow-pro" && title TaskFlow Frontend && npm run dev"

:: Открываем браузер
timeout /t 4 /nobreak >nul
start "" "http://localhost:1420"

echo.
echo  ========================================
echo   Готово!
echo   Frontend:  http://localhost:1420
echo   Backend:   http://localhost:3001
echo   Логин:     admin@taskflow.pro
echo  ========================================
echo.
echo  Окна "TaskFlow Backend" и "TaskFlow Frontend" — не закрывай.
echo  Для остановки закрой эти окна или запусти stop-taskflow.bat
echo.
pause
