@echo off
echo ========================================
echo    NaCinema Development Server
echo ========================================
echo.

echo Checking if port 5000 is available...
netstat -ano | findstr :5000 >nul
if %errorlevel% == 0 (
    echo Port 5000 is in use. Stopping existing processes...
    echo.
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
        echo Killing PID: %%a
        taskkill /PID %%a /F 2>nul
    )
    echo.
    timeout /t 2 /nobreak >nul
) else (
    echo Port 5000 is available.
)

echo Starting development server...
echo.
echo Server will be available at: http://localhost:5000
echo Press Ctrl+C to stop the server
echo.

npm run dev
