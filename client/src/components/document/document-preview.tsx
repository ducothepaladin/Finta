import { BookOpen } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { useFileObjectUrl } from "@/hooks/use-file-object-url"
import { cn } from "@/lib/utils"

type DocumentPreviewProps = {
  thumbnailUrl?: string
  className?: string
  compact?: boolean
}

function PreviewSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <>
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
    </>
  )
}

export function DocumentPreview({
  thumbnailUrl,
  className,
  compact = false,
}: DocumentPreviewProps) {
  const thumbnail = useFileObjectUrl(thumbnailUrl)
  const hasThumbnail = Boolean(thumbnailUrl?.trim())
  const showImage =
    hasThumbnail && thumbnail.status === "ready" && Boolean(thumbnail.src)

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
        className="absolute top-2.5 right-2.5 z-10 h-5 border-0 bg-primary/10 px-1.5 text-[9px] font-medium tracking-wide text-primary"
      >
        PDF
      </Badge>

      {showImage ? (
        <img
          src={thumbnail.src}
          alt=""
          className="absolute inset-0 size-full bg-white object-cover object-top"
        />
      ) : (
        <PreviewSkeleton compact={compact} />
      )}

      {hasThumbnail && thumbnail.status === "loading" && (
        <div className="absolute inset-0 animate-pulse bg-secondary/80" />
      )}

      <div className="absolute inset-0 z-10 flex items-center justify-center bg-primary/5 opacity-0 transition-opacity group-hover:opacity-100">
        <BookOpen className="size-5 text-primary" />
      </div>
    </div>
  )
}
