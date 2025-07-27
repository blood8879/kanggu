from pydantic import BaseModel
from typing import List, Dict, Optional, Any

class InputField(BaseModel):
    pattern: str
    cell: str
    row: int
    column: int
    column_letter: str
    original_value: str
    sheet: str

class SheetInfo(BaseModel):
    name: str
    max_row: int
    max_column: int
    input_fields: List[InputField]

class ExcelAnalysisResult(BaseModel):
    sheets: Dict[str, SheetInfo]
    input_fields: List[InputField]
    file_info: Dict[str, Any]
    pandas_info: Optional[Dict[str, Any]] = None
    pandas_error: Optional[str] = None
    file_id: Optional[str] = None

class InputValue(BaseModel):
    pattern: str
    value: str
    cell: str
    sheet: str

class ProcessExcelRequest(BaseModel):
    file_id: str
    input_values: List[InputValue]

class ProcessExcelResponse(BaseModel):
    success: bool
    message: str
    download_url: Optional[str] = None
    processed_file_id: Optional[str] = None