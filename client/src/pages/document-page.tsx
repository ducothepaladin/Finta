import { ArrowLeft } from "lucide-react"
import { Link, useParams } from "react-router-dom"

import { PageLoader } from "@/components/core/page-loader"
import { DocumentViewer } from "@/components/document/document-viewer"
import { Button } from "@/components/ui/button"
import { useDocumentQuery } from "@/queries/document.query"

export function DocumentPage() {
  const { id } = useParams<{ id: string }>()
  const { data: document, isPending, isError } = useDocumentQuery(id)

  if (isPending) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <PageLoader />
      </div>
    )
  }

  if (isError || !document) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
        <p className="text-sm text-destructive">Document not found.</p>
        <Button variant="outline" asChild>
          <Link to="/documents">
            <ArrowLeft data-icon="inline-start" />
            Back to documents
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center gap-3 border-b border-border bg-card px-4 py-2">
        <Button variant="ghost" size="sm" className="h-8 px-2" asChild>
          <Link to="/documents">
            <ArrowLeft className="size-4" />
            Back
          </Link>
        </Button>
        <h1 className="truncate text-[15px] font-medium text-foreground">
          {document.originalFileName || document.name}
        </h1>
      </div>

      <DocumentViewer document={document} className="min-h-0 flex-1" />
    </div>
  )
}
