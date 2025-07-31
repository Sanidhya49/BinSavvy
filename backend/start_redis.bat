@echo off
echo Starting Redis for BinSavvy development...
echo.
echo Note: This requires Redis to be installed on Windows.
echo If Redis is not installed, you can:
echo 1. Download from: https://github.com/microsoftarchive/redis/releases
echo 2. Or use Docker: docker run -d -p 6379:6379 redis:alpine
echo 3. Or skip ML processing for now (uploads will work without Redis)
echo.

REM Try to start Redis
redis-server --port 6379

echo.
echo If Redis started successfully, you can now run ML processing.
echo If you see errors, ML processing will be skipped but uploads will still work.
pause 