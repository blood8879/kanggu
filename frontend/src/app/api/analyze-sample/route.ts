import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { ExcelAnalysisResult } from '@/types/excel';
import path from 'path';
import fs from 'fs';

export async function GET(request: NextRequest) {
  try {
    // sample.xlsx 파일 경로 (public 폴더에서 찾기)
    const sampleFilePath = path.join(process.cwd(), 'public', 'sample.xlsx');
    
    if (!fs.existsSync(sampleFilePath)) {
      return NextResponse.json(
        { error: 'sample.xlsx 파일을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // Excel 파일 읽기
    const fileBuffer = fs.readFileSync(sampleFilePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    
    const result: ExcelAnalysisResult = {
      sheets: {},
      input_fields: [],
      file_info: {
        sheet_names: workbook.SheetNames,
        total_sheets: workbook.SheetNames.length
      },
      file_id: 'sample'
    };

    // 각 시트 분석
    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:A1');
      
      const inputFields = [];
      
      // 셀들을 순회하며 input 패턴 찾기
      for (let row = range.s.r; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          const cell = sheet[cellAddress];
          
          if (cell && cell.v) {
            const cellValue = String(cell.v);
            // input 패턴 검색 (예: {{pattern}})
            const inputPattern = /\{\{([^}]+)\}\}/g;
            let match;
            
            while ((match = inputPattern.exec(cellValue)) !== null) {
              const pattern = match[1];
              const inputField = {
                pattern,
                cell: cellAddress,
                row: row + 1, // 1-based indexing
                column: col + 1, // 1-based indexing
                column_letter: XLSX.utils.encode_col(col),
                original_value: cellValue,
                sheet: sheetName
              };
              
              inputFields.push(inputField);
              result.input_fields.push(inputField);
            }
          }
        }
      }
      
      result.sheets[sheetName] = {
        name: sheetName,
        max_row: range.e.r + 1,
        max_column: range.e.c + 1,
        input_fields: inputFields
      };
    });

    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Sample Excel 분석 오류:', error);
    return NextResponse.json(
      { error: `분석 중 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}` },
      { status: 500 }
    );
  }
}