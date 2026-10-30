@echo off
echo ========================================================
echo  Starting CollabBoard AI Full-Stack Application...
echo ========================================================

start "CollabBoard AI - Backend Server" cmd /k "cd server && npm run dev"
timeout /t 2 /nobreak > nul
start "CollabBoard AI - Frontend Client" cmd /k "cd client && npm run dev"

timeout /t 3 /nobreak > nul
start http://localhost:5173

echo.
echo Application launched!
echo - Frontend: http://localhost:5173
echo - Backend:  http://localhost:5000
echo ========================================================
