import { Link } from "react-router-dom"

import { DocumentDeleteButton } from "@/components/document/document-delete-button"
import { DocumentPreview } from "@/components/document/document-preview"
import { cn } from "@/lib/utils"
import type { DocumentItem } from "@/types/document"

type DocumentListCardProps = {
  document: DocumentItem
  onDeleteRequest?: (document: DocumentItem) => void
  className?: string
}

export function DocumentListCard({
  document,
  onDeleteRequest,
  className,
}: DocumentListCardProps) {
  return (
    <div
      className={cn(
        "group relative h-[190px] overflow-hidden rounded-[10px] border border-border bg-card transition-colors hover:border-primary/40",
        className,
      )}
    >
      <Link
        to={`/document/${document.id}`}
        className="relative z-0 flex h-full flex-col"
      >
        <DocumentPreview thumbnailUrl={document.thumbnailUrl} />
        <div className="border-t border-border bg-card px-3 py-2.5">
          <p className="truncate pr-6 text-xs font-medium text-foreground">{document.name}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span>{document.size}</span>
            <span className="size-[3px] rounded-full bg-border-emphasis" />
            <span>
              pg. {document.currentPage} / {document.totalPages}
            </span>
          </p>
        </div>
      </Link>
      <DocumentDeleteButton
        documentName={document.name}
        onClick={() => onDeleteRequest?.(document)}
        className="absolute top-1.5 right-1.5 z-10 bg-card/90"
      />
    </div>
  )
}
