import { Link } from "react-router-dom"

import { DocumentPreview } from "@/components/document/document-preview"
import { cn } from "@/lib/utils"
import type { DocumentItem } from "@/types/document"

type DocumentListRowProps = {
  document: DocumentItem
  className?: string
}

export function DocumentListRow({ document, className }: DocumentListRowProps) {
  return (
    <Link
      to={`/document/${document.id}`}
      className={cn(
        "group flex overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/40",
        className,
      )}
    >
      <div className="w-28 shrink-0 border-r border-border">
        <DocumentPreview compact className="h-full min-h-[88px] rounded-none" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center px-4 py-3">
        <p className="truncate text-sm font-medium text-foreground">{document.name}</p>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>{document.size}</span>
          <span className="size-[3px] rounded-full bg-border-emphasis" />
          <span>
            pg. {document.currentPage} / {document.totalPages}
          </span>
        </p>
      </div>
    </Link>
  )
}
