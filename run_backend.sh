#!/bin/bash

# venv 활성화
echo "🐍 Activating virtual environment..."
source venv/bin/activate

# backend 디렉터리로 이동
cd backend

# 의존성 설치 확인
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# 서버 시작
echo "🚀 Starting FastAPI server..."
python start.py