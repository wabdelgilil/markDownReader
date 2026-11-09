@echo off
title MDFull - Universal Markdown Station
echo ========================================================
echo        Starting MDFull Local Development Server
echo ========================================================
echo.

cd /d "%~dp0"

if not exist "node_modules\" (
    echo [INFO] First time run detected. Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies.
        pause
        exit /b %errorlevel%
    )
)

echo [INFO] Launching default browser at http://localhost:3000/ ...
start "" "http://localhost:3000/"

echo [INFO] Starting Vite development server...
call npm run dev

pause
