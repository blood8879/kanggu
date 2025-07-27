'use client'

import React, { useCallback, useState } from 'react'
import { Upload, File, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  disabled?: boolean
  accept?: string
}

export function FileUpload({ onFileSelect, disabled = false, accept = '.xlsx,.xls' }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (disabled) return

    const files = Array.from(e.dataTransfer.files)
    const excelFile = files.find(file => 
      file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
    )

    if (excelFile) {
      setSelectedFile(excelFile)
      onFileSelect(excelFile)
    }
  }, [onFileSelect, disabled])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      onFileSelect(file)
    }
  }, [onFileSelect])

  const clearFile = useCallback(() => {
    setSelectedFile(null)
  }, [])

  return (
    <Card className={cn(
      "border-2 border-dashed transition-colors",
      dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
      disabled && "opacity-50 cursor-not-allowed"
    )}>
      <CardContent className="p-8">
        <div
          className="flex flex-col items-center justify-center space-y-4 text-center"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {selectedFile ? (
            <div className="flex items-center space-x-3 p-4 bg-muted rounded-lg">
              <File className="h-8 w-8 text-primary" />
              <div className="flex-1 text-left">
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={clearFile}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <Upload className={cn(
                "h-12 w-12",
                dragActive ? "text-primary" : "text-muted-foreground"
              )} />
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Excel 파일 업로드</h3>
                <p className="text-sm text-muted-foreground">
                  .xlsx 또는 .xls 파일을 드래그하거나 클릭하여 선택하세요
                </p>
              </div>
              <div className="flex gap-2">
                <label htmlFor="file-upload">
                  <Button variant="outline" disabled={disabled} asChild>
                    <span>파일 선택</span>
                  </Button>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept={accept}
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={disabled}
                />
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}