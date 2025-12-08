"use client"

import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Upload, ImageIcon, Video } from "lucide-react"

interface FileUploadProps {
  onFileUpload: (files: File[]) => void
  accept?: string
  multiple?: boolean
}

export function FileUpload({ onFileUpload, accept, multiple = true }: FileUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFileUpload(acceptedFiles)
    },
    [onFileUpload],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept ? { [accept]: [] } : undefined,
    multiple,
  })

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return <ImageIcon className="w-8 h-8" />
    if (file.type.startsWith("video/")) return <Video className="w-8 h-8" />
    return <ImageIcon className="w-8 h-8" />
  }

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
        isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"
      }`}
    >
      <input {...getInputProps()} />
      <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
      {isDragActive ? (
        <p className="text-blue-600">Thả file vào đây...</p>
      ) : (
        <div>
          <p className="text-gray-600 mb-2">Kéo thả file vào đây hoặc click để chọn</p>
          <Button variant="outline" size="sm">
            Chọn file
          </Button>
        </div>
      )}
    </div>
  )
}
