@echo off
title EcoTrack AI Launcher
echo ========================================================
echo         Starting EcoTrack AI Application
echo ========================================================
echo.

echo Starting FastAPI Backend (Port 8000)...
start "EcoTrack Backend" /min cmd /c "cd /d %~dp0backend && python -m uvicorn main:app --host 127.0.0.1 --port 8000"

echo Starting Vite Frontend (Port 5173)...
start "EcoTrack Frontend" /min cmd /c "cd /d %~dp0frontend && npm run dev"

echo Waiting 3 seconds for servers to initialize...
timeout /t 3 /nobreak >nul

echo Opening browser at http://localhost:5173 ...
start http://localhost:5173

echo ========================================================
echo EcoTrack AI is now running!
echo - Frontend: http://localhost:5173
echo - Backend API: http://127.0.0.1:8000
echo - API Docs: http://127.0.0.1:8000/docs
echo.
echo (Keep the background terminal windows open while using the app)
echo ========================================================
pause
