@echo off
echo.
echo ========================================
echo   CinePay Database Migration Helper
echo ========================================
echo.
echo Instructions:
echo 1. Get DATABASE_URL from Railway:
echo    - Go to Railway Dashboard
echo    - Click on "Postgres" service
echo    - Go to "Variables" tab
echo    - Copy the "DATABASE_URL" value
echo.
echo 2. When prompted, paste the DATABASE_URL
echo.
echo ========================================
echo.

set /p DB_URL="Paste DATABASE_URL here and press Enter: "

echo.
echo Running migration...
echo.

psql "%DB_URL%" -f database/schema.sql
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Schema creation failed!
    pause
    exit /b 1
)

echo.
echo Schema created successfully!
echo.

psql "%DB_URL%" -f database/seed.sql
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Seed data insertion failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   SUCCESS! Database migration complete!
echo ========================================
echo.
echo Next step: Test your backend API
echo   curl https://cinepay-backend-production.up.railway.app/api/movies
echo.
pause
