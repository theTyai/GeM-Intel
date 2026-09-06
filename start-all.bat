@echo off
echo =================================================================
echo        GeM-Intel — Local Services Startup Script
echo        SIH 1360 — Advanced Price Intelligence & Audit Engine
echo =================================================================
echo.

echo Starting Python AI Service (Port 8000)...
start "GeM-Intel AI Service" cmd /k "cd /d %~dp0ai-service && python -m uvicorn main:app --reload --port 8000"

echo Starting Node.js Backend Gateway (Port 5000)...
start "GeM-Intel Backend" cmd /k "cd /d %~dp0backend && node src/index.js"

echo Starting React Dashboard (Port 5173)...
start "GeM-Intel Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo =================================================================
echo All GeM-Intel services are starting in separate windows:
echo - Frontend:  http://localhost:5173
echo - Backend:   http://localhost:5000/api/v1
echo - AI Core:   http://localhost:8000
echo =================================================================
pause
