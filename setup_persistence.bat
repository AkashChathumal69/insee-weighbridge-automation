@echo off
REM Setup script for Data Persistence and Excel Integration

echo.
echo ================================================
echo Setting up Data Persistence & Excel Integration
echo ================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python 3.8+ and try again
    exit /b 1
)

echo [1/3] Installing Python dependencies...
cd slnp
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Error: Failed to install Python dependencies
    exit /b 1
)
cd ..

echo.
echo [2/3] Creating database directories...
if not exist "slnp\Database" mkdir slnp\Database
if not exist "slnp\Database\exports" mkdir slnp\Database\exports
if not exist "slnp\Database\backups" mkdir slnp\Database\backups
echo Database directories created.

echo.
echo [3/3] Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo Error: Failed to install frontend dependencies
    cd ..
    exit /b 1
)
cd ..

echo.
echo ================================================
echo ✓ Setup completed successfully!
echo ================================================
echo.
echo Next steps:
echo 1. Start the backend: python slnp/api.py
echo 2. Start the frontend: cd frontend && npm start
echo.
echo Data will be automatically persisted to:
echo - Main Database: slnp/Database/data.json
echo - Exports: slnp/Database/exports/
echo - Backups: slnp/Database/backups/
echo.
echo For more information, see DATA_PERSISTENCE_GUIDE.md
echo.

pause
