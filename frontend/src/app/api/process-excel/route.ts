import { NextRequest, NextResponse } from 'next/server';
import { ProcessExcelRequest, ProcessExcelResponse } from '@/types/excel';
import path from 'path';
import fs from 'fs';
import JSZip from 'jszip';

// 글로벌 파일 저장소 설정
if (typeof globalThis !== 'undefined') {
  if (!globalThis.fileStore) {
    globalThis.fileStore = new Map<string, Buffer>();
  }
}


// ZIP 내부의 XML 파일에서 패턴을 교체하는 함수
async function replaceInZipXml(buffer: Buffer, patterns: { pattern: string; value: string }[]): Promise<Buffer> {
  try {
    const zip = new JSZip();
    await zip.loadAsync(buffer);
    
    console.log('ZIP loaded, files:', Object.keys(zip.files));
    
    // sharedStrings.xml에서 패턴 교체
    const sharedStringsFile = zip.file('xl/sharedStrings.xml');
    if (sharedStringsFile) {
      let sharedStringsContent = await sharedStringsFile.async('string');
      console.log('Original sharedStrings length:', sharedStringsContent.length);
      
      patterns.forEach(({ pattern, value }) => {
        const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedPattern, 'g');
        const before = sharedStringsContent;
        sharedStringsContent = sharedStringsContent.replace(regex, value);
        if (before !== sharedStringsContent) {
          console.log(`Replaced "${pattern}" with "${value}" in sharedStrings.xml`);
        }
      });
      
      // 수정된 내용으로 다시 저장
      zip.file('xl/sharedStrings.xml', sharedStringsContent);
    }
    
    // worksheet XML 파일들에서도 패턴 교체
    const worksheetFiles = Object.keys(zip.files).filter(name => 
      name.startsWith('xl/worksheets/') && name.endsWith('.xml')
    );
    
    for (const worksheetPath of worksheetFiles) {
      const worksheetFile = zip.file(worksheetPath);
      if (worksheetFile) {
        let worksheetContent = await worksheetFile.async('string');
        
        patterns.forEach(({ pattern, value }) => {
          const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(escapedPattern, 'g');
          const before = worksheetContent;
          worksheetContent = worksheetContent.replace(regex, value);
          if (before !== worksheetContent) {
            console.log(`Replaced "${pattern}" with "${value}" in ${worksheetPath}`);
          }
        });
        
        zip.file(worksheetPath, worksheetContent);
      }
    }
    
    // 새로운 ZIP 버퍼 생성
    const newBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 }
    });
    
    console.log('New ZIP buffer size:', newBuffer.length);
    return newBuffer;
    
  } catch (error) {
    console.error('ZIP 처리 실패:', error);
    return buffer; // 실패시 원본 반환
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ProcessExcelRequest = await request.json();
    const { file_id, input_values } = body;
    
    // 항상 sample.xlsx 템플릿을 사용
    const sampleFilePath = path.join(process.cwd(), 'public', 'sample.xlsx');
    
    if (!fs.existsSync(sampleFilePath)) {
      return NextResponse.json({
        success: false,
        message: 'sample.xlsx 템플릿 파일을 찾을 수 없습니다.'
      } as ProcessExcelResponse);
    }
    
    console.log('Using ZIP-level pattern replacement to preserve formatting perfectly');
    console.log('Template path:', sampleFilePath);
    console.log('Template file exists:', fs.existsSync(sampleFilePath));
    
    // 원본 파일을 바이너리로 읽어서 복사
    const originalBuffer = fs.readFileSync(sampleFilePath);
    console.log('Original template file size:', originalBuffer.length);

    // ZIP 레벨에서 패턴 교체 (완전한 포맷 보존)
    const patterns = input_values.map(inputValue => ({
      pattern: inputValue.pattern,
      value: inputValue.value
    }));
    
    console.log('Patterns to replace:', patterns);
    const processedBuffer = await replaceInZipXml(originalBuffer, patterns);
    console.log('After ZIP replacement - Processed size:', processedBuffer.length);
    
    // 처리된 파일 ID 생성
    const processedFileId = `processed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
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
      console.log('File saved to memory store');
    }

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