"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Upload, CheckCircle2 } from "lucide-react"
import { useIsEnglish } from "@/hooks/use-is-english"

interface SteppedFileUploadProps {
  onComplete: (negativeFile: File, positiveFile: File, cellType: string) => void
  onClose: () => void
}

type Step = 1 | 2 | 3 | 4

export function SteppedFileUpload({ onComplete, onClose }: SteppedFileUploadProps) {
  const isEnglish = useIsEnglish()
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [negativeFile, setNegativeFile] = useState<File | null>(null)
  const [positiveFile, setPositiveFile] = useState<File | null>(null)
  const [cellType, setCellType] = useState("")
  const negFileInputRef = useRef<HTMLInputElement>(null)
  const posFileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [dragStep, setDragStep] = useState<number | null>(null)

  const stepTitles = isEnglish
    ? ["Upload Negative Data", "Upload Positive Data", "Enter Target Cell Type", "Preview & Complete"]
    : ["上传阴性数据", "上传阳性数据", "输入靶点细胞类型", "预览和完成"]

  const stepDescriptions = isEnglish
    ? [
        "Upload your negative control data file",
        "Upload your positive control data file",
        "Enter the target cell type for target excavation",
        "Review your inputs and complete",
      ]
    : ["上传您的阴性对照数据文件", "上传您的阳性对照数据文件", "输入进行靶点挖掘的目标细胞类型", "检查您的输入并完成"]

  const handleDrag = (e: React.DragEvent, step: number) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
      setDragStep(step)
    } else if (e.type === "dragleave") {
      setDragActive(false)
      setDragStep(null)
    }
  }

  const handleDrop = (e: React.DragEvent, step: number) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    setDragStep(null)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      if (step === 1) {
        setNegativeFile(files[0])
      } else if (step === 2) {
        setPositiveFile(files[0])
      }
    }
  }

  const handleFileSelect = (step: number, file: File) => {
    if (step === 1) {
      setNegativeFile(file)
    } else if (step === 2) {
      setPositiveFile(file)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>, step: number) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(step, e.target.files[0])
    }
  }

  const canProceed = () => {
    if (currentStep === 1) return negativeFile !== null
    if (currentStep === 2) return positiveFile !== null
    if (currentStep === 3) return cellType.trim() !== ""
    return true
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as Step)
    } else {
      if (negativeFile && positiveFile) {
        onComplete(negativeFile, positiveFile, cellType)
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="text-lg font-semibold">{stepTitles[currentStep - 1]}</h3>
            <p className="text-sm text-muted-foreground">{stepDescriptions[currentStep - 1]}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Step Indicators */}
        <div className="px-6 pt-6 flex gap-2 justify-between">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex-1">
              <div
                className={`
                  h-2 rounded-full
                  ${step < currentStep ? "bg-green-600" : step === currentStep ? "bg-primary" : "bg-muted"}
                `}
              />
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 min-h-[300px]">
          {/* Step 1: Upload Negative Data */}
          {currentStep === 1 && (
            <div
              className={`
                border-2 border-dashed rounded-lg p-8 text-center transition-colors
                ${dragActive && dragStep === 1 ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
              `}
              onDragEnter={(e) => handleDrag(e, 1)}
              onDragLeave={(e) => handleDrag(e, 1)}
              onDragOver={(e) => handleDrag(e, 1)}
              onDrop={(e) => handleDrop(e, 1)}
            >
              {negativeFile ? (
                <div className="space-y-4">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-green-600" />
                  <div>
                    <p className="font-medium text-sm">{negativeFile.name}</p>
                    <p className="text-xs text-muted-foreground">{(negativeFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      negFileInputRef.current?.click()
                    }}
                  >
                    {isEnglish ? "Change File" : "更改文件"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {isEnglish ? "Drag negative data file here or click to select" : "拖拽阴性数据文件到此处或点击选择"}
                  </p>
                  <Button variant="outline" onClick={() => negFileInputRef.current?.click()}>
                    {isEnglish ? "Select File" : "选择文件"}
                  </Button>
                </div>
              )}
              <input
                ref={negFileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => handleFileInput(e, 1)}
                accept=".csv,.tsv,.xlsx,.h5,.h5ad"
              />
            </div>
          )}

          {/* Step 2: Upload Positive Data */}
          {currentStep === 2 && (
            <div
              className={`
                border-2 border-dashed rounded-lg p-8 text-center transition-colors
                ${dragActive && dragStep === 2 ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
              `}
              onDragEnter={(e) => handleDrag(e, 2)}
              onDragLeave={(e) => handleDrag(e, 2)}
              onDragOver={(e) => handleDrag(e, 2)}
              onDrop={(e) => handleDrop(e, 2)}
            >
              {positiveFile ? (
                <div className="space-y-4">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-green-600" />
                  <div>
                    <p className="font-medium text-sm">{positiveFile.name}</p>
                    <p className="text-xs text-muted-foreground">{(positiveFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      posFileInputRef.current?.click()
                    }}
                  >
                    {isEnglish ? "Change File" : "更改文件"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {isEnglish ? "Drag positive data file here or click to select" : "拖拽阳性数据文件到此处或点击选择"}
                  </p>
                  <Button variant="outline" onClick={() => posFileInputRef.current?.click()}>
                    {isEnglish ? "Select File" : "选择文件"}
                  </Button>
                </div>
              )}
              <input
                ref={posFileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => handleFileInput(e, 2)}
                accept=".csv,.tsv,.xlsx,.h5,.h5ad"
              />
            </div>
          )}

          {/* Step 3: Enter Cell Type */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="cellType" className="text-base mb-2 block">
                  {isEnglish ? "Target Cell Type" : "靶点细胞类型"}
                </Label>
                <Input
                  id="cellType"
                  value={cellType}
                  onChange={(e) => setCellType(e.target.value)}
                  placeholder={isEnglish ? "e.g., triple-negative breast cancer cells" : "例如：三阴性乳腺癌细胞"}
                  className="text-base"
                  autoFocus
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {isEnglish
                  ? "Enter the specific cell type you want to analyze for target discovery"
                  : "输入您要进行靶点挖掘分析的具体细胞类型"}
              </p>
            </div>
          )}

          {/* Step 4: Preview & Complete */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{isEnglish ? "Negative Data" : "阴性数据"}</p>
                    <p className="text-xs text-muted-foreground truncate">{negativeFile?.name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{isEnglish ? "Positive Data" : "阳性数据"}</p>
                    <p className="text-xs text-muted-foreground truncate">{positiveFile?.name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{isEnglish ? "Target Cell Type" : "靶点细胞类型"}</p>
                    <p className="text-xs text-muted-foreground">{cellType}</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {isEnglish ? "Click 'Complete' to proceed with target excavation" : "点击'完成'继续进行靶点挖掘"}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-6 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex-1 bg-transparent"
          >
            {isEnglish ? "Previous" : "上一步"}
          </Button>
          <Button onClick={handleNext} disabled={!canProceed()} className="flex-1">
            {currentStep === 4 ? (isEnglish ? "Complete" : "完成") : isEnglish ? "Next" : "下一步"}
          </Button>
        </div>
      </Card>
    </div>
  )
}
