@echo off
echo ======================================================
echo           SYNDIC GRAVITY - FULL STACK
echo ======================================================
echo.
echo Ce script va lancer le serveur et l'interface.
echo Gardez les deux fenetres ouvertes !
echo.

start "Syndic Backend" cmd /c run_backend.bat
start "Syndic Frontend" cmd /c run_frontend.bat

echo.
echo Operation terminee. 
echo Le Backend sera sur : http://localhost:5000
echo Le Frontend sera sur : http://localhost:5173
echo.
pause
