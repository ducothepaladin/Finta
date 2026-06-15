import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

type PdfPageListProps = {
  numPages: number
  currentPage: number
  markedPages?: number[]
  onPageSelect: (page: number) => void
  className?: string
}

export function PdfPageList({
  numPages,
  currentPage,
  markedPages = [],
  onPageSelect,
  className,
}: PdfPageListProps) {
  const listRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const container = listRef.current
    if (!container || numPages <= 0) return

    const activeButton = container.querySelector(
      `[data-page-list-item="${currentPage}"]`,
    )
    if (!(activeButton instanceof HTMLElement)) return

    activeButton.scrollIntoView({ block: "nearest", behavior: "instant" })
  }, [currentPage, numPages])

  if (numPages <= 0) return null

  const markedSet = new Set(markedPages)

  return (
    <aside
      ref={listRef}
      className={cn(
        "flex w-14 shrink-0 flex-col items-center gap-1.5 overflow-y-auto border-r border-border bg-sidebar py-2.5",
        className,
      )}
      aria-label="Page list"
    >
      <span className="mb-0.5 text-[11px] font-medium tracking-[0.07em] text-muted-foreground uppercase">
        pgs
      </span>
      {Array.from({ length: numPages }, (_, index) => {
        const page = index + 1
        const isActive = page === currentPage
        const hasMarker = markedSet.has(page)

        return (
          <button
            key={page}
            type="button"
            data-page-list-item={page}
            onClick={() => onPageSelect(page)}
            className={cn(
              "relative flex h-12 w-9 shrink-0 items-center justify-center rounded-sm border text-[10px] transition-colors",
              isActive
                ? "border-primary bg-primary/10 font-medium text-primary"
                : "border-border bg-secondary/50 text-muted-foreground hover:border-primary/40",
            )}
            aria-label={`Page ${page}`}
            aria-current={isActive ? "page" : undefined}
          >
            {page}
            {hasMarker && (
              <span
                className="absolute top-1 right-1 size-[5px] rounded-full bg-vanilla-custard-600"
                aria-hidden
              />
            )}
          </button>
        )
      })}
    </aside>
  )
}
