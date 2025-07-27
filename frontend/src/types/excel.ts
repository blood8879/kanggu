export interface InputField {
  pattern: string;
  cell: string;
  row: number;
  column: number;
  column_letter: string;
  original_value: string;
  sheet: string;
}

export interface SheetInfo {
  name: string;
  max_row: number;
  max_column: number;
  input_fields: InputField[];
}

export interface ExcelAnalysisResult {
  sheets: Record<string, SheetInfo>;
  input_fields: InputField[];
  file_info: {
    sheet_names: string[];
    total_sheets: number;
  };
  pandas_info?: Record<string, any>;
  pandas_error?: string;
  file_id?: string;
}

export interface InputValue {
  pattern: string;
  value: string;
  cell: string;
  sheet: string;
}

export interface ProcessExcelRequest {
  file_id: string;
  input_values: InputValue[];
}

export interface ProcessExcelResponse {
  success: boolean;
  message: string;
  download_url?: string;
  processed_file_id?: string;
}