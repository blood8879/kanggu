import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const sampleFilePath = path.join(process.cwd(), 'public', 'sample.xlsx');
    
    console.log('Testing sample.xlsx access:');
    console.log('Current working directory:', process.cwd());
    console.log('Sample file path:', sampleFilePath);
    console.log('File exists:', fs.existsSync(sampleFilePath));
    
    if (fs.existsSync(sampleFilePath)) {
      const stats = fs.statSync(sampleFilePath);
      console.log('File size:', stats.size);
      console.log('File modified:', stats.mtime);
      
      // 파일을 직접 반환해서 다운로드 테스트
      const fileBuffer = fs.readFileSync(sampleFilePath);
      
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="test-sample.xlsx"',
        },
      });
    } else {
      // public 디렉토리 내용 확인
      const publicDir = path.join(process.cwd(), 'public');
      let publicContents: string[] = [];
      
      if (fs.existsSync(publicDir)) {
        publicContents = fs.readdirSync(publicDir);
      }
      
      return NextResponse.json({
        error: 'File not found',
        cwd: process.cwd(),
        samplePath: sampleFilePath,
        publicDirExists: fs.existsSync(publicDir),
        publicContents,
      });
    }
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}