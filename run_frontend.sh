#!/bin/bash

# frontend 디렉터리로 이동
cd frontend

# 의존성 설치 확인
echo "📦 Installing dependencies..."
npm install

# 개발 서버 시작
echo "🚀 Starting Next.js development server..."
npm run dev