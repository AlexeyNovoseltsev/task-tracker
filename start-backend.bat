@echo off
echo Starting TaskFlow Pro Backend...
cd /d "%~dp0task-flow-api"
npm run dev
pause