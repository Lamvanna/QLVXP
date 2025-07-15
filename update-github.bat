@echo off
echo ========================================
echo    Update GitHub Repository
echo ========================================
echo.

echo Adding all changes...
git add .

echo Creating commit...
git commit -m "Update README with GitHub badges and improved documentation"

echo Pushing to GitHub...
git push

echo.
echo ========================================
echo    GitHub repository updated!
echo    Visit: https://github.com/Lamvanna/QLVXP
echo ========================================
pause
