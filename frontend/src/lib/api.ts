import axios from 'axios'
import { ExcelAnalysisResult, ProcessExcelRequest, ProcessExcelResponse } from '@/types/excel'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? window.location.origin : '')

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
})

export const excelApi = {
  analyzeSampleExcel: async (): Promise<ExcelAnalysisResult> => {
    const response = await api.get<ExcelAnalysisResult>('/api/analyze-sample')
    return response.data
  },

  analyzeExcel: async (file: File): Promise<ExcelAnalysisResult> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post<ExcelAnalysisResult>('/api/analyze-excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data
  },

  processExcel: async (request: ProcessExcelRequest): Promise<ProcessExcelResponse> => {
    const response = await api.post<ProcessExcelResponse>('/api/process-excel', request)
    return response.data
  },

  downloadFile: (fileId: string): string => {
    // 상대 경로를 반환하여 현재 도메인 자동 사용
    return `/api/download/${fileId}`
  },

  deleteFile: async (fileId: string): Promise<void> => {
    await api.delete(`/api/file/${fileId}`)
  },
}

export default api