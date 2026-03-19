@echo off
echo ==========================================
echo    Lancement du Frontend (React)
echo ==========================================
cd frontend
set PATH=C:\Program Files\nodejs\;%PATH%
echo Verification des dependances...
call npm install
echo Demarrage de l'interface sur http://localhost:5173
call npm run dev
pause
