import { Plus } from "lucide-react"

import { cn } from "@/lib/utils"

type DocumentUploadCardProps = {
  onClick: () => void
  variant?: "grid" | "list"
  className?: string
}

export function DocumentUploadCard({
  onClick,
  variant = "grid",
  className,
}: DocumentUploadCardProps) {
  const isList = variant === "list"

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex items-center justify-center gap-2.5 rounded-[10px] border-2 border-dashed border-border-emphasis bg-secondary/50 transition-colors hover:border-primary hover:bg-primary/5",
        isList
          ? "min-h-[88px] w-full flex-row px-4 py-3"
          : "h-[190px] flex-col",
        className,
      )}
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
        <Plus className="size-5" />
      </span>
      <span className="text-xs font-medium text-muted-foreground">Upload PDF</span>
    </button>
  )
}
