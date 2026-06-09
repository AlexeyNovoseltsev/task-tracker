@echo off
chcp 65001 >nul
title TaskFlow Pro — остановка

echo Останавливаю TaskFlow dev-серверы...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001" ^| findstr "LISTENING"') do (
    taskkill /PID %%a /F >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":1420" ^| findstr "LISTENING"') do (
    taskkill /PID %%a /F >nul 2>&1
)

taskkill /FI "WINDOWTITLE eq TaskFlow Backend*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq TaskFlow Frontend*" /F >nul 2>&1

echo Готово.
timeout /t 2 >nul
