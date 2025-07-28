"use client"

import { UploadCloud, X } from "lucide-react"
import { useDropzone, type DropzoneOptions } from "react-dropzone"
import { twMerge } from "tailwind-merge"
import { Button } from "./button"
import { forwardRef, useState, useEffect } from "react"

type ImageUploaderProps = {
  value?: File[]
  onChange?: (files: File[]) => void
  className?: string
  dropzoneOptions?: DropzoneOptions
}

const MultiImageUploader = forwardRef<HTMLDivElement, ImageUploaderProps>(
  ({ value: valueProp, onChange, className, dropzoneOptions }, ref) => {
    const [files, setFiles] = useState<File[]>(valueProp || [])
    const [previewUrls, setPreviewUrls] = useState<string[]>([])

    useEffect(() => {
        // if valueProp changes from outside, update internal state
        if (valueProp) {
            setFiles(valueProp)
        }
    }, [valueProp])

    useEffect(() => {
        // create preview URLs
        const newPreviewUrls = files.map(file => URL.createObjectURL(file))
        setPreviewUrls(newPreviewUrls)

        // cleanup function to revoke URLs
        return () => {
            newPreviewUrls.forEach(url => URL.revokeObjectURL(url))
        }
    }, [files])

    const onDrop = (acceptedFiles: File[]) => {
      const newFiles = [...files, ...acceptedFiles]
      setFiles(newFiles)
      onChange?.(newFiles)
    }

    const removeFile = (index: number) => {
      const newFiles = files.filter((_, i) => i !== index)
      setFiles(newFiles)
      onChange?.(newFiles)
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      ...dropzoneOptions,
      onDrop,
      accept: {
        "image/*": [],
      },
    })

    return (
      <div className={twMerge("space-y-4", className)}>
        <div
          {...getRootProps()}
          ref={ref}
          className={twMerge(
            "group relative grid h-48 w-full cursor-pointer place-items-center rounded-lg border-2 border-dashed border-muted-foreground/25 px-5 py-2.5 text-center transition hover:bg-muted/25",
            "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            isDragActive && "border-primary"
          )}
        >
          <input {...getInputProps()} capture="environment" />
          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <UploadCloud
              className={twMerge(
                "h-10 w-10",
                isDragActive && "animate-bounce"
              )}
            />
            {isDragActive ? (
              <p className="font-bold">Drop files here</p>
            ) : (
              <div>
                <p className="font-medium">
                  Drag & drop files, or click to upload
                </p>
                <p className="text-sm">
                  Recommended size: &lt; 2MB per image
                </p>
              </div>
            )}
          </div>
        </div>

        {previewUrls.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {previewUrls.map((url, index) => (
              <div
                key={index}
                className="relative aspect-square w-full max-w-[200px] rounded-md shadow-md"
              >
                <img
                  src={url}
                  alt={`Preview ${index}`}
                  className="h-full w-full object-cover rounded-md"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-7 w-7 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation() // prevent dropzone from opening
                    removeFile(index)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
)

MultiImageUploader.displayName = "MultiImageUploader"

export { MultiImageUploader } 