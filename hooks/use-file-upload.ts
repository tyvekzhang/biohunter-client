"use client"

import { useState, useCallback } from "react"
import type { UploadFile, FileUploadConfig } from "@/types/file-upload"

const DEFAULT_CONFIG: FileUploadConfig = {
  maxFileSize: 500 * 1024 * 1024, // 500MB
  allowedTypes: [
    "text/csv",
    "application/json",
    "text/plain",
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
  maxFiles: 5,
  allowPreview: true,
}

export function useFileUpload(config: Partial<FileUploadConfig> = {}) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const finalConfig = { ...DEFAULT_CONFIG, ...config }

  const validateFile = useCallback((file: File): string | null => {
    if (file.size > DEFAULT_CONFIG.maxFileSize) {
      return `文件大小超过限制 (${(DEFAULT_CONFIG.maxFileSize / 1024 / 1024).toFixed(1)}MB)`
    }

    if (!DEFAULT_CONFIG.allowedTypes.includes(file.type)) {
      return "不支持的文件类型"
    }

    return null
  }, [])

  const generatePreview = useCallback(async (file: File): Promise<string | undefined> => {
    if (!DEFAULT_CONFIG.allowPreview) return undefined

    if (file.type.startsWith("image/")) {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.readAsDataURL(file)
      })
    }

    return undefined
  }, [])

  const addFiles = useCallback(
    async (files: File[]) => {
      if (uploadFiles.length + files.length > DEFAULT_CONFIG.maxFiles) {
        throw new Error(`最多只能上传 ${DEFAULT_CONFIG.maxFiles} 个文件`)
      }

      const newUploadFiles: UploadFile[] = []

      for (const file of files) {
        const error = validateFile(file)
        const preview = await generatePreview(file)

        const uploadFile: UploadFile = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file,
          status: error ? "error" : "pending",
          progress: 0,
          error,
          preview,
        }

        newUploadFiles.push(uploadFile)
      }

      setUploadFiles((prev) => [...prev, ...newUploadFiles])
      return newUploadFiles
    },
    [uploadFiles.length],
  )

  const removeFile = useCallback((fileId: string) => {
    setUploadFiles((prev) => prev.filter((f) => f.id !== fileId))
  }, [])

  const updateFileStatus = useCallback(
    (fileId: string, status: UploadFile["status"], progress?: number, error?: string) => {
      setUploadFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                status,
                progress: progress ?? f.progress,
                error,
                uploadedAt: status === "completed" ? new Date() : f.uploadedAt,
              }
            : f,
        ),
      )
    },
    [],
  )

  const simulateUpload = useCallback(
    async (fileId: string) => {
      const file = uploadFiles.find((f) => f.id === fileId)
      if (!file || file.status === "error") return

      updateFileStatus(fileId, "uploading", 0)

      // Simulate upload progress
      const totalSteps = 20
      const baseDelay = 100

      for (let step = 0; step <= totalSteps; step++) {
        const progress = (step / totalSteps) * 100

        // Simulate variable upload speed
        const delay = baseDelay + Math.random() * 200
        await new Promise((resolve) => setTimeout(resolve, delay))

        // Simulate occasional errors (5% chance)
        if (step > 5 && Math.random() < 0.05) {
          updateFileStatus(fileId, "error", progress, "上传失败：网络连接中断")
          return
        }

        updateFileStatus(fileId, "uploading", progress)
      }

      updateFileStatus(fileId, "completed", 100)
    },
    [uploadFiles, updateFileStatus],
  )

  const uploadAll = useCallback(async () => {
    const pendingFiles = uploadFiles.filter((f) => f.status === "pending")
    if (pendingFiles.length === 0) return

    setIsUploading(true)

    // Upload files in parallel
    const uploadPromises = pendingFiles.map((f) => simulateUpload(f.id))

    try {
      await Promise.all(uploadPromises)
    } finally {
      setIsUploading(false)
    }
  }, [uploadFiles, simulateUpload])

  const retryUpload = useCallback(
    (fileId: string) => {
      updateFileStatus(fileId, "pending", 0)
      simulateUpload(fileId)
    },
    [updateFileStatus, simulateUpload],
  )

  const clearCompleted = useCallback(() => {
    setUploadFiles((prev) => prev.filter((f) => f.status !== "completed"))
  }, [])

  const clearAll = useCallback(() => {
    setUploadFiles([])
  }, [])

  const getCompletedFiles = useCallback(() => {
    return uploadFiles.filter((f) => f.status === "completed").map((f) => f.file)
  }, [uploadFiles])

  const getUploadStats = useCallback(() => {
    const total = uploadFiles.length
    const completed = uploadFiles.filter((f) => f.status === "completed").length
    const failed = uploadFiles.filter((f) => f.status === "error").length
    const uploading = uploadFiles.filter((f) => f.status === "uploading").length
    const pending = uploadFiles.filter((f) => f.status === "pending").length

    return { total, completed, failed, uploading, pending }
  }, [uploadFiles])

  return {
    uploadFiles,
    isUploading,
    config: finalConfig,
    addFiles,
    removeFile,
    uploadAll,
    retryUpload,
    clearCompleted,
    clearAll,
    getCompletedFiles,
    getUploadStats,
  }
}
