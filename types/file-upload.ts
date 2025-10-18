export interface UploadFile {
  id: string
  file: File
  status: "pending" | "uploading" | "completed" | "error"
  progress: number
  error?: string
  uploadedAt?: Date
  preview?: string
}

export interface FileUploadConfig {
  maxFileSize: number // in bytes
  allowedTypes: string[]
  maxFiles: number
  allowPreview: boolean
}
