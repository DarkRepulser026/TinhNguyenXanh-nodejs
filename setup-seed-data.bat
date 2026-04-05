@echo off
REM Quick setup script for seed data (Windows)
REM Usage: setup-seed-data.bat

echo.
echo ============================================================
echo  Tinh Nguyen Xanh - Enhanced Seed Data Setup
echo ============================================================
echo.

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Node.js is not installed
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Node.js version: %NODE_VERSION%
echo.

REM Check MongoDB and db:generate
echo [*] Checking MongoDB connection...
npm run db:generate >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] MongoDB connection failed!
    echo     Please ensure MongoDB is running:
    echo     - Windows: mongod
    echo     - Docker: docker run -d -p 27017:27017 mongo
    echo     - Atlas: Check .env DATABASE_URL
    echo.
    pause
    exit /b 1
)
echo [OK] MongoDB connection OK
echo.

REM Reset database
echo [*] Resetting database...
call npm run db:reset
if %errorlevel% neq 0 (
    echo [!] Database reset failed
    pause
    exit /b 1
)
echo [OK] Database reset complete
echo.

REM Seed data
echo [*] Seeding data...
call npm run db:seed
if %errorlevel% neq 0 (
    echo [!] Seeding failed
    pause
    exit /b 1
)
echo [OK] Seeding complete
echo.

REM Summary
echo ============================================================
echo  SETUP COMPLETE!
echo ============================================================
echo.
echo Data Summary:
echo   [OK] 2 Admins + 3 Organizers + 3 Volunteers
echo   [OK] 3 Organizations
echo   [OK] 7 Event Categories
echo   [OK] 18 Events
echo   [OK] 36+ Registrations
echo   [OK] 18+ Ratings and Reviews
echo   [OK] 18+ Comments
echo   [OK] 9+ Organization Reviews
echo.
echo Next Steps:
echo   1. Start backend:    npm run dev:backend
echo   2. Start frontend:   npm run dev:frontend
echo   3. Login with admin: admin1@tinhnguyenxanh.local / Admin12345
echo.
echo See SEED_DATA_GUIDE.md for more details
echo.
pause
