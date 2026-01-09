@echo off
REM Quick Start Script for SLNP Detection System

echo ====================================
echo SLNP Detection System - Quick Start
echo ====================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Python version:
python --version
echo.
echo Node.js version:
node --version
echo.

REM Check Tesseract installation
echo Checking Tesseract OCR installation...
where tesseract >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Tesseract-OCR not found in PATH
    echo Download from: https://github.com/UB-Mannheim/tesseract/wiki
    echo Make sure to install it before running the API
    echo.
)

REM Setup Backend
echo ====================================
echo Setting up Backend (SLNP API)...
echo ====================================
cd slnp
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing Python dependencies...
pip install -r requirements.txt

echo.
echo Backend setup complete!
echo.

REM Setup Frontend
echo ====================================
echo Setting up Frontend (React)...
echo ====================================
cd ..\frontend

if not exist "node_modules" (
    echo Installing Node packages...
    call npm install
) else (
    echo Node packages already installed
)

cd ..

echo.
echo ====================================
echo Setup Complete!
echo ====================================
echo.
echo To start the system, open two terminal windows:
echo.
echo Terminal 1 - Backend (SLNP API):
echo   cd slnp
echo   venv\Scripts\activate.bat
echo   python api.py
echo.
echo Terminal 2 - Frontend (React):
echo   cd frontend
echo   npm start
echo.
echo Then open http://localhost:3000 in your browser
echo.
pause
