@echo off
echo Starting ThinkHire Development Environment...
echo.

echo Starting Backend Server...
start "Backend" cmd /k "cd ../backend && python -m uvicorn main:app --host 0.0.0.0 --port 8001"

timeout /t 5 /nobreak >nul

echo Starting Frontend Development Server...
npm run dev

echo.
echo Development environment started successfully!
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:8001
echo.
echo To access from other devices on your network, use your computer's IP address:
echo Frontend: http://[YOUR_IP]:5173
echo Backend API: http://[YOUR_IP]:8001