"use client";

import React from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DownloadButtonProps {
  downloadUrl?: string;
  filename?: string;
  onDownload?: () => void;
  disabled?: boolean;
}

export function DownloadButton({
  downloadUrl,
  filename = "processed_excel.xlsx",
  onDownload,
  disabled = false,
}: DownloadButtonProps) {
  const handleDownload = () => {
    if (downloadUrl) {
      const link = document.createElement("a");
      // link.href = `http://localhost:8000${downloadUrl}`;
      // link.href = downloadUrl;
      link.href = `${process.env.NEXT_PUBLIC_API_URL}${downloadUrl}`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    onDownload?.();
  };

  if (!downloadUrl) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          다운로드 준비 완료
        </CardTitle>
        <CardDescription>
          처리된 Excel 파일을 다운로드할 수 있습니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleDownload} disabled={disabled} className="w-full">
          <Download className="h-4 w-4 mr-2" />
          Excel 파일 다운로드
        </Button>
      </CardContent>
    </Card>
  );
}
