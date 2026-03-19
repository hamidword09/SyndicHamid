@echo off
echo ==========================================
echo    Lancement du Backend (API Flask)
echo ==========================================
cd backend
echo Isolation de l'environnement...
python -m venv venv
call venv\Scripts\activate
echo Installation des dependances...
pip install -r requirements.txt
echo Demarrage du serveur sur http://localhost:5000
python app.py
pause
