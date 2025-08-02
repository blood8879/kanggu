import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { ProcessExcelRequest, ProcessExcelResponse } from '@/types/excel';
import path from 'path';
import fs from 'fs';

// 글로벌 파일 저장소 설정
if (typeof globalThis !== 'undefined') {
  if (!globalThis.fileStore) {
    globalThis.fileStore = new Map<string, Buffer>();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ProcessExcelRequest = await request.json();
    const { file_id, input_values } = body;
    
    // 항상 sample.xlsx 템플릿을 사용
    // Vercel 배포 환경과 로컬 환경을 모두 고려한 경로
    const sampleFilePath = path.join(process.cwd(), 'public', 'sample.xlsx');
    
    if (!fs.existsSync(sampleFilePath)) {
      return NextResponse.json({
        success: false,
        message: 'sample.xlsx 템플릿 파일을 찾을 수 없습니다.'
      } as ProcessExcelResponse);
    }
    
    console.log('Using sample.xlsx template from:', sampleFilePath);
    const fileBuffer = fs.readFileSync(sampleFilePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

    // input_values를 사용하여 Excel 파일 수정
    input_values.forEach(inputValue => {
      const sheet = workbook.Sheets[inputValue.sheet];
      if (sheet && sheet[inputValue.cell]) {
        // 기존 셀 값에서 패턴을 실제 값으로 대체
        const originalValue = String(sheet[inputValue.cell].v || '');
        
        // 다양한 패턴 형태 지원
        const patterns = [
          new RegExp(`\\{\\{${inputValue.pattern}\\}\\}`, 'g'),  // {{pattern}}
          new RegExp(`\\b${inputValue.pattern}\\b`, 'gi')       // input1, Input2 등
        ];
        
        let newValue = originalValue;
        patterns.forEach(patternRegex => {
          newValue = newValue.replace(patternRegex, inputValue.value);
        });
        
        // 셀 값 업데이트
        sheet[inputValue.cell].v = newValue;
        sheet[inputValue.cell].w = newValue; // 표시 값도 업데이트
      }
    });

    // 처리된 파일을 buffer로 변환
    const processedBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx' 
    });

    // 처리된 파일 ID 생성
    const processedFileId = `processed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('Storing file with ID:', processedFileId);
    console.log('Buffer size:', processedBuffer.length);
    
    // 개발/프로덕션 환경에 따른 저장 방식
    const isDev = process.env.NODE_ENV === 'development';
    
    if (isDev) {
      // 로컬 개발 환경: 파일 시스템에 저장
      const tempDir = path.join(process.cwd(), '.tmp');
      
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      const filePath = path.join(tempDir, `${processedFileId}.xlsx`);
      fs.writeFileSync(filePath, processedBuffer);
      console.log('File saved to filesystem:', filePath);
    } else {
      // 프로덕션 환경: 메모리에 저장
      globalThis.fileStore?.set(processedFileId, processedBuffer);
    }
    
    console.log('Files in store after saving:', Array.from(globalThis.fileStore?.keys() || []));

    const downloadUrl = `/api/download/${processedFileId}`;

    return NextResponse.json({
      success: true,
      message: 'Excel 파일이 성공적으로 처리되었습니다.',
      download_url: downloadUrl,
      processed_file_id: processedFileId
    } as ProcessExcelResponse);
    
  } catch (error) {
    console.error('Excel 처리 오류:', error);
    return NextResponse.json({
      success: false,
      message: `처리 중 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    } as ProcessExcelResponse);
  }
}

