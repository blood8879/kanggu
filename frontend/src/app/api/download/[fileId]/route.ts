import { NextRequest, NextResponse } from 'next/server';

// 임시 파일 저장소 (process-excel에서와 동일한 저장소를 사용해야 함)
const fileStore = new Map<string, Buffer>();

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
    console.log('Available files in store:', Array.from(globalThis.fileStore?.keys() || []));
    
    // 글로벌 저장소에서 파일 찾기
    const fileBuffer = globalThis.fileStore?.get(fileId);
    console.log('File found:', !!fileBuffer);
    
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