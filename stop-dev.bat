@echo off
echo ========================================
echo    Stopping NaCinema Development Server
echo ========================================
echo.

echo Checking for running processes on port 5000...
netstat -ano | findstr :5000 >nul
if %errorlevel% == 0 (
    echo Found processes on port 5000. Stopping them...
    echo.
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
        echo Killing PID: %%a
        taskkill /PID %%a /F 2>nul
    )
    echo.
    echo All processes on port 5000 have been stopped.
) else (
    echo No processes found on port 5000.
)

echo.
echo Development server stopped successfully.
pause
