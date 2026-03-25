@echo off
echo ========================================
echo HRIS Frontend - Installation Script
echo ========================================
echo.

echo Installing Auth Frontend...
cd frontend\apps\auth-frontend
call npm install
echo.

echo Installing Admin Frontend...
cd ..\admin-frontend
call npm install
echo.

echo Installing HR Frontend...
cd ..\hr-frontend
call npm install
echo.

echo Installing Finance Frontend...
cd ..\finance-frontend
call npm install
echo.

echo Installing Employee Frontend...
cd ..\employee-frontend
call npm install
echo.

cd ..\..\..
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Start backend: cd backend ^&^& npm run dev
echo 2. Open 5 terminals and run each app:
echo    - Auth: cd frontend/apps/auth-frontend ^&^& npm run dev
echo    - Admin: cd frontend/apps/admin-frontend ^&^& npm run dev
echo    - HR: cd frontend/apps/hr-frontend ^&^& npm run dev
echo    - Finance: cd frontend/apps/finance-frontend ^&^& npm run dev
echo    - Employee: cd frontend/apps/employee-frontend ^&^& npm run dev
echo.
pause
