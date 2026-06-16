import { formatFileSize } from "@/lib/format-file-size"
import type { DocumentUploadProgress } from "@/lib/upload-progress"
import { useBufferedUploadProgress } from "@/hooks/use-buffered-upload-progress"
import { cn } from "@/lib/utils"

type DocumentUploadProgressBarProps = DocumentUploadProgress & {
  active?: boolean
  complete?: boolean
}

export function DocumentUploadProgressBar({
  percent,
  message,
  loadedBytes,
  totalBytes,
  phase,
  active = true,
  complete = false,
}: DocumentUploadProgressBarProps) {
  const { progress, buffer } = useBufferedUploadProgress(
    percent,
    active,
    complete,
  )

  const byteLabel =
    phase === "uploading" && totalBytes > 0
      ? `${formatFileSize(loadedBytes)} / ${formatFileSize(totalBytes)}`
      : null

  return (
    <div className="mt-3.5">
      <div className="mb-1.5 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <span className="min-w-0 truncate">{message}</span>
        <span className="shrink-0 tabular-nums">
          {byteLabel ? `${byteLabel} · ` : ""}
          {progress}%
        </span>
      </div>

      <div
        className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <div
          className={cn(
            "absolute inset-y-0 left-0 bg-primary/25",
            !complete && "animate-pulse",
          )}
          style={{ width: `${buffer}%` }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 left-0 overflow-hidden"
          style={{ width: `${buffer}%` }}
        >
          <div className="upload-progress-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-primary/35 to-transparent" />
        </div>
        <div
          className="absolute inset-y-0 left-0 bg-primary transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
