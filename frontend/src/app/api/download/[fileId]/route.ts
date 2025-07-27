import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 로컬 개발 환경에서는 파일 시스템을 사용
const isDev = process.env.NODE_ENV === 'development';
const tempDir = path.join(process.cwd(), '.tmp');

// 임시 디렉토리 생성
if (isDev && !fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// 다른 API route에서 저장한 파일에 접근하기 위한 글로벌 저장소
if (typeof globalThis !== 'undefined') {
  if (!globalThis.fileStore) {
    globalThis.fileStore = new Map<string, Buffer>();
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;
    console.log('Download requested for fileId:', fileId);
    
    let fileBuffer: Buffer | undefined;
    
    if (isDev) {
      // 로컬 개발 환경: 파일 시스템에서 읽기
      const filePath = path.join(tempDir, `${fileId}.xlsx`);
      console.log('Looking for file at:', filePath);
      
      if (fs.existsSync(filePath)) {
        fileBuffer = fs.readFileSync(filePath);
        console.log('File found in filesystem');
      }
    } else {
      // 프로덕션 환경: 메모리에서 읽기
      console.log('Available files in store:', Array.from(globalThis.fileStore?.keys() || []));
      fileBuffer = globalThis.fileStore?.get(fileId);
      console.log('File found in memory:', !!fileBuffer);
    }
    
    if (!fileBuffer) {
      return NextResponse.json(
        { error: '파일을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // Excel 파일로 응답
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="processed_${fileId}.xlsx"`,
      },
    });
    
  } catch (error) {
    console.error('파일 다운로드 오류:', error);
    return NextResponse.json(
      { error: `다운로드 중 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}` },
      { status: 500 }
    );
  }
}