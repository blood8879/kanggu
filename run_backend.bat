@echo off
echo 🐍 Activating virtual environment...
call venv\Scripts\activate

echo 📂 Moving to backend directory...
cd backend

echo 📦 Installing dependencies...
pip install -r requirements.txt

echo 🚀 Starting FastAPI server...
python start.py

pause