@echo off
echo ========================================
echo BinSavvy Simple Development Setup
echo ========================================
echo.

echo [1/3] Checking Python virtual environment...
if not exist "venv\Scripts\Activate.ps1" (
    echo ERROR: Virtual environment not found!
    echo Please run: python -m venv venv
    echo Then: .\venv\Scripts\Activate.ps1
    echo Then: pip install -r requirements.txt
    pause
    exit /b 1
)

echo [2/3] Activating virtual environment...
call venv\Scripts\Activate.ps1

echo [3/3] Setting up synchronous processing...
set CELERY_TASK_ALWAYS_EAGER=True

echo.
echo ========================================
echo Development Server Starting!
echo ========================================
echo.
echo Frontend: http://localhost:8080
echo Backend API: http://localhost:8000
echo Admin: http://localhost:8000/admin
echo.
echo NOTE: ML processing will run synchronously (slower but works without Redis)
echo.
echo Press Ctrl+C to stop the server
echo.

python manage.py runserver 