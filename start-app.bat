@echo off
title RollCall Attendance App Launcher
cd /d "%~dp0"

echo ========================================================
echo         Launching RollCall Attendance App...
echo ========================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [NOTICE] Node.js is not yet installed on this system.
    echo Opening Standalone App directly in your browser...
    echo (All features and LocalStorage work fully!)
    echo.
    start "" "%~dp0standalone.html"
    pause
    exit /b
)

if not exist "node_modules\" (
    echo Installing dependencies (first-time setup, may take a minute)...
    call npm install
    echo.
)

echo Starting Vite development server...
echo The app will open in your default browser at http://localhost:3000
echo Keep this window open while using the app.
echo.
call npm run dev
pause
