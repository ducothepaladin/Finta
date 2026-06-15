import { Minus, Plus, RotateCcw, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  clampPdfZoom,
  PDF_ZOOM_MAX,
  PDF_ZOOM_MIN,
  PDF_ZOOM_STEP,
} from "@/lib/pdf-page-search"
import { cn } from "@/lib/utils"

type PdfViewerToolbarProps = {
  currentPage: number
  numPages: number
  zoom: number
  onZoomChange: (zoom: number) => void
  searchQuery: string
  onSearchQueryChange: (query: string) => void
  appliedSearchQuery?: string
  matchCount: number
  activeMatchIndex: number
  onNextMatch: () => void
  onPreviousMatch: () => void
  className?: string
}

export function PdfViewerToolbar({
  currentPage,
  numPages,
  zoom,
  onZoomChange,
  searchQuery,
  onSearchQueryChange,
  appliedSearchQuery,
  matchCount,
  activeMatchIndex,
  onNextMatch,
  onPreviousMatch,
  className,
}: PdfViewerToolbarProps) {
  const hasAppliedSearch = (appliedSearchQuery ?? searchQuery).trim().length > 0
  const canZoomOut = zoom > PDF_ZOOM_MIN + 0.001
  const canZoomIn = zoom < PDF_ZOOM_MAX - 0.001

  return (
    <div
      className={cn(
        "flex shrink-0 flex-wrap items-center gap-2 border-b border-border bg-card px-3 py-1.5",
        className,
      )}
    >
      <span className="sr-only">
        Page {currentPage} of {numPages || "unknown"}
      </span>

      <div className="flex items-center gap-0.5 rounded-md border border-border bg-secondary/30 p-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="size-7"
          disabled={!canZoomOut}
          onClick={() => onZoomChange(clampPdfZoom(zoom - PDF_ZOOM_STEP))}
          aria-label="Zoom out"
        >
          <Minus className="size-3.5" />
        </Button>
        <span className="min-w-10 text-center text-[11px] text-muted-foreground">
          {Math.round(zoom * 100)}%
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="size-7"
          disabled={!canZoomIn}
          onClick={() => onZoomChange(clampPdfZoom(zoom + PDF_ZOOM_STEP))}
          aria-label="Zoom in"
        >
          <Plus className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="size-7"
          disabled={zoom === 1}
          onClick={() => onZoomChange(1)}
          aria-label="Reset zoom"
        >
          <RotateCcw className="size-3.5" />
        </Button>
      </div>

      <div className="ml-auto flex min-w-[220px] flex-1 items-center gap-1.5 sm:max-w-xs">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            placeholder="Word search on page"
            className="h-7 bg-secondary/30 pr-7 pl-8 text-xs"
            aria-label="Word search on page"
          />
          {searchQuery && (
            <button
              type="button"
              className="absolute top-1/2 right-0.5 size-6 -translate-y-1/2"
              onClick={() => onSearchQueryChange("")}
              aria-label="Clear search"
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        {hasAppliedSearch && (
          <div className="flex shrink-0 items-center gap-0.5">
            <span className="text-[10px] text-muted-foreground">
              {matchCount === 0
                ? "0"
                : `${activeMatchIndex + 1}/${matchCount}`}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="size-6"
              disabled={matchCount === 0}
              onClick={onPreviousMatch}
              aria-label="Previous match"
            >
              ↑
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="size-6"
              disabled={matchCount === 0}
              onClick={onNextMatch}
              aria-label="Next match"
            >
              ↓
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
