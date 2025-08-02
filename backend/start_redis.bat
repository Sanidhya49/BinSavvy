@echo off
echo Starting Redis Server...
echo.
echo If Redis is not installed, please:
echo 1. Download Redis for Windows from: https://github.com/microsoftarchive/redis/releases
echo 2. Install Redis-x64-xxx.msi
echo 3. Run this script again
echo.
echo Testing Redis connection...
redis-cli ping
echo.
echo If you see "PONG", Redis is running correctly.
echo If you see an error, please install Redis first.
pause 