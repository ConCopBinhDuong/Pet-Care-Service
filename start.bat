@echo off
echo 🚀 Starting Pet Care Service Application
echo ========================================

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo 📦 Installing dependencies if needed...

:: Install backend dependencies
if not exist "node_modules" (
    echo Installing backend dependencies...
    npm install
)

:: Install frontend dependencies
if not exist "public\node_modules" (
    echo Installing frontend dependencies...
    cd public
    npm install
    cd ..
)

echo ✅ Dependencies ready!
echo.
echo 🔧 Starting both servers...
echo    - Backend: http://localhost:10000
echo    - Frontend: http://localhost:3000
echo.
echo Press Ctrl+C to stop both servers
echo.

:: Start both servers
npm run dev:both
