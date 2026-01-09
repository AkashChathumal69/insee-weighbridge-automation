@echo off
REM Start Script for SLNP Detection System

echo ====================================
echo SLNP Detection System - Starting
echo ====================================
echo.
echo Starting Backend (SLNP API) in new window...
start cmd /k "cd slnp && venv\Scripts\activate.bat && python api.py"

timeout /t 3

echo Starting Frontend (React) in new window...
start cmd /k "cd frontend && npm start"

echo.
echo Both services are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Opening browser...
timeout /t 5
start http://localhost:3000

echo Done! Press any key to close this window.
pause
