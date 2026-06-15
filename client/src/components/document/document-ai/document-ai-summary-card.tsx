import { cn } from "@/lib/utils"
import type { DocumentHistoryItem } from "@/types/document"

type DocumentAiSummaryCardProps = {
  item: DocumentHistoryItem
  className?: string
}

export function DocumentAiSummaryCard({
  item,
  className,
}: DocumentAiSummaryCardProps) {
  return (
    <button
      type="button"
      className={cn(
        "w-full rounded-lg border border-border bg-secondary/30 px-2.5 py-2 text-left transition-colors hover:border-border-emphasis",
        className,
      )}
    >
      <p className="text-[11px] font-medium tracking-[0.07em] text-frosted-mint-800 uppercase dark:text-frosted-mint-100">
        Summary
      </p>
      <p className="mt-0.5 line-clamp-2 text-[11px] leading-[1.4] text-muted-foreground">
        {item.text}
      </p>
      <p className="mt-0.5 text-[11px] text-muted-foreground/80">
        pg. {item.pageNumber}
      </p>
    </button>
  )
}
