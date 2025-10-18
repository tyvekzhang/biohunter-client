"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Upload, File, ImageIcon, FileText, Database, CheckCircle, RotateCcw, Trash2, Eye } from "lucide-react"
import { useFileUpload } from "@/hooks/use-file-upload"
import { useIsEnglish } from "@/hooks/use-is-english"
import type { UploadFile } from "@/types/file-upload"

interface FileUploadProps {
  onUpload: (files: File[]) => void
  onClose: () => void
  maxFiles?: number
  maxFileSize?: number
  allowedTypes?: string[]
}

const fileIcons = {
  "image/": ImageIcon,
  "text/": FileText,
  "application/json": Database,
  "application/pdf": FileText,
  "application/vnd.ms-excel": Database,
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": Database,
  "application/x-hdf5": Database,
  ".h5ad": Database,
  default: File,
}

const statusColors = {
  pending: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  uploading: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
}

function FileIcon({ file }: { file: File }) {
  const IconComponent = Object.entries(fileIcons).find(([type]) => file.type.startsWith(type))?.[1] || fileIcons.default

  return <IconComponent className="h-4 w-4" />
}

function FilePreview({ uploadFile }: { uploadFile: UploadFile }) {
  const [showPreview, setShowPreview] = useState(false)

  if (!uploadFile.preview) return null

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setShowPreview(true)} className="h-6 w-6 p-0">
        <Eye className="h-3 w-3" />
      </Button>

      {showPreview && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPreview(false)}
        >
          <div className="bg-background rounded-lg p-4 max-w-2xl max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{uploadFile.file.name}</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowPreview(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <img
              src={uploadFile.preview || "/placeholder.svg"}
              alt={uploadFile.file.name}
              className="max-w-full h-auto"
            />
          </div>
        </div>
      )}
    </>
  )
}

function FileItem({
  uploadFile,
  onRemove,
  onRetry,
}: {
  uploadFile: UploadFile
  onRemove: () => void
  onRetry: () => void
}) {
  const isEnglish = useIsEnglish()

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
      <FileIcon file={uploadFile.file} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-medium truncate">{uploadFile.file.name}</p>
          <Badge variant="outline" className={statusColors[uploadFile.status]}>
            {uploadFile.status === "pending" && (isEnglish ? "Pending" : "等待")}
            {uploadFile.status === "uploading" && (isEnglish ? "Uploading" : "上传中")}
            {uploadFile.status === "completed" && (isEnglish ? "Completed" : "完成")}
            {uploadFile.status === "error" && (isEnglish ? "Failed" : "失败")}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatFileSize(uploadFile.file.size)}</span>
          {uploadFile.uploadedAt && <span>• {uploadFile.uploadedAt.toLocaleTimeString()}</span>}
        </div>

        {uploadFile.status === "uploading" && (
          <div className="flex items-center gap-2 mt-2">
            <Progress value={uploadFile.progress} className="flex-1 h-1" />
            <span className="text-xs text-muted-foreground">{Math.round(uploadFile.progress)}%</span>
          </div>
        )}

        {uploadFile.error && <p className="text-xs text-destructive mt-1">{uploadFile.error}</p>}
      </div>

      <div className="flex items-center gap-1">
        {uploadFile.preview && <FilePreview uploadFile={uploadFile} />}

        {uploadFile.status === "completed" && <CheckCircle className="h-4 w-4 text-green-600" />}

        {uploadFile.status === "error" && (
          <Button variant="ghost" size="sm" onClick={onRetry} className="h-6 w-6 p-0">
            <RotateCcw className="h-3 w-3" />
          </Button>
        )}

        <Button variant="ghost" size="sm" onClick={onRemove} className="h-6 w-6 p-0">
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

export function FileUpload({
  onUpload,
  onClose,
  maxFiles = 5,
  maxFileSize = 500 * 1024 * 1024,
  allowedTypes,
}: FileUploadProps) {
  const isEnglish = useIsEnglish()
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    uploadFiles,
    isUploading,
    config,
    addFiles,
    removeFile,
    uploadAll,
    retryUpload,
    clearCompleted,
    clearAll,
    getCompletedFiles,
    getUploadStats,
  } = useFileUpload({
    maxFiles,
    maxFileSize,
    allowedTypes: allowedTypes || [
      "image/*",
      "text/*",
      "application/pdf",
      "application/json",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/x-hdf5",
      ".h5ad",
      ".csv",
      ".tsv",
    ],
  })

  const stats = getUploadStats()

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    try {
      await addFiles(files)
    } catch (error) {
      console.error("Error adding files:", error)
    }
  }

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    try {
      await addFiles(files)
    } catch (error) {
      console.error("Error adding files:", error)
    }
  }

  const handleUploadAll = async () => {
    await uploadAll()
  }

  const handleFinish = () => {
    const completedFiles = getCompletedFiles()
    onUpload(completedFiles)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="text-lg font-semibold">{isEnglish ? "File Upload" : "文件上传"}</h3>
            <p className="text-sm text-muted-foreground">
              {isEnglish
                ? `Maximum ${config.maxFiles} files, each file no more than ${(config.maxFileSize / 1024 / 1024).toFixed(1)}MB`
                : `最多 ${config.maxFiles} 个文件，单个文件不超过 ${(config.maxFileSize / 1024 / 1024).toFixed(1)}MB`}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Upload Area */}
        <div className="p-6">
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              {isEnglish ? "Drag files here or click to select" : "拖拽文件到此处或点击选择"}
            </p>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              {isEnglish ? "Select Files" : "选择文件"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileInput}
              accept={config.allowedTypes.join(",")}
            />
          </div>
        </div>

        {/* File List */}
        {uploadFiles.length > 0 && (
          <div className="flex-1 px-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>
                  {isEnglish ? "Total" : "总计"}: {stats.total}
                </span>
                {stats.completed > 0 && (
                  <span className="text-green-600">
                    {isEnglish ? "Completed" : "完成"}: {stats.completed}
                  </span>
                )}
                {stats.failed > 0 && (
                  <span className="text-red-600">
                    {isEnglish ? "Failed" : "失败"}: {stats.failed}
                  </span>
                )}
                {stats.uploading > 0 && (
                  <span className="text-blue-600">
                    {isEnglish ? "Uploading" : "上传中"}: {stats.uploading}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                {stats.completed > 0 && (
                  <Button variant="outline" size="sm" onClick={clearCompleted}>
                    {isEnglish ? "Clear Completed" : "清除已完成"}
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={clearAll}>
                  <Trash2 className="h-3 w-3 mr-1" />
                  {isEnglish ? "Clear All" : "清空"}
                </Button>
              </div>
            </div>

            <ScrollArea className="h-64">
              <div className="space-y-2">
                {uploadFiles.map((uploadFile) => (
                  <FileItem
                    key={uploadFile.id}
                    uploadFile={uploadFile}
                    onRemove={() => removeFile(uploadFile.id)}
                    onRetry={() => retryUpload(uploadFile.id)}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-2 p-6 border-t">
          {stats.pending > 0 && (
            <Button onClick={handleUploadAll} disabled={isUploading} className="flex-1">
              {isUploading
                ? isEnglish
                  ? "Uploading..."
                  : "上传中..."
                : isEnglish
                  ? `Start Upload (${stats.pending})`
                  : `开始上传 (${stats.pending})`}
            </Button>
          )}

          {stats.completed > 0 && stats.pending === 0 && stats.uploading === 0 && (
            <Button onClick={handleFinish} className="flex-1">
              {isEnglish ? `Finish (${stats.completed} files)` : `完成 (${stats.completed} 个文件)`}
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
