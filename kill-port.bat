@echo off
echo Checking processes on port 5000...
netstat -ano | findstr :5000

echo.
echo Killing processes on port 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    echo Killing PID: %%a
    taskkill /PID %%a /F 2>nul
)

echo.
echo Port 5000 should now be free.
echo You can now run: npm run dev
pause
