import { Progress } from "@/components/ui/progress"

type DocumentUploadProgressBarProps = {
  progress: number
}

export function DocumentUploadProgressBar({
  progress,
}: DocumentUploadProgressBarProps) {
  return (
    <div className="mt-3.5">
      <div className="mb-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>Uploading...</span>
        <span>{progress}%</span>
      </div>
      <Progress value={progress} className="h-1.5" />
    </div>
  )
}
