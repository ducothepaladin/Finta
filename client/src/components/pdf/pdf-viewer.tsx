import { useState } from "react"

import { Document, Page } from "@/lib/pdf"
import { cn } from "@/lib/utils"

type PdfViewerProps = {
  file?: string | File | null
  className?: string
}

export function PdfViewer({ file, className }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>()

  if (!file) {
    return (
      <div
        className={cn(
          "flex min-h-[320px] items-center justify-center rounded-lg border border-border bg-secondary/30",
          className,
        )}
      >
        <p className="text-sm text-muted-foreground">No PDF loaded</p>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Document
        file={file}
        onLoadSuccess={({ numPages: total }) => setNumPages(total)}
        loading={
          <p className="py-12 text-center text-sm text-muted-foreground">
            Loading PDF…
          </p>
        }
        error={
          <p className="py-12 text-center text-sm text-muted-foreground">
            Failed to load PDF.
          </p>
        }
      >
        <Page
          pageNumber={1}
          className="mx-auto rounded-lg border border-border"
          width={600}
        />
      </Document>
      {numPages !== undefined && (
        <p className="text-xs text-muted-foreground">{numPages} pages</p>
      )}
    </div>
  )
}
