"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, File, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileWithPreview extends File {
  preview?: string;
}

export function DocumentUpload() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      const newFiles = droppedFiles.map((file) => {
        const fileWithPreview: FileWithPreview = file;
        if (file.type.startsWith("image/")) {
          fileWithPreview.preview = URL.createObjectURL(file);
        }
        return fileWithPreview;
      });

      setFiles((prev) => [...prev, ...newFiles]);
    },
    []
  );

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const newFiles = selectedFiles.map((file) => {
      const fileWithPreview: FileWithPreview = file;
      if (file.type.startsWith("image/")) {
        fileWithPreview.preview = URL.createObjectURL(file);
      }
      return fileWithPreview;
    });

    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      const removedFile = newFiles[index];
      if (removedFile.preview) {
        URL.revokeObjectURL(removedFile.preview);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    // TODO: Implement actual upload logic
    console.log("Uploading files:", files);
    
    // Simulate upload
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Clear files after upload
    files.forEach((file) => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Documents</CardTitle>
          <CardDescription>
            Drag and drop files here or click to browse. Supported formats: PDF, DOC, DOCX, TXT, images.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
            <input
              type="file"
              multiple
              onChange={handleFileInput}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
            />
            <div className="flex flex-col items-center gap-4">
              <div
                className={cn(
                  "flex h-16 w-16 items-center justify-center rounded-full transition-colors",
                  isDragging ? "bg-primary/10" : "bg-muted"
                )}
              >
                <Upload
                  className={cn(
                    "h-8 w-8 transition-colors",
                    isDragging ? "text-primary" : "text-muted-foreground"
                  )}
                />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">
                  {isDragging ? "Drop files here" : "Drag files here or click to browse"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Maximum file size: 10MB
                </p>
              </div>
            </div>
          </div>

          {files.length > 0 && (
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  {files.length} file{files.length !== 1 ? "s" : ""} selected
                </p>
                <Button onClick={handleUpload} size="sm">
                  Upload All
                </Button>
              </div>
              <div className="grid gap-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    {file.preview ? (
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="h-10 w-10 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                        <File className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

