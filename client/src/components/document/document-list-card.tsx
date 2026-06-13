import { Link } from "react-router-dom"

import { DocumentPreview } from "@/components/document/document-preview"
import { cn } from "@/lib/utils"
import type { DocumentItem } from "@/types/document"

type DocumentListCardProps = {
  document: DocumentItem
  className?: string
}

export function DocumentListCard({ document, className }: DocumentListCardProps) {
  return (
    <Link
      to={`/document/${document.id}`}
      className={cn(
        "group flex h-[190px] flex-col overflow-hidden rounded-[10px] border border-border bg-card transition-colors hover:border-primary/40",
        className,
      )}
    >
      <DocumentPreview />
      <div className="border-t border-border bg-card px-3 py-2.5">
        <p className="truncate text-xs font-medium text-foreground">{document.name}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
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
