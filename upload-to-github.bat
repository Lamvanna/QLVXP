@echo off
echo ========================================
echo    Upload NaCinema to GitHub
echo ========================================
echo.

echo Step 1: Initialize Git repository...
git init
if %errorlevel% neq 0 (
    echo Error: Failed to initialize Git repository
    pause
    exit /b 1
)

echo Step 2: Add remote repository...
git remote add origin https://github.com/Lamvanna/QLVXP.git
if %errorlevel% neq 0 (
    echo Warning: Remote might already exist, continuing...
)

echo Step 3: Configure Git (if needed)...
git config --global user.name "Lamvanna" 2>nul
git config --global user.email "lamvanna@example.com" 2>nul

echo Step 4: Add all files...
git add .
if %errorlevel% neq 0 (
    echo Error: Failed to add files
    pause
    exit /b 1
)

echo Step 5: Create initial commit...
git commit -m "Initial commit: NaCinema Movie Ticket Management System"
if %errorlevel% neq 0 (
    echo Error: Failed to create commit
    pause
    exit /b 1
)

echo Step 6: Push to GitHub...
git branch -M main
git push -u origin main
if %errorlevel% neq 0 (
    echo Error: Failed to push to GitHub
    echo Please check your GitHub credentials and repository access
    pause
    exit /b 1
)

echo.
echo ========================================
echo    SUCCESS! Code uploaded to GitHub
echo    Repository: https://github.com/Lamvanna/QLVXP
echo ========================================
pause
