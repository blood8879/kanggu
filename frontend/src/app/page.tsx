"use client";

import React, { useState, useEffect } from "react";
import { InputForm } from "@/components/InputForm";
import { DownloadButton } from "@/components/DownloadButton";
import { excelApi } from "@/lib/api";
import { ExcelAnalysisResult, InputValue } from "@/types/excel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, FileText, RefreshCw } from "lucide-react";

export default function Home() {
  const [analysisResult, setAnalysisResult] =
    useState<ExcelAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const [error, setError] = useState<string>("");

  // 페이지 로드 시 자동으로 sample.xlsx 분석
  useEffect(() => {
    loadSampleExcel();
  }, []);

  const loadSampleExcel = async () => {
    setIsAnalyzing(true);
    setError("");
    setAnalysisResult(null);
    setDownloadUrl("");

    try {
      console.log(
        "API_BASE_URL:",
        process.env.NEXT_PUBLIC_API_URL ||
          (typeof window !== "undefined" ? window.location.origin : "")
      );
      console.log(
        "Environment check - NEXT_PUBLIC_API_URL:",
        process.env.NEXT_PUBLIC_API_URL
      );
      console.log("downloadUrl", downloadUrl);
      const result = await excelApi.analyzeSampleExcel();
      console.log("Analysis result:", result);
      setAnalysisResult(result);
    } catch (err) {
      console.error("Sample Excel analysis error:", err);
      if (err instanceof Error) {
        setError(
          `Sample Excel 파일 분석 중 오류가 발생했습니다: ${err.message}`
        );
      } else {
        setError("Sample Excel 파일 분석 중 오류가 발생했습니다.");
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleInputSubmit = async (values: Record<string, string>) => {
    if (!analysisResult?.file_id) return;

    setIsProcessing(true);
    setError("");

    try {
      // 동일한 패턴의 모든 위치에 같은 값을 적용
      const inputValues: InputValue[] = analysisResult.input_fields.map(
        (field) => {
          // 패턴과 매칭되는 입력값 찾기 (대소문자 구분 없이)
          const matchingKey = Object.keys(values).find(
            (key) => key.toLowerCase() === field.pattern.toLowerCase()
          );
          const value = matchingKey ? values[matchingKey] : "";

          return {
            pattern: field.pattern,
            value: value,
            cell: field.cell,
            sheet: field.sheet,
          };
        }
      );

      const response = await excelApi.processExcel({
        file_id: analysisResult.file_id,
        input_values: inputValues,
      });

      if (response.success && response.download_url) {
        setDownloadUrl(response.download_url);
      } else {
        setError(response.message || "파일 처리 중 오류가 발생했습니다.");
      }
    } catch (err) {
      setError("파일 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
      console.error("Excel processing error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setAnalysisResult(null);
    setDownloadUrl("");
    setError("");
    loadSampleExcel();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Excel 입력 처리기
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            기본 템플릿에서 input 패턴을 찾아 값을 입력하고 새로운 파일을
            생성합니다.
          </p>

          {/* 새로고침 버튼 */}
          <div className="flex justify-center mb-4">
            <Button
              onClick={loadSampleExcel}
              disabled={isAnalyzing || isProcessing}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              템플릿 새로고침
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Error Display */}
          {error && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  오류 발생
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-destructive">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Sample File Info */}
          {!isAnalyzing && analysisResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  기본 템플릿 로드 완료
                </CardTitle>
                <CardDescription>
                  sample.xlsx 파일을 기반으로 입력 폼이 준비되었습니다.
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {/* Loading State */}
          {isAnalyzing && (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">
                    템플릿을 분석하고 있습니다...
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analysis Results */}
          {analysisResult && (
            <Card>
              <CardHeader>
                <CardTitle>분석 결과</CardTitle>
                <CardDescription>
                  총 {analysisResult.input_fields.length}개의 입력 필드를
                  발견했습니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">총 시트 수:</span>
                    <span className="ml-2">
                      {analysisResult.file_info.total_sheets}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">입력 필드:</span>
                    <span className="ml-2">
                      {analysisResult.input_fields.length}개
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">시트:</span>
                    <span className="ml-2">
                      {analysisResult.file_info.sheet_names.join(", ")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Input Form */}
          {analysisResult && analysisResult.input_fields.length > 0 && (
            <InputForm
              inputFields={analysisResult.input_fields}
              onSubmit={handleInputSubmit}
              isLoading={isProcessing}
            />
          )}

          {/* Download Button */}
          {downloadUrl && (
            <DownloadButton
              downloadUrl={downloadUrl}
              onDownload={() => {
                setTimeout(resetForm, 1000);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
