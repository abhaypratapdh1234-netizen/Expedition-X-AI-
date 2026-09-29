@echo off
echo ==========================================
echo Starting Expedition X AI Services
echo ==========================================

echo [1/2] Starting Spring Boot Backend (Port 8080)...
start "Expedition X Backend" cmd /k "cd backend && mvnw spring-boot:run"

echo [2/2] Starting Vite Frontend (Port 5173)...
start "Expedition X Frontend" cmd /k "npm run dev"

echo.
echo All services have been launched in separate windows!
echo - Frontend: http://localhost:5173
echo - Backend:  http://localhost:8080
echo.
echo You can close this window now.
pause
