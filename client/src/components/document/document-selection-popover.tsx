import { Copy, Languages, Pencil, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type DocumentSelectionPopoverProps = {
  open: boolean
  position: { top: number; left: number } | null
  onCopy: () => void
  onNote: () => void
  onTranslate: () => void
  onSummarize: () => void
  className?: string
}

export function DocumentSelectionPopover({
  open,
  position,
  onCopy,
  onNote,
  onTranslate,
  onSummarize,
  className,
}: DocumentSelectionPopoverProps) {
  if (!open || !position) return null

  return (
    <div
      className={cn(
        "absolute z-10 flex gap-0.5 rounded-[9px] border border-border bg-card p-1 shadow-sm",
        className,
      )}
      style={{
        top: position.top,
        left: position.left,
        transform: "translate(-50%, calc(-100% - 10px))",
      }}
      role="toolbar"
      aria-label="Selection actions"
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 gap-1 px-2.5 text-[11px] font-medium text-muted-foreground"
        onClick={onCopy}
      >
        <Copy className="size-3" />
        Copy
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 gap-1 px-2.5 text-[11px] font-medium text-primary"
        onClick={onNote}
      >
        <Pencil className="size-3" />
        Note
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 gap-1 px-2.5 text-[11px] font-medium text-honeydew-700 dark:text-honeydew-300"
        onClick={onTranslate}
      >
        <Languages className="size-3" />
        Translate
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 gap-1 px-2.5 text-[11px] font-medium text-frosted-mint-700 dark:text-frosted-mint-300"
        onClick={onSummarize}
      >
        <Sparkles className="size-3" />
        Summarize
      </Button>
    </div>
  )
}
