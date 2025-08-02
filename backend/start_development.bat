@echo off
echo ========================================
echo BinSavvy Development Environment Setup
echo ========================================
echo.

echo [1/4] Checking Python virtual environment...
if not exist "venv\Scripts\Activate.ps1" (
    echo ERROR: Virtual environment not found!
    echo Please run: python -m venv venv
    echo Then: .\venv\Scripts\Activate.ps1
    echo Then: pip install -r requirements.txt
    pause
    exit /b 1
)

echo [2/4] Activating virtual environment...
call venv\Scripts\Activate.ps1

echo [3/4] Checking Redis connection...
redis-cli ping >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Redis is not running!
    echo.
    echo To enable ML processing, you need Redis:
    echo 1. Download Redis for Windows: https://github.com/microsoftarchive/redis/releases
    echo 2. Install Redis-x64-xxx.msi
    echo 3. Redis will run as a Windows service automatically
    echo.
    echo OR use Docker: docker run -d -p 6379:6379 redis:alpine
    echo.
    echo For now, uploads will work but ML processing will be skipped.
    echo.
) else (
    echo SUCCESS: Redis is running!
)

echo [4/4] Starting Django development server...
echo.
echo ========================================
echo Development Server Started!
echo ========================================
echo.
echo Frontend: http://localhost:8080
echo Backend API: http://localhost:8000
echo Admin: http://localhost:8000/admin
echo.
echo To enable ML processing, open a new terminal and run:
echo   cd backend
echo   .\venv\Scripts\Activate.ps1
echo   celery -A binsavvy worker --loglevel=info -P eventlet
echo.
echo Press Ctrl+C to stop the server
echo.

python manage.py runserver 