"use client"

import { useCallback, useState } from "react"
import { Upload, File, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface FileDropzoneProps {
  onFilesSelected?: (files: File[]) => void
  maxFiles?: number
  accept?: string
}

export function FileDropzone({
  onFilesSelected,
  maxFiles = 10,
  accept = "*/*",
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<File[]>([])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const droppedFiles = Array.from(e.dataTransfer.files)
      const newFiles = [...files, ...droppedFiles].slice(0, maxFiles)
      setFiles(newFiles)
      onFilesSelected?.(newFiles)
    },
    [files, maxFiles, onFilesSelected]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || [])
      const newFiles = [...files, ...selectedFiles].slice(0, maxFiles)
      setFiles(newFiles)
      onFilesSelected?.(newFiles)
    },
    [files, maxFiles, onFilesSelected]
  )

  const removeFile = useCallback(
    (index: number) => {
      const newFiles = files.filter((_, i) => i !== index)
      setFiles(newFiles)
      onFilesSelected?.(newFiles)
    },
    [files, onFilesSelected]
  )

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        )}
      >
        <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
        <div className="text-center">
          <p className="text-sm font-medium">
            Drag and drop files here, or click to select
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            You can upload up to {maxFiles} files
          </p>
        </div>
        <input
          type="file"
          multiple
          accept={accept}
          onChange={handleFileInput}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Selected Files</h3>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-lg border bg-card p-3"
              >
                <File className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            onClick={() => {
              // Handle upload
              console.log("Uploading files:", files)
            }}
            className="w-full"
          >
            Upload {files.length} file{files.length !== 1 ? "s" : ""}
          </Button>
        </div>
      )}
    </div>
  )
}

