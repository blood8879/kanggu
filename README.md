# Excel 입력 처리기

Excel 파일에서 `input1`, `input2`, `input3` 등의 패턴을 찾아 사용자가 입력한 값으로 변경하여 새로운 Excel 파일을 생성하는 웹 애플리케이션입니다.

## 기능

- Excel 파일 업로드 및 분석 (drag & drop 지원)
- `input1`, `input2` 등의 패턴 자동 감지
- 시트별로 구분된 입력 폼 제공
- 실시간 값 입력 및 검증
- 처리된 Excel 파일 다운로드

## 기술 스택

### 백엔드
- **FastAPI**: REST API 서버
- **Python**: 메인 언어
- **pandas & openpyxl**: Excel 파일 처리
- **pydantic**: 데이터 모델링

### 프론트엔드
- **Next.js 14**: React 프레임워크 (App Router)
- **TypeScript**: 타입 안전성
- **TailwindCSS**: 스타일링
- **shadcn/ui**: UI 컴포넌트
- **React Hook Form**: 폼 관리
- **Zod**: 스키마 검증

## 프로젝트 구조

```
kanggu/
├── backend/                 # FastAPI 백엔드
│   ├── app/
│   │   ├── main.py         # FastAPI 애플리케이션
│   │   ├── routers/        # API 라우터
│   │   ├── services/       # 비즈니스 로직
│   │   └── models/         # 데이터 모델
│   ├── uploads/            # 업로드된 파일 저장소
│   ├── requirements.txt    # Python 의존성
│   └── start.py           # 서버 시작 스크립트
├── frontend/               # Next.js 프론트엔드
│   ├── src/
│   │   ├── app/           # Next.js App Router
│   │   ├── components/    # React 컴포넌트
│   │   ├── lib/          # 유틸리티 및 API
│   │   └── types/        # TypeScript 타입
│   └── package.json      # Node.js 의존성
├── sample.xlsx           # 테스트용 Excel 파일
└── README.md            # 프로젝트 문서
```

## 설치 및 실행

### 🚀 빠른 실행 (스크립트 사용)

#### macOS/Linux:
```bash
# 백엔드 실행
./run_backend.sh

# 새 터미널에서 프론트엔드 실행
./run_frontend.sh
```

#### Windows:
```cmd
# 백엔드 실행
run_backend.bat

# 새 명령 프롬프트에서 프론트엔드 실행
cd frontend
npm install
npm run dev
```

### 📝 수동 실행

#### 1. Python 가상환경 설정

```bash
# 가상환경 생성 (처음 한 번만)
python -m venv venv

# 가상환경 활성화
source venv/bin/activate  # macOS/Linux
# 또는
venv\Scripts\activate     # Windows

# 가상환경이 활성화되면 프롬프트에 (venv)가 표시됩니다
```

#### 2. 백엔드 실행

```bash
# venv 활성화 후
cd backend

# 의존성 설치
pip install -r requirements.txt

# 서버 시작
python start.py
```

백엔드 서버가 `http://localhost:8000`에서 실행됩니다.

#### 3. 프론트엔드 실행 (새 터미널)

```bash
# 프론트엔드 디렉터리로 이동
cd frontend

# 의존성 설치
npm install

# 개발 서버 시작
npm run dev
```

프론트엔드가 `http://localhost:3000`에서 실행됩니다.

#### 4. 가상환경 비활성화

```bash
# 작업 완료 후
deactivate
```

## API 엔드포인트

### POST `/api/analyze-excel`
- Excel 파일 업로드 및 분석
- Form-data로 Excel 파일 전송
- 응답: 분석 결과 (input 필드 위치 정보)

### POST `/api/process-excel`
- 입력값으로 Excel 파일 생성
- 요청: file_id와 input_values 배열
- 응답: 처리 결과 및 다운로드 URL

### GET `/api/download/{file_id}`
- 처리된 Excel 파일 다운로드

### DELETE `/api/file/{file_id}`
- 업로드된 파일 삭제

## 사용 방법

1. **파일 업로드**: Excel 파일을 드래그하거나 클릭하여 업로드
2. **분석 확인**: 발견된 input 필드 목록 확인
3. **값 입력**: 각 input 필드에 원하는 값 입력
4. **파일 생성**: "Excel 파일 생성" 버튼 클릭
5. **다운로드**: 처리된 파일 다운로드

## 개발 정보

- 백엔드 API 문서: `http://localhost:8000/docs`
- 프론트엔드 개발 서버: `http://localhost:3000`
- CORS가 설정되어 있어 로컬 개발 환경에서 정상 작동

## 주요 기능 설명

### Excel 분석
- `openpyxl`을 사용하여 Excel 파일의 모든 셀을 검사
- 정규표현식으로 `input\d+` 패턴 감지
- 각 패턴의 시트, 셀 위치, 원본 값 정보 저장

### 입력 폼 생성
- 감지된 input 필드를 기반으로 동적 폼 생성
- 시트별로 그룹화하여 표시
- React Hook Form과 Zod를 사용한 검증

### 파일 처리
- 원본 Excel 파일을 복사하여 새로운 파일 생성
- 각 input 패턴을 사용자 입력값으로 교체
- UUID를 사용한 고유 파일 식별자 생성# kanggu
