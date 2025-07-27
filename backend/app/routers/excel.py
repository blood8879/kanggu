from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import FileResponse
from app.services.excel_service import ExcelService
from app.models.excel_models import ExcelAnalysisResult, ProcessExcelRequest, ProcessExcelResponse
import os
import tempfile

router = APIRouter()
excel_service = ExcelService()

@router.get("/analyze-sample", response_model=ExcelAnalysisResult)
async def analyze_sample_excel():
    """sample.xlsx 파일을 분석합니다."""
    try:
        # 프로젝트 루트에 있는 sample.xlsx 파일 경로
        # backend/app/routers/excel.py -> ../../../sample.xlsx
        current_dir = os.path.dirname(os.path.abspath(__file__))
        backend_dir = os.path.dirname(os.path.dirname(current_dir))
        project_root = os.path.dirname(backend_dir)
        sample_file_path = os.path.join(project_root, "sample.xlsx")
        
        if not os.path.exists(sample_file_path):
            raise HTTPException(status_code=404, detail="sample.xlsx 파일을 찾을 수 없습니다.")
        
        analysis_result = excel_service.analyze_excel_file(sample_file_path)
        
        # sample.xlsx의 고정 file_id 설정
        setattr(analysis_result, 'file_id', 'sample')
        
        return analysis_result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze-excel", response_model=ExcelAnalysisResult)
async def analyze_excel(file: UploadFile = File(...)):
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Excel 파일만 업로드 가능합니다.")
    
    try:
        file_content = await file.read()
        file_id = excel_service.save_uploaded_file(file_content, file.filename)
        file_path = excel_service.get_file_path(file_id, "upload_")
        
        analysis_result = excel_service.analyze_excel_file(file_path)
        
        setattr(analysis_result, 'file_id', file_id)
        
        return analysis_result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/process-excel", response_model=ProcessExcelResponse)
async def process_excel(request: ProcessExcelRequest):
    try:
        if request.file_id == "sample":
            # sample.xlsx 파일 처리
            processed_file_id = excel_service.process_sample_excel_with_inputs(request.input_values)
        else:
            # 업로드된 파일 처리 (기존 로직)
            original_file_path = excel_service.get_file_path(request.file_id, "upload_")
            
            if not os.path.exists(original_file_path):
                raise HTTPException(status_code=404, detail="원본 파일을 찾을 수 없습니다.")
            
            processed_file_id = excel_service.process_excel_with_inputs(
                original_file_path, 
                request.input_values
            )
        
        download_url = f"/api/download/{processed_file_id}"
        
        return ProcessExcelResponse(
            success=True,
            message="Excel 파일이 성공적으로 처리되었습니다.",
            download_url=download_url,
            processed_file_id=processed_file_id
        )
        
    except Exception as e:
        return ProcessExcelResponse(
            success=False,
            message=f"처리 중 오류 발생: {str(e)}"
        )

@router.get("/download/{file_id}")
async def download_file(file_id: str):
    try:
        file_path = excel_service.get_file_path(file_id, "processed_")
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="파일을 찾을 수 없습니다.")
        
        return FileResponse(
            path=file_path,
            filename=f"processed_{file_id}.xlsx",
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/file/{file_id}")
async def delete_file(file_id: str):
    try:
        upload_path = excel_service.get_file_path(file_id, "upload_")
        processed_path = excel_service.get_file_path(file_id, "processed_")
        
        deleted_files = []
        
        if os.path.exists(upload_path):
            os.remove(upload_path)
            deleted_files.append("upload")
        
        if os.path.exists(processed_path):
            os.remove(processed_path)
            deleted_files.append("processed")
        
        if not deleted_files:
            raise HTTPException(status_code=404, detail="삭제할 파일을 찾을 수 없습니다.")
        
        return {"message": f"파일이 성공적으로 삭제되었습니다: {', '.join(deleted_files)}"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))