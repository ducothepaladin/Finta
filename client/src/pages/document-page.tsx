import { ArrowLeft } from "lucide-react"
import { Link, useParams } from "react-router-dom"

import { PdfViewer } from "@/components/pdf/pdf-viewer"
import { Button } from "@/components/ui/button"

export function DocumentPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="flex w-full flex-col gap-6">
      <header className="flex flex-col gap-4">
        <Button variant="ghost" className="w-fit px-0" asChild>
          <Link to="/documents">
            <ArrowLeft data-icon="inline-start" />
            Back to documents
          </Link>
        </Button>

        <div className="flex flex-col gap-1">
          <h1 className="text-[22px] font-medium text-foreground">
            Document workspace
          </h1>
          <p className="text-sm leading-[1.7] text-muted-foreground">
            Reading workspace for document {id ?? "unknown"}.
          </p>
        </div>
      </header>

      <PdfViewer />
    </div>
  )
}
