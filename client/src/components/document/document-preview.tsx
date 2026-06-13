import { BookOpen } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type DocumentPreviewProps = {
  className?: string
  compact?: boolean
}

export function DocumentPreview({ className, compact = false }: DocumentPreviewProps) {
  return (
    <div
      className={cn(
        "relative flex flex-1 flex-col gap-1.5 overflow-hidden bg-secondary p-3",
        compact ? "min-h-0" : "min-h-[120px]",
        className,
      )}
    >
      <Badge
        variant="secondary"
        className="absolute top-2.5 right-2.5 h-5 border-0 bg-primary/10 px-1.5 text-[9px] font-medium tracking-wide text-primary"
      >
        PDF
      </Badge>
      <div className="h-2.5 w-[60%] rounded-sm bg-border-emphasis" />
      <div className="h-1.5 w-full rounded-sm bg-border" />
      <div className="h-1.5 w-[75%] rounded-sm bg-border" />
      <div className="h-1.5 w-[55%] rounded-sm bg-border" />
      <div className="h-1.5 w-full rounded-sm bg-border" />
      {!compact && (
        <>
          <div className="h-1.5 w-[75%] rounded-sm bg-border" />
          <div className="h-1.5 w-full rounded-sm bg-border" />
        </>
      )}
      <div className="absolute inset-0 flex items-center justify-center bg-primary/5 opacity-0 transition-opacity group-hover:opacity-100">
        <BookOpen className="size-5 text-primary" />
      </div>
    </div>
  )
}
