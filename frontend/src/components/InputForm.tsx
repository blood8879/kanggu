'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { InputField } from '@/types/excel'

interface InputFormProps {
  inputFields: InputField[]
  onSubmit: (values: Record<string, string>) => void
  isLoading?: boolean
}

export function InputForm({ inputFields, onSubmit, isLoading = false }: InputFormProps) {
  // 동일한 패턴을 그룹화하여 중복 제거
  const uniquePatterns = inputFields.reduce((acc, field) => {
    const patternKey = field.pattern.toLowerCase()
    if (!acc[patternKey]) {
      acc[patternKey] = {
        pattern: field.pattern,
        cells: [],
        sheet: field.sheet
      }
    }
    acc[patternKey].cells.push(field.cell)
    return acc
  }, {} as Record<string, { pattern: string; cells: string[]; sheet: string }>)

  const groupedFields = Object.values(uniquePatterns)

  const schema = z.object(
    groupedFields.reduce((acc, field) => {
      acc[field.pattern] = z.string().min(1, `${field.pattern} 값을 입력해주세요`)
      return acc
    }, {} as Record<string, z.ZodString>)
  )

  type FormData = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormData>({
    resolver: zodResolver(schema)
  })

  const handleFormSubmit = (data: FormData) => {
    onSubmit(data)
  }

  if (inputFields.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>입력 필드</CardTitle>
          <CardDescription>
            업로드된 Excel 파일에서 input 패턴을 찾을 수 없습니다.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>입력 값 설정</CardTitle>
        <CardDescription>
          Excel 파일에서 발견된 입력 필드에 값을 입력하세요.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">
              입력 필드 (총 {groupedFields.length}개 패턴)
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {groupedFields.map((field) => (
                <div key={field.pattern} className="space-y-2">
                  <label 
                    htmlFor={field.pattern}
                    className="text-sm font-medium text-foreground"
                  >
                    {field.pattern}
                    <span className="text-xs text-muted-foreground ml-2">
                      ({field.cells.length}개 위치)
                    </span>
                  </label>
                  <Input
                    id={field.pattern}
                    {...register(field.pattern)}
                    placeholder={`${field.pattern} 값을 입력하세요`}
                    disabled={isLoading}
                  />
                  {errors[field.pattern] && (
                    <p className="text-sm text-destructive">
                      {errors[field.pattern]?.message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '처리 중...' : 'Excel 파일 생성'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => reset()}
              disabled={isLoading}
            >
              초기화
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}