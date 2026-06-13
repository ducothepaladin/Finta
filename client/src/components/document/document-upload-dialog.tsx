import { FileText, Upload, X } from "lucide-react"
import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"

import { DocumentUploadProgressBar } from "@/components/document/document-upload-progress-bar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatFileSize } from "@/lib/format-file-size"
import { cn } from "@/lib/utils"
import { useUploadDocumentMutation } from "@/queries/document.query"

type DocumentUploadDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DocumentUploadDialog({
  open,
  onOpenChange,
}: DocumentUploadDialogProps) {
  const uploadMutation = useUploadDocumentMutation()

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)

  const isUploading = uploadMutation.isPending

  const resetState = useCallback(() => {
    setSelectedFile(null)
    setProgress(0)
    uploadMutation.reset()
  }, [uploadMutation])

  const handleOpenChange = (nextOpen: boolean) => {
    if (isUploading) return
    if (!nextOpen) resetState()
    onOpenChange(nextOpen)
  }

  const handleFile = useCallback((file: File | undefined) => {
    if (!file) return
    setSelectedFile(file)
    setProgress(0)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    disabled: isUploading,
    maxFiles: 1,
    multiple: false,
    onDrop: (acceptedFiles) => handleFile(acceptedFiles[0]),
  })

  const handleRemoveFile = () => {
    if (isUploading) return
    setSelectedFile(null)
    setProgress(0)
  }

  const startUpload = () => {
    if (!selectedFile || isUploading) return

    uploadMutation.mutate(
      {
        file: selectedFile,
        onProgress: setProgress,
      },
      {
        onSuccess: () => {
          setProgress(100)
          window.setTimeout(() => {
            handleOpenChange(false)
            resetState()
          }, 400)
        },
        onError: () => {
          setProgress(0)
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[420px]">
        <DialogHeader className="flex-row items-center border-b border-border py-4 pr-12 pl-[18px]">
          <DialogTitle className="flex min-w-0 items-center gap-2 text-sm font-medium">
            <Upload className="size-[18px] shrink-0 text-primary" />
            <span className="truncate">Upload document</span>
          </DialogTitle>
        </DialogHeader>

        <div className="min-w-0 overflow-hidden px-[18px] py-5">
          <div
            {...getRootProps()}
            className={cn(
              "relative box-border flex w-full min-w-0 cursor-pointer flex-col items-center justify-center gap-2.5 rounded-[10px] border-2 border-dashed border-border-emphasis bg-secondary/50 px-5 py-9 transition-colors",
              isDragActive && "border-primary bg-primary/5",
            )}
          >
            <input {...getInputProps()} />
            <span className="flex size-[52px] shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Upload className="size-6" />
            </span>
            <p className="text-center text-[13px] font-medium text-foreground">
              Drop your PDF here
            </p>
            <p className="text-center text-[11px] text-muted-foreground">
              or click to browse files
            </p>
            <span className="mt-1 rounded-[5px] border border-border bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              PDF
            </span>
          </div>

          {selectedFile && (
            <div className="mt-3.5 box-border flex w-full min-w-0 items-center gap-3 rounded-[9px] border border-primary/30 bg-primary/5 px-3.5 py-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <FileText className="size-[18px]" />
              </span>
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="truncate text-xs font-medium text-primary">{selectedFile.name}</p>
                <p className="mt-0.5 text-[11px] text-primary/80">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="shrink-0"
                onClick={(event) => {
                  event.stopPropagation()
                  handleRemoveFile()
                }}
                disabled={isUploading}
                aria-label="Remove file"
              >
                <X className="size-3.5" />
              </Button>
            </div>
          )}

          {isUploading && (
            <div className="mt-3.5 w-full min-w-0">
              <DocumentUploadProgressBar progress={progress} />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 border-t border-border px-[18px] py-3.5 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={startUpload}
            disabled={!selectedFile || isUploading}
          >
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
